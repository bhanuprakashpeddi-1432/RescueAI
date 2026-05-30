/**
 * RescueAI — Disaster Risk Prediction Engine
 *
 * Lightweight, deterministic forecasting engine that analyses current
 * operational data to produce forward-looking risk predictions.
 *
 * No LLM dependency — pure algorithmic scoring using weighted heuristics,
 * exponential decay analysis, and threshold-based escalation rules.
 *
 * Three scoring pillars:
 *   1. Historical incident pattern analysis (frequency, severity trends, cascade risk)
 *   2. Shelter pressure forecasting (occupancy velocity, supply depletion curves)
 *   3. Weather / environmental signal processing (simulated conditions)
 *
 * Output: RiskForecast containing scored risk zones, predicted incidents,
 *         and prioritised recommended actions.
 */

/* ══════════════════════════════════════════════════════════════
   CONSTANTS & CONFIGURATION
══════════════════════════════════════════════════════════════ */

const SEVERITY_WEIGHT = { critical: 1.0, high: 0.75, medium: 0.5, low: 0.25 };
const STATUS_WEIGHT   = { active: 1.0, monitoring: 0.5, resolved: 0.1 };

const CATEGORY_CASCADE_MAP = {
  flood:      ["collapse", "gas", "medical"],
  fire:       ["gas", "collapse", "medical"],
  cyclone:    ["flood", "collapse", "fire"],
  earthquake: ["collapse", "gas", "fire", "flood"],
  gas:        ["fire", "medical"],
  collapse:   ["gas", "medical"],
};

const CATEGORY_BASE_RECURRENCE = {
  flood: 0.7, fire: 0.5, cyclone: 0.3, earthquake: 0.15, gas: 0.35, collapse: 0.2,
};

const RISK_LEVEL_THRESHOLDS = [
  { min: 0.80, level: "EXTREME",   color: "#dc2626", numLevel: 5 },
  { min: 0.60, level: "VERY HIGH", color: "#ea580c", numLevel: 4 },
  { min: 0.40, level: "HIGH",      color: "#f59e0b", numLevel: 3 },
  { min: 0.20, level: "MODERATE",  color: "#0891b2", numLevel: 2 },
  { min: 0.00, level: "LOW",       color: "#22c55e", numLevel: 1 },
];

function classifyRisk(score) {
  for (const t of RISK_LEVEL_THRESHOLDS) {
    if (score >= t.min) return t;
  }
  return RISK_LEVEL_THRESHOLDS[RISK_LEVEL_THRESHOLDS.length - 1];
}

/* ══════════════════════════════════════════════════════════════
   SIMULATED WEATHER CONDITIONS
   In production, this would be fed from a weather API.
   For the prototype, we generate realistic monsoon-season
   conditions for the Pune / Coastal Maharashtra region.
══════════════════════════════════════════════════════════════ */

function generateWeatherConditions() {
  const now = new Date();
  const hour = now.getUTCHours();

  // Simulate monsoon-season conditions — peak rainfall at night/early morning
  const isNightPeak = hour >= 0 && hour <= 6;
  const baseRainfall = isNightPeak ? 120 + Math.random() * 160 : 40 + Math.random() * 80;

  return {
    timestamp: now.toISOString(),
    region: "Pune Metropolitan & Coastal Districts",
    conditions: {
      rainfallMmPerHour:  Math.round(baseRainfall * 10) / 10,
      rainfall6hForecast: Math.round(baseRainfall * (3.5 + Math.random() * 2.5)),
      rainfall24hForecast: Math.round(baseRainfall * (10 + Math.random() * 8)),
      windSpeedKmh:       Math.round(25 + Math.random() * 60),
      windGustKmh:        Math.round(45 + Math.random() * 90),
      temperature:        Math.round((24 + Math.random() * 8) * 10) / 10,
      humidity:           Math.round(70 + Math.random() * 25),
      visibility:         Math.round((2 + Math.random() * 8) * 10) / 10,
      seaState:           Math.random() > 0.5 ? "rough" : "very rough",
      stormSurgeRisk:     Math.random() > 0.6 ? "high" : "moderate",
      lightningRisk:      Math.random() > 0.4 ? "active" : "low",
    },
    warnings: [],
    _simulated: true,
  };
}

