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
  s === 'CREATED' ? 'bg-blue-100 text-blue-800'
    : s === 'SHIPPED' ? 'bg-yellow-100 text-yellow-800'
      : s === 'RECEIVED' ? 'bg-purple-100 text-purple-800'
        : s === 'AUDITED' ? 'bg-green-100 text-green-800'
          : s === 'FOR_SALE' ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-700';

const DEFAULT_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs',
  'https://ipfs.io/ipfs',
  'https://dweb.link/ipfs',
];

export const ShipmentDetailModal: React.FC<Props> = ({ open, shipment, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const ipfsGatewayDefault =
    (import.meta.env.VITE_IPFS_GATEWAY as string) || DEFAULT_GATEWAYS[0];
  const [gateway, setGateway] = useState(ipfsGatewayDefault.replace(/\/+$/, ''));

  const ipfsUrl = useMemo(() => {
    if (!shipment?.ipfsHash) return null;
    return `${gateway}/${encodeURIComponent(shipment.ipfsHash.trim())}`;
  }, [shipment, gateway]);

  const isImage = useMemo(() => {
    if (!ipfsUrl) return false;
    return /\.(png|jpe?g|gif|webp|bmp|svg)(?:$|\?)/i.test(ipfsUrl);
  }, [ipfsUrl]);

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    setCopied(false);
    setShowPreview(true);
  }, [shipment?.ipfsHash, open]);

  const handleCopy = async () => {
    if (!ipfsUrl) return;
    await navigator.clipboard.writeText(ipfsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!open || !shipment) return null;

  const qrLink = `${import.meta.env.VITE_FRONTEND_URL}/tracking?id=${shipment.shipmentId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-[680px] max-w-[94vw] rounded-xl shadow-xl p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold">Chi tiết lô hàng</h2>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass(
                shipment.status
              )}`}
            >
              {shipment.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT – QR (CĂN GIỮA DỌC) */}
          <div className="flex flex-col items-center border rounded-lg p-4 bg-gray-50 self-center">
            <h3 className="text-sm font-medium mb-2">Quét mã để theo dõi</h3>

            <QRCodeSVG value={qrLink} size={140} level="H" />

            <p className="mt-2 text-xs text-gray-500">
              ID: {shipment.shipmentId}
            </p>

            <div className="flex gap-2 mt-4 w-full">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-900 text-white py-2 rounded-lg"
              >
                <Printer className="w-3 h-3" /> In tem
              </button>

              <a
                href={qrLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center p-2 bg-gray-100 rounded-lg text-gray-600"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Xác minh</h3>
              <p className="text-xs text-gray-600">
                Giao dịch này đã được xác minh bằng mật mã và ghi nhận trên blockchain.
                Tính bất biến của công nghệ blockchain đảm bảo bản ghi không thể bị sửa
                đổi hoặc giả mạo.
              </p>
            </div>
          </div>

          {/* RIGHT – INFO */}
          <div className="space-y-3 text-sm">
            <div><b>Mã lô:</b> {shipment.shipmentId}</div>
            <div><b>Sản phẩm:</b> {shipment.productName}</div>
            <div><b>Số lượng:</b> {shipment.quantity}</div>
            <div>
              <b>Ngày SX:</b>{' '}
              {new Date(shipment.manufacturingDate).toLocaleString('vi-VN')}
            </div>

            <div className="pt-2 border-t">
              <b>Hash giao dịch:</b>
              <code className="block break-all text-xs bg-gray-50 p-2 rounded mt-1">
                {shipment.transactionHash}
              </code>
            </div>

            <div><b>Producer:</b> {shipment.producerAddress}</div>
            <div>
              <b>Tạo:</b>{' '}
              {new Date(shipment.createdAt).toLocaleString('vi-VN')}
            </div>
            <div>
              <b>Cập nhật:</b>{' '}
              {new Date(shipment.updatedAt).toLocaleString('vi-VN')}
            </div>

            {/* IPFS */}
            <div className="pt-3 border-t">
              <b>Tài liệu IPFS</b>

              <div className="flex items-center gap-2 mt-2">
                <select
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                  className="text-xs border rounded p-1"
                >
                  {DEFAULT_GATEWAYS.map((g) => (
                    <option key={g} value={g.replace(/\/+$/, '')}>
                      {new URL(g).host}
                    </option>
                  ))}
                </select>

                {ipfsUrl && (
                  <button
                    onClick={handleCopy}
                    className="text-xs border px-2 py-1 rounded"
                  >
                    {copied ? 'Đã sao chép' : 'Copy link'}
                  </button>
                )}
              </div>

              {ipfsUrl ? (
                <a
                  href={ipfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-blue-600 text-xs break-all hover:underline"
                >
                  {shipment.ipfsHash}
                </a>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Chưa có tài liệu
                </p>
              )}

              {ipfsUrl && isImage && showPreview && (
                <img
                  src={ipfsUrl}
                  onError={() => setShowPreview(false)}
                  className="mt-3 max-w-[260px] rounded border"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1 border rounded hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailModal;
