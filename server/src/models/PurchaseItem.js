import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("PurchaseItem", purchaseItemSchema);
