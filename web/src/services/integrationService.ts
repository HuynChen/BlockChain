import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface BackendShipmentData {
  shipmentId?: string;
  productName: string;
  quantity: number;
  manufacturingDate: string;
  status?: string;
  transactionHash: string;
  producerAddress: string;
}

const sendToBackend = async (data: BackendShipmentData) => {
  console.log("IntegrationDev: Sending data to backend:", data);

  try {
    const shipmentId = (data as any).shipmentId || `SHP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

    const requestBody = {
      shipmentId,
      productName: data.productName,
      quantity: data.quantity,
      manufacturingDate: data.manufacturingDate,
      status: data.status || "CREATED",
      transactionHash: data.transactionHash,
      producerAddress: data.producerAddress,
    };

    console.log("IntegrationDev: Request Body:", requestBody);

    const response = await axios.post(
      `${API_BASE_URL}/shipments`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("IntegrationDev: Backend responded successfully:", response.data);
    return response.data;

  } catch (error) {
    console.error("IntegrationDev: Error sending data to backend:", error);
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.response?.statusText || error.message;
      throw new Error(`API Error (${error.response?.status}): ${errorMsg}`);
    } else {
      throw new Error("An unexpected error occurred while contacting the backend.");
    }
  }
};

interface UpdateStatusData {
  shipmentId: string | number;
  status: string;
  transactionHash: string;
}

const updateStatus = async (data: UpdateStatusData) => {
  console.log("IntegrationDev: Syncing status to backend...", data);

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/shipments/status`,
      {
        shipmentId: String(data.shipmentId),
        status: data.status,
        transactionHash: data.transactionHash
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log("IntegrationDev: Backend synced successfully:", response.data);
    return response.data;

  } catch (error) {
    console.error("IntegrationDev: Error syncing status:", error);
    return null;
  }
};

export const IntegrationDev = {
  sendToBackend: sendToBackend,
  updateStatus: updateStatus,
};