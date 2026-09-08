/**
 * ============================================================================
 * WeatherGPT • Weather Impact Modes Engine
 * ============================================================================
 *
 * ARCHITECTURE PRINCIPLES:
 * 1. Single Meteorological Truth:
 *    All four modes evaluate the EXACT SAME underlying weather consensus data.
 *    Modes are domain-specific lenses, NOT separate chatbots or divergent forecasts.
 *
 * 2. Deterministic Rule-Based Reasoning:
 *    Insights are generated through transparent thresholds based on:
 *    - Rain Probability (%)
 *    - Temperature (°C) & Feels-like (°C)
 *    - Wind Velocity (km/h)
 *    - Atmospheric conditions, UV Index, and Air Quality (AQI)
 *
 * 3. Traceability:
 *    Each insight explicitly identifies the trigger weather factor responsible.
 *
 * 4. Safety & Non-Medical Policy:
 *    Health & Environment mode strictly offers general environmental situational
 *    awareness. It expressly avoids clinical diagnoses or medical advice.
 * ============================================================================
 */

export const IMPACT_MODES = [
  {
    id: 'farmer',
    name: 'Farmer',
    icon: 'Wheat',
    shortDescription: 'Agronomic considerations, soil moisture, and field operations.',
    accentColor: '#16a34a'
  },
  {
    id: 'traveller',
    name: 'Traveller',
    icon: 'Plane',
    shortDescription: 'Transit safety, road visibility, and commute feasibility.',
    accentColor: '#0284c7'
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    icon: 'Compass',
    shortDescription: 'Recreation feasibility, storm risk, and activity planning.',
    accentColor: '#d97706'
  },
  {
    id: 'health',
    name: 'Health & Environment',
    icon: 'HeartPulse',
    shortDescription: 'Air quality, thermal comfort, UV exposure, and environment.',
    accentColor: '#9333ea'
  }
];

/**
 * Main rule-based engine that interprets weather data for a selected persona.
 *
 * @param {string} modeId - 'farmer' | 'traveller' | 'outdoor' | 'health'
 * @param {Object} weatherData - Object containing weather consensus metrics.
 * @returns {Object} Structured insights with feasibility score, primary message, considerations, and metrics.
 */
