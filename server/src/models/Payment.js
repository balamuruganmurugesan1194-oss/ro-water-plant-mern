import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: { type: String, required: true, unique: true, index: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    direction: { type: String, enum: ["received", "paid"], required: true, index: true },
    date: { type: Date, required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    mode: { type: String, required: true, default: "Cash" },
    reference: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

paymentSchema.index({ party: 1, direction: 1, date: -1 });
export default mongoose.model("Payment", paymentSchema);
