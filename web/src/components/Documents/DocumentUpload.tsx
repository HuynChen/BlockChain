import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { computeFileHash } from '../../utils/fileHelpers';
import { callAddDocumentHash } from '../../services/blockchainService';
import { useToast } from '../context/ToastContext';

interface Props {
  shipmentId: string | number;
  onSuccess?: () => void;
}

export const DocumentUpload: React.FC<Props> = ({ shipmentId, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('CERTIFICATE');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const hash = await computeFileHash(file);
      console.log("Generated Hash:", hash);

      showToast("Đang mở ví MetaMask...", "pending");

      const tx = await callAddDocumentHash({
        shipmentId: shipmentId,
        fileHash: hash,
        docType: docType
      });

      showToast("Giao dịch đã gửi! Đang chờ xác nhận...", "pending", tx.hash);

      await tx.wait();

      showToast("Lưu tài liệu lên Blockchain thành công!", "success", tx.hash);

      // Reset form
      setFile(null);
      if (onSuccess) onSuccess();

    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Lỗi tải tài liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Thêm tài liệu minh chứng
      </h3>

      <div className="space-y-3">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          disabled={loading}
        >
          <option value="CERTIFICATE">Chứng chỉ chất lượng (CO/CQ)</option>
          <option value="INVOICE">Hóa đơn (Invoice)</option>
          <option value="SHIPPING_NOTE">Phiếu vận đơn</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="file"
            onChange={handleFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`w-full py-2 px-4 rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors
            ${!file || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'}`
          }
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {loading ? 'Đang xử lý...' : 'Ký & Lưu Hash lên Blockchain'}
        </button>
      </div>
    </div>
  );
};