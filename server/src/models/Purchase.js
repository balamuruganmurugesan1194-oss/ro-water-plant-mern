import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
      index: true,
    },

    supplierName: {
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
      required: true,
      trim: true,
    },

    paymentStatus: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

purchaseSchema.index({
  date: -1,
  supplierId: 1,
  isDeleted: 1,
});

export default mongoose.model("Purchase", purchaseSchema);
