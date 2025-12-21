import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Users,
  Award,
  AlertCircle,
} from "lucide-react";
import { Supplier } from "../../types";
import AddSupplierModal from "./AddSupplierModal";
import EditSupplierModal from "./EditSupplierModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  /* ======================
      FETCH DATA
     ====================== */
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/suppliers`);
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  /* ======================
      DELETE SUPPLIER
     ====================== */
  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (supplier.status === "verified") {
      alert("Không thể xóa nhà cung cấp đã được xác minh");
      return;
    }

    const ok = window.confirm(
      "Bạn có chắc muốn xóa nhà cung cấp này?\n(Hành động này không thể hoàn tác)"
    );
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE_URL}/suppliers/${supplier.id}`);
      fetchSuppliers();
    } catch (err) {
      alert("Xóa nhà cung cấp thất bại");
    }
  };

  /* ======================
      FILTER + SEARCH
     ====================== */
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || supplier.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [suppliers, searchTerm, filterStatus]);

  /* ======================
      HELPER FUNCTIONS
     ====================== */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "flagged":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "verified":
        return "Đã xác minh";
      case "pending":
        return "Đang chờ";
      case "flagged":
        return "Cảnh báo";
      default:
        return "Không xác định";
    }
  };

  /* ======================
      LOADING / ERROR
     ====================== */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Đang tải danh sách nhà cung cấp...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
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
          Quản lý nhà cung cấp
        </h2>
        <p className="text-gray-600">
          Quản lý và xác minh nhà cung cấp trong mạng lưới chuỗi cung ứng
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc địa điểm..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">Tất cả</option>
              <option value="verified">Đã xác minh</option>
              <option value="pending">Đang chờ</option>
              <option value="flagged">Cảnh báo</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Thêm nhà cung cấp
            </button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

      {/* ADD */}
      {showAddModal && (
        <AddSupplierModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchSuppliers}
        />
      )}

      {/* EDIT */}
      {editSupplier && (
        <EditSupplierModal
          supplier={editSupplier}
          onClose={() => setEditSupplier(null)}
          onSuccess={fetchSuppliers}
        />
      )}

      {/* VIEW DETAIL */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-2">
              {selectedSupplier.name}
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedSupplier.location}
            </p>


            <div className="space-y-2 text-sm">
              <div>
                <b>Điểm tin cậy:</b> {selectedSupplier.trustScore}
              </div>
              <div>
                <b>Sản phẩm:</b>{" "}
                {selectedSupplier.productsSupplied}
              </div>
              <div>
                <b>Trạng thái:</b>{" "}
                {getStatusLabel(selectedSupplier.status)}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 border rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};
