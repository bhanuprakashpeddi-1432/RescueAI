import mongoose from "mongoose";

const shelterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
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
  totalCapacity: { type: Number, required: true },
  currentOccupancy: { type: Number, required: true },
  availableBeds: { type: Number, required: true },
  loadPercent: { type: Number, required: true },
  status: { type: String, required: true },
  supplyStatus: {
    food: String,
    water: String,
    medicine: String,
    blankets: String,
  },
  hasToilets: Boolean,
  hasMedicalStaff: Boolean,
  hasPowerBackup: Boolean,
  hasCleanWater: Boolean,
  childrenPresent: { type: Number, default: 0 },
  elderlyPresent: { type: Number, default: 0 },
  specialNeedsPresent: { type: Number, default: 0 },
  coordinatorName: String,
  coordinatorPhone: String,
}, { timestamps: true });

shelterSchema.index({ "location.coordinates": "2dsphere" });

export const Shelter = mongoose.model("Shelter", shelterSchema);
