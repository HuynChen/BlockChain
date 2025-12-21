import mongoose, { Schema, Document } from "mongoose";

/**
 * Các vai trò trong hệ thống chuỗi cung ứng
 */
export type UserRole =
  | "ADMIN"
  | "PRODUCER"
  | "SHIPPER"
  | "AUDITOR"
  | "RETAILER";

/**
 * Interface User
 */
export interface IUser extends Document {
  email: string;
  password_hash: string;

  name: string;                 // Tên hiển thị (dùng cho Blockchain Log)
  role: UserRole;               // Vai trò trong hệ thống
  walletAddress?: string;       // Địa chỉ ví blockchain (MetaMask)

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema User
 */
const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password_hash: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "PRODUCER", "SHIPPER", "AUDITOR", "RETAILER"],
      required: true,
      index: true,
    },

    walletAddress: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index giúp lookup ví nhanh khi map blockchain log
 */
UserSchema.index({ walletAddress: 1 });

export default mongoose.model<IUser>("User", UserSchema);
