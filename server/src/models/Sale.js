import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  type: { type: String, enum: ["retail", "supplier", "other"], required: true },
  date: { type: Date, required: true },
  customerName: { type: String, trim: true },
  contactNumber: { type: String, trim: true },
  area: { type: String, trim: true },
  product: { type: String, trim: true },
  quantity: { type: Number, default: 0, min: 0 },
  rate: { type: Number, default: 0, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  paymentMode: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Card", "Credit"], default: "Cash" },
  paymentStatus: { type: String, enum: ["Paid", "Pending", "Partial"], default: "Paid" },
  notes: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

saleSchema.index({ date: -1, type: 1 });
export default mongoose.model("Sale", saleSchema);
