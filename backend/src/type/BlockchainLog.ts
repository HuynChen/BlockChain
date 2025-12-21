export interface BlockchainLog {
  txId: string;
  txHash: string;
  type: string;
  shipmentId: string;
  productName: string;
  from: string;
  to: string;
  status: "CONFIRMED" | "PENDING";
  timestamp: string;
  gasUsed: number;
  network: string;
}
