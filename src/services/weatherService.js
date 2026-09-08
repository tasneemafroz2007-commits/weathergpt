/**
 * ============================================================================
 * Weather Service Adapter Layer
 * ============================================================================
 *
 * Supports two distinct data modes:
 * 1. LIVE WEATHER MODE:
 *    Fetches real-time observations and forecasts from the free Open-Meteo API
 *    (no API key required). Converts Open-Meteo response into the application's
 *    standardized internal schema.
 *
 * 2. DEMO SCENARIO MODE:
 *    Uses the 3 hypothetical forecast models from mockWeather.js to demonstrate
 *    multi-model variance, consensus, and confidence calculations.
 *
 * FALLBACK SAFETY:
 * If an Open-Meteo API request fails (e.g. offline or rate limited), the service
 * automatically falls back to cached mock data with an informative notice.
 * ============================================================================
 */

import { LOCATIONS, SCENARIOS, MOCK_DATA } from '../data/mockWeather';
import { calculateConfidence, compareSources } from '../utils/confidence';
import { generateImpactInsights } from '../utils/impactModes';

/**
 * Retrieve available preset locations
 */
export function getAvailableLocations() {
  return LOCATIONS;
}

/**
 * Retrieve available demo scenarios
 */
export function getAvailableScenarios() {
  return Object.values(SCENARIOS);
}

/**
 * Convert wind degrees (0–360) to 16-point cardinal compass direction
 */
export function degreesToCardinal(deg = 0) {
  const cardinals = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(deg / 22.5) % 16;
  return cardinals[index] || 'SW';
}

/**
 * Map standard WMO (World Meteorological Organization) weather interpretation codes
 * to user-friendly conditions and icon identifiers.
 */
export function mapWmoCode(code) {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', weatherCode: 'sun' };
    case 1:
      return { condition: 'Mainly Clear', weatherCode: 'sun' };
    case 2:
      return { condition: 'Partly Cloudy', weatherCode: 'cloud-sun' };
    case 3:
      return { condition: 'Overcast Skies', weatherCode: 'cloud' };
    case 45:
    case 48:
      return { condition: 'Fog & Mist', weatherCode: 'cloud' };
    case 51:
      return { condition: 'Light Drizzle', weatherCode: 'cloud-drizzle' };
    case 53:
      return { condition: 'Moderate Drizzle', weatherCode: 'cloud-drizzle' };
    case 55:
      return { condition: 'Dense Drizzle', weatherCode: 'cloud-drizzle' };
    case 61:
      return { condition: 'Slight Rain Showers', weatherCode: 'cloud-rain' };
    case 63:
      return { condition: 'Moderate Rain', weatherCode: 'cloud-rain' };
    case 65:
      return { condition: 'Heavy Rain', weatherCode: 'cloud-heavy-rain' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', weatherCode: 'cloud-rain' };
    case 80:
      return { condition: 'Scattered Showers', weatherCode: 'cloud-rain' };
    case 81:
      return { condition: 'Moderate Showers', weatherCode: 'cloud-rain' };
    case 82:
      return { condition: 'Violent Rain Showers', weatherCode: 'cloud-heavy-rain' };
    case 95:
      return { condition: 'Thunderstorm', weatherCode: 'cloud-lightning' };
    case 96:
    case 99:
      return { condition: 'Thunderstorm with Hail', weatherCode: 'cloud-lightning' };
    default:
      return { condition: 'Partly Cloudy', weatherCode: 'cloud-sun' };
  }
}

/**
 * Fetch real weather data from the public Open-Meteo REST API.
 * Endpoint requires NO API KEY.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} locationName - Human-readable label
 * @returns {Promise<Object>} Formatted weather payload
 */
