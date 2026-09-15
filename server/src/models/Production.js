import mongoose from "mongoose";

const productionSchema = new mongoose.Schema(
  {
    productionNumber: { type: String, required: true, unique: true, index: true },
    date: { type: Date, required: true },
    output: {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 0.0001 },
    },
    inputs: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 0.0001 },
      },
    ],
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

productionSchema.index({ date: -1 });

export default mongoose.model("Production", productionSchema);
