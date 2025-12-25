import mongoose, { Schema, Document } from "mongoose";

export interface AILog extends Document {
  shipmentId: string;
  engine: "Z_SCORE" | "ISOLATION_FOREST";

  // ===== Z-SCORE =====
  zScore?: number;
  latestDelta?: number;
  level?: "LOW" | "MEDIUM" | "HIGH";
  transition?: string;
  sampleMean?: number;
  sampleStd?: number;
  sampleCount?: number;
  
  // ===== ISOLATION FOREST =====
  score?: number;
  isAnomaly?: boolean;

  detectedAt: Date;
}

const AILogSchema = new Schema(
  {
    shipmentId: { type: String, required: true },

    engine: {
      type: String,
      enum: ["Z_SCORE", "ISOLATION_FOREST"],
      required: true,
    },

    // ===== Z-SCORE =====
    zScore: { type: Number },
    latestDelta: { type: Number },
    transition: { type: String },
    sampleMean: { type: Number },
    sampleStd: { type: Number },
    sampleCount: { type: Number },
    level: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },

    // ===== ISOLATION FOREST =====
    score: { type: Number },
    isAnomaly: { type: Boolean },

    detectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


export default mongoose.model<AILog>("ai_logs", AILogSchema);