export async function fetchLiveOpenMeteoWeather(lat = 12.9716, lon = 77.5946, locationName = 'Bengaluru, India') {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code,visibility,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API returned status ${res.status}`);
  }

  const data = await res.json();
  const current = data.current || {};
  const daily = data.daily || {};
  const hourly = data.hourly || {};

  const currentWmo = mapWmoCode(current.weather_code ?? 0);
  const currentTemp = Math.round(current.temperature_2m ?? 25);
  const feelsLike = Math.round(current.apparent_temperature ?? currentTemp);
  const windSpeed = Math.round(current.wind_speed_10m ?? 12);
  const windDirection = degreesToCardinal(current.wind_direction_10m ?? 270);
  const humidity = Math.round(current.relative_humidity_2m ?? 65);
  const pressure = Math.round(current.surface_pressure ?? 1012);
  const rainProb = Math.round(daily.precipitation_probability_max?.[0] ?? hourly.precipitation_probability?.[0] ?? 20);
  const uvIndex = Math.round(daily.uv_index_max?.[0] ?? 5);
  const tempHigh = Math.round(daily.temperature_2m_max?.[0] ?? currentTemp + 3);
  const tempLow = Math.round(daily.temperature_2m_min?.[0] ?? currentTemp - 4);

  // Format visibility in km
  const rawVisibility = hourly.visibility?.[0] ?? 10000;
  const visibilityStr = `${Math.round(rawVisibility / 1000)} km`;

  // Sample 6 intervals over the next 24 hours (every 4 hours)
  const hourlyNodes = [];
  const totalHourlyPoints = hourly.time?.length || 0;
  for (let i = 0; i < Math.min(24, totalHourlyPoints); i += 4) {
    const rawTime = hourly.time[i];
    const timeStr = rawTime ? rawTime.split('T')[1]?.slice(0, 5) : `${i}:00`;
    const wmo = mapWmoCode(hourly.weather_code?.[i] ?? 0);
    hourlyNodes.push({
      time: timeStr,
      temp: Math.round(hourly.temperature_2m?.[i] ?? currentTemp),
      rain: Math.round(hourly.precipitation_probability?.[i] ?? 0),
      wind: Math.round(hourly.wind_speed_10m?.[i] ?? windSpeed),
      icon: wmo.weatherCode
    });
  }

  // Consensus object represents the single real-world truth
  const consensus = {
    temperature: currentTemp,
    feelsLike,
    rainProbability: rainProb,
    windSpeed,
    windDirection,
    humidity,
    condition: currentWmo.condition,
    weatherCode: currentWmo.weatherCode,
    pressure,
    uvIndex,
    airQuality: { aqi: 42, status: 'Normal', pm25: 9.8 },
    visibility: visibilityStr,
    tempHigh,
    tempLow
  };

  // Honest single live source representation (Requirement 8)
  const liveSource = {
    id: 'source-open-meteo',
    name: 'Open-Meteo Live API',
    providerCode: 'NWP Ensemble Blend',
    temperature: currentTemp,
    rainProbability: rainProb,
    windSpeed,
    humidity,
    condition: currentWmo.condition,
    resolution: '1–11 km blended ECMWF/GFS',
    lastSync: 'Live just now',
    status: 'Operational Live Feed'
  };

  // Multi-source agreement is explicitly PAUSED for single-source mode (Requirement 9)
  const confidence = {
    isLiveSingleSource: true,
    level: 'LIVE',
    score: null,
    badgeColor: 'cyan',
    shortExplanation: 'Live real-time weather feed from Open-Meteo API. Single-source live mode is active.',
    subExplanation: 'Multi-source model agreement calculation requires at least 2 independent forecast models.',
    comparison: {
      sourceCount: 1,
      temperature: { min: currentTemp, max: currentTemp, spread: 0, stdDev: 0, avg: currentTemp },
      rainProbability: { min: rainProb, max: rainProb, spread: 0, stdDev: 0, avg: rainProb },
      windSpeed: { min: windSpeed, max: windSpeed, spread: 0, stdDev: 0, avg: windSpeed },
      humidity: { min: humidity, max: humidity, spread: 0, stdDev: 0, avg: humidity }
    },
    metricScores: null,
    disclaimer:
      'Single-source live feed active. Multi-source model agreement scoring is paused because only one real weather source is connected. To view multi-source consensus scoring, switch to Demo Scenario mode.'
  };

  // Generate live weather alerts if conditions warrant caution
  const alerts = [];
  if (rainProb >= 65) {
    alerts.push({
      id: 'alert-live-rain',
      severity: 'advisory',
      title: 'Active Precipitation Advisory (Open-Meteo Live)',
      description: `Live forecast indicates elevated precipitation likelihood (${rainProb}%). Allow extra travel buffer and check drainage.`,
      sourceAgreementNotice: 'Real-time telemetry from Open-Meteo API.'
    });
  } else if (windSpeed >= 25) {
    alerts.push({
      id: 'alert-live-wind',
      severity: 'caution',
      title: 'Live Gusty Wind Advisory (Open-Meteo Live)',
      description: `Current wind velocity is ${windSpeed} km/h. High-profile vehicles should exercise caution on bridges and flyovers.`,
      sourceAgreementNotice: 'Real-time telemetry from Open-Meteo API.'
    });
  }

  // Pre-compute rule-based impact insights using the REAL live weather values
  const impactInsights = {
    farmer: generateImpactInsights('farmer', { consensus }),
    traveller: generateImpactInsights('traveller', { consensus }),
    outdoor: generateImpactInsights('outdoor', { consensus }),
    health: generateImpactInsights('health', { consensus })
  };

  return {
    isLiveMode: true,
    locationId: 'live-location',
    scenarioId: 'LIVE_WEATHER',
    locationName,
    coordinates: { lat, lon },
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    consensus,
    sources: [liveSource],
    hourly: hourlyNodes,
    alerts,
    confidence,
    comparison: confidence.comparison,
    impactInsights
  };
}

/**
 * Universal data getter supporting both Live Weather and Demo Scenarios
 *
 * @param {string} locationId - e.g. 'bengaluru', 'tokyo', 'london'
 * @param {string} scenarioId - 'LIVE_WEATHER' | 'HIGH_AGREEMENT' | 'MODERATE_AGREEMENT' | 'LOW_AGREEMENT'
 * @param {boolean} isLiveMode - Force live Open-Meteo fetch
 * @param {Object} customCoords - Optional { lat, lon, label } for user geolocation
 * @returns {Promise<Object>} Formatted weather payload
 */
export async function getWeatherData(
  locationId = 'bengaluru',
  scenarioId = 'HIGH_AGREEMENT',
  isLiveMode = false,
  customCoords = null
) {
  // Check if live mode requested
  if (isLiveMode || scenarioId === 'LIVE_WEATHER') {
    try {
      let lat = 12.9716;
      let lon = 77.5946;
      let label = 'Bengaluru, India';

      if (customCoords && customCoords.lat && customCoords.lon) {
        lat = customCoords.lat;
        lon = customCoords.lon;
        label = customCoords.label || `Live (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
      } else {
        const foundLoc = LOCATIONS.find(l => l.id === locationId) || LOCATIONS[0];
        lat = foundLoc.coordinates.lat;
        lon = foundLoc.coordinates.lon;
        label = `${foundLoc.name}, ${foundLoc.region}`;
      }

      return await fetchLiveOpenMeteoWeather(lat, lon, label);
    } catch (err) {
      console.warn('Open-Meteo live API request failed. Falling back to cached mock data.', err);
      // Fallback: load corresponding mock data gracefully (Requirement 5)
      const cityData = MOCK_DATA[locationId] || MOCK_DATA.bengaluru;
      const fallbackScenario = cityData.HIGH_AGREEMENT;
      const confidence = calculateConfidence(fallbackScenario.sources);
      const comparison = compareSources(fallbackScenario.sources);

      return {
        isLiveMode: false,
        isApiFallback: true,
        apiErrorMessage: err.message,
        locationId,
        scenarioId: 'HIGH_AGREEMENT',
        locationName: `${fallbackScenario.location} (Offline Fallback)`,
        updatedAt: 'Using cached offline data',
        consensus: fallbackScenario.consensus,
        sources: fallbackScenario.sources,
        hourly: fallbackScenario.hourly,
        alerts: [
          {
            id: 'alert-fallback',
            severity: 'caution',
            title: 'API Offline Fallback Mode',
            description: 'Could not reach Open-Meteo servers. Displaying cached meteorological data.',
            sourceAgreementNotice: 'Cached fallback model runs.'
          },
          ...(fallbackScenario.alerts || [])
        ],
        confidence,
        comparison,
        impactInsights: {
          farmer: generateImpactInsights('farmer', fallbackScenario),
          traveller: generateImpactInsights('traveller', fallbackScenario),
          outdoor: generateImpactInsights('outdoor', fallbackScenario),
          health: generateImpactInsights('health', fallbackScenario)
        }
      };
    }
  }

  // Demo Scenario Mode (Multi-source simulation)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const cityData = MOCK_DATA[locationId] || MOCK_DATA.bengaluru;
        const scenarioData = cityData[scenarioId] || cityData.HIGH_AGREEMENT;

        if (!scenarioData) {
          throw new Error(`Scenario ${scenarioId} not found for location ${locationId}`);
        }

        // Calculate dynamic multi-source agreement metrics across the 3 models
        const confidence = calculateConfidence(scenarioData.sources);
        const comparison = compareSources(scenarioData.sources);

        // Pre-compute insights for each mode
        const impactInsights = {
          farmer: generateImpactInsights('farmer', scenarioData),
          traveller: generateImpactInsights('traveller', scenarioData),
          outdoor: generateImpactInsights('outdoor', scenarioData),
          health: generateImpactInsights('health', scenarioData)
        };

        const payload = {
          isLiveMode: false,
          locationId,
          scenarioId,
          locationName: scenarioData.location,
          updatedAt: scenarioData.updatedAt,
          consensus: scenarioData.consensus,
          sources: scenarioData.sources,
          hourly: scenarioData.hourly,
          alerts: scenarioData.alerts || [],
          confidence,
          comparison,
          impactInsights
        };

        resolve(payload);
      } catch (err) {
        reject(err);
      }
    }, 200);
  });
}

export { generateImpactInsights, calculateConfidence, compareSources };
