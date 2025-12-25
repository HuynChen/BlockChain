from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.ensemble import IsolationForest

app = FastAPI(title="Isolation Forest AI Service")

# ===== Request schema =====
class IsolationRequest(BaseModel):
    deltaTimes: List[float]

# ===== Response schema =====
class IsolationResponse(BaseModel):
    anomalyScore: float
    isAnomaly: bool

@app.post("/ai/isolation-forest", response_model=IsolationResponse)
def detect_anomaly(data: IsolationRequest):
    X = np.array(data.deltaTimes).reshape(-1, 1)

    model = IsolationForest(
        n_estimators=100,
        contamination=0.2,
        random_state=42
    )

    model.fit(X)

    scores = model.decision_function(X)
    anomaly_score = float(scores.min())
    is_anomaly = anomaly_score < -0.1

    return {
        "anomalyScore": anomaly_score,
        "isAnomaly": is_anomaly
    }
