/**
 * ============================================================================
 * WeatherGPT • Multi-Source Evidence & Confidence Engine
 * ============================================================================
 *
 * PURPOSE:
 * This module calculates multi-model consensus and agreement across independent
 * hypothetical weather forecasting sources (e.g., Source A, Source B, Source C).
 *
 * IMPORTANT SCIENTIFIC FRAMING:
 * The confidence score is strictly an indicator of *mathematical source agreement*
 * (i.e. model convergence/divergence). It is NOT a scientific claim that the
 * physical atmosphere is guaranteed to be X% accurate.
 *
 * SCORING METHODOLOGY:
 * 1. Calculate statistical spread (max - min), average (mean), and standard deviation
 *    for each core meteorological parameter:
 *    - Rain Probability (%)
 *    - Temperature (°C)
 *    - Wind Speed (km/h)
 *    - Humidity (%)
 *
 * 2. Deduct penalty points based on spread tolerance thresholds:
 *    - Rain (45% weight): 0% spread = 100 score; 50%+ spread = 0 score.
 *    - Temperature (30% weight): <= 0.5°C spread = 100 score; 8°C+ spread = 0 score.
 *    - Wind (25% weight): <= 2 km/h spread = 100 score; 25+ km/h spread = 0 score.
 *
 * 3. Categorize final composite score (0–100):
 *    - HIGH: >= 80% (sources tightly agree)
 *    - MEDIUM: 50%–79% (moderate variance in timing or intensity)
 *    - LOW: < 50% (sources conflict significantly)
 * ============================================================================
 */

/**
 * Calculate statistical spread, mean average, and standard deviation for an array of numbers.
 *
 * @param {number[]} numbers - Array of numeric values from each source.
 * @returns {Object} { min, max, spread, avg, stdDev }
 */
export function getSpreadAndStdDev(numbers) {
  if (!numbers || numbers.length === 0) {
    return { min: 0, max: 0, spread: 0, stdDev: 0, avg: 0 };
  }

  // Sanitize: ensure all items are valid numbers
  const validNumbers = numbers
    .map(n => Number(n))
    .filter(n => !isNaN(n));

  if (validNumbers.length === 0) {
    return { min: 0, max: 0, spread: 0, stdDev: 0, avg: 0 };
  }

  const min = Math.min(...validNumbers);
  const max = Math.max(...validNumbers);
  const spread = Math.round((max - min) * 10) / 10;
  
  // Calculate arithmetic mean (average)
  const sum = validNumbers.reduce((acc, val) => acc + val, 0);
  const avg = Math.round((sum / validNumbers.length) * 10) / 10;

  // Calculate population variance and standard deviation (σ)
  const variance = validNumbers.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / validNumbers.length;
  const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

  return { min, max, spread, stdDev, avg };
}

/**
 * Compares all available weather sources across primary meteorological variables.
 *
 * @param {Array<Object>} sources - Array of source objects with temperature, rainProbability, windSpeed, humidity.
 * @returns {Object|null} Comparison metrics containing min, max, spread, stdDev, avg for each variable.
 */
export function compareSources(sources = []) {
  if (!sources || sources.length === 0) {
    return null;
  }

  // Extract metric arrays from each source
  const temps = sources.map(s => s.temperature);
  const rains = sources.map(s => s.rainProbability);
  const winds = sources.map(s => s.windSpeed);
  const humids = sources.map(s => s.humidity ?? 0);

  // Compute stats for each metric
  const tempStats = getSpreadAndStdDev(temps);
  const rainStats = getSpreadAndStdDev(rains);
  const windStats = getSpreadAndStdDev(winds);
  const humidStats = getSpreadAndStdDev(humids);

  return {
    sourceCount: sources.length,
    temperature: tempStats,
    rainProbability: rainStats,
    windSpeed: windStats,
    humidity: humidStats
  };
}

/**
 * Calculates the overall source agreement score (0–100) and confidence tier.
 * Result is dynamically derived from actual values of Source A, B, and C.
 *
 * @param {Array<Object>} sources - Array of weather sources.
 * @returns {Object} Detailed confidence result with level, score, explanations, and metric breakdowns.
 */
