import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: {
    name: String,
    latitude: Number,
    longitude: Number,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: false } // [longitude, latitude]
    }
  },
  totalBeds: { type: Number, required: true },
  freeBeds: { type: Number, required: true },
  icuBeds: { type: Number, required: true },
  icuFree: { type: Number, required: true },
  ventilators: { type: Number, required: true },
  ventilatorsInUse: { type: Number, required: true },
  operationalLoad: { type: Number, required: true },
  status: { type: String, required: true },
  specialties: [String],
  emergencyContact: String,
  helipads: { type: Number, default: 0 },
  bloodBankAvailable: { type: Boolean, default: false },
  surgicalTeamsOnCall: { type: Number, default: 0 },
  admissionsSince00h: { type: Number, default: 0 },
  dischargesSince00h: { type: Number, default: 0 },
}, { timestamps: true });

hospitalSchema.index({ "location.coordinates": "2dsphere" });

export const Hospital = mongoose.model("Hospital", hospitalSchema);
