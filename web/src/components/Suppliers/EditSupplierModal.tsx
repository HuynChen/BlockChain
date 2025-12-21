import { useState } from "react";
import axios from "axios";
import { Supplier } from "../../types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function EditSupplierModal({
  supplier,
  onClose,
  onSuccess,
}: {
  supplier: Supplier;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(supplier.name);
  const [location, setLocation] = useState(supplier.location);
  const [avatar, setAvatar] = useState(supplier.avatar || "");
  const [certifications, setCertifications] = useState(
    supplier.certifications.join(", ")
  );

  const handleSubmit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/suppliers/${supplier.id}`, {
        name,
        location,
        avatar,
        certifications: certifications.split(",").map((c) => c.trim()),
      });

      onSuccess();
      onClose();
    } catch (err) {
      alert("Cập nhật supplier thất bại");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Sửa nhà cung cấp</h2>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên nhà cung cấp"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Địa điểm"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="Avatar URL"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="Chứng nhận (cách nhau bởi dấu ,)"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
