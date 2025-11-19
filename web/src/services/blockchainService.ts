import { ethers, type Provider, type Signer, type TransactionResponse } from "ethers";

const CONTRACT_ADDRESS = "0xD7070F3e64aD987cb99A37d1A18877E407dC7586";

const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "qty",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "createShipment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_status",
        "type": "bool"
      }
    ],
    "name": "setProducerRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_status",
        "type": "bool"
      }
    ],
    "name": "setRetailerRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_status",
        "type": "bool"
      }
    ],
    "name": "setShipperRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "producer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "quantity",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "manufactureTimestamp",
        "type": "uint256"
      }
    ],
    "name": "ShipmentCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum SupplyChain.Status",
        "name": "oldStatus",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "enum SupplyChain.Status",
        "name": "newStatus",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ShipmentStatusUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_shipmentId",
        "type": "uint256"
      },
      {
        "internalType": "enum SupplyChain.Status",
        "name": "_newStatus",
        "type": "uint8"
      }
    ],
    "name": "updateStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_shipmentId",
        "type": "uint256"
      }
    ],
    "name": "getShipment",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "quantity",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "producer",
        "type": "address"
      },
      {
        "internalType": "enum SupplyChain.Status",
        "name": "currentStatus",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isProducer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isRetailer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isShipper",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "shipments",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "quantity",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "manufactureTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "producer",
        "type": "address"
      },
      {
        "internalType": "enum SupplyChain.Status",
        "name": "currentStatus",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export enum ShipmentStatus {
  CREATED = 0,
  SHIPPED = 1,
  RECEIVED = 2,
  AUDITED = 3,
  FOR_SALE = 4
}

export const getBlockchainContract = (providerOrSigner: Provider | Signer) => {
  try {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
  } catch (error) {
    console.error("Error initializing Smart Contract:", error);
    throw new Error("Cannot initialize contract.");
  }
};

const handleBlockchainError = (error: any): never => {
  console.error("Blockchain Raw Error:", error);

  if (error.code === 'ACTION_REJECTED' || error.code === 4001 || error.message?.includes("user rejected")) {
    throw new Error("❌ You rejected the transaction.");
  }

  let reason = error.reason || error.shortMessage || error.message || "";

  if (error.data?.message) reason = error.data.message;

  if (reason.includes("Not producer")) {
    throw new Error("⛔ You are NOT the Producer of this shipment.");
  }
  if (reason.includes("Not shipper")) {
    throw new Error("⛔ Only Shipper can update this status.");
  }
  if (reason.includes("Not retailer")) {
    throw new Error("⛔ Only Retailer can update this status.");
  }
  if (reason.includes("Invalid status transition")) {
    throw new Error("⛔ Invalid status transition! Must follow: Created -> Shipped -> Received...");
  }
  if (reason.includes("Shipment does not exist")) {
    throw new Error("⛔ Shipment does not exist on Blockchain.");
  }

  throw new Error(`⚠️ Blockchain Error: ${reason}`);
};

interface ShipmentData {
  productName: string;
  quantity: number | string;
  manufactureTimestamp: number | string;
}

export const callCreateShipment = async (data: ShipmentData) => {
  if (typeof (window as any).ethereum === 'undefined') throw new Error("MetaMask is not installed!");

  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract = getBlockchainContract(signer);

    const tx = await contract.createShipment(
      data.productName,
      data.quantity,
      data.manufactureTimestamp
    );
    return tx;
  } catch (error: any) {
    handleBlockchainError(error);
  }
};

export const callUpdateStatus = async (id: string | number, newStatus: number): Promise<TransactionResponse> => {
  if (!(window as any).ethereum) throw new Error("Please install MetaMask!");

  try {
    let numericId: string;
    if (typeof id === 'string' && id.startsWith('SHP-')) {
      numericId = id.replace('SHP-', '');
    } else {
      numericId = id.toString();
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract = getBlockchainContract(signer);

    console.log(`Calling updateStatus(id: ${numericId}, status: ${newStatus})`);

    const tx = await contract.updateStatus(numericId, newStatus);
    return tx;

  } catch (error: any) {
    handleBlockchainError(error);
  }
  throw new Error("Unknown error");
};

export interface ChainShipmentData {
  id: string;
  productName: string;
  quantity: string;
  manufactureDate: string;
  producer: string;
  status: string;
  rawStatus: number;
}

export const getShipmentStatusOnChain = async (id: string | number): Promise<ChainShipmentData | null> => {
  if (!(window as any).ethereum) {
    console.warn("MetaMask not found.");
    return null;
  }

  try {
    let numericId: string;
    if (typeof id === 'string' && id.startsWith('SHP-')) {
      numericId = id.replace('SHP-', '');
    } else {
      numericId = id.toString();
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const contract = getBlockchainContract(provider);

    console.log(`🔍 Reading Blockchain for ID: ${numericId}...`);

    const data = await contract.shipments(numericId);

    if (data[0] == 0n) {
      throw new Error("Shipment does not exist");
    }

    const statusMap = ["CREATED", "SHIPPED", "RECEIVED", "AUDITED", "FOR_SALE"];
    const statusIdx = Number(data[5]);

    const result: ChainShipmentData = {
      id: `SHP-${data[0].toString()}`,
      productName: data[1],
      quantity: data[2].toString(),
      manufactureDate: new Date(Number(data[3]) * 1000).toLocaleString('vi-VN'),
      producer: data[4],
      status: statusMap[statusIdx] || "UNKNOWN",
      rawStatus: statusIdx
    };

    return result;

  } catch (error: any) {
    console.error("Read Error:", error);
    if (error.message.includes("Shipment does not exist")) {
      throw new Error("⛔ Shipment not found on Blockchain.");
    }
    throw new Error("Connection error or shipment not found.");
  }
};