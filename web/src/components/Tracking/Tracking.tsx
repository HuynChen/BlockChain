import React, { useState } from 'react';
import { getShipmentStatusOnChain, ChainShipmentData } from '../../services/blockchainService';
import { Search, Package, User, Calendar, Box } from 'lucide-react';

export const ConsumerTracking: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [data, setData] = useState<ChainShipmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await getShipmentStatusOnChain(searchId);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Không tìm thấy lô hàng này trên Blockchain.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CREATED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-yellow-100 text-yellow-800';
      case 'RECEIVED': return 'bg-purple-100 text-purple-800';
      case 'AUDITED': return 'bg-indigo-100 text-indigo-800';
      case 'FOR_SALE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tra Cứu Sản Phẩm</h1>
          <p className="text-gray-600 mt-2">Xác thực nguồn gốc minh bạch trên Blockchain</p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-8">
          <input
            type="text"
            placeholder="Nhập mã lô hàng (VD: 12 hoặc SHP-12)"
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang quét Blockchain...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-100">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <span className="font-mono font-bold text-lg">{data.id}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm`}>
                VERIFIED
              </span>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{data.productName}</h3>
                <div className="mt-2 inline-block">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(data.status)}`}>
                    {data.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <Box className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Số lượng</p>
                    <p className="font-medium">{data.quantity}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Ngày sản xuất</p>
                    <p className="font-medium">{data.manufactureDate}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Nhà sản xuất (Ví)</p>
                    <p className="font-mono text-xs text-gray-600 truncate w-full" title={data.producer}>
                      {data.producer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
              Dữ liệu được đọc trực tiếp từ Polygon PoS Chain (Amoy Testnet)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};