import mongoose from "mongoose";

const partySchema = new mongoose.Schema({
  type: { type: String, enum: ["customer", "supplier"], required: true },
  code: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  contactNumber: { type: String, trim: true },
  address: { type: String, trim: true },
  since: Date,
  notes: { type: String, trim: true }
}, { timestamps: true });

partySchema.index({ name: 1, type: 1 });
export default mongoose.model("Party", partySchema);
