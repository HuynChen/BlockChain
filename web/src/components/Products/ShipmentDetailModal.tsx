import React, { useEffect, useMemo, useState } from 'react';
import type { Shipment } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ExternalLink } from 'lucide-react';

type Props = {
  open: boolean;
  shipment: Shipment | null;
  onClose: () => void;
};

const badgeClass = (s: Shipment['status']) =>
  s === 'CREATED' ? 'bg-blue-100 text-blue-800' :
    s === 'SHIPPED' ? 'bg-yellow-100 text-yellow-800' :
      s === 'RECEIVED' ? 'bg-purple-100 text-purple-800' :
        s === 'AUDITED' ? 'bg-indigo-100 text-indigo-800' :
          s === 'FOR_SALE' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-700';

export const ShipmentDetailModal: React.FC<Props> = ({
  open,
  shipment,
  onClose,
}) => {
  // ESC để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const ipfsGatewayDefault = (import.meta.env.VITE_IPFS_GATEWAY as string) || 'https://gateway.pinata.cloud/ipfs';

  // Tạo link IPFS từ hash (nếu có)
  const ipfsUrl = useMemo(() => {
    if (!shipment?.ipfsHash) return null;
    const gw = ipfsGatewayDefault.replace(/\/+$/, '');
    return `${gw}/${encodeURIComponent(shipment.ipfsHash.trim())}`;
  }, [shipment, ipfsGatewayDefault]);

  // detect file type from url/hash by extension (best-effort)
  const isImage = useMemo(() => {
    if (!ipfsUrl) return false;
    const lower = ipfsUrl.toLowerCase();
    return /\.(png|jpe?g|gif|webp|bmp|svg)(?:$|\?)/.test(lower);
  }, [ipfsUrl]);

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    // reset copied when modal/shipment changes
    setCopied(false);
    setShowPreview(true);
  }, [shipment?.ipfsHash, open]);

  const handleCopy = async () => {
    if (!ipfsUrl) return;
    try {
      await navigator.clipboard.writeText(ipfsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = ipfsUrl;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 1500); }
      finally { document.body.removeChild(el); }
    }
  };

  if (!open || !shipment) return null;

  const qrLink = `${import.meta.env.VITE_API_URL}/shipments/${shipment.shipmentId}`;

  const handlePrint = () => {
    const printContent = document.getElementById(`qr-card-${shipment.shipmentId}`);
    const win = window.open('', '', 'height=600,width=600');
    if (win && printContent) {
      win.document.write('<html><head><title>Print QR Label</title>');
      win.document.write('<style>body { font-family: sans-serif; display: flex; justify-content: center; padding: 20px; } .card { border: 2px solid #000; padding: 20px; text-align: center; width: 300px; } .title { font-weight: bold; font-size: 18px; margin-bottom: 10px; } .id { font-family: monospace; margin-top: 10px; font-size: 14px; } </style>');
      win.document.write('</head><body>');
      win.document.write(`<div class="card">${printContent.innerHTML}</div>`);
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal content */}
      <div className="relative bg-white w-[520px] max-w-[92vw] rounded-xl shadow-xl p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">Chi tiết lô hàng</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Header status pill */}
        <div className="mt-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass(shipment.status)}`}>
            {shipment.status}
          </span>
        </div>

        <div className="mt-4 flex flex-col items-center border rounded p-4 bg-gray-50">
          <h3 className="text-base font-medium mb-2">Quét mã để theo dõi lô hàng</h3>
          <QRCodeSVG value={qrLink} size={120} level="H" />
          <p className="mt-2 text-xs text-gray-500">ID: {shipment.shipmentId}</p>
          <div className="flex gap-2 mt-4 w-full">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Printer className="w-3 h-3" /> In Tem
            </button>
            <a
              href={qrLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              title="Mở link thử"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div><b>Mã lô hàng:</b> {shipment.shipmentId}</div>
          <div><b>Tên sản phẩm:</b> {shipment.productName}</div>
          <div><b>Số lượng:</b> {shipment.quantity}</div>
          <div><b>Ngày sản xuất:</b> {new Date(shipment.manufacturingDate).toLocaleString('vi-VN')}</div>

          <div className="sm:col-span-2">
            <b>Hash giao dịch:</b> <code className="break-all">{shipment.transactionHash}</code>
          </div>

          <div className="sm:col-span-2">
            <b>Producer:</b> {shipment.producerAddress}
          </div>

          <div><b>Tạo lúc:</b> {new Date(shipment.createdAt).toLocaleString('vi-VN')}</div>
          <div><b>Cập nhật:</b> {new Date(shipment.updatedAt).toLocaleString('vi-VN')}</div>

          {/* IPFS link row */}
          <div className="sm:col-span-2 mt-2">
            <b>Tài liệu đính kèm:</b>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-3">
              {ipfsUrl ? (
                <>
                  <a
                    href={ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                    title="Mở tài liệu trên gateway công khai"
                  >
                    {shipment.ipfsHash}
                  </a>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={handleCopy}
                      className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                      aria-label="Sao chép link IPFS"
                    >
                      {copied ? 'Đã sao chép' : 'Sao chép link'}
                    </button>

                    <a
                      href={ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                      aria-label="Mở link"
                    >
                      Mở
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Chưa có tài liệu đính kèm</div>
              )}
            </div>

            {/* preview nếu là ảnh */}
            {ipfsUrl && isImage && showPreview && (
              <div className="mt-3">
                <img
                  src={ipfsUrl}
                  alt="IPFS preview"
                  style={{ maxWidth: 280, maxHeight: 240, objectFit: 'contain', borderRadius: 8 }}
                  onError={() => setShowPreview(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-1 border rounded hover:bg-gray-100" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailModal;
