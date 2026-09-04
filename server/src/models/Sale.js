import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    // ==========================================
    // SALE TYPE
    // ==========================================
    saleNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,

      enum: ["retail", "supplier", "other"],

      required: true,

      index: true,
    },

    // ==========================================
    // DATE
    // ==========================================

    date: {
      type: Date,

      required: true,

      index: true,
    },

    // ==========================================
    // PARTY ID
    //
    // Customer/Supplier:
    // actual Party ObjectId
    //
    // Other:
    // null
    // ==========================================

    partyId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Party",

      default: null,

      index: true,
    },

    // ==========================================
    // PARTY NAME
    //
    // Customer/Supplier:
    // copied from Party at sale time
    //
    // Other:
    // entered manually
    // ==========================================

    partyName: {
      type: String,

      required: true,

      trim: true,
    },

    // ==========================================
    // TOTAL AMOUNT
    // ==========================================

    amount: {
      type: Number,

      required: true,

      min: 0,
    },

    // ==========================================
    // PAYMENT MODE
    // ==========================================

    paymentMode: {
      type: String,
      required: true,
    },

    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    paymentStatus: {
      type: String,
      required: true,
    },
    // ==========================================
    // NOTES
    // ==========================================

    notes: {
      type: String,

      trim: true,

      default: "",
    },

    // ==========================================
    // CREATED BY
    // ==========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    // ==========================================
    // SOFT DELETE
    // ==========================================

    isDeleted: {
      type: Boolean,

      default: false,

      index: true,
    },

    // ==========================================
    // DELETED DATE
    // ==========================================

    deletedAt: {
      type: Date,

      default: null,
    },

    // ==========================================
    // DELETED BY
    // ==========================================

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null,
    },
  },

  {
    timestamps: true,
  },
);

// ==========================================
// INDEX
// ==========================================

saleSchema.index({
  date: -1,
  type: 1,
  isDeleted: 1,
});

export default mongoose.model("Sale", saleSchema);
