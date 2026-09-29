import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // ✅ Product name must be unique
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true, // ✅ Product code must be unique
      trim: true,
      uppercase: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },

    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    reorderLevel: {
      type: Number,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ active: 1, createdAt: -1 });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ active: 1, currentStock: 1, reorderLevel: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
