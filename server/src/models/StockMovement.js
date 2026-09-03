import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["purchase", "sale", "adjustment", "opening", "purchase-reversal", "sale-reversal"],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: "",
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

stockMovementSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model("StockMovement", stockMovementSchema);
