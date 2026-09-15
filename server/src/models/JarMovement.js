import mongoose from "mongoose";

const jarMovementSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", default: null },
    date: { type: Date, required: true, index: true },
    type: { type: String, enum: ["issued", "returned", "lost", "damaged"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

jarMovementSchema.index({ customer: 1, date: -1 });
export default mongoose.model("JarMovement", jarMovementSchema);
