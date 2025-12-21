import React, { useState} from "react";

export const UploadButton: React.FC<{ shipmentId: string, onUploaded?: (cid: string) => void }> = ({ shipmentId, onUploaded }) => {
  const [loading, setLoading] = useState(false);
  const API_BASE = (import.meta.env.VITE_API_URL);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadUrl = `${API_BASE}/ipfs/upload`;
      console.log("[Upload] POST ->", uploadUrl, "file:", file.name, file.size);

      const uploadRes = await fetch(uploadUrl, { method: "POST", body: formData });

      console.log("[Upload] status:", uploadRes.status);

      const text = await uploadRes.text().catch(() => "");
      console.log("[Upload] raw response body:", text);

      if (!uploadRes.ok) {
        throw new Error(`Upload thất bại. status=${uploadRes.status} body=${text}`);
      }

      const data = JSON.parse(text || "{}");
      const cid = data.cid || data.IpfsHash || data.hash;

      if (!cid) throw new Error("Server không trả về cid");

      console.log("[Upload] CID:", cid);

      // gọi update shipment để lưu ipfsHash
      const updateRes = await fetch(`${API_BASE}/shipments/${shipmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipfsHash: cid }),
      });

      if (!updateRes.ok) {
        const upText = await updateRes.text().catch(() => "");
        throw new Error(`Cập nhật shipment thất bại. status=${updateRes.status} body=${upText}`);
      }

      alert("Upload ảnh thành công! CID: " + cid);
      if (onUploaded) onUploaded(cid);
    } catch (err: any) {
      console.error("Lỗi upload:", err);
      alert("Upload thất bại: " + (err.message || err));
    } finally {
      setLoading(false);
      (e.target as HTMLInputElement).value = "";
    }
  };

  return (
    <label className="cursor-pointer text-blue-600 hover:underline">
      {loading ? "Đang upload..." : "Chọn ảnh"}
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </label>
  );
};
export default UploadButton;