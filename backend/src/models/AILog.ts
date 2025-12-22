import mongoose, { Schema, Document } from "mongoose";

export interface AILog extends Document {
  shipmentId: string;
  zScore: number;
  latestDelta: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  transition?: string;
  sampleMean?: number;
  sampleStd?: number;
  sampleCount?: number;
  detectedAt: Date;
}

const AILogSchema = new Schema(
  {
    shipmentId: { type: String, required: true },
    zScore: { type: Number, required: true },
    latestDelta: { type: Number, required: true },
    transition: { type: String, required: false },
    sampleMean: { type: Number, required: false },
    sampleStd: { type: Number, required: false },
    sampleCount: { type: Number, required: false },
    level: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    detectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<AILog>("ai_logs", AILogSchema);
