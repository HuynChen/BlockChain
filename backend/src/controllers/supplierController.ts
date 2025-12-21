import Supplier from "../models/Supplier";

/* =================================================
   GET /api/suppliers
   Lấy danh sách supplier
================================================= */
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    res.json(
      suppliers.map((s) => ({
        id: s._id,
        name: s.name,
        location: s.location,
        avatar: s.avatar,
        trustScore: s.trustScore,
        productsSupplied: s.productsSupplied,
        status: s.status,
        certifications: s.certifications,
        joinDate: s.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Fetch suppliers failed" });
  }
};

/* =================================================
   GET /api/suppliers/:id
   Xem chi tiết supplier
================================================= */
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({
      id: supplier._id,
      name: supplier.name,
      location: supplier.location,
      avatar: supplier.avatar,
      trustScore: supplier.trustScore,
      productsSupplied: supplier.productsSupplied,
      status: supplier.status,
      certifications: supplier.certifications,
      joinDate: supplier.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Get supplier failed" });
  }
};

/* =================================================
   POST /api/suppliers
   Tạo supplier mới
================================================= */
export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ message: "Create supplier failed", error: err });
  }
};

/* =================================================
   PUT /api/suppliers/:id
   Sửa thông tin supplier (KHÔNG sửa status, trustScore)
================================================= */
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        location: req.body.location,
        avatar: req.body.avatar,
        certifications: req.body.certifications,
      },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({
      id: supplier._id,
      name: supplier.name,
      location: supplier.location,
      avatar: supplier.avatar,
      trustScore: supplier.trustScore,
      productsSupplied: supplier.productsSupplied,
      status: supplier.status,
      certifications: supplier.certifications,
      joinDate: supplier.createdAt,
    });
  } catch (err) {
    res.status(400).json({ message: "Update supplier failed" });
  }
};

/* =================================================
   DELETE /api/suppliers/:id
   Xóa supplier (KHÔNG cho xóa nếu đã verified)
================================================= */
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Rule quan trọng cho đồ án
    if (supplier.status === "verified") {
      return res
        .status(400)
        .json({ message: "Cannot delete verified supplier" });
    }

    await supplier.deleteOne();

    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete supplier failed" });
  }
};
