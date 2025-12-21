import mongoose, { Schema, Document } from "mongoose";

export interface AILog extends Document {
  shipmentId: string;
  zScore: number;
  latestDelta: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  detectedAt: Date;
}

const AILogSchema = new Schema(
  {
    shipmentId: { type: String, required: true },
    zScore: { type: Number, required: true },
    latestDelta: { type: Number, required: true },
    level: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    detectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<AILog>("ai_logs", AILogSchema);
