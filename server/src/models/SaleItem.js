import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    // ==========================================
    // SALE
    // ==========================================

    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
      index: true,
    },

    // ==========================================
    // PRODUCT
    // ==========================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // ==========================================
    // QUANTITY
    // ==========================================

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // ==========================================
    // RATE
    // ==========================================

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // AMOUNT
    // ==========================================

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

saleItemSchema.index({
  product: 1,
});

export default mongoose.model("SaleItem", saleItemSchema);
