export type Shipment = {
  shipmentId: string;
  productName: string;
  quantity: number;
  manufacturingDate: string | Date;
  status: 'CREATED' | 'SHIPPED' | 'RECEIVED' | 'AUDITED' | 'FOR_SALE';
  transactionHash: string;
  producerAddress: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  ipfsHash?: string;
};

export interface Supplier {
  id: string;
  name: string;
  location: string;
  trustScore: number;
  certifications: string[];
  productsSupplied: number;
  status: 'verified' | 'pending' | 'flagged';
  joinDate: string;
  avatar: string;
}

export interface Transaction {
  id: string;
  type: 'transfer' | 'verification' | 'certification';
  from: string;
  to: string;
  productId: string;
  timestamp: string;
  blockchainHash: string;
  gasUsed: number;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface DashboardMetrics {
  totalProducts: number;
  activeSuppliers: number;
  verifiedTransactions: number;
  complianceRate: number;
  trendsData: Array<{
    date: string;
    products: number;
    transactions: number;
  }>;
}

export interface SmartContract {
  id: string;
  name: string;
  address: string;
  type: 'quality' | 'logistics' | 'payment';
  status: 'active' | 'paused' | 'deployed';
  deployer: string;
  gasUsed: number;
  lastExecution: string;
}