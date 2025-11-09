import React from 'react';
import { Shipment } from '../../types'; 

export type ShipmentListProps = {
  title?: string;
  shipments: Shipment[];
};

export const ShipmentList: React.FC<ShipmentListProps> = ({ title, shipments }) => {
  const formatVN = (d: string | number | Date) => new Date(d).toLocaleString('vi-VN');

  return (
    <div className="mt-4">
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {shipments.length === 0 ? (
        <div className="text-gray-500 text-sm">Chưa có dữ liệu.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3">ID</th>
                <th className="text-left py-2 px-3">Tên</th>
                <th className="text-left py-2 px-3">Trạng thái</th>
                <th className="text-left py-2 px-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shipments.map((s) => (
                <tr key={s.shipmentId || s.transactionHash}>
                  <td className="py-2 px-3">{s.shipmentId || s.transactionHash}</td>
                  <td className="py-2 px-3">{s.productName}</td>
                  <td className="py-2 px-3">{s.status}</td>
                  <td className="py-2 px-3">{formatVN(s.updatedAt || s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
