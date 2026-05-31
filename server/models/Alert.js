import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  severity: { type: String, required: true },
  category: { type: String },
  title: { type: String, required: true },
  action: { type: String },
  location: { type: String },
}, { timestamps: true });

export const Alert = mongoose.model("Alert", alertSchema);
