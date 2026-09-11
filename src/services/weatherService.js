/**
 * ============================================================================
 * Weather Service Adapter Layer
 * ============================================================================
 * Supports two distinct data modes:
 * 1. LIVE WEATHER MODE:
 *    Fetches real-time observations and 7-day forecasts from Open-Meteo API.
 *    Converts Open-Meteo response into the application's standardized schema.
 *
 * 2. DEMO SCENARIO MODE:
 *    Uses hypothetical forecast models from mockWeather.js to demonstrate
 *    multi-model variance, consensus, and confidence calculations.
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
  return cardinals[index] || 'N';
}

/**
 * Format ISO time string (e.g. "2026-09-11T06:12") into readable 12-hour format ("06:12 AM")
 */
export function formatSunTime(isoStr) {
  if (!isoStr) return '--:--';
  try {
    const parts = isoStr.split('T');
    if (parts.length < 2) return isoStr;
    const timePart = parts[1].slice(0, 5);
    const [h, m] = timePart.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const formattedH = h12 < 10 ? `0${h12}` : `${h12}`;
    return `${formattedH}:${m < 10 ? '0' + m : m} ${period}`;
  } catch (e) {
    return isoStr;
  }
}

/**
 * Map WMO weather codes to readable condition labels and icon IDs
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
 */
export async function fetchLiveOpenMeteoWeather(lat = 12.9716, lon = 77.5946, locationName = 'Bengaluru, India') {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

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

  const sunrise = formatSunTime(daily.sunrise?.[0]);
  const sunset = formatSunTime(daily.sunset?.[0]);

  // Format visibility in km
  const rawVisibility = hourly.visibility?.[0] ?? 10000;
  const visibilityStr = `${Math.round(rawVisibility / 1000)} km`;

  // Process 24-hour hourly forecast
  const hourlyNodes = [];
  const totalHourlyPoints = hourly.time?.length || 0;
  for (let i = 0; i < Math.min(24, totalHourlyPoints); i++) {
    const rawTime = hourly.time[i];
    const timeStr = rawTime ? rawTime.split('T')[1]?.slice(0, 5) : `${i}:00`;
    const wmo = mapWmoCode(hourly.weather_code?.[i] ?? 0);
    hourlyNodes.push({
      time: timeStr,
      temp: Math.round(hourly.temperature_2m?.[i] ?? currentTemp),
      rain: Math.round(hourly.precipitation_probability?.[i] ?? 0),
      wind: Math.round(hourly.wind_speed_10m?.[i] ?? windSpeed),
      humidity: Math.round(hourly.relative_humidity_2m?.[i] ?? humidity),
      icon: wmo.weatherCode,
      condition: wmo.condition
    });
  }

  // Process 7-day daily forecast
  const dailyForecast = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totalDailyPoints = daily.time?.length || 0;

  for (let i = 0; i < Math.min(7, totalDailyPoints); i++) {
    const dateStr = daily.time[i]; // e.g. "2026-09-11"
    const dateObj = new Date(dateStr);
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysOfWeek[dateObj.getDay()];
    const wmo = mapWmoCode(daily.weather_code?.[i] ?? 0);

    dailyForecast.push({
      day: dayLabel,
      date: dateStr,
      tempMax: Math.round(daily.temperature_2m_max?.[i] ?? currentTemp + 2),
      tempMin: Math.round(daily.temperature_2m_min?.[i] ?? currentTemp - 3),
      feelsMax: Math.round(daily.apparent_temperature_max?.[i] ?? currentTemp + 2),
      feelsMin: Math.round(daily.apparent_temperature_min?.[i] ?? currentTemp - 3),
      rainProb: Math.round(daily.precipitation_probability_max?.[i] ?? 10),
      windMax: Math.round(daily.wind_speed_10m_max?.[i] ?? windSpeed),
      uvIndexMax: Math.round(daily.uv_index_max?.[i] ?? uvIndex),
      sunrise: formatSunTime(daily.sunrise?.[i]),
      sunset: formatSunTime(daily.sunset?.[i]),
      condition: wmo.condition,
      weatherCode: wmo.weatherCode
    });
  }

  // Consensus object
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
    airQuality: { aqi: 42, status: 'Good', pm25: 9.8 },
    visibility: visibilityStr,
    tempHigh,
    tempLow,
    sunrise,
    sunset
  };

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

  const confidence = {
    isLiveSingleSource: true,
    level: 'LIVE',
    score: null,
    badgeColor: 'cyan',
    shortExplanation: 'Live real-time weather feed from Open-Meteo API.',
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
    dailyForecast,
    alerts,
    confidence,
    comparison: confidence.comparison,
    impactInsights
  };
}

/**
 * Universal data getter supporting both Live Weather and Demo Scenarios
 */
