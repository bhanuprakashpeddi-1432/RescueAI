import { incidents, hospitals, shelters, ambulanceTeams, alertScenarios } from "./mockData.js";
import { Incident } from "../models/Incident.js";
import { Hospital } from "../models/Hospital.js";
import { Shelter } from "../models/Shelter.js";
import { Ambulance } from "../models/Ambulance.js";
import { Alert } from "../models/Alert.js";

export const seedDatabaseIfEmpty = async () => {
  try {
    const count = await Incident.countDocuments();
    if (count > 0) {
      console.log("Database already seeded.");
      return;
    }

    console.log("Seeding initial data...");
    
    const formattedIncidents = incidents.map(inc => ({
      ...inc,
      location: {
        ...inc.location,
        coordinates: {
          type: "Point",
          coordinates: [inc.location?.longitude || 0, inc.location?.latitude || 0]
        }
      }
    }));
    await Incident.insertMany(formattedIncidents);

    const formattedHospitals = hospitals.map(h => ({
      ...h,
      location: {
        ...h.location,
        coordinates: {
          type: "Point",
          coordinates: [h.location?.longitude || 0, h.location?.latitude || 0]
        }
      }
    }));
    await Hospital.insertMany(formattedHospitals);

    const formattedShelters = shelters.map(s => ({
      ...s,
      location: {
        ...s.location,
        coordinates: {
          type: "Point",
          coordinates: [s.location?.longitude || 0, s.location?.latitude || 0]
        }
      }
    }));
    await Shelter.insertMany(formattedShelters);

    const formattedAmbulances = ambulanceTeams.map(a => ({
      ...a,
      currentLocation: {
        ...a.currentLocation,
        coordinates: {
          type: "Point",
          coordinates: [a.currentLocation?.longitude || 0, a.currentLocation?.latitude || 0]
        }
      }
    }));
    await Ambulance.insertMany(formattedAmbulances);

    const initialAlerts = alertScenarios.slice(0, 5).map((a, i) => ({
      id: `ALT-${Date.now()}-${i}`,
      ...a
    }));
    await Alert.insertMany(initialAlerts);

    console.log("Data seeded successfully!");
  } catch (error) {
    console.error(`Error with data import: ${error}`);
  }
};