export function generateImpactInsights(modeId, weatherData) {
  if (!weatherData) {
    return {
      title: 'No Data Available',
      primaryMessage: 'Weather data not loaded for impact evaluation.',
      feasibilityScore: 0,
      feasibilityLabel: 'Unavailable',
      considerations: [],
      metrics: [],
      disclaimer: null
    };
  }

  // Extract consensus metrics safely
  const consensus = weatherData.consensus || weatherData;
  const {
    temperature = 25,
    feelsLike = temperature,
    rainProbability = 0,
    windSpeed = 10,
    humidity = 60,
    condition = 'Clear',
    uvIndex = 4,
    airQuality = { aqi: 45, status: 'Good', pm25: 12 },
    visibility = '10 km'
  } = consensus;

  switch (modeId) {
    // ========================================================================
    // 1. FARMER MODE
    // ========================================================================
    // Rules:
    // - Rain Probability >= 60%: High precipitation -> suspend irrigation, topsoil saturation risk.
    // - Rain Probability < 30%: Low precipitation -> scheduled irrigation required.
    // - Temperature >= 30°C: Heat stress -> high crop evapotranspiration.
    // - Temperature < 16°C: Cool conditions -> slow crop vegetative development.
    // - Wind Speed >= 20 km/h: Gusts -> agrochemical spray drift hazard.
    // - Wind Speed <= 15 km/h & Rain <= 35%: Favorable spray deposition window.
    // ========================================================================
    case 'farmer': {
      const isHighRain = rainProbability >= 60;
      const isLowRain = rainProbability < 30;
      const isHighTemp = temperature >= 30;
      const isCoolTemp = temperature < 16;
      const isHighWind = windSpeed >= 20;
      const isSafeSpray = windSpeed <= 15 && rainProbability <= 35;

      // Composite feasibility calculation for farming operations
      let feasibilityScore = 80;
      if (isHighRain) feasibilityScore -= 35;
      if (isHighWind) feasibilityScore -= 20;
      if (isHighTemp) feasibilityScore -= 10;
      feasibilityScore = Math.max(15, Math.min(95, feasibilityScore));

      let feasibilityLabel = 'Favorable for Field Activities';
      let primaryMessage = 'Atmospheric conditions are stable for scheduled farming and field tasks.';

      if (isHighRain && isHighWind) {
        feasibilityLabel = 'Field Activities Restricted';
        primaryMessage = 'Combined high rainfall likelihood and gusty winds. Field operations and spraying should be suspended.';
      } else if (isHighRain) {
        feasibilityLabel = 'Rain Precautions Required';
        primaryMessage = 'Rain is likely tomorrow. Consider checking field activities and low-lying plots that may be affected by rainfall.';
      } else if (isHighWind) {
        feasibilityLabel = 'Wind Spray Advisory';
        primaryMessage = 'Elevated wind speeds present a chemical drift hazard. Postpone foliar spraying.';
      } else if (isHighTemp) {
        feasibilityLabel = 'Elevated Crop Water Demand';
        primaryMessage = 'Warm temperatures accelerate soil evapotranspiration. Monitor soil moisture in vulnerable crop beds.';
      }

      const considerations = [
        // Rule 1: Irrigation & Soil Moisture (Rain factor)
        {
          label: 'Irrigation & Soil Moisture',
          status: isHighRain ? 'Suspend Irrigation' : isLowRain ? 'Irrigation Required' : 'Moderate Moisture',
          type: isHighRain ? 'warning' : isLowRain ? 'info' : 'success',
          description: isHighRain
            ? 'High rainfall probability will recharge topsoil naturally. Hold artificial watering to avoid waterlogging and root hypoxia.'
            : isLowRain
            ? 'Minimal precipitation forecast. Maintain scheduled furrow or drip irrigation to prevent moisture deficits.'
            : 'Moderate rain likelihood. Probe field soil moisture before initiating water cycles.',
          weatherFactor: `Rain Probability: ${rainProbability}%`
        },
        // Rule 2: Chemical & Pesticide Spraying (Wind + Rain factor)
        {
          label: 'Agrochemical & Fertilizer Spraying',
          status: isSafeSpray ? 'Optimal Spray Window' : 'Postpone Spraying',
          type: isSafeSpray ? 'success' : 'danger',
          description: isSafeSpray
            ? 'Wind velocity is under 15 km/h and rain probability is low. Favorable droplet retention without wash-off or drift.'
            : isHighWind
            ? `High wind speeds (${windSpeed} km/h) risk chemical drift onto adjacent buffer zones and reduce application uniformity.`
            : `Precipitation chance (${rainProbability}%) poses an active chemical wash-off risk within 24 hours of application.`,
          weatherFactor: `Wind: ${windSpeed} km/h • Rain: ${rainProbability}%`
        },
        // Rule 3: Crop Thermal & Transpiration State (Temperature factor)
        {
          label: 'Crop Heat & Evapotranspiration',
          status: isHighTemp ? 'Elevated Heat Stress' : isCoolTemp ? 'Slow Vegetative Rate' : 'Optimal Thermal Window',
          type: isHighTemp ? 'warning' : isCoolTemp ? 'info' : 'success',
          description: isHighTemp
            ? `Ambient temperature of ${temperature}°C accelerates plant transpiration. Shield sensitive nursery seedlings from prolonged midday heat.`
            : isCoolTemp
            ? `Cool temperature of ${temperature}°C moderates photosynthesis rates. Monitor frost-sensitive horticultural beds.`
            : `Balanced air temperature of ${temperature}°C supports steady crop canopy development.`,
          weatherFactor: `Temperature: ${temperature}°C (High: ${consensus.tempHigh || temperature}°C)`
        },
        // Rule 4: Machinery Operations & Harvesting (Soil load factor)
        {
          label: 'Machinery & Tractor Operations',
          status: rainProbability >= 70 ? 'Soil Compaction Risk' : 'Ground Conditions Safe',
          type: rainProbability >= 70 ? 'danger' : 'success',
          description: rainProbability >= 70
            ? 'Wet topsoil significantly increases rutting and subsoil compaction risks under heavy tractor axel loads.'
            : 'Firm ground traction suitable for tractor movement, tilling, and harvest transport.',
          weatherFactor: `Rain Probability: ${rainProbability}%`
        }
      ];

      const metrics = [
        { label: 'Rain Probability', value: `${rainProbability}%`, detail: 'Soil moisture intake' },
        { label: 'Wind Velocity', value: `${windSpeed} km/h`, detail: 'Spray drift index' },
        { label: 'Air Temperature', value: `${temperature}°C`, detail: 'Evapotranspiration' },
        { label: 'Relative Humidity', value: `${humidity}%`, detail: 'Fungal risk factor' }
      ];

      return {
        modeId: 'farmer',
        modeName: 'Farmer Mode',
        feasibilityScore,
        feasibilityLabel,
        primaryMessage,
        considerations,
        metrics,
        disclaimer: 'Agronomic recommendations are rule-based advisory generalizations. Local crop species, growth stages, and soil drains vary.'
      };
    }

    // ========================================================================
    // 2. TRAVELLER MODE
    // ========================================================================
    // Rules:
    // - Rain Probability >= 60%: High rain -> wet roads, braking distance, commute delays.
    // - Wind Speed >= 25 km/h: Strong wind -> highway crosswind buffeting, airport holds.
    // - Severe condition (thunderstorm, lightning, squalls) -> severe travel caution.
    // - Luggage/packing: Rain >= 40% -> waterproof luggage and umbrella advisory.
    // ========================================================================
    case 'traveller': {
      const isHighRain = rainProbability >= 60;
      const isStrongWind = windSpeed >= 25;
      const isSevereCondition =
        condition.toLowerCase().includes('thunder') ||
        condition.toLowerCase().includes('squall') ||
        condition.toLowerCase().includes('heavy') ||
        condition.toLowerCase().includes('typhoon') ||
        rainProbability >= 75;

      let feasibilityScore = 85;
      if (isHighRain) feasibilityScore -= 30;
      if (isStrongWind) feasibilityScore -= 20;
      if (isSevereCondition) feasibilityScore -= 15;
      feasibilityScore = Math.max(15, Math.min(95, feasibilityScore));

      let feasibilityLabel = 'Normal Commute Flow';
      let primaryMessage = 'Current weather trends indicate standard travel and commute conditions.';

      if (isSevereCondition) {
        feasibilityLabel = 'Severe Travel Delays Likely';
        primaryMessage = 'Heavy rainfall and severe weather may affect highway travel, evening commutes, and scheduled regional flights.';
      } else if (isHighRain) {
        feasibilityLabel = 'Wet Commute Delays';
        primaryMessage = 'Intermittent rain showers may cause surface water pooling, slower road traffic, and increased braking distances.';
      } else if (isStrongWind) {
        feasibilityLabel = 'Breezy Transit Conditions';
        primaryMessage = 'Noticeable crosswinds on open highways and elevated roadways. Drive with steady control.';
      }

      const considerations = [
        // Rule 1: Road & Highway Traction (Rain factor)
        {
          label: 'Highway Driving & Road Traction',
          status: isHighRain ? 'Wet Roads / Reduced Grip' : 'Normal Road Grip',
          type: isHighRain ? 'warning' : 'success',
          description: isHighRain
            ? 'Surface water pooling increases hydroplaning risks. Increase vehicle following distances and allow 20–30 minutes extra travel time.'
            : 'Clear, dry pavement. Standard highway and expressway travel speeds are nominal.',
          weatherFactor: `Rain Probability: ${rainProbability}%`
        },
        // Rule 2: Crosswinds & High-Profile Vehicles (Wind factor)
        {
          label: 'Wind Buffeting & Flight Operations',
          status: isStrongWind ? 'Crosswind Caution' : 'Nominal Winds',
          type: isStrongWind ? 'warning' : 'success',
          description: isStrongWind
            ? `Wind gusts of ${windSpeed} km/h may cause crosswind instability on bridges, flyovers, and elevated expressways. Airport departure slots may experience holds.`
            : `Gentle winds (${windSpeed} km/h). Optical flight corridors and ground transport within nominal criteria.`,
          weatherFactor: `Wind Velocity: ${windSpeed} km/h`
        },
        // Rule 3: Severe Weather & Route Disruptions (Condition factor)
        {
          label: 'Severe Atmospheric Disruption',
          status: isSevereCondition ? 'Severe Warning Active' : 'Low Disruption Risk',
          type: isSevereCondition ? 'danger' : 'success',
          description: isSevereCondition
            ? `Forecast condition "${condition}" indicates localized convective turbulence. Monitor carrier alerts and municipal drainage notices.`
            : `Nominal weather condition "${condition}". No widespread weather-induced transport cancellations anticipated.`,
          weatherFactor: `Weather Condition: ${condition}`
        },
        // Rule 4: Packing & Commute Gear
        {
          label: 'Luggage & Personal Gear Advice',
          status: rainProbability >= 40 ? 'Waterproof Gear Recommended' : 'Standard Commute Pack',
          type: 'info',
          description: rainProbability >= 40
            ? 'Pack a compact umbrella, water-resistant outer layers, and protective sleeves for sensitive electronics.'
            : 'Mild ambient conditions; light, breathable layers are appropriate.',
          weatherFactor: `Rain Probability: ${rainProbability}% • Feels Like: ${feelsLike}°C`
        }
      ];

      const metrics = [
        { label: 'Visibility Range', value: visibility || '10 km', detail: 'Optical distance' },
        { label: 'Precipitation Risk', value: `${rainProbability}%`, detail: 'Road wetness' },
        { label: 'Wind Velocity', value: `${windSpeed} km/h`, detail: 'Crosswind drag' },
        { label: 'Feels Like', value: `${feelsLike}°C`, detail: 'Platform comfort' }
      ];

      return {
        modeId: 'traveller',
        modeName: 'Traveller Mode',
        feasibilityScore,
        feasibilityLabel,
        primaryMessage,
        considerations,
        metrics,
        disclaimer: 'Always verify live flight schedules, transit status, and municipal traffic alerts with official authorities.'
      };
    }

    // ========================================================================
    // 3. OUTDOOR MODE
    // ========================================================================
    // Rules:
    // - Rain Probability >= 60%: High rain -> outdoor activities affected, shift indoors.
    // - Temperature >= 30°C: Heat caution -> hydration, avoid midday peak sun.
    // - Temperature < 15°C: Cold caution -> thermal layering required.
    // - Wind Speed >= 25 km/h: Strong wind -> high drag, trail branch hazard.
    // - UV Index >= 6: High UV -> sunscreen and eye protection required.
    // ========================================================================
    case 'outdoor': {
      const isHighRain = rainProbability >= 60;
      const isModerateRain = rainProbability >= 35 && rainProbability < 60;
      const isHighTemp = temperature >= 30 || feelsLike >= 32;
      const isColdTemp = temperature < 15;
      const isHighWind = windSpeed >= 25;
      const isHighUV = (uvIndex || 4) >= 6;

      let feasibilityScore = 90;
      if (isHighRain) feasibilityScore -= 40;
      else if (isModerateRain) feasibilityScore -= 15;
      if (isHighWind) feasibilityScore -= 20;
      if (isHighTemp) feasibilityScore -= 15;
      feasibilityScore = Math.max(10, Math.min(95, feasibilityScore));

      let feasibilityLabel = 'Excellent Outdoor Conditions';
      let primaryMessage = 'Great conditions for outdoor exercise, hiking, cycling, and park recreation.';

      if (isHighRain && isHighWind) {
        feasibilityLabel = 'Outdoor Recreation Inadvisable';
        primaryMessage = 'Outdoor activities may be affected by heavy rainfall, gusty winds, and possible thunderstorm cells. Shift training indoors.';
      } else if (isHighRain) {
        feasibilityLabel = 'Rain Impairments Expected';
        primaryMessage = 'High rain probability. Outdoor activities may be disrupted by showers and slippery surfaces.';
      } else if (isHighTemp) {
        feasibilityLabel = 'Heat Caution for Outdoor Sports';
        primaryMessage = 'Warm temperatures elevate heat strain during prolonged outdoor exertion. Hydrate regularly and schedule workouts during early morning.';
      } else if (isHighWind) {
        feasibilityLabel = 'Gusty / High Resistance';
        primaryMessage = 'Brisk winds will affect cycling stability and open-field ball sports.';
      }

      const considerations = [
        // Rule 1: Running, Cycling & Sports (Rain factor)
        {
          label: 'Cardio, Cycling & Ball Sports',
          status: isHighRain ? 'Shift Indoors' : isModerateRain ? 'Keep Shelter in Reach' : 'Prime Training Window',
          type: isHighRain ? 'danger' : isModerateRain ? 'warning' : 'success',
          description: isHighRain
            ? `Rain chance is ${rainProbability}%. Wet asphalt creates slippery turns and reduced braking. Indoor gym or treadmill recommended.`
            : isModerateRain
            ? `Chance of passing showers (${rainProbability}%). Choose looped routes close to shelter.`
            : `Low rain chance (${rainProbability}%). Favorable traction for road running and cycling.`,
          weatherFactor: `Rain Probability: ${rainProbability}%`
        },
        // Rule 2: Heat Exertion & Thermal Comfort (Temperature factor)
        {
          label: 'Thermal Exertion & Hydration',
          status: isHighTemp ? 'Heat Caution' : isColdTemp ? 'Chilly / Layer Up' : 'Comfortable Thermal Range',
          type: isHighTemp ? 'warning' : isColdTemp ? 'info' : 'success',
          description: isHighTemp
            ? `Feels like ${feelsLike}°C (ambient ${temperature}°C). High perspiration rates expected; carry electrolyte fluids and avoid peak sun hours.`
            : isColdTemp
            ? `Air temperature of ${temperature}°C. Wear windproof, moisture-wicking base layers to prevent rapid sweat cooling.`
            : `Air temperature of ${temperature}°C is in the sweet spot for sustained outdoor metabolic activity.`,
          weatherFactor: `Feels Like: ${feelsLike}°C (Actual: ${temperature}°C)`
        },
        // Rule 3: Wind Resistance & Trail Safety (Wind factor)
        {
          label: 'Wind Resistance & Trail Safety',
          status: isHighWind ? 'High Resistance / Trail Caution' : 'Calm / Gentle Breeze',
          type: isHighWind ? 'warning' : 'success',
          description: isHighWind
            ? `Wind velocity of ${windSpeed} km/h creates significant aerodynamic drag for runners and cyclists. Take caution near loose branches on forest trails.`
            : `Mild wind speed (${windSpeed} km/h). Minimal headwind resistance for open-air sports.`,
          weatherFactor: `Wind Velocity: ${windSpeed} km/h`
        },
        // Rule 4: Solar & UV Radiation (UV factor)
        {
          label: 'UV Radiation & Sun Exposure',
          status: isHighUV ? 'High UV Index' : 'Moderate / Safe UV',
          type: isHighUV ? 'warning' : 'info',
          description: isHighUV
            ? `UV Index is ${uvIndex}. Apply broad-spectrum SPF 30+ sunscreen, wear protective sunglasses, and seek shade between 11:00 AM and 3:00 PM.`
            : `UV Index is ${uvIndex || 4}. Standard daytime sun awareness recommended.`,
          weatherFactor: `UV Index: ${uvIndex || 4} / 11`
        }
      ];

      const metrics = [
        { label: 'Outdoor Feasibility', value: `${feasibilityScore}%`, detail: 'Composite rating' },
        { label: 'Precipitation Risk', value: `${rainProbability}%`, detail: 'Rain hazard' },
        { label: 'Wind Velocity', value: `${windSpeed} km/h`, detail: 'Aerodynamic drag' },
        { label: 'UV Radiation', value: `${uvIndex || 4} / 11`, detail: 'Sun index' }
      ];

      return {
        modeId: 'outdoor',
        modeName: 'Outdoor Mode',
        feasibilityScore,
        feasibilityLabel,
        primaryMessage,
        considerations,
        metrics,
        disclaimer: 'Open-water and wilderness microclimates can change abruptly. Always check local terrain advisories.'
      };
    }

    // ========================================================================
    // 4. HEALTH & ENVIRONMENT MODE
    // ========================================================================
    // Rules:
    // - High Temperature / Heat Index: Feels-like >= 32°C -> hydration and heat awareness.
    // - Rain & Moisture: Rain >= 60% -> humidity increases, atmospheric particulate washout.
    // - Strong Wind: Wind >= 20 km/h -> active pollen and dust dispersal.
    // - Air Quality (AQI): Ambient particulate awareness.
    // - STRICT POLICY: No medical diagnosis, treatment, or clinical claims.
    // ========================================================================
    case 'health': {
      const aqiVal = airQuality?.aqi ?? 45;
      const aqiStatus = airQuality?.status ?? 'Good';
      const isHighHeat = feelsLike >= 32 || temperature >= 30;
      const isHighRain = rainProbability >= 60;
      const isHighWind = windSpeed >= 20;

      let feasibilityScore = 85;
      if (isHighHeat) feasibilityScore -= 20;
      if (aqiVal > 100) feasibilityScore -= 25;
      else if (aqiVal > 50) feasibilityScore -= 10;
      feasibilityScore = Math.max(25, Math.min(95, feasibilityScore));

      let feasibilityLabel = 'Favorable Ambient Environment';
      let primaryMessage = 'General environmental parameters indicate pleasant, manageable atmospheric conditions.';

      if (isHighHeat && aqiVal > 100) {
        feasibilityLabel = 'Elevated Heat & Particulate Load';
        primaryMessage = 'Elevated ambient temperatures and particulate levels. Maintain hydration and pace strenuous activities.';
      } else if (isHighHeat) {
        feasibilityLabel = 'Elevated Heat Index';
        primaryMessage = `Ambient temperatures produce a heat index of ${feelsLike}°C. Maintain consistent hydration and seek shaded environments during midday.`;
      } else if (isHighRain) {
        feasibilityLabel = 'High Humidity / Wet Environment';
        primaryMessage = 'Persistent atmospheric moisture and rain showers. Ambient humidity is elevated.';
      }

      const considerations = [
        // Rule 1: Temperature & Heat Index Awareness (Temperature factor)
        {
          label: 'Thermal Comfort & Heat Index',
          status: isHighHeat ? 'High Thermal Load' : 'Comfortable Metabolic Range',
          type: isHighHeat ? 'warning' : 'success',
          description: isHighHeat
            ? `Ambient temperature is ${temperature}°C with a heat index of ${feelsLike}°C. Higher thermal stress accelerates perspiration; maintain regular fluid intake.`
            : `Thermal index is moderate (feels like ${feelsLike}°C, actual ${temperature}°C). Standard metabolic dissipation without elevated heat strain.`,
          weatherFactor: `Feels Like: ${feelsLike}°C • Actual: ${temperature}°C`
        },
        // Rule 2: Rain & Atmospheric Moisture Awareness (Rain factor)
        {
          label: 'Rainfall & Humidity Awareness',
          status: isHighRain ? 'High Atmospheric Moisture' : 'Balanced Humidity',
          type: isHighRain ? 'info' : 'success',
          description: isHighRain
            ? `High rain probability (${rainProbability}%) and ${humidity}% relative humidity. Precipitation acts to scrub localized coarse particles from lower air layers.`
            : `Precipitation likelihood is low (${rainProbability}%) with relative humidity at ${humidity}%. Ambient air moisture is in a balanced range.`,
          weatherFactor: `Rain: ${rainProbability}% • Humidity: ${humidity}%`
        },
        // Rule 3: Wind & Particulate/Allergen Dispersal (Wind factor)
        {
          label: 'Air Movement & Allergen Dispersal',
          status: isHighWind ? 'Active Particulate Dispersal' : 'Calm Aerosol Dispersion',
          type: isHighWind ? 'warning' : 'neutral',
          description: isHighWind
            ? `Brisk wind movement (${windSpeed} km/h) aids in dispersing localized exhaust gases but can carry and suspend airborne dust and seasonal plant pollen.`
            : `Gentle air movement (${windSpeed} km/h). Stable atmospheric boundary layer with minimal dust stirring.`,
          weatherFactor: `Wind Velocity: ${windSpeed} km/h`
        },
        // Rule 4: Air Quality & Particulates (AQI factor)
        {
          label: 'Air Quality & Ambient Particulates',
          status: `${aqiStatus} (AQI ${aqiVal})`,
          type: aqiVal <= 50 ? 'success' : aqiVal <= 100 ? 'info' : 'warning',
          description: `Ambient PM2.5 concentration is ${airQuality?.pm25 ?? 12} µg/m³. ${
            aqiVal <= 50
              ? 'Urban particulate monitors show clean air quality.'
              : 'Moderate particulate concentrations in the ambient air.'
          }`,
          weatherFactor: `AQI: ${aqiVal} (${aqiStatus})`
        }
      ];

      const metrics = [
        { label: 'Air Quality Index', value: `${aqiVal}`, detail: aqiStatus },
        { label: 'Feels Like', value: `${feelsLike}°C`, detail: 'Thermal index' },
        { label: 'Relative Humidity', value: `${humidity}%`, detail: 'Air moisture' },
        { label: 'UV Radiation', value: `${uvIndex || 4} / 11`, detail: 'Solar load' }
      ];

      return {
        modeId: 'health',
        modeName: 'Health & Environment Mode',
        feasibilityScore,
        feasibilityLabel,
        primaryMessage,
        considerations,
        metrics,
        disclaimer:
          'NON-MEDICAL NOTICE: This section provides general environmental indicators (temperature, humidity, air quality) for situational awareness only. It DOES NOT provide medical diagnosis, clinical consultation, or personalized health advice.'
      };
    }

    default:
      return null;
  }
}
