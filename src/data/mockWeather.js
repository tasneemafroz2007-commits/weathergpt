/**
 * Mock weather datasets designed for multi-source consensus demonstration.
 * Locations: Bengaluru (Demo Default), Tokyo, London.
 * Scenarios: HIGH_AGREEMENT, MODERATE_AGREEMENT, LOW_AGREEMENT.
 */

export const LOCATIONS = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    region: 'Karnataka, India',
    coordinates: { lat: 12.9716, lon: 77.5946 },
    timezone: 'IST (UTC+5:30)',
    elevation: '920m'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    region: 'Kanto, Japan',
    coordinates: { lat: 35.6762, lon: 139.6503 },
    timezone: 'JST (UTC+9:00)',
    elevation: '40m'
  },
  {
    id: 'london',
    name: 'London',
    region: 'Greater London, UK',
    coordinates: { lat: 51.5074, lon: -0.1278 },
    timezone: 'GMT (UTC+0:00)',
    elevation: '11m'
  }
];

export const SCENARIOS = {
  HIGH_AGREEMENT: {
    id: 'HIGH_AGREEMENT',
    name: 'High Agreement (High Confidence)',
    description: 'All 3 weather models project very close rainfall, temperature, and wind forecasts.'
  },
  MODERATE_AGREEMENT: {
    id: 'MODERATE_AGREEMENT',
    name: 'Moderate Agreement (Medium Confidence)',
    description: 'Models agree on general conditions with slight divergence in precipitation timing and intensity.'
  },
  LOW_AGREEMENT: {
    id: 'LOW_AGREEMENT',
    name: 'Divergent Models (Low Confidence)',
    description: 'Significant disagreement between models regarding storm development and rainfall probability.'
  }
};

