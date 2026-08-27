import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["retail", "supplier", "other"],
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "card", "credit"],
      default: "Cash",
    },

    paymentStatus: {
      type: String,
      enum: ["paid","partially_paid", "pending", "partial"],
      default: "Paid",
    },

    notes: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

saleSchema.index({ date: -1, type: 1 });

export default mongoose.model("Sale", saleSchema);
