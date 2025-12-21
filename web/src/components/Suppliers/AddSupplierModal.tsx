import { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function AddSupplierModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    location: "",
    avatar: "",
    trustScore: 0,
    productsSupplied: 0,
    certifications: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/suppliers`, {
        name: form.name,
        location: form.location,
        avatar: form.avatar,
        trustScore: Number(form.trustScore),
        productsSupplied: Number(form.productsSupplied),
        certifications: form.certifications
          .split(",")
          .map((c) => c.trim()),
        status: "pending",
      });

      onSuccess(); // reload list
      onClose();   // đóng modal
    } catch (err) {
      alert("Không thể thêm supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Thêm nhà cung cấp</h2>

        <div className="space-y-3">
          <input
            name="name"
            placeholder="Tên nhà cung cấp"
            className="input"
            onChange={handleChange}
          />
          <input
            name="location"
            placeholder="Địa điểm"
            className="input"
            onChange={handleChange}
          />
          <input
            name="avatar"
            placeholder="URL ảnh đại diện"
            className="input"
            onChange={handleChange}
          />
          <input
            name="trustScore"
            type="number"
            placeholder="Điểm tin cậy"
            className="input"
            onChange={handleChange}
          />
          <input
            name="productsSupplied"
            type="number"
            placeholder="Số sản phẩm"
            className="input"
            onChange={handleChange}
          />
          <input
            name="certifications"
            placeholder="Chứng nhận (cách nhau bằng dấu ,)"
            className="input"
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Đang thêm..." : "Thêm"}
          </button>
        </div>
      </div>
    </div>
  );
}
