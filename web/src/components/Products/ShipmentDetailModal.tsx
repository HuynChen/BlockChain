import React, { useEffect, useMemo, useState } from 'react';
import type { Shipment } from '../../types';
import { QRCodeSVG } from 'qrcode.react';

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

  // QR link - nếu muốn đổi thành frontend route thay VITE_API_URL -> import.meta.env.VITE_APP_URL
  const qrLink = `${import.meta.env.VITE_API_URL}/shipments/${shipment.shipmentId}`;

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
