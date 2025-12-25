import { Request, Response } from "express";
import Shipment, { IShipment } from "../models/Shipment";
import { callIsolationForest } from "../services/aiService";
import AILog from "../models/AILog";
import mongoose from "mongoose";
import User from "../models/User";

export const getShipments = async (req: Request, res: Response) => {
  try {
    const {
      status,
      q,
      producerAddress,
      from,
      to,
      page = "1",
      limit = "20",
      sort = "-createdAt",
    } = req.query as Record<string, string>;

    const filter: any = {};
    if (status) filter.status = status;
    if (q) filter.productName = { $regex: q, $options: "i" };
    if (producerAddress)
      filter.producerAddress = String(producerAddress).toLowerCase();

    if (from || to) {
      filter.manufacturingDate = {};
      if (from) filter.manufacturingDate.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.manufacturingDate.$lte = end;
      }
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Shipment.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Shipment.countDocuments(filter),
    ]);

    return res.status(200).json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      filter,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const createShipment = async (req: Request, res: Response) => {
  try {
    const {
      shipmentId,
      productName,
      quantity,
      manufacturingDate,
      status,
      transactionHash,
      producerAddress,
    } = req.body;

    // Validate bắt buộc
    if (!shipmentId || !productName || quantity == null || !manufacturingDate || !producerAddress) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["shipmentId", "productName", "quantity", "manufacturingDate", "producerAddress"],
      });
    }

    //Chuẩn hoá và kiểm tra dữ liệu
    const parsedQty = Number(quantity);
    const parsedDate = new Date(manufacturingDate);
    if (Number.isNaN(parsedQty) || parsedQty < 0) {
      return res.status(400).json({ message: "quantity must be a non-negative number" });
    }
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "manufacturingDate must be a valid ISO date string" });
    }

    //Kiểm tra trùng khoá trước khi tạo
    const existedById = await Shipment.findOne({ shipmentId }).lean();
    if (existedById) {
      return res.status(409).json({ message: "Duplicate shipmentId" });
    }
    if (transactionHash) {
      const existedByTx = await Shipment.findOne({ transactionHash }).lean();
      if (existedByTx) {
        return res.status(409).json({ message: "Duplicate transactionHash" });
      }
    }

    //Tạo document
    const doc = await Shipment.create({
      shipmentId,
      productName: String(productName).trim(),
      quantity: parsedQty,
      manufacturingDate: parsedDate,
      status,
      transactionHash: transactionHash ? String(transactionHash).trim() : undefined,
      producerAddress: String(producerAddress).toLowerCase().trim(),
    });

    return res.status(201).json(doc);
  } catch (error: any) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "unique_field";
      return res.status(409).json({ message: `Duplicate ${field}` });
    }
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Lấy chi tiết 1 shipment theo shipmentId hoặc _id (MongoDB)
export const getShipmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const shipment = await Shipment.findOne({ shipmentId: id }).lean();

    if (!shipment) {
      return res.status(404).json({
        message: "Shipment not found",
        shipmentId: id,
      });
    }

    return res.status(200).json(shipment);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};


const Z_SCORE_THRESHOLD = 2.5;

