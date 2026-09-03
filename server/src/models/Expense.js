import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    expenseNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    date: { type: Date, required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    vendor: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

expenseSchema.index({ date: -1, category: 1 });
export default mongoose.model("Expense", expenseSchema);
