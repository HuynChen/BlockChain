import React, { useState } from 'react';
import { Shipment } from '../../types';
import ShipmentDetailModal from './ShipmentDetailModal';
import { ShipmentStatusUpdater } from './ShipmentStatusUpdater';
import { DocumentUpload } from '../Documents/DocumentUpload';
import { QRCodeGenerator } from '../Tracking/QRCodeGenerator';
import { ChevronDown, ChevronUp } from 'lucide-react';

export type ShipmentListProps = {
  title?: string;
  shipments: Shipment[];
  onRefresh?: () => void;
};

const formatVN = (d: string | number | Date | undefined | null) => {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleString('vi-VN');
  } catch {
    return 'Invalid Date';
  }
};

const renderStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    CREATED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-yellow-100 text-yellow-800',
    RECEIVED: 'bg-purple-100 text-purple-800',
    AUDITED: 'bg-green-100 text-green-800',
    FOR_SALE: 'bg-red-100 text-red-800',
  };
  const colorClass = colors[status] || 'bg-gray-100 text-gray-600';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

const ShipmentRow: React.FC<{
  shipment: Shipment;
  onRefresh?: () => void;
  onOpenDetail: (sh: Shipment) => void;
}> = ({ shipment: s, onRefresh, onOpenDetail }) => {
  const [showUpload, setShowUpload] = useState(false);

  const idOrHash = s.shipmentId || s.transactionHash || '—';

  return (
    <>
      <tr
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => onOpenDetail(s)}
        tabIndex={0}
        role="button"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenDetail(s);
          }
        }}
        aria-label={`Mở chi tiết lô hàng ${idOrHash}`}
      >
        <td className="py-3 px-4 font-mono text-xs">
          {s.shipmentId ? (
            <span className="font-bold text-blue-600">{s.shipmentId}</span>
          ) : (
            <span title={s.transactionHash}>
              {s.transactionHash ? `${s.transactionHash.substring(0, 10)}...` : '—'}
            </span>
          )}
        </td>

        <td className="py-3 px-4 font-medium">{s.productName || '—'}</td>

        <td className="py-3 px-4">{renderStatusBadge(s.status)}</td>

        <td className="py-3 px-4 text-gray-500 text-xs">
          {formatVN(s.updatedAt || s.createdAt)}
        </td>

        <td
          className="py-3 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-2">
            <ShipmentStatusUpdater
              shipmentId={s.shipmentId || s.transactionHash || ''}
              currentStatus={s.status}
              onStatusUpdated={() => {
                if (onRefresh) onRefresh();
              }}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUpload((v) => !v);
              }}
              className={`p-1.5 rounded-full transition-colors ${showUpload ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-500'}`}
              title="Mở rộng: Upload tài liệu & QR Code"
              aria-pressed={showUpload}
            >
              {showUpload ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </td>

        <td
          className="py-3 px-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
        </td>
      </tr>

      {showUpload && (
        <tr className="bg-blue-50/20 animate-in fade-in zoom-in duration-200">
          <td colSpan={5} className="p-0">
            <div className="border-b border-blue-100 p-6 bg-gradient-to-b from-blue-50/30 to-white">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 w-full">
                  <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 h-full">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg mb-2">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Upload tài liệu
                      </span>
                    </div>
                    <DocumentUpload
                      shipmentId={s.shipmentId || ''}
                      onSuccess={() => {
                        if (onRefresh) onRefresh();
                      }}
                    />
                  </div>
                </div>

                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="relative">
                    <span className="absolute -top-3 -left-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10">
                      TEM SẢN PHẨM
                    </span>
                    <QRCodeGenerator
                      shipment={s}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUpload(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1 hover:underline"
                >
                  <ChevronUp className="w-3 h-3" /> Thu gọn
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export const ShipmentList: React.FC<ShipmentListProps> = ({ title, shipments, onRefresh }) => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [open, setOpen] = useState(false);

  const openDetail = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setOpen(true);
  };

  return (
    <div className="mt-6">
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>}

      {shipments.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          Chưa có dữ liệu lô hàng.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="py-3 px-4 border-b">ID / Hash</th>
                <th className="py-3 px-4 border-b">Sản phẩm</th>
                <th className="py-3 px-4 border-b">Trạng thái</th>
                <th className="py-3 px-4 border-b">Ngày Tạo / Sửa</th>
                <th className="py-3 px-4 border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <ShipmentRow
                  key={s.shipmentId || s.transactionHash || Math.random()}
                  shipment={s}
                  onRefresh={onRefresh}
                  onOpenDetail={openDetail}
                />
              ))}
            </tbody>
          </table>

          <ShipmentDetailModal
            open={open}
            shipment={selectedShipment}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
