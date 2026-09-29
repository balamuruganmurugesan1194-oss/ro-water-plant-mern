import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", default: null },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ["pending", "delivered", "cancelled"], default: "pending", index: true },
    items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, quantity: { type: Number, required: true, min: 0.0001 } }],
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

deliverySchema.index({ customer: 1, date: -1 });
export default mongoose.model("Delivery", deliverySchema);
