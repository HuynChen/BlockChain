import React, { useState } from 'react';
import { ethers } from 'ethers';
import { callCreateShipment } from '../../services/blockchainService';
import { IntegrationDev } from '../../services/integrationService';
import { ShipmentList } from './ShipmentList';
import { Shipment } from '../../types'; 
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

type Step = 'init' | 'connecting' | 'signing' | 'mining' | 'backend' | 'done';

const stepMessages: Record<Step, string> = {
  init: '',
  connecting: 'Đang kết nối ví MetaMask...',
  signing: 'Vui lòng xác nhận giao dịch trên ví...',
  mining: 'Đang chờ Blockchain xác nhận (Khoảng 10-15s)...',
  backend: 'Đang lấy ID thật và đồng bộ...',
  done: 'Hoàn tất!',
};

type CreateShipmentFormProps = {
  onCreated?: (shipment: Shipment) => void;
  getNextShipmentId: () => string; 
};

export const CreateShipmentForm: React.FC<CreateShipmentFormProps> = ({ onCreated }) => {
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
      setError('Số lượng phải là số dương.');
      return;
    }

    setIsLoading(true);
    setError('');
    setTxHash('');
    setCurrentStep('connecting');

    try {
      if (!window.ethereum) throw new Error('MetaMask chưa được cài đặt!');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const producerAddress = await signer.getAddress();

      setCurrentStep('signing'); 
      const txResponse = await callCreateShipment({
        productName,
        quantity: quantityNum,
        manufactureTimestamp: Math.floor(new Date(manufacturingDate).getTime() / 1000),
      });

      setTxHash(txResponse.hash);
      setCurrentStep('mining'); 
      
      const receipt = await txResponse.wait(); 
      
      if (!receipt || receipt.status !== 1) {
        throw new Error('Giao dịch bị thất bại trên Blockchain.');
      }

      let realBlockchainId = "";
      
      try {
          for (const log of receipt.logs) {
              if (log.topics && log.topics[1]) {
                  const idBigInt = BigInt(log.topics[1]);
                  realBlockchainId = idBigInt.toString();
                  console.log("FOUND REAL ID:", realBlockchainId);
                  break; 
              }
          }
      } catch (e) {
          console.error("Không đọc được ID từ logs:", e);
      }

      const finalId = realBlockchainId || `SHP-${Date.now()}`;

      setCurrentStep('backend');

      await IntegrationDev.sendToBackend({
        shipmentId: finalId,
        productName,
        quantity: quantityNum,
        manufacturingDate: new Date(manufacturingDate).toISOString(),
        transactionHash: txResponse.hash,
        producerAddress,
      });

      const now = new Date().toISOString();
      const createdShipment: Shipment = {
        shipmentId: finalId,
        productName,
        quantity: quantityNum,
        manufacturingDate, 
        status: 'CREATED',
        transactionHash: txResponse.hash,
        producerAddress,
        createdAt: now,
        updatedAt: now,
      };

      onCreated?.(createdShipment);
      setRecentShipments(prev => [createdShipment, ...prev].slice(0, 5));
      
      setProductName('');
      setQuantity('');
      setManufacturingDate('');
      setCurrentStep('done');

    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Gặp lỗi khi tạo lô hàng.';
      if (msg.includes('user rejected')) msg = 'Bạn đã từ chối xác nhận trên ví.';
      setError(msg);
      setCurrentStep('init');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Tạo Lô Hàng Mới</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input
            type="text"
            placeholder="Ví dụ: iPhone 17..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                <input
                type="number"
                placeholder="1000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sản xuất</label>
                <input
                type="datetime-local"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2.5 text-white font-medium rounded-lg transition-all flex justify-center items-center space-x-2 ${
            isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>{stepMessages[currentStep]}</span>
              </>
          ) : (
              'Tạo Lô Hàng'
          )}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {currentStep === 'done' && txHash && (
          <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200 text-sm flex items-start space-x-2">
             <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
             <div>
                <p className="font-semibold">Tạo thành công!</p>
                <a
                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center mt-1"
                >
                Xem trên PolygonScan <ExternalLink className="h-3 w-3 ml-1" />
                </a>
             </div>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {currentStep === 'done' && recentShipments.length > 0 && (
          <div className="mt-6 border-t pt-4">
             <ShipmentList shipments={recentShipments} />
          </div>
        )}
      </div>
    </div>
  );
};