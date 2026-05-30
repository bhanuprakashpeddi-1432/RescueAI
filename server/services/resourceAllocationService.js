/**
 * RescueAI — Resource Allocation Engine
 *
 * Deterministic engine for optimising emergency resource dispatch.
 * Uses geospatial distance (Haversine), capacity saturation, and capability matching
 * to recommend the most optimal shelters, hospitals, and rescue teams for a given incident.
 */

/* ══════════════════════════════════════════════════════════════
   GEOSPATIAL & MATH HELPERS
══════════════════════════════════════════════════════════════ */

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 100) / 100;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/* ══════════════════════════════════════════════════════════════
   HOSPITAL SCORING
══════════════════════════════════════════════════════════════ */

function scoreHospitals(hospitals, incident) {
  const incLat = incident.location?.latitude;
  const incLon = incident.location?.longitude;
  const severityWeight = incident.severity === "critical" ? 1.5 : incident.severity === "high" ? 1.2 : 1.0;

  const scored = hospitals.map(h => {
    // Distance
    const distanceKm = calculateDistance(incLat, incLon, h.location?.latitude, h.location?.longitude);
    
    // Normalize distance score (0 to 1, where closer is better, max practical distance 50km)
    const distanceScore = Math.max(0, 1 - (distanceKm / 50));

    // Capacity score (0 to 1)
    const loadScore = h.operationalLoad ? Math.max(0, 1 - (h.operationalLoad / 100)) : 0;
    const capacityScore = h.freeBeds > 0 ? (Math.min(h.freeBeds, 50) / 50) : 0;
    
    // Capability bonuses
    let capabilityBonus = 0;
    if (incident.severity === "critical" && h.icuFree > 0) capabilityBonus += 0.3;
    if (h.type === "Trauma Center" && (incident.category === "collapse" || incident.category === "earthquake")) capabilityBonus += 0.2;
    if (h.surgicalTeamsOnCall) capabilityBonus += 0.1;

    // Penalty for critical load
    const loadPenalty = h.operationalLoad >= 90 ? 0.8 : (h.operationalLoad >= 80 ? 0.3 : 0);
    const statusPenalty = h.status === "critical" ? 0.9 : 0;

    // Composite score
    let compositeScore = (distanceScore * 0.4) + (capacityScore * 0.3) + (loadScore * 0.3) + capabilityBonus;
    compositeScore = compositeScore - loadPenalty - statusPenalty;
    compositeScore = Math.max(0, Math.min(1.0, compositeScore));

    return {
      id: h.id,
      name: h.name,
      type: h.type,
      distanceKm,
      freeBeds: h.freeBeds,
      icuFree: h.icuFree,
      operationalLoad: h.operationalLoad,
      status: h.status,
      score: Math.round(compositeScore * 100) / 100,
      matchReason: compositeScore > 0.7 ? "High suitability" : (h.operationalLoad >= 90 ? "Critically loaded" : (distanceKm > 20 ? "Distant" : "Available")),
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/* ══════════════════════════════════════════════════════════════
   SHELTER SCORING
══════════════════════════════════════════════════════════════ */

function scoreShelters(shelters, incident) {
  const incLat = incident.location?.latitude;
  const incLon = incident.location?.longitude;
  const displacedCount = incident.displaced ?? 0;

  const scored = shelters.map(s => {
    const distanceKm = calculateDistance(incLat, incLon, s.location?.latitude, s.location?.longitude);
    const distanceScore = Math.max(0, 1 - (distanceKm / 40));

    // Capacity score based on how well it can handle the displaced count
    let capacityScore = 0;
    const available = s.availableBeds ?? 0;
    if (available > 0) {
      if (displacedCount === 0) {
         capacityScore = Math.min(1.0, available / 100);
      } else {
         capacityScore = Math.min(1.0, available / displacedCount);
      }
    }

    const loadScore = Math.max(0, 1 - ((s.loadPercent ?? 0) / 100));

    let infraBonus = 0;
    if (s.hasMedicalStaff) infraBonus += 0.15;
    if (s.hasPowerBackup) infraBonus += 0.1;
    if (s.hasCleanWater) infraBonus += 0.1;

    // Supply penalty
    let supplyPenalty = 0;
    const foodStr = s.supplyStatus?.food || "999";
    const foodMatch = foodStr.match(/(\d+)/);
    const foodH = foodMatch ? parseInt(foodMatch[1], 10) : 999;
    if (foodH <= 24) supplyPenalty += 0.3;

    let compositeScore = (distanceScore * 0.4) + (capacityScore * 0.4) + (loadScore * 0.2) + infraBonus;
    compositeScore -= supplyPenalty;
    if (s.status === "full") compositeScore = 0;
    
    compositeScore = Math.max(0, Math.min(1.0, compositeScore));

    return {
      id: s.id,
      name: s.name,
      distanceKm,
      availableBeds: s.availableBeds,
      loadPercent: s.loadPercent,
      hasMedicalStaff: s.hasMedicalStaff,
      status: s.status,
      score: Math.round(compositeScore * 100) / 100,
      matchReason: compositeScore > 0.6 ? (s.availableBeds >= displacedCount ? "Sufficient capacity" : "Partial capacity available") : (s.status === "full" ? "At capacity" : "Available"),
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/* ══════════════════════════════════════════════════════════════
   RESCUE TEAM (AMBULANCE) SCORING
══════════════════════════════════════════════════════════════ */

function scoreRescueTeams(teams, incident) {
    const incLat = incident.location?.latitude;
    const incLon = incident.location?.longitude;
    const needsALS = incident.severity === "critical" || incident.severity === "high";
  
    const scored = teams.map(t => {
      let distanceKm = 9999; // Mock data might not have ambulance locations, assume base station or random for now. 
      // If no location, we rely purely on status and type.
      let distanceScore = 0.5; // Neutral if unknown

      if (t.location) {
          distanceKm = calculateDistance(incLat, incLon, t.location.latitude, t.location.longitude);
          distanceScore = Math.max(0, 1 - (distanceKm / 30));
      }

      // Status score
      let statusScore = 0;
      if (t.status === "available") statusScore = 1.0;
      else if (t.status === "returning") statusScore = 0.6;
      else if (t.status === "dispatched" || t.status === "on-scene") statusScore = 0.1;

      // Type matching
      let typeScore = 0.5;
      if (needsALS && t.type === "ALS") typeScore = 1.0;
      if (!needsALS && t.type === "BLS") typeScore = 0.8;
      
      let compositeScore = (statusScore * 0.6) + (typeScore * 0.3) + (distanceScore * 0.1);
      compositeScore = Math.max(0, Math.min(1.0, compositeScore));

      return {
        id: t.id,
        callSign: t.callSign,
        type: t.type,
        status: t.status,
        distanceKm: distanceKm === 9999 ? "Unknown" : distanceKm,
        score: Math.round(compositeScore * 100) / 100,
        matchReason: t.status === "available" ? (typeScore === 1.0 ? "Available & Optimal Type" : "Available") : `Busy (${t.status})`,
      };
    });
  
    return scored.sort((a, b) => b.score - a.score);
}

/* ══════════════════════════════════════════════════════════════
   MAIN ALLOCATION ENGINE
══════════════════════════════════════════════════════════════ */

/**
 * Calculates optimal resource allocations for a given incident.
 * 
 * @param {object} incident - The incident to allocate for
 * @param {Array} hospitals - Available hospitals
 * @param {Array} shelters - Available shelters
 * @param {Array} rescueTeams - Available rescue teams (ambulances)
 * @returns {object} Recommended allocations
 */
export function allocateResources({ incident, hospitals, shelters, rescueTeams }) {
  const startedAt = Date.now();

  if (!incident || !incident.location) {
      throw new Error("Incident location is required for resource allocation.");
  }

  const hospitalRankings = scoreHospitals(hospitals, incident);
  const shelterRankings = scoreShelters(shelters, incident);
  const teamRankings = scoreRescueTeams(rescueTeams, incident);

  // Recommendations logic
  const recommendedHospitals = hospitalRankings.filter(h => h.score >= 0.4).slice(0, 3);
  const recommendedShelters = shelterRankings.filter(s => s.score >= 0.4 && s.availableBeds > 0).slice(0, 3);
  
  // Estimate teams needed based on severity and injured count
  let teamsNeeded = 1;
  if (incident.injured > 10) teamsNeeded = 3;
  else if (incident.injured > 3) teamsNeeded = 2;
  if (incident.severity === "critical") teamsNeeded = Math.max(teamsNeeded, 2);

  const recommendedTeams = teamRankings.filter(t => t.score >= 0.5).slice(0, teamsNeeded);

  const actionItems = [];
  if (recommendedTeams.length > 0) {
      actionItems.push(`Dispatch ${recommendedTeams.map(t => t.callSign).join(", ")} to incident location.`);
  } else {
      actionItems.push("WARNING: No available rescue teams meet criteria. Escalate immediately.");
  }

  if (incident.injured > 0 && recommendedHospitals.length > 0) {
       actionItems.push(`Prepare ${recommendedHospitals[0].name} (Distance: ${recommendedHospitals[0].distanceKm}km) for incoming casualties.`);
  }

  if (incident.displaced > 0) {
      if (recommendedShelters.length > 0) {
          const s = recommendedShelters[0];
          actionItems.push(`Route ${Math.min(incident.displaced, s.availableBeds)} displaced persons to ${s.name} (${s.availableBeds} beds available).`);
      } else {
           actionItems.push("WARNING: Insufficient shelter capacity nearby for displaced population.");
      }
  }

  return {
      allocationId: `ALLOC-${Date.now()}`,
      incidentId: incident.id,
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      incidentContext: {
          category: incident.category,
          severity: incident.severity,
          injured: incident.injured || 0,
          displaced: incident.displaced || 0,
          location: incident.location,
      },
      recommendations: {
          hospitals: recommendedHospitals,
          shelters: recommendedShelters,
          rescueTeams: recommendedTeams,
      },
      actionItems,
      allRankings: {
          hospitals: hospitalRankings.slice(0, 10), // Top 10 for detailed view
          shelters: shelterRankings.slice(0, 10),
          rescueTeams: teamRankings.slice(0, 10),
      }
  };
}
