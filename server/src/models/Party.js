import mongoose from "mongoose";

const partySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["customer", "supplier"],
      required: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    since: Date,

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Existing name index
partySchema.index({
  name: 1,
  type: 1,
});

// Mobile number unique per party type
partySchema.index(
  {
    contactNumber: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      contactNumber: {
        $exists: true,
        $ne: "",
      },
    },
  },
);

export default mongoose.model("Party", partySchema);
