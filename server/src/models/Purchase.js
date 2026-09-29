import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: { type: String, required: true, unique: true, index: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Party", default: null },
    date: { type: Date, required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 0.0001 },
        rate: { type: Number, required: true, min: 0 },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["Paid", "Partial", "Unpaid"], default: "Unpaid" },
    paidAmount: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

purchaseSchema.index({ date: -1, supplier: 1 });

export default mongoose.model("Purchase", purchaseSchema);