function enrichWeatherWarnings(weather) {
  const c = weather.conditions;
  const w = [];

  if (c.rainfallMmPerHour > 80)  w.push({ type: "HEAVY_RAIN",    message: `Heavy rainfall: ${c.rainfallMmPerHour} mm/hr. Flash flood risk elevated.`, severity: "high" });
  if (c.rainfall6hForecast > 200) w.push({ type: "FLOOD_WATCH",   message: `6-hour forecast: ${c.rainfall6hForecast} mm. Flood watch advisable for low-lying areas.`, severity: "high" });
  if (c.windSpeedKmh > 60)       w.push({ type: "HIGH_WIND",     message: `Sustained winds: ${c.windSpeedKmh} km/h. Structural damage risk to temporary shelters.`, severity: "high" });
  if (c.windGustKmh > 100)       w.push({ type: "CYCLONE_GUST",  message: `Wind gusts: ${c.windGustKmh} km/h. Cyclonic intensity gusts detected.`, severity: "critical" });
  if (c.visibility < 3)          w.push({ type: "LOW_VISIBILITY", message: `Visibility: ${c.visibility} km. Aerial/road rescue operations impaired.`, severity: "medium" });
  if (c.lightningRisk === "active") w.push({ type: "LIGHTNING",   message: "Active lightning detected. Suspend outdoor rescue operations.", severity: "high" });
  if (c.stormSurgeRisk === "high") w.push({ type: "STORM_SURGE",  message: "Storm surge risk HIGH. Coastal evacuation routes must remain open.", severity: "critical" });

  weather.warnings = w;
  return weather;
}

/* ══════════════════════════════════════════════════════════════
   PILLAR 1: HISTORICAL INCIDENT ANALYSIS
══════════════════════════════════════════════════════════════ */

function analyseIncidentPatterns(incidents) {
  const now = Date.now();

  /* Group by category */
  const byCategory = {};
  for (const inc of incidents) {
    const cat = inc.category ?? "other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(inc);
  }

  const categoryScores = {};

  for (const [category, items] of Object.entries(byCategory)) {
    const activeCount    = items.filter(i => i.status === "active").length;
    const totalAffected  = items.reduce((s, i) => s + (i.affectedPeople ?? 0), 0);
    const avgSeverity    = items.reduce((s, i) => s + (SEVERITY_WEIGHT[i.severity] ?? 0.3), 0) / items.length;

    /* Recency weight: more recent incidents score higher (exponential decay, 48h half-life) */
    const recencyScores = items.map(i => {
      const ageHours = (now - new Date(i.updatedAt ?? i.createdAt).getTime()) / 3_600_000;
      return Math.exp(-0.693 * ageHours / 48);  // ln(2)/48 ≈ 0.01444
    });
    const avgRecency = recencyScores.reduce((a, b) => a + b, 0) / recencyScores.length;

    /* Frequency signal: more incidents of same category → higher risk of continuation */
    const frequencyFactor = Math.min(1.0, items.length / 5);

    /* Active severity multiplier */
    const activeIntensity = activeCount > 0
      ? Math.min(1.0, activeCount / 3) * avgSeverity
      : 0;

    /* Composite score [0–1] */
    const raw = (
      avgSeverity      * 0.25 +
      avgRecency       * 0.20 +
      frequencyFactor  * 0.15 +
      activeIntensity  * 0.25 +
      Math.min(1.0, totalAffected / 50000) * 0.15
    );

    categoryScores[category] = {
      category,
      incidentCount:  items.length,
      activeCount,
      totalAffected,
      avgSeverity:    Math.round(avgSeverity * 100) / 100,
      recencyFactor:  Math.round(avgRecency * 100) / 100,
      frequencyFactor: Math.round(frequencyFactor * 100) / 100,
      riskScore:      Math.round(Math.min(1.0, raw) * 100) / 100,
    };
  }

  return categoryScores;
}

