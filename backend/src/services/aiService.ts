import axios from "axios";

const AI_SERVICE_URL = "http://localhost:8001";

export const callIsolationForest = async (deltaTimes: number[]) => {
  const response = await axios.post(
    `${AI_SERVICE_URL}/ai/isolation-forest`,
    { deltaTimes }
  );

  return response.data; 
  // { anomalyScore, isAnomaly }
};