// Cập nhật trạng thái lô hàng + transactionHash
export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const {
      shipmentId,
      newStatus,
      transactionHash,
    }: {
      shipmentId?: string;
      newStatus?: IShipment["status"];
      transactionHash?: string;
    } = req.body;

    // 1. Validate input
    if (!shipmentId || !newStatus || !transactionHash) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["shipmentId", "newStatus", "transactionHash"],
      });
    }

    // 2. Tìm shipment theo shipmentId
    const shipment = await Shipment.findOne({ shipmentId }).exec();
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // 3. Kiểm tra trùng transactionHash với lô hàng khác
    const existedByTx = await Shipment.findOne({
      transactionHash: transactionHash.trim(),
      _id: { $ne: shipment._id },
    }).lean();

    if (existedByTx) {
      return res.status(409).json({ message: "Duplicate transactionHash" });
    }

    // 4. Cập nhật status + transactionHash
    const oldStatus = shipment.status;
    shipment.status = newStatus;
    shipment.transactionHash = transactionHash.trim();

    // 5. Thêm mục vào lịch sử trạng thái
    shipment.statusHistory = shipment.statusHistory || [];
    shipment.statusHistory.push({
      fromStatus: oldStatus,
      toStatus: newStatus,
      transactionHash: shipment.transactionHash,
      changedAt: new Date(),
    });

    await shipment.save();
    // ===== ANOMALY DETECTION (CROSS-SHIPMENT Z-SCORE) =====

    // transition vừa xảy ra
    const transitionKey = `${oldStatus}->${newStatus}`;
    const shipmentsWithTransition = await Shipment.find({
      "statusHistory.fromStatus": oldStatus,
      "statusHistory.toStatus": newStatus,
    }).lean();

    // lấy delta time cho transition này ở mỗi shipment (thời gian từ lúc vào `oldStatus` đến lúc chuyển sang `newStatus`)
    const deltas: number[] = [];

    shipmentsWithTransition.forEach((s) => {
      const h = s.statusHistory || [];
      for (let i = 0; i < h.length; i++) {
        if (h[i].fromStatus === oldStatus && h[i].toStatus === newStatus) {
          // tìm thời điểm lô này vào oldStatus: tìm entry trước đó với toStatus === oldStatus, nếu không có dùng createdAt
          let enteredOldAt: Date | null = null;
          for (let j = i - 1; j >= 0; j--) {
            if (h[j].toStatus === oldStatus) {
              enteredOldAt = new Date(h[j].changedAt);
              break;
            }
          }
          if (!enteredOldAt) {
            // fallback: dùng createdAt nếu có
            if ((s as any).createdAt) enteredOldAt = new Date((s as any).createdAt);
            else enteredOldAt = new Date(h[i].changedAt); // zero delta
          }

          const delta = new Date(h[i].changedAt).getTime() - enteredOldAt.getTime();
          if (!Number.isNaN(delta) && isFinite(delta) && delta >= 0) deltas.push(delta);
        }
      }
    });

    // tính latestDelta cho shipment hiện tại (dựa trên statusHistory vừa push)
    let latestDelta = 0;
    try {
      const hist = shipment.statusHistory || [];
      const lastIdx = hist.length - 1;
      if (lastIdx >= 0 && hist[lastIdx].fromStatus === oldStatus && hist[lastIdx].toStatus === newStatus) {
        // tìm thời điểm nhập oldStatus cho lô hiện tại
        let enteredOldAt: Date | null = null;
        for (let j = lastIdx - 1; j >= 0; j--) {
          if (hist[j].toStatus === oldStatus) {
            enteredOldAt = new Date(hist[j].changedAt);
            break;
          }
        }
        if (!enteredOldAt) enteredOldAt = shipment.createdAt || new Date(hist[lastIdx].changedAt);
        latestDelta = new Date(hist[lastIdx].changedAt).getTime() - enteredOldAt.getTime();
      }
    } catch (e) {
      latestDelta = 0;
    }

    const TRANSITION_BASELINE: Record<string, number> = {
      "CREATED->SHIPPED": 30 * 60 * 1000,     // 30 phút
      "SHIPPED->RECEIVED": 60 * 60 * 1000,     // 1 giờ
      "RECEIVED->AUDITED": 60 * 60 * 1000,    // 1 giờ
      "AUDITED->FOR_SALE": 30 * 60 * 1000,    // 30 phút
    };

    let zScore: number | null = null;
    let level: "LOW" | "MEDIUM" | "HIGH" = "LOW";

    // cần ít nhất 3 sample để học
    if (deltas.length >= 3) {
      const rawMean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      const baseline = TRANSITION_BASELINE[transitionKey] ?? 0;
      const mean = Math.max(rawMean, baseline);
      const variance =
        deltas.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / deltas.length;
      const std = Math.sqrt(variance);
      zScore = std === 0 ? 0 : (latestDelta - mean) / std;
      const ratio = mean > 0 ? latestDelta / mean : 1;

      // ===== PHÂN LEVEL =====
      if (
        Math.abs(zScore) >= 2.5 ||
        ratio < 0.2 ||
        ratio > 3
      ) {
        level = "HIGH";
      }
      else if (
        Math.abs(zScore) >= 0.8 ||
        ratio < 0.5 ||
        ratio > 1.8
      ) {
        level = "MEDIUM";
      }

      // ===== CHỈ GHI LOG KHI MEDIUM / HIGH =====
      if (level !== "LOW") {
        await AILog.create({
          shipmentId: shipment.shipmentId,
          engine: "Z_SCORE",
          transition: transitionKey,
          zScore,
          latestDelta,
          sampleMean: mean,
          sampleStd: std,
          sampleCount: deltas.length,
          ratio,
          level,
          detectedAt: new Date(),
        });
      }
    }

    if (level === "HIGH" && deltas.length >= 5) {
      try {
        const aiResult = await callIsolationForest(deltas);

        await AILog.create({
          shipmentId: shipment.shipmentId,
          engine: "ISOLATION_FOREST",
          score: aiResult.anomalyScore,
          isAnomaly: aiResult.isAnomaly,
          detectedAt: new Date(),
        });
      } catch (err) {
        console.error("Isolation Forest error:", err);
      }
    }

    // 6. Trả về kết quả
    return res.status(200).json({
      message: "Shipment status updated successfully",
      data: shipment,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getAIAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await AILog.find()
      .sort({ detectedAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json(alerts);
  } catch (err: any) {
    return res.status(500).json({
      message: "Cannot fetch AI alerts",
    });
  }
};

// Cập nhật lô hàng theo id (có thể là _id hoặc shipmentId)
export const updateShipmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status: newStatus,
      transactionHash,
      ipfsHash,
      documentTxHash,
      documentType,
    }: {
      status?: IShipment["status"];
      transactionHash?: string;
      ipfsHash?: string;
      documentTxHash?: string;
      documentType?: "CERTIFICATE" | "INVOICE" | "SHIPPING_NOTE" | "CONTRACT";
    } = req.body;

    const ALLOWED_DOC_TYPES = ["CERTIFICATE", "INVOICE", "SHIPPING_NOTE", "CONTRACT"];
    if (documentType && !ALLOWED_DOC_TYPES.includes(documentType)) {
      return res.status(400).json({ message: "Invalid documentType" });
    }

    // Nếu không có gì để cập nhật thì báo lỗi
    if (!newStatus && !transactionHash && !ipfsHash && !documentTxHash && !documentType) {
      return res.status(400).json({
        message: "No fields to update. You can send status, transactionHash, ipfsHash, documentTxHash or documentType.",
      });
    }

    // Cho phép id là _id (ObjectId) hoặc shipmentId
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { shipmentId: id };

    // Tìm shipment
    const shipment = await Shipment.findOne(filter).exec();
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // 1. Xử lý transactionHash (nếu có gửi)
    if (transactionHash && transactionHash.trim() !== shipment.transactionHash) {
      const newTx = transactionHash.trim();

      // Check trùng hash với lô hàng khác
      const existedByTx = await Shipment.findOne({
        transactionHash: newTx,
        _id: { $ne: shipment._id },
      }).lean();

      if (existedByTx) {
        return res.status(409).json({ message: "Duplicate transactionHash" });
      }

      shipment.transactionHash = newTx;
    }

    // 2. Xử lý status (nếu có gửi)
    if (newStatus) {
      shipment.status = newStatus as IShipment["status"];
    }

    // 3. Xử lý ipfsHash (HASH IPFS)
    if (ipfsHash) {
      shipment.ipfsHash = String(ipfsHash).trim();
    }

    if (documentTxHash && documentTxHash !== shipment.documentTxHash) {
      shipment.documentTxHash = documentTxHash.trim();
    }

    if (documentType) {
      shipment.documentType = documentType;
    }

    await shipment.save();

    return res.status(200).json({
      message: "Shipment updated successfully",
      data: shipment,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

// Thống kê đơn giản: tổng số lô, số lô ở trạng thái cuối cùng
export const getShipmentStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Tính toán số liệu thật
    const total = await Shipment.countDocuments({});
    const newThisMonth = await Shipment.countDocuments({ createdAt: { $gte: startOfMonth } });
    const growthNumber =
      total > 0 ? (newThisMonth / total) * 100 : 0;

    const growth = growthNumber.toFixed(0);

    const suppliers = (await Shipment.distinct("producerAddress")).length;

    const totalTx = await Shipment.countDocuments({ transactionHash: { $exists: true, $ne: "" } });
    const txToday = await Shipment.countDocuments({
      transactionHash: { $exists: true, $ne: "" },
      updatedAt: { $gte: startOfToday }
    });

    const audited = await Shipment.countDocuments({ status: "AUDITED" });

    return res.json({
      totalShipments: total,
      productGrowth: `+${growth}% tháng này`,
      activeSuppliers: suppliers,
      newSuppliersCount: `+${growthNumber > 0 ? 2 : 0} mới tuần này`, // Ví dụ logic
      blockchainTransactions: totalTx,
      transactionsToday: `+${txToday} hôm nay`,
      complianceRate: total > 0 ? ((audited / total) * 100).toFixed(1) : "0"
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBlockchainLogs = async (req: Request, res: Response) => {
  try {
    const shipments = await Shipment.find();

    const wallets = new Set<string>();
    shipments.forEach(s => {
      s.statusHistory?.forEach(h => {
        if (s.producerAddress) wallets.add(s.producerAddress);
      });
    });

    const users = await User.find({
      walletAddress: { $in: [...wallets] }
    });

    const walletMap = new Map(
      users
        .filter(u => u.walletAddress)
        .map(u => [u.walletAddress!.toLowerCase(), u.name])
    );

    const logs = shipments.flatMap(shipment =>
      (shipment.statusHistory ?? []).map((h, index) => ({
        txId: `${shipment.shipmentId}-${index}`,
        type: h.toStatus,
        from:
          walletMap.get(shipment.producerAddress.toLowerCase()) ??
          shipment.producerAddress,
        to: "Next Actor",
        shipmentId: shipment.shipmentId,
        txHash: h.transactionHash,
        timestamp: h.changedAt,
        gasUsed: 21000
      }))
    );

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to get blockchain logs" });
  }
};