/* ══════════════════════════════════════════════════════════════
   PILLAR 2: SHELTER PRESSURE FORECASTING
══════════════════════════════════════════════════════════════ */

function analyseShelterPressure(shelters, incidents) {
  const totalCapacity   = shelters.reduce((s, sh) => s + sh.totalCapacity, 0);
  const totalOccupancy  = shelters.reduce((s, sh) => s + sh.currentOccupancy, 0);
  const overallLoadPct  = totalCapacity > 0 ? totalOccupancy / totalCapacity : 0;

  /* Estimate incoming displaced not yet sheltered */
  const totalDisplaced = incidents
    .filter(i => i.status === "active")
    .reduce((s, i) => s + (i.displaced ?? 0), 0);
  const totalSheltered = totalOccupancy;
  const unsheltered    = Math.max(0, totalDisplaced - totalSheltered);

  /* Supply depletion risk */
  const parseSupplyHours = (str) => {
    if (!str) return 999;
    const match = String(str).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  const shelterRisks = shelters.map(sh => {
    const foodH     = parseSupplyHours(sh.supplyStatus?.food);
    const waterH    = parseSupplyHours(sh.supplyStatus?.water);
    const medH      = parseSupplyHours(sh.supplyStatus?.medicine);
    const minSupply = Math.min(foodH, waterH, medH);

    /* Risk factors */
    const loadRisk    = sh.loadPercent >= 100 ? 1.0 : sh.loadPercent >= 85 ? 0.8 : sh.loadPercent >= 70 ? 0.5 : 0.2;
    const supplyRisk  = minSupply <= 12 ? 1.0 : minSupply <= 24 ? 0.7 : minSupply <= 48 ? 0.4 : 0.1;
    const vulnRatio   = sh.totalCapacity > 0
      ? ((sh.elderlyPresent ?? 0) + (sh.childrenPresent ?? 0) + (sh.specialNeedsPresent ?? 0)) / sh.totalCapacity
      : 0;
    const vulnRisk    = Math.min(1.0, vulnRatio * 3);
    const infraRisk   = (!sh.hasPowerBackup ? 0.3 : 0) + (!sh.hasMedicalStaff ? 0.3 : 0) + (!sh.hasCleanWater ? 0.4 : 0);

    const compositeRisk = Math.min(1.0,
      loadRisk    * 0.30 +
      supplyRisk  * 0.30 +
      vulnRisk    * 0.20 +
      infraRisk   * 0.20
    );

    const alerts = [];
    if (sh.status === "full") alerts.push(`${sh.name} is FULL — no beds available`);
    if (minSupply <= 24)      alerts.push(`${sh.name} — supply critical: ${minSupply}h until depletion`);
    if (!sh.hasPowerBackup)   alerts.push(`${sh.name} — no power backup`);
    if (vulnRatio > 0.3)     alerts.push(`${sh.name} — high vulnerable population ratio (${Math.round(vulnRatio * 100)}%)`);

    return {
      shelterId:    sh.id,
      shelterName:  sh.name,
      loadPercent:  sh.loadPercent,
      minSupplyHours: minSupply,
      riskScore:    Math.round(compositeRisk * 100) / 100,
      riskLevel:    classifyRisk(compositeRisk),
      alerts,
    };
  });

  /* Aggregate shelter pressure score */
  const avgShelterRisk = shelterRisks.length > 0
    ? shelterRisks.reduce((s, r) => s + r.riskScore, 0) / shelterRisks.length
    : 0;

  /* Capacity saturation risk: will we run out of shelter beds? */
  const totalAvailable  = totalCapacity - totalOccupancy;
  const saturationRisk  = totalAvailable <= 0
    ? 1.0
    : unsheltered > totalAvailable
      ? 0.9
      : unsheltered > totalAvailable * 0.5
        ? 0.6
        : 0.2;

  const overallPressure = Math.min(1.0, avgShelterRisk * 0.5 + saturationRisk * 0.3 + overallLoadPct * 0.2);

  return {
    totalCapacity,
    totalOccupancy,
    overallLoadPct:  Math.round(overallLoadPct * 100),
    unsheltered,
    saturationRisk:  Math.round(saturationRisk * 100) / 100,
    overallPressure: Math.round(overallPressure * 100) / 100,
    shelterRisks,
  };
}

/* ══════════════════════════════════════════════════════════════
   PILLAR 3: WEATHER-DRIVEN RISK SCORING
══════════════════════════════════════════════════════════════ */

function analyseWeatherRisk(weather) {
  const c = weather.conditions;

  /* Sub-scores */
  const floodRisk   = Math.min(1.0, (c.rainfallMmPerHour / 150) * 0.4 + (c.rainfall6hForecast / 500) * 0.6);
  const windRisk    = Math.min(1.0, c.windSpeedKmh / 120);
  const cycloneRisk = Math.min(1.0, (c.windGustKmh / 180) * 0.6 + (c.stormSurgeRisk === "high" ? 0.4 : 0.1));
  const fireRisk    = Math.min(1.0, Math.max(0, (1 - c.humidity / 100) * 0.5 + (c.temperature > 35 ? 0.3 : 0) + (c.windSpeedKmh > 40 ? 0.2 : 0)));

  const compositeWeatherRisk = Math.min(1.0,
    floodRisk   * 0.35 +
    windRisk    * 0.20 +
    cycloneRisk * 0.30 +
    fireRisk    * 0.15
  );

  return {
    floodRisk:            Math.round(floodRisk * 100) / 100,
    windRisk:             Math.round(windRisk * 100) / 100,
    cycloneRisk:          Math.round(cycloneRisk * 100) / 100,
    fireRisk:             Math.round(fireRisk * 100) / 100,
    compositeWeatherRisk: Math.round(compositeWeatherRisk * 100) / 100,
    weatherWarnings:      weather.warnings,
  };
}

/* ══════════════════════════════════════════════════════════════
   PREDICTION: CASCADING INCIDENT GENERATOR
══════════════════════════════════════════════════════════════ */

function generatePredictedIncidents(categoryScores, shelterPressure, weatherRisk, weather) {
  const predictions = [];
  const now = new Date();

  /* Cascade predictions from active high-risk categories */
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score.riskScore < 0.35 || score.activeCount === 0) continue;

    const cascadeTargets = CATEGORY_CASCADE_MAP[category] ?? [];
    for (const target of cascadeTargets) {
      const baseProb = CATEGORY_BASE_RECURRENCE[target] ?? 0.2;
      const cascadeProb = Math.min(0.95, score.riskScore * baseProb * 1.5);
      if (cascadeProb < 0.25) continue;

      predictions.push({
        type: "cascade",
        predictedCategory: target,
        triggeredBy: category,
        probability: Math.round(cascadeProb * 100) / 100,
        timeframeHours: Math.round(6 + Math.random() * 18),
        reasoning: `Active ${category} incidents (${score.activeCount}) increase ${target} risk via cascade dynamics.`,
        riskLevel: classifyRisk(cascadeProb),
      });
    }
  }

  /* Weather-driven predictions */
  if (weatherRisk.floodRisk > 0.5) {
    predictions.push({
      type: "weather",
      predictedCategory: "flood",
      triggeredBy: "heavy_rainfall",
      probability: Math.round(weatherRisk.floodRisk * 100) / 100,
      timeframeHours: Math.round(3 + Math.random() * 9),
      reasoning: `Rainfall forecast of ${weather.conditions.rainfall6hForecast} mm in 6h exceeds flash flood threshold for urban drainage systems.`,
      riskLevel: classifyRisk(weatherRisk.floodRisk),
    });
  }

  if (weatherRisk.cycloneRisk > 0.4) {
    predictions.push({
      type: "weather",
      predictedCategory: "cyclone",
      triggeredBy: "wind_surge",
      probability: Math.round(weatherRisk.cycloneRisk * 100) / 100,
      timeframeHours: Math.round(6 + Math.random() * 12),
      reasoning: `Wind gusts of ${weather.conditions.windGustKmh} km/h with ${weather.conditions.stormSurgeRisk} storm surge risk indicate cyclonic conditions.`,
      riskLevel: classifyRisk(weatherRisk.cycloneRisk),
    });
  }

  if (weatherRisk.fireRisk > 0.4) {
    predictions.push({
      type: "weather",
      predictedCategory: "fire",
      triggeredBy: "low_humidity_wind",
      probability: Math.round(weatherRisk.fireRisk * 100) / 100,
      timeframeHours: Math.round(4 + Math.random() * 20),
      reasoning: `Low humidity (${weather.conditions.humidity}%) combined with ${weather.conditions.windSpeedKmh} km/h winds elevates fire spread risk.`,
      riskLevel: classifyRisk(weatherRisk.fireRisk),
    });
  }

  /* Shelter overflow prediction */
  if (shelterPressure.saturationRisk > 0.5) {
    predictions.push({
      type: "capacity",
      predictedCategory: "shelter_overflow",
      triggeredBy: "displacement_surge",
      probability: Math.round(shelterPressure.saturationRisk * 100) / 100,
      timeframeHours: Math.round(2 + Math.random() * 10),
      reasoning: `${shelterPressure.unsheltered} displaced persons without shelter assignment. Available beds: ${shelterPressure.totalCapacity - shelterPressure.totalOccupancy}.`,
      riskLevel: classifyRisk(shelterPressure.saturationRisk),
    });
  }

  /* Sort by probability descending */
  predictions.sort((a, b) => b.probability - a.probability);

  return predictions;
}

