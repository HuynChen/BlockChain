import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  Hash,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Transaction {
  id: string;
  type: string;              // SHIPPED | RECEIVED | AUDITED | FOR_SALE
  from: string;
  to: string;
  shipmentId: string;
  transactionHash: string;
  timestamp: string;
  gasUsed: number;
  status: string;
}

export const BlockchainLog: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  /* ======================
     FETCH DATA
  ====================== */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/shipments/blockchain-logs`)
      .then((res) => {
        setTransactions(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Fetch blockchain logs failed", err);
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ======================
     FILTER
  ====================== */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        (tx.shipmentId || "").toLowerCase().includes(search) ||
        (tx.from || "").toLowerCase().includes(search) ||
        (tx.to || "").toLowerCase().includes(search) ||
        (tx.transactionHash || "").toLowerCase().includes(search);

      const matchesStatus =
        filterStatus === "all" ||
        (tx.status || "").toLowerCase() === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, filterStatus]);

  /* ======================
     UI HELPERS
  ====================== */
  const getStatusIcon = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "received":
      case "audited":
      case "for_sale":
      case "confirmed":
        return CheckCircle;
      case "pending":
        return Clock;
      case "failed":
        return XCircle;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "received":
      case "audited":
      case "for_sale":
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Đang tải nhật ký blockchain...
      </div>
    );
  }

  /* ======================
     UI
  ====================== */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nhật ký giao dịch blockchain
        </h2>
        <p className="text-gray-600">
          Bản ghi bất biến mọi giao dịch chuỗi cung ứng
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo hash, shipment hoặc đối tác..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="pending">Đang chờ</option>
          <option value="failed">Thất bại</option>
        </select>
      </div>


      {/* TABLE */}
      <div className="bg-white rounded-xl overflow-hidden border">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Giao dịch</th>
              <th className="px-6 py-3 text-left">Từ → Đến</th>
              <th className="px-6 py-3 text-left">Lô hàng</th>
              <th className="px-6 py-3 text-left">Sự kiện</th>
              <th className="px-6 py-3 text-left">Thời gian</th>
              <th className="px-6 py-3 text-left">Gas</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((tx, index) => {
              const StatusIcon = getStatusIcon(tx.status);
              return (
                <tr
                  key={tx.id || index}
                  onClick={() => setSelectedTransaction(tx)}
                  className="hover:bg-gray-50 cursor-pointer border-t"

                >
                  <td className="px-6 py-4">
                    <Hash className="inline h-4 w-4 text-blue-600 mr-2" />
                    {tx.id || "#"}
                    <div className="text-xs text-gray-500 font-mono">
                      {tx.transactionHash
                        ? `${tx.transactionHash.slice(0, 16)}...`
                        : "N/A"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {(tx.from || "N/A")} → {(tx.to || "N/A")}
                  </td>

                  <td className="px-6 py-4 font-mono text-blue-600">
                    {tx.shipmentId || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      <StatusIcon className="inline h-3 w-3 mr-1" />
                      {tx.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {tx.timestamp
                      ? new Date(tx.timestamp).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-6 py-4">
                    {(tx.gasUsed ?? 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Chi tiết giao dịch</h3>
            <p><b>Hash:</b> {selectedTransaction.transactionHash}</p>
            <p><b>Lô hàng:</b> {selectedTransaction.shipmentId}</p>
            <p><b>Sự kiện:</b> {selectedTransaction.type}</p>
            <p><b>Gas:</b> {selectedTransaction.gasUsed.toLocaleString()}</p>
            <p>
              <b>Thời gian:</b>{" "}
              {new Date(selectedTransaction.timestamp).toLocaleString()}
            </p>
            <button
              onClick={() => setSelectedTransaction(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Đóng
            </button>
          </div>
        </div>
      )} */
    </div>
  );

};

// const getTypeLabel = (type: string) => {
//   switch (type) {
//     case 'transfer': return 'Chuyển giao';
//     case 'verification': return 'Xác minh';
//     case 'certification': return 'Chứng nhận';
//     default: return type;
//   }
// };
// const getStatusLabel = (status: string) => {
//   switch (status) {
//     case 'confirmed': return 'Đã xác nhận';
//     case 'pending': return 'Đang chờ';
//     case 'failed': return 'Thất bại';
//     default: return status;
//   }
// };