export async function getWeatherData(
  locationId = 'bengaluru',
  scenarioId = 'HIGH_AGREEMENT',
  isLiveMode = false,
  customCoords = null
) {
  if (isLiveMode || scenarioId === 'LIVE_WEATHER') {
    try {
      let lat = 12.9716;
      let lon = 77.5946;
      let label = 'Bengaluru, India';

      if (customCoords && customCoords.lat !== undefined && customCoords.lon !== undefined) {
        lat = customCoords.lat;
        lon = customCoords.lon;
        label = customCoords.displayName || customCoords.label || `Live (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
      } else {
        const foundLoc = LOCATIONS.find((l) => l.id === locationId) || LOCATIONS[0];
        lat = foundLoc.coordinates.lat;
        lon = foundLoc.coordinates.lon;
        label = `${foundLoc.name}, ${foundLoc.region}`;
      }

      return await fetchLiveOpenMeteoWeather(lat, lon, label);
    } catch (err) {
      console.warn('Open-Meteo live API request failed. Falling back to cached mock data.', err);
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
        consensus: {
          ...fallbackScenario.consensus,
          sunrise: '06:15 AM',
          sunset: '06:45 PM'
        },
        sources: fallbackScenario.sources,
        hourly: fallbackScenario.hourly,
        dailyForecast: [
          { day: 'Today', date: '2026-09-11', tempMax: 29, tempMin: 21, rainProb: 80, condition: 'Scattered Showers', weatherCode: 'cloud-rain', sunrise: '06:15 AM', sunset: '06:45 PM' },
          { day: 'Tomorrow', date: '2026-09-12', tempMax: 28, tempMin: 20, rainProb: 65, condition: 'Light Rain', weatherCode: 'cloud-drizzle', sunrise: '06:15 AM', sunset: '06:45 PM' },
          { day: 'Sun', date: '2026-09-13', tempMax: 30, tempMin: 22, rainProb: 40, condition: 'Partly Cloudy', weatherCode: 'cloud-sun', sunrise: '06:16 AM', sunset: '06:44 PM' },
          { day: 'Mon', date: '2026-09-14', tempMax: 31, tempMin: 22, rainProb: 20, condition: 'Clear Sky', weatherCode: 'sun', sunrise: '06:16 AM', sunset: '06:43 PM' },
          { day: 'Tue', date: '2026-09-15', tempMax: 29, tempMin: 21, rainProb: 50, condition: 'Isolated Thunderstorms', weatherCode: 'cloud-lightning', sunrise: '06:16 AM', sunset: '06:42 PM' },
          { day: 'Wed', date: '2026-09-16', tempMax: 28, tempMin: 20, rainProb: 75, condition: 'Moderate Rain', weatherCode: 'cloud-rain', sunrise: '06:17 AM', sunset: '06:41 PM' },
          { day: 'Thu', date: '2026-09-17', tempMax: 27, tempMin: 19, rainProb: 30, condition: 'Overcast', weatherCode: 'cloud', sunrise: '06:17 AM', sunset: '06:40 PM' }
        ],
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

  // Demo Scenario Mode
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const cityData = MOCK_DATA[locationId] || MOCK_DATA.bengaluru;
        const scenarioData = cityData[scenarioId] || cityData.HIGH_AGREEMENT;

        if (!scenarioData) {
          throw new Error(`Scenario ${scenarioId} not found for location ${locationId}`);
        }

        const confidence = calculateConfidence(scenarioData.sources);
        const comparison = compareSources(scenarioData.sources);

        const impactInsights = {
          farmer: generateImpactInsights('farmer', scenarioData),
          traveller: generateImpactInsights('traveller', scenarioData),
          outdoor: generateImpactInsights('outdoor', scenarioData),
          health: generateImpactInsights('health', scenarioData)
        };

        const consensus = {
          ...scenarioData.consensus,
          sunrise: '06:15 AM',
          sunset: '06:45 PM'
        };

        const dailyForecast = [
          { day: 'Today', date: '2026-09-11', tempMax: consensus.tempHigh || 29, tempMin: consensus.tempLow || 21, rainProb: consensus.rainProbability, condition: consensus.condition, weatherCode: consensus.weatherCode, sunrise: '06:15 AM', sunset: '06:45 PM' },
          { day: 'Tomorrow', date: '2026-09-12', tempMax: (consensus.tempHigh || 29) - 1, tempMin: (consensus.tempLow || 21) - 1, rainProb: Math.max(10, consensus.rainProbability - 15), condition: 'Partly Cloudy', weatherCode: 'cloud-sun', sunrise: '06:15 AM', sunset: '06:45 PM' },
          { day: 'Sun', date: '2026-09-13', tempMax: (consensus.tempHigh || 29) + 1, tempMin: consensus.tempLow || 21, rainProb: Math.min(90, consensus.rainProbability + 10), condition: 'Scattered Showers', weatherCode: 'cloud-rain', sunrise: '06:16 AM', sunset: '06:44 PM' },
          { day: 'Mon', date: '2026-09-14', tempMax: (consensus.tempHigh || 29) + 2, tempMin: (consensus.tempLow || 21) + 1, rainProb: 20, condition: 'Clear Sky', weatherCode: 'sun', sunrise: '06:16 AM', sunset: '06:43 PM' },
          { day: 'Tue', date: '2026-09-15', tempMax: consensus.tempHigh || 29, tempMin: consensus.tempLow || 21, rainProb: 35, condition: 'Passing Clouds', weatherCode: 'cloud-sun', sunrise: '06:16 AM', sunset: '06:42 PM' },
          { day: 'Wed', date: '2026-09-16', tempMax: (consensus.tempHigh || 29) - 2, tempMin: (consensus.tempLow || 21) - 1, rainProb: 70, condition: 'Moderate Rain', weatherCode: 'cloud-rain', sunrise: '06:17 AM', sunset: '06:41 PM' },
          { day: 'Thu', date: '2026-09-17', tempMax: (consensus.tempHigh || 29) - 1, tempMin: (consensus.tempLow || 21) - 2, rainProb: 25, condition: 'Overcast', weatherCode: 'cloud', sunrise: '06:17 AM', sunset: '06:40 PM' }
        ];

        const payload = {
          isLiveMode: false,
          locationId,
          scenarioId,
          locationName: scenarioData.location,
          updatedAt: scenarioData.updatedAt,
          consensus,
          sources: scenarioData.sources,
          hourly: scenarioData.hourly,
          dailyForecast,
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
