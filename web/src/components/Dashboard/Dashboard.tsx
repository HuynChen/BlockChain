import React, { useEffect, useState } from 'react';
import api from '../../services/apiService';
import {
  Package,
  Users,
  Activity,
  Shield,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { ShipmentList } from '../Products/ShipmentList';
import { Shipment } from '../../types';

/* ===== Interface ===== */
interface DashboardStats {
  totalShipments: number;
  productGrowth: string;
  activeSuppliers: number;
  newSuppliersCount: string;
  blockchainTransactions: number;
  transactionsToday: string;
  complianceRate: string;
}

export const Dashboard: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 0,
    productGrowth: "+0% tháng này",
    activeSuppliers: 0,
    newSuppliersCount: "+0 mới tuần này",
    blockchainTransactions: 0,
    transactionsToday: "+0 hôm nay",
    complianceRate: "0"
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ===== LOAD DATA THẬT ===== */
  const loadData = async () => {
    setLoading(true);
    try {
      const [shipmentsRes, statsRes, suppliersRes] = await Promise.all([
        api.get('/shipments'),
        api.get('/shipments/stats'),
        api.get('/suppliers')
      ]);

      /* Shipments */
      const shipmentData = shipmentsRes.data?.data || shipmentsRes.data || [];
      setShipments(shipmentData);

      /* Suppliers */
      const suppliers = Array.isArray(suppliersRes.data)
        ? suppliersRes.data
        : [];

      const activeSuppliersCount = suppliers.length; 
      // Nếu sau này có status thì đổi thành:
      // suppliers.filter(s => s.status === "ACTIVE").length

      /* Stats */
      setStats({
  ...statsRes.data,
  activeSuppliers: activeSuppliersCount,
  newSuppliersCount: "Dữ liệu thực tế"
});

      setError('');
    } catch (err) {
      console.error(err);
      setError('Không thể đồng bộ dữ liệu thực tế từ hệ thống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mr-2" />
        <span>Đang tải dữ liệu từ chuỗi cung ứng...</span>
      </div>
    );
  }

  /* ===== UI ===== */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Supply Chain Dashboard
          </h2>
          <p className="text-gray-600">
            Dữ liệu thời gian thực từ Blockchain Polygon Amoy
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* ===== METRICS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Tổng sản phẩm"
          value={stats.totalShipments.toLocaleString()}
          change={stats.productGrowth}
          changeType="tích cực"
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Nhà cung cấp hoạt động"
          value={stats.activeSuppliers.toString()}
          change={stats.newSuppliersCount}
          changeType="tích cực"
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Giao dịch blockchain"
          value={stats.blockchainTransactions.toLocaleString()}
          change={stats.transactionsToday}
          changeType="tích cực"
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Tỷ lệ tuân thủ"
          value={`${stats.complianceRate}%`}
          change="+0.3% cải thiện"
          changeType="tích cực"
          icon={Shield}
          color="yellow"
        />
      </div>

      {/* ===== SHIPMENTS ===== */}
      <div className="mb-8">
        <ShipmentList
          title="Lô hàng mới cập nhật"
          shipments={shipments}
          onRefresh={loadData}
        />
      </div>

      {/* ===== FLOW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Luồng hoạt động
          </h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-around px-10">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold">{stats.activeSuppliers}</p>
              <p className="text-[10px] text-gray-500 uppercase">Suppliers</p>
            </div>

            <div className="h-px bg-gray-300 flex-1 mx-4"></div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-md">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold">{stats.totalShipments}</p>
              <p className="text-[10px] text-gray-500 uppercase">Products</p>
            </div>

            <div className="h-px bg-gray-300 flex-1 mx-4"></div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold">{stats.blockchainTransactions}</p>
              <p className="text-[10px] text-gray-500 uppercase">Actions</p>
            </div>
          </div>
        </div>

        {/* ===== ALERT ===== */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Thông báo
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs font-bold text-green-800">
                Hệ thống ổn định
              </p>
              <p className="text-[10px] text-green-600">
                Đã đồng bộ {stats.blockchainTransactions} giao dịch thành công.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}