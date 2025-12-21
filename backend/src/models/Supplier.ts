import { Schema, model } from "mongoose";

const supplierSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    avatar: String,

    trustScore: { type: Number, default: 0 },
    productsSupplied: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "verified", "flagged"],
      default: "pending",
    },

    certifications: [String],
  },
  { timestamps: true }
);

export default model("Supplier", supplierSchema);
