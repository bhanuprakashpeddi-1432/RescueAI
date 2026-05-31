import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, required: true },
  status: { type: String, required: true },
  location: {
    name: String,
    district: String,
    latitude: Number,
    longitude: Number,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: false } // [longitude, latitude]
    }
  },
  affectedPeople: { type: Number, default: 0 },
  displaced: { type: Number, default: 0 },
  injured: { type: Number, default: 0 },
  deceased: { type: Number, default: 0 },
  assignedUnits: { type: Number, default: 0 },
  details: { type: mongoose.Schema.Types.Mixed }, // Type-specific fields
  estimatedResolutionHours: { type: Number },
}, { timestamps: true });

incidentSchema.index({ "location.coordinates": "2dsphere" });

export const Incident = mongoose.model("Incident", incidentSchema);