export const MOCK_DATA = {
  bengaluru: {
    HIGH_AGREEMENT: {
      location: 'Bengaluru, India',
      updatedAt: '2 minutes ago',
      consensus: {
        temperature: 28,
        feelsLike: 30,
        rainProbability: 80,
        windSpeed: 19,
        windDirection: 'SW',
        humidity: 76,
        condition: 'Scattered Monsoon Showers',
        weatherCode: 'rain-moderate',
        pressure: 1012,
        uvIndex: 4,
        airQuality: { aqi: 48, status: 'Good', pm25: 11.2 },
        visibility: '8 km',
        tempHigh: 29,
        tempLow: 21
      },
      sources: [
        {
          id: 'source-a',
          name: 'Global Met Model A',
          providerCode: 'GFS-Ensemble',
          temperature: 28,
          rainProbability: 80,
          windSpeed: 18,
          humidity: 75,
          condition: 'Rain Showers',
          resolution: '13 km grid',
          lastSync: '10 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-b',
          name: 'European Met Center B',
          providerCode: 'ECMWF-HRES',
          temperature: 27,
          rainProbability: 76,
          windSpeed: 20,
          humidity: 78,
          condition: 'Moderate Rain',
          resolution: '9 km grid',
          lastSync: '15 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-c',
          name: 'Regional Radar AI Model C',
          providerCode: 'Nowcast-RadarAI',
          temperature: 28,
          rainProbability: 82,
          windSpeed: 19,
          humidity: 76,
          condition: 'Scattered Showers',
          resolution: '2 km grid',
          lastSync: '3 mins ago',
          status: 'Operational'
        }
      ],
      hourly: [
        { time: '09:00', temp: 24, rain: 30, wind: 14, icon: 'cloud-sun' },
        { time: '12:00', temp: 28, rain: 55, wind: 17, icon: 'cloud-rain' },
        { time: '15:00', temp: 28, rain: 80, wind: 21, icon: 'cloud-heavy-rain' },
        { time: '18:00', temp: 25, rain: 85, wind: 19, icon: 'cloud-lightning' },
        { time: '21:00', temp: 23, rain: 60, wind: 15, icon: 'cloud-rain' },
        { time: '00:00', temp: 22, rain: 35, wind: 12, icon: 'cloud' }
      ],
      alerts: [
        {
          id: 'alert-1',
          severity: 'advisory',
          title: 'Monsoon Rain Advisory',
          description: '3 weather sources show consistent high probability of afternoon rain (76% - 82%). Waterlogging possible in low-lying roads between 3:00 PM and 7:00 PM.',
          sourceAgreementNotice: 'All 3 queried models are in agreement on afternoon precipitation.'
        }
      ]
    },

    MODERATE_AGREEMENT: {
      location: 'Bengaluru, India',
      updatedAt: '5 minutes ago',
      consensus: {
        temperature: 29,
        feelsLike: 31,
        rainProbability: 55,
        windSpeed: 18,
        windDirection: 'WNW',
        humidity: 64,
        condition: 'Partly Cloudy with Passing Showers',
        weatherCode: 'cloud-rain',
        pressure: 1014,
        uvIndex: 7,
        airQuality: { aqi: 62, status: 'Moderate', pm25: 18.5 },
        visibility: '10 km',
        tempHigh: 31,
        tempLow: 22
      },
      sources: [
        {
          id: 'source-a',
          name: 'Global Met Model A',
          providerCode: 'GFS-Ensemble',
          temperature: 29,
          rainProbability: 65,
          windSpeed: 14,
          humidity: 68,
          condition: 'Chance of Showers',
          resolution: '13 km grid',
          lastSync: '8 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-b',
          name: 'European Met Center B',
          providerCode: 'ECMWF-HRES',
          temperature: 26,
          rainProbability: 45,
          windSpeed: 22,
          humidity: 60,
          condition: 'Partly Cloudy',
          resolution: '9 km grid',
          lastSync: '22 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-c',
          name: 'Regional Radar AI Model C',
          providerCode: 'Nowcast-RadarAI',
          temperature: 31,
          rainProbability: 55,
          windSpeed: 18,
          humidity: 65,
          condition: 'Passing Showers',
          resolution: '2 km grid',
          lastSync: '4 mins ago',
          status: 'Operational'
        }
      ],
      hourly: [
        { time: '09:00', temp: 25, rain: 20, wind: 12, icon: 'sun' },
        { time: '12:00', temp: 29, rain: 40, wind: 16, icon: 'cloud-sun' },
        { time: '15:00', temp: 30, rain: 55, wind: 20, icon: 'cloud-rain' },
        { time: '18:00', temp: 27, rain: 50, wind: 18, icon: 'cloud-sun' },
        { time: '21:00', temp: 24, rain: 25, wind: 14, icon: 'cloud' },
        { time: '00:00', temp: 22, rain: 15, wind: 10, icon: 'moon' }
      ],
      alerts: [
        {
          id: 'alert-mod-1',
          severity: 'caution',
          title: 'Moderate Rain Uncertainty',
          description: 'Models diverge on precipitation probability between 45% and 65%. Isolated evening showers are possible, but prolonged downpours are not guaranteed.',
          sourceAgreementNotice: 'Models agree on warm temperatures but diverge moderately on rain chance.'
        }
      ]
    },

    LOW_AGREEMENT: {
      location: 'Bengaluru, India',
      updatedAt: 'Just now',
      consensus: {
        temperature: 27,
        feelsLike: 28,
        rainProbability: 55,
        windSpeed: 21,
        windDirection: 'Variable',
        humidity: 68,
        condition: 'Model Divergence / Storm Uncertainty',
        weatherCode: 'cloud-lightning',
        pressure: 1009,
        uvIndex: 6,
        airQuality: { aqi: 75, status: 'Moderate', pm25: 24.1 },
        visibility: '6-12 km (Variable)',
        tempHigh: 31,
        tempLow: 21
      },
      sources: [
        {
          id: 'source-a',
          name: 'Global Met Model A',
          providerCode: 'GFS-Ensemble',
          temperature: 31,
          rainProbability: 85,
          windSpeed: 32,
          humidity: 85,
          condition: 'Heavy Thunderstorm',
          resolution: '13 km grid',
          lastSync: '2 mins ago',
          status: 'High Instability Alert'
        },
        {
          id: 'source-b',
          name: 'European Met Center B',
          providerCode: 'ECMWF-HRES',
          temperature: 24,
          rainProbability: 25,
          windSpeed: 10,
          humidity: 52,
          condition: 'Mild & Overcast',
          resolution: '9 km grid',
          lastSync: '12 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-c',
          name: 'Regional Radar AI Model C',
          providerCode: 'Nowcast-RadarAI',
          temperature: 27,
          rainProbability: 55,
          windSpeed: 22,
          humidity: 68,
          condition: 'Scattered Isolated Gusts',
          resolution: '2 km grid',
          lastSync: '1 min ago',
          status: 'Rapid Variance Detected'
        }
      ],
      hourly: [
        { time: '09:00', temp: 24, rain: 20, wind: 10, icon: 'cloud' },
        { time: '12:00', temp: 28, rain: 40, wind: 18, icon: 'cloud-lightning' },
        { time: '15:00', temp: 29, rain: 65, wind: 28, icon: 'cloud-heavy-rain' },
        { time: '18:00', temp: 25, rain: 75, wind: 30, icon: 'wind' },
        { time: '21:00', temp: 23, rain: 45, wind: 16, icon: 'cloud-rain' },
        { time: '00:00', temp: 22, rain: 20, wind: 12, icon: 'cloud' }
      ],
      alerts: [
        {
          id: 'alert-conflict',
          severity: 'warning',
          title: 'High Disagreement Warning Between Forecast Models',
          description: 'Source A projects severe thunderstorm with 85% rain probability, while Source B projects benign overcast conditions with only 25% rain. Prepare for sudden shifts.',
          sourceAgreementNotice: 'Low agreement between independent models. Exercise flexibility with outdoor and travel arrangements.'
        }
      ]
    }
  },

  tokyo: {
    HIGH_AGREEMENT: {
      location: 'Tokyo, Japan',
      updatedAt: '1 minute ago',
      consensus: {
        temperature: 21,
        feelsLike: 21,
        rainProbability: 15,
        windSpeed: 12,
        windDirection: 'NE',
        humidity: 55,
        condition: 'Clear Autumn Sky',
        weatherCode: 'sun',
        pressure: 1018,
        uvIndex: 5,
        airQuality: { aqi: 24, status: 'Excellent', pm25: 5.8 },
        visibility: '15 km',
        tempHigh: 23,
        tempLow: 15
      },
      sources: [
        {
          id: 'source-a',
          name: 'Global Met Model A',
          providerCode: 'GFS-Ensemble',
          temperature: 21,
          rainProbability: 15,
          windSpeed: 11,
          humidity: 54,
          condition: 'Clear',
          resolution: '13 km grid',
          lastSync: '6 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-b',
          name: 'European Met Center B',
          providerCode: 'ECMWF-HRES',
          temperature: 21,
          rainProbability: 12,
          windSpeed: 13,
          humidity: 56,
          condition: 'Sunny',
          resolution: '9 km grid',
          lastSync: '18 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-c',
          name: 'Regional Radar AI Model C',
          providerCode: 'JMA-AI-Nowcast',
          temperature: 22,
          rainProbability: 18,
          windSpeed: 12,
          humidity: 55,
          condition: 'Mostly Sunny',
          resolution: '2 km grid',
          lastSync: '3 mins ago',
          status: 'Operational'
        }
      ],
      hourly: [
        { time: '09:00', temp: 17, rain: 10, wind: 8, icon: 'sun' },
        { time: '12:00', temp: 22, rain: 10, wind: 12, icon: 'sun' },
        { time: '15:00', temp: 21, rain: 15, wind: 14, icon: 'sun' },
        { time: '18:00', temp: 18, rain: 15, wind: 10, icon: 'cloud-sun' },
        { time: '21:00', temp: 16, rain: 10, wind: 8, icon: 'moon' },
        { time: '00:00', temp: 15, rain: 5, wind: 6, icon: 'moon' }
      ],
      alerts: []
    },
    MODERATE_AGREEMENT: {
      location: 'Tokyo, Japan',
      updatedAt: '7 minutes ago',
      consensus: {
        temperature: 19,
        feelsLike: 19,
        rainProbability: 40,
        windSpeed: 18,
        windDirection: 'ENE',
        humidity: 68,
        condition: 'Breezy with High Cloud Cover',
        weatherCode: 'cloud-wind',
        pressure: 1013,
        uvIndex: 3,
        airQuality: { aqi: 35, status: 'Good', pm25: 8.4 },
        visibility: '12 km',
        tempHigh: 21,
        tempLow: 14
      },
      sources: [
        {
          id: 'source-a',
          name: 'Global Met Model A',
          providerCode: 'GFS-Ensemble',
          temperature: 20,
          rainProbability: 35,
          windSpeed: 16,
          humidity: 65,
          condition: 'Overcast',
          resolution: '13 km grid',
          lastSync: '9 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-b',
          name: 'European Met Center B',
          providerCode: 'ECMWF-HRES',
          temperature: 18,
          rainProbability: 50,
          windSpeed: 21,
          humidity: 72,
          condition: 'Light Drizzle',
          resolution: '9 km grid',
          lastSync: '14 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-c',
          name: 'Regional Radar AI Model C',
          providerCode: 'JMA-AI-Nowcast',
          temperature: 19,
          rainProbability: 35,
          windSpeed: 17,
          humidity: 67,
          condition: 'Cloudy',
          resolution: '2 km grid',
          lastSync: '2 mins ago',
          status: 'Operational'
        }
      ],
      hourly: [
        { time: '09:00', temp: 16, rain: 20, wind: 14, icon: 'cloud' },
        { time: '12:00', temp: 20, rain: 35, wind: 18, icon: 'cloud-wind' },
        { time: '15:00', temp: 19, rain: 45, wind: 20, icon: 'cloud-rain' },
        { time: '18:00', temp: 17, rain: 30, wind: 16, icon: 'cloud' },
        { time: '21:00', temp: 15, rain: 20, wind: 12, icon: 'cloud' },
        { time: '00:00', temp: 14, rain: 15, wind: 10, icon: 'cloud' }
      ],
      alerts: []
    },
    LOW_AGREEMENT: {
      location: 'Tokyo, Japan',
      updatedAt: '4 minutes ago',
      consensus: {
        temperature: 20,
        feelsLike: 20,
        rainProbability: 60,
        windSpeed: 28,
        windDirection: 'S',
        humidity: 78,
        condition: 'Typhoon Peripheral Track Uncertainty',
        weatherCode: 'wind',
        pressure: 1002,
        uvIndex: 2,
        airQuality: { aqi: 42, status: 'Good', pm25: 9.8 },
        visibility: '8 km',
        tempHigh: 22,
        tempLow: 16
      },
      sources: [
        {
          id: 'source-a',
          name: 'Global Met Model A',
          providerCode: 'GFS-Ensemble',
          temperature: 23,
          rainProbability: 88,
          windSpeed: 42,
          humidity: 88,
          condition: 'Tropical Squalls',
          resolution: '13 km grid',
          lastSync: '5 mins ago',
          status: 'Warning Track'
        },
        {
          id: 'source-b',
          name: 'European Met Center B',
          providerCode: 'ECMWF-HRES',
          temperature: 17,
          rainProbability: 30,
          windSpeed: 18,
          humidity: 62,
          condition: 'Moderate Breeze',
          resolution: '9 km grid',
          lastSync: '25 mins ago',
          status: 'Offshore Track'
        },
        {
          id: 'source-c',
          name: 'Regional Radar AI Model C',
          providerCode: 'JMA-AI-Nowcast',
          temperature: 20,
          rainProbability: 62,
          windSpeed: 25,
          humidity: 84,
          condition: 'Squally Showers',
          resolution: '2 km grid',
          lastSync: '1 min ago',
          status: 'High Trajectory Spread'
        }
      ],
      hourly: [
        { time: '09:00', temp: 17, rain: 30, wind: 18, icon: 'cloud' },
        { time: '12:00', temp: 21, rain: 55, wind: 28, icon: 'wind' },
        { time: '15:00', temp: 22, rain: 80, wind: 38, icon: 'cloud-heavy-rain' },
        { time: '18:00', temp: 19, rain: 70, wind: 35, icon: 'cloud-lightning' },
        { time: '21:00', temp: 17, rain: 45, wind: 24, icon: 'cloud-rain' },
        { time: '00:00', temp: 16, rain: 25, wind: 16, icon: 'cloud' }
      ],
      alerts: [
        {
          id: 'alert-typhoon',
          severity: 'warning',
          title: 'Offshore System Track Uncertainty',
          description: 'Discrepancy in offshore low-pressure trajectory. Source A models storm center landfall; Source B keeps winds offshore. Monitor coastal transit advisories.',
          sourceAgreementNotice: 'Wind and rain variance high between US and European ensemble suites.'
        }
      ]
    }
  },

  london: {
    HIGH_AGREEMENT: {
      location: 'London, UK',
      updatedAt: '3 minutes ago',
      consensus: {
        temperature: 15,
        feelsLike: 14,
        rainProbability: 72,
        windSpeed: 24,
        windDirection: 'WSW',
        humidity: 82,
        condition: 'Persistent Autumn Drizzle',
        weatherCode: 'cloud-rain',
        pressure: 1008,
        uvIndex: 2,
        airQuality: { aqi: 28, status: 'Good', pm25: 6.2 },
        visibility: '7 km',
        tempHigh: 16,
        tempLow: 11
      },
      sources: [
        {
          id: 'source-a',
          name: 'Global Met Model A',
          providerCode: 'GFS-Ensemble',
          temperature: 15,
          rainProbability: 70,
          windSpeed: 23,
          humidity: 80,
          condition: 'Light Rain',
          resolution: '13 km grid',
          lastSync: '7 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-b',
          name: 'European Met Center B',
          providerCode: 'ECMWF-HRES',
          temperature: 15,
          rainProbability: 74,
          windSpeed: 25,
          humidity: 83,
          condition: 'Drizzle & Low Cloud',
          resolution: '9 km grid',
          lastSync: '12 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-c',
          name: 'Regional Radar AI Model C',
          providerCode: 'UK-RadarAI',
          temperature: 14,
          rainProbability: 72,
          windSpeed: 24,
          humidity: 83,
          condition: 'Intermittent Showers',
          resolution: '2 km grid',
          lastSync: '2 mins ago',
          status: 'Operational'
        }
      ],
      hourly: [
        { time: '09:00', temp: 12, rain: 60, wind: 20, icon: 'cloud-rain' },
        { time: '12:00', temp: 15, rain: 75, wind: 24, icon: 'cloud-rain' },
        { time: '15:00', temp: 16, rain: 80, wind: 26, icon: 'cloud-rain' },
        { time: '18:00', temp: 14, rain: 70, wind: 22, icon: 'cloud-rain' },
        { time: '21:00', temp: 12, rain: 50, wind: 18, icon: 'cloud' },
        { time: '00:00', temp: 11, rain: 40, wind: 16, icon: 'cloud' }
      ],
      alerts: []
    },
    MODERATE_AGREEMENT: {
      location: 'London, UK',
      updatedAt: '6 minutes ago',
      consensus: {
        temperature: 17,
        feelsLike: 16,
        rainProbability: 40,
        windSpeed: 19,
        windDirection: 'W',
        humidity: 70,
        condition: 'Scattered Clouds with Sunny Intervals',
        weatherCode: 'cloud-sun',
        pressure: 1016,
        uvIndex: 3,
        airQuality: { aqi: 32, status: 'Good', pm25: 7.1 },
        visibility: '10 km',
        tempHigh: 18,
        tempLow: 10
      },
      sources: [
        {
          id: 'source-a',
          name: 'Global Met Model A',
          providerCode: 'GFS-Ensemble',
          temperature: 18,
          rainProbability: 30,
          windSpeed: 17,
          humidity: 66,
          condition: 'Partly Cloudy',
          resolution: '13 km grid',
          lastSync: '11 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-b',
          name: 'European Met Center B',
          providerCode: 'ECMWF-HRES',
          temperature: 16,
          rainProbability: 52,
          windSpeed: 22,
          humidity: 74,
          condition: 'Scattered Showers',
          resolution: '9 km grid',
          lastSync: '19 mins ago',
          status: 'Operational'
        },
        {
          id: 'source-c',
          name: 'Regional Radar AI Model C',
          providerCode: 'UK-RadarAI',
          temperature: 17,
          rainProbability: 38,
          windSpeed: 18,
          humidity: 70,
          condition: 'Brief Spells',
          resolution: '2 km grid',
          lastSync: '3 mins ago',
          status: 'Operational'
        }
      ],
      hourly: [
        { time: '09:00', temp: 12, rain: 20, wind: 14, icon: 'cloud-sun' },
        { time: '12:00', temp: 17, rain: 35, wind: 18, icon: 'cloud-sun' },
        { time: '15:00', temp: 18, rain: 45, wind: 22, icon: 'cloud-rain' },
        { time: '18:00', temp: 15, rain: 30, wind: 18, icon: 'cloud' },
        { time: '21:00', temp: 13, rain: 15, wind: 12, icon: 'moon' },
        { time: '00:00', temp: 11, rain: 10, wind: 10, icon: 'moon' }
      ],
      alerts: []
    },
    LOW_AGREEMENT: {
      location: 'London, UK',
      updatedAt: '2 minutes ago',
      consensus: {
        temperature: 16,
        feelsLike: 14,
        rainProbability: 55,
        windSpeed: 30,
        windDirection: 'SW',
        humidity: 78,
        condition: 'Atlantic Frontal Speed Discrepancy',
        weatherCode: 'wind',
        pressure: 998,
        uvIndex: 2,
        airQuality: { aqi: 25, status: 'Good', pm25: 5.5 },
        visibility: '5-12 km',
        tempHigh: 19,
        tempLow: 9
      },
      sources: [
        {
          id: 'source-a',
          name: 'Global Met Model A',
          providerCode: 'GFS-Ensemble',
          temperature: 20,
          rainProbability: 85,
          windSpeed: 45,
          humidity: 88,
          condition: 'Gale Force Rainband',
          resolution: '13 km grid',
          lastSync: '4 mins ago',
          status: 'Fast Front'
        },
        {
          id: 'source-b',
          name: 'European Met Center B',
          providerCode: 'ECMWF-HRES',
          temperature: 13,
          rainProbability: 25,
          windSpeed: 18,
          humidity: 65,
          condition: 'Dry Pre-Frontal Warmth',
          resolution: '9 km grid',
          lastSync: '16 mins ago',
          status: 'Stalled Front'
        },
        {
          id: 'source-c',
          name: 'Regional Radar AI Model C',
          providerCode: 'UK-RadarAI',
          temperature: 16,
          rainProbability: 55,
          windSpeed: 28,
          humidity: 81,
          condition: 'Progressive Showers',
          resolution: '2 km grid',
          lastSync: '1 min ago',
          status: 'Frontal Timing Split'
        }
      ],
      hourly: [
        { time: '09:00', temp: 11, rain: 20, wind: 16, icon: 'cloud' },
        { time: '12:00', temp: 16, rain: 45, wind: 24, icon: 'cloud-rain' },
        { time: '15:00', temp: 18, rain: 80, wind: 42, icon: 'cloud-heavy-rain' },
        { time: '18:00', temp: 15, rain: 60, wind: 36, icon: 'wind' },
        { time: '21:00', temp: 12, rain: 30, wind: 22, icon: 'cloud-rain' },
        { time: '00:00', temp: 10, rain: 15, wind: 16, icon: 'cloud' }
      ],
      alerts: [
        {
          id: 'alert-wind',
          severity: 'warning',
          title: 'Frontal Timing & Gust Discrepancy',
          description: 'Atlantic depression timing varies by 6 hours between models. High gusts (up to 45 km/h) possible if fast-front scenario verifies.',
          sourceAgreementNotice: 'Noticeable spread in frontal arrival estimates.'
        }
      ]
    }
  }
};
