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
      enum: [
        "opening",
        "purchase",
        "sale",
        "adjustment",
        "production_in",
        "production_out",
      ],
      required: true,
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
    referenceType: {
      type: String,
      enum: ["sale", "manual", "opening"],
      default: "manual",
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

stockMovementSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model("StockMovement", stockMovementSchema);
