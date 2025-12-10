import React, { useState } from 'react';
import { Shipment } from '../../types';
import ShipmentDetailModal from './ShipmentDetailModal';
import { ShipmentStatusUpdater } from './ShipmentStatusUpdater';
import { UploadButton } from "./UploadButton";

export type ShipmentListProps = {
  title?: string;
  shipments: Shipment[];
  onRefresh?: () => void;
};

export const ShipmentList: React.FC<ShipmentListProps> = ({ title, shipments, onRefresh }) => {

  const formatVN = (d: string | number | Date) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('vi-VN');
  };

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [open, setOpen] = useState(false);

  const openDetail = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setOpen(true);
  };

  const handleRowKey = (e: React.KeyboardEvent, shipment: Shipment) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetail(shipment);
    }
  };

  const renderStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      CREATED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-yellow-100 text-yellow-800',
      RECEIVED: 'bg-purple-100 text-purple-800',
      AUDITED: 'bg-indigo-100 text-indigo-800',
      FOR_SALE: 'bg-green-100 text-green-800',
    };
    const colorClass = colors[status] || 'bg-gray-100 text-gray-600';

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="mt-6">
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>}

      {shipments.length === 0 ? (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          Chưa có dữ liệu lô hàng.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="py-3 px-4 border-b">ID / Hash</th>
                <th className="py-3 px-4 border-b">Sản phẩm</th>
                <th className="py-3 px-4 border-b">Trạng thái</th>
                <th className="py-3 px-4 border-b">Ngày tạo/Sửa</th>
                <th className="py-3 px-4 border-b text-center">Cập nhật</th>
                <th className="py-3 px-4 border-b text-center">Upload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {shipments.map((s) => (
                <tr
                  key={s.shipmentId || s.transactionHash}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => openDetail(s)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => handleRowKey(e, s)}
                  aria-label={`Mở chi tiết lô hàng ${s.shipmentId || s.transactionHash}`}
                >
                  <td className="py-3 px-4 font-mono text-xs">
                    {s.shipmentId ? (
                      <span className="font-bold text-blue-600">{s.shipmentId}</span>
                    ) : (
                      <span title={s.transactionHash}>
                        {s.transactionHash?.substring(0, 10)}...
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium">{s.productName}</td>
                  <td className="py-3 px-4">{renderStatusBadge(s.status)}</td>
                  <td className="py-3 px-4 text-gray-530">{formatVN(s.updatedAt || s.createdAt)}</td>
                  <td
                    className="py-3 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center">
                      <ShipmentStatusUpdater
                        shipmentId={s.shipmentId || s.transactionHash}
                        currentStatus={s.status}
                        onStatusUpdated={() => {
                          if (onRefresh) onRefresh();
                        }}
                      />
                    </div>
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UploadButton
                      shipmentId={s.shipmentId}
                      onUploaded={() => {
                        if (onRefresh) onRefresh();
                      }}
                    />

                  </td>
                </tr>
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
