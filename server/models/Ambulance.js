import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  callSign: { type: String, required: true },
  type: { type: String, required: true },
  vehicleType: String,
  registrationNo: String,
  crew: [String],
  crewCount: Number,
  status: { type: String, required: true },
  assignedIncident: String,
  currentLocation: {
    latitude: Number,
    longitude: Number,
    description: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: false } // [longitude, latitude]
    }
  },
  eta: String,
  hospital: String,
  equipment: [String],
  fuelPercent: Number,
  lastServiceDate: String,
  dispatchedAt: Date,
}, { timestamps: true });

ambulanceSchema.index({ "currentLocation.coordinates": "2dsphere" });

export const Ambulance = mongoose.model("Ambulance", ambulanceSchema);
