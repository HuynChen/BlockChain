import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { callCreateShipment } from '../../services/blockchainService';
import { IntegrationDev } from '../../services/integrationService';
import { ShipmentList } from './ShipmentList';
import { Shipment } from '../../types'; 

// ===== Spinner nhỏ =====
const Spinner = () => (
  <div className="inline-block animate-spin h-4 w-4 border-[2px] border-current border-t-transparent text-blue-600 rounded-full" />
);

// ===== Steps =====
type Step = 'init' | 'connecting' | 'signing' | 'mining' | 'backend' | 'done';
const stepMessages: Record<Step, string> = {
  init: '',
  connecting: 'Đang kết nối MetaMask...',
  signing: 'Vui lòng ký giao dịch trên MetaMask...',
  mining: 'Đang chờ xác nhận giao dịch...',
  backend: 'Đang gửi dữ liệu lên hệ thống...',
  done: 'Hoàn tất!',
};

// ===== Retry helper =====
const withRetry = async <T,>(
  fn: () => Promise<T>,
  retries = 3, delay = 800): Promise<T> => {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
  throw lastErr;
};

// ===== Props =====
type CreateShipmentFormProps = {
  onCreated?: (shipment: Shipment) => void;
  getNextShipmentId: () => string;
};

export const CreateShipmentForm: React.FC<CreateShipmentFormProps> = ({ onCreated, getNextShipmentId }) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('init');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !quantity || !manufacturingDate) {
      setError('Vui lòng nhập đủ thông tin.');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Số lượng không hợp lệ.');
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentStep('connecting');

    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask chưa được cài đặt!');
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const producerAddress = await signer.getAddress();

      setCurrentStep('signing');
      setCurrentStep('mining');

      const tx = await withRetry(() =>
        callCreateShipment({
          productName,
          quantity: quantityNum,
          manufactureTimestamp: Math.floor(new Date(manufacturingDate).getTime() / 1000),
        })
      );

      const hash = tx?.hash || tx?.transactionHash || (typeof tx === 'string' ? tx : '');
        if (!hash) throw new Error('Giao dịch chưa được broadcast (không có transaction hash).');
        setTxHash(hash);
        console.log('TX HASH:', hash);

      setCurrentStep('backend');
      const backendRes = await IntegrationDev.sendToBackend({
        productName,
        quantity: quantityNum,
        manufacturingDate: new Date(manufacturingDate).toISOString(),
        transactionHash: hash,
        producerAddress,
      });

      const fallbackId = getNextShipmentId(); 
      const shipmentId =
        backendRes?.data?.shipmentId && /^SHP-\d+$/.test(backendRes.data.shipmentId)
          ? backendRes.data.shipmentId
          : fallbackId;

      const now = new Date().toISOString();
      const createdShipment: Shipment = {
        shipmentId,
        productName,
        quantity: quantityNum,
        manufacturingDate: manufacturingDate,
        status: 'CREATED',
        transactionHash: hash,
        producerAddress,
        createdAt: now,
        updatedAt: now,
      };

      onCreated?.(createdShipment);

      setRecentShipments((prev) => [createdShipment, ...prev].slice(0, 5));
      setProductName('');
      setQuantity('');
      setManufacturingDate('');
      setCurrentStep('done');
    } catch (err: any) {
      setError(err?.message || 'Gặp lỗi khi tạo lô hàng.');
      setCurrentStep('init');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Tạo Lô Hàng Mới</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Tên sản phẩm"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Số lượng"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="datetime-local"
          value={manufacturingDate}
          onChange={(e) => setManufacturingDate(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 text-white rounded-lg ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Đang xử lý...' : 'Tạo Lô Hàng'}
        </button>
      </form>

      {/* Hiển thị tiến trình */}
      <div className="mt-4 space-y-2">
        {isLoading && currentStep !== 'init' && (
          <div className="mt-3 text-sm text-gray-600 flex items-center space-x-2">
            <Spinner />
            <span>{stepMessages[currentStep]}</span>
          </div>
        )}

        {currentStep === 'done' && txHash && (
          <div className="mt-3 text-green-700 text-sm">
            ✅ Tạo thành công!{' '}
            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Xem giao dịch
            </a>
          </div>
        )}
        {error && (
          <div className="mt-3 text-red-600 text-sm">⚠️ {error}</div>
        )}
        {currentStep === 'done' && recentShipments.length > 0 && (
          <ShipmentList shipments={recentShipments} title="Lô hàng vừa tạo" />
        )}
      </div>
    </div>
  );
};