/* ══════════════════════════════════════════════════════════════
   ACTION RECOMMENDATION ENGINE
══════════════════════════════════════════════════════════════ */

function generateRecommendedActions(categoryScores, shelterPressure, weatherRisk, predictions) {
  const actions = [];

  /* Shelter-specific actions */
  for (const sr of shelterPressure.shelterRisks) {
    if (sr.riskScore >= 0.7) {
      actions.push({
        priority: "immediate",
        domain: "logistics",
        action: `Critical shelter alert: ${sr.shelterName} at ${sr.loadPercent}% capacity with ${sr.minSupplyHours}h supplies remaining. Deploy resupply convoy immediately.`,
        targetId: sr.shelterId,
      });
    } else if (sr.riskScore >= 0.4) {
      actions.push({
        priority: "high",
        domain: "logistics",
        action: `Monitor ${sr.shelterName}: ${sr.loadPercent}% load, ${sr.minSupplyHours}h supply window. Pre-position resupply assets.`,
        targetId: sr.shelterId,
      });
    }
  }

  /* Weather-driven actions */
  if (weatherRisk.floodRisk > 0.6) {
    actions.push({
      priority: "immediate",
      domain: "rescue",
      action: "Pre-position water rescue boats at flood-prone sectors. Activate river gauge monitoring at 15-min intervals.",
    });
  }
  if (weatherRisk.cycloneRisk > 0.5) {
    actions.push({
      priority: "immediate",
      domain: "communication",
      action: "Activate coastal evacuation corridor alerts. Broadcast shelter-in-place orders for non-coastal inland zones.",
    });
  }
  if (weatherRisk.windRisk > 0.6) {
    actions.push({
      priority: "high",
      domain: "logistics",
      action: "Secure temporary shelter structures against high winds. Suspend aerial rescue operations until gusts subside below 80 km/h.",
    });
  }

  /* Cascade risk actions */
  const highCascadePredictions = predictions.filter(p => p.type === "cascade" && p.probability > 0.4);
  for (const pred of highCascadePredictions.slice(0, 3)) {
    actions.push({
      priority: "high",
      domain: "rescue",
      action: `Prepare ${pred.predictedCategory} response assets: ${pred.triggeredBy} cascade risk at ${Math.round(pred.probability * 100)}%. Expected timeframe: ${pred.timeframeHours}h.`,
    });
  }

  /* Incident-pattern-driven actions */
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score.riskScore >= 0.7 && score.activeCount > 0) {
      actions.push({
        priority: "high",
        domain: "rescue",
        action: `${category.toUpperCase()} risk remains elevated (score: ${score.riskScore}). ${score.activeCount} active incident(s) affecting ${score.totalAffected.toLocaleString()} people. Maintain enhanced readiness posture.`,
      });
    }
  }

  /* Medical capacity actions */
  if (shelterPressure.overallPressure > 0.6) {
    actions.push({
      priority: "high",
      domain: "medical",
      action: `Shelter system at ${shelterPressure.overallLoadPct}% aggregate load. Coordinate with hospitals for potential patient surge from overcrowded shelters.`,
    });
  }

  /* Sort by priority */
  const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
  actions.sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));

  return actions;
}

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT: generateRiskForecast
══════════════════════════════════════════════════════════════ */