export function calculateConfidence(sources = []) {
  // Guard clause: handle empty or invalid source arrays
  if (!sources || sources.length === 0) {
    return {
      level: 'UNKNOWN',
      score: 0,
      badgeColor: 'neutral',
      shortExplanation: 'No weather sources available to calculate model agreement.',
      subExplanation: 'At least 2 weather forecast models are required.',
      comparison: null,
      metricScores: { rain: 0, temperature: 0, wind: 0 },
      disclaimer: 'Source agreement requires active model telemetry.'
    };
  }

  // Perform full statistical comparison across sources
  const comparison = compareSources(sources);
  const { temperature, rainProbability, windSpeed } = comparison;

  // --------------------------------------------------------------------------
  // 1. Rain Agreement Score (Weight: 45%)
  // --------------------------------------------------------------------------
  // Tolerance: 0% spread gives 100 points. A spread of 50% or more gives 0 points.
  const rainPenalty = Math.min(100, (rainProbability.spread / 50) * 100);
  const rainScore = Math.max(0, Math.round(100 - rainPenalty));

  // --------------------------------------------------------------------------
  // 2. Temperature Agreement Score (Weight: 30%)
  // --------------------------------------------------------------------------
  // Tolerance: <= 0.5°C spread gives 100 points (sensor measurement tolerance).
  // Spreads from 0.5°C to 8.0°C scale penalty linearly up to 100.
  const tempExcess = Math.max(0, temperature.spread - 0.5);
  const tempPenalty = Math.min(100, (tempExcess / 7.5) * 100);
  const tempScore = Math.max(0, Math.round(100 - tempPenalty));

  // --------------------------------------------------------------------------
  // 3. Wind Speed Agreement Score (Weight: 25%)
  // --------------------------------------------------------------------------
  // Tolerance: <= 2.0 km/h spread gives 100 points.
  // Spreads from 2.0 to 25.0 km/h scale penalty linearly up to 100.
  const windExcess = Math.max(0, windSpeed.spread - 2);
  const windPenalty = Math.min(100, (windExcess / 23) * 100);
  const windScore = Math.max(0, Math.round(100 - windPenalty));

  // --------------------------------------------------------------------------
  // 4. Weighted Composite Agreement Score (0–100)
  // --------------------------------------------------------------------------
  const overallAgreementScore = Math.round(
    rainScore * 0.45 + tempScore * 0.30 + windScore * 0.25
  );

  // --------------------------------------------------------------------------
  // 5. Categorize Confidence Level (NOT HARDCODED: derived dynamically)
  // --------------------------------------------------------------------------
  let level = 'MEDIUM';
  let badgeColor = 'amber';
  let shortExplanation = '';

  if (overallAgreementScore >= 80) {
    level = 'HIGH';
    badgeColor = 'emerald';
    shortExplanation = `${sources.length} weather sources demonstrate high agreement. Rainfall predictions differ by only ${rainProbability.spread}%, with a temperature spread of ${temperature.spread}°C.`;
  } else if (overallAgreementScore >= 50) {
    level = 'MEDIUM';
    badgeColor = 'amber';
    shortExplanation = `Moderate source agreement: ${sources.length} models align on general conditions, but exhibit a ${rainProbability.spread}% spread in rainfall probability (${rainProbability.min}%–${rainProbability.max}%) and ±${temperature.spread}°C temperature difference.`;
  } else {
    level = 'LOW';
    badgeColor = 'rose';
    shortExplanation = `Low source agreement: ${sources.length} models conflict significantly. Rainfall predictions diverge by ${rainProbability.spread}% (${rainProbability.min}% vs ${rainProbability.max}%), with a temperature spread of ${temperature.spread}°C.`;
  }

  return {
    level,
    score: overallAgreementScore,
    badgeColor,
    shortExplanation,
    subExplanation: `Calculated from variance across ${sources.length} independent forecast models.`,
    comparison,
    metricScores: {
      rain: rainScore,
      temperature: tempScore,
      wind: windScore
    },
    disclaimer:
      'Confidence represents mathematical source agreement between the queried forecast models, NOT guaranteed meteorological certainty.'
  };
}

/**
 * Returns a comprehensive telemetry breakdown for the "Why this confidence?" modal.
 *
 * @param {Array<Object>} sources - Array of weather sources.
 * @returns {Object|null} Detailed explanation structure with parameter cards and methodology.
 */
export function getConfidenceExplanationDetails(sources = []) {
  const conf = calculateConfidence(sources);
  if (!conf || !conf.comparison) return null;

  const { temperature, rainProbability, windSpeed, humidity } = conf.comparison;

  const points = [
    {
      metric: 'Rainfall Consensus',
      status:
        rainProbability.spread <= 10
          ? 'Strong Consensus'
          : rainProbability.spread <= 25
          ? 'Moderate Spread'
          : 'High Divergence',
      detail: `Spread of ${rainProbability.spread}% across models (range: ${rainProbability.min}% - ${rainProbability.max}%, mean: ${rainProbability.avg}%). Standard deviation: ±${rainProbability.stdDev}%.`,
      impact:
        rainProbability.spread <= 10
          ? 'High model alignment on rain likelihood.'
          : rainProbability.spread <= 25
          ? 'Models show moderate disagreement on precipitation timing or volume.'
          : 'Significant model divergence: one model predicts dry conditions while another forecasts heavy rain.'
    },
    {
      metric: 'Temperature Consensus',
      status:
        temperature.spread <= 1.5
          ? 'Strong Consensus'
          : temperature.spread <= 4
          ? 'Moderate Spread'
          : 'High Divergence',
      detail: `Max delta of ${temperature.spread}°C (range: ${temperature.min}°C - ${temperature.max}°C, mean: ${temperature.avg}°C). Standard deviation: ±${temperature.stdDev}°C.`,
      impact:
        temperature.spread <= 1.5
          ? 'Consistent thermal boundary predictions across all runs.'
          : 'Variability in cloud cover or frontal boundary positioning.'
    },
    {
      metric: 'Wind Velocity Consensus',
      status:
        windSpeed.spread <= 4
          ? 'Strong Consensus'
          : windSpeed.spread <= 10
          ? 'Moderate Spread'
          : 'High Divergence',
      detail: `Wind speed spread of ${windSpeed.spread} km/h (range: ${windSpeed.min} - ${windSpeed.max} km/h, mean: ${windSpeed.avg} km/h). Standard deviation: ±${windSpeed.stdDev} km/h.`,
      impact:
        windSpeed.spread <= 4
          ? 'Consistent atmospheric pressure gradient predictions.'
          : 'Differences in local gust and squall line timing.'
    }
  ];

  return {
    ...conf,
    points,
    scientificMethodologyNotice:
      'Multi-model ensemble analysis compares numerical weather prediction (NWP) outputs. When high-resolution regional radar models converge with global deterministic runs, source agreement increases. Divergence indicates atmospheric chaos or sensitive front development.'
  };
}