/**
 * Generate a comprehensive risk forecast from operational data.
 *
 * @param {object} opts
 * @param {Array}  opts.incidents  — historical + active incidents
 * @param {Array}  opts.shelters   — current shelter registry
 * @param {object} [opts.weather]  — override weather data (else simulated)
 * @returns {RiskForecast}
 */
export function generateRiskForecast({ incidents, shelters, weather: weatherOverride }) {
  const startedAt = Date.now();

  /* Generate or accept weather conditions */
  const weather = enrichWeatherWarnings(weatherOverride ?? generateWeatherConditions());

  /* Run three analysis pillars */
  const categoryScores   = analyseIncidentPatterns(incidents);
  const shelterPressure  = analyseShelterPressure(shelters, incidents);
  const weatherRisk      = analyseWeatherRisk(weather);

  /* Generate predictions from combined signals */
  const predictions      = generatePredictedIncidents(categoryScores, shelterPressure, weatherRisk, weather);

  /* Generate recommended actions */
  const actions          = generateRecommendedActions(categoryScores, shelterPressure, weatherRisk, predictions);

  /* Overall composite risk score */
  const categoryRiskAvg = Object.values(categoryScores).length > 0
    ? Object.values(categoryScores).reduce((s, c) => s + c.riskScore, 0) / Object.values(categoryScores).length
    : 0;

  const overallRiskScore = Math.min(1.0,
    categoryRiskAvg                     * 0.35 +
    shelterPressure.overallPressure     * 0.25 +
    weatherRisk.compositeWeatherRisk    * 0.30 +
    (predictions.length > 0 ? Math.min(1.0, predictions[0].probability) : 0) * 0.10
  );

  const overallRisk = classifyRisk(overallRiskScore);

  return {
    forecastId:   `FORECAST-${Date.now()}`,
    generatedAt:  new Date().toISOString(),
    durationMs:   Date.now() - startedAt,
    validForHours: 6,

    overallRisk: {
      score:    Math.round(overallRiskScore * 100) / 100,
      level:    overallRisk.level,
      numLevel: overallRisk.numLevel,
      color:    overallRisk.color,
    },

    incidentAnalysis: {
      categoriesAnalysed: Object.keys(categoryScores).length,
      categoryScores,
    },

    shelterPressure: {
      overallLoadPct:  shelterPressure.overallLoadPct,
      unsheltered:     shelterPressure.unsheltered,
      saturationRisk:  shelterPressure.saturationRisk,
      overallPressure: shelterPressure.overallPressure,
      shelterRisks:    shelterPressure.shelterRisks,
    },

    weatherRisk: {
      ...weatherRisk,
      conditions: weather.conditions,
      isSimulated: weather._simulated ?? false,
    },

    predictions: {
      count: predictions.length,
      items: predictions,
    },

    recommendedActions: {
      count: actions.length,
      items: actions,
    },
  };
}
