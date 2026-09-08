# WeatherGPT • Weather Intelligence & Impact Module

> A modular, responsive, and production-ready frontend for **WeatherGPT**, built for high-stakes hackathons. Demonstrates multi-source meteorological consensus, mathematical model agreement, and persona-driven weather impact intelligence.

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch
```bash
# Install dependencies
npm install

# Start local development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build
```

---

## 🎯 Core Features

### 1. Multi-Source Evidence & Confidence Engine
- **3 Independent Weather Models:**
  - **Source A:** Global Deterministic Model (`GFS-Ensemble`, 13 km grid)
  - **Source B:** European High-Resolution Met Center (`ECMWF-HRES`, 9 km grid)
  - **Source C:** Regional Radar AI Nowcasting (`Nowcast-RadarAI`, 2 km grid)
- **Mathematical Agreement Index (0–100%):** Weighted cross-model variance calculation:
  - Precipitation probability spread (45% weight)
  - Temperature delta (30% weight)
  - Wind velocity divergence (25% weight)
- **Categorical Confidence Levels:** `HIGH` ($\ge 80\%$), `MEDIUM` ($50\% - 79\%$), `LOW` ($< 50\%$).
- **Source Agreement Disclaimer:** Explicitly framed as *model consensus among queried forecasting suites*, avoiding misleading claims of absolute atmospheric certainty.
- **"Why this confidence?" Modal:** Deep dive explaining standard deviation, delta, and ensemble methodology.
- **Interactive Scenarios:** Instantly toggle between **High Agreement**, **Moderate Agreement**, and **Divergent / Conflict** scenarios in the demo control bar.

---

### 2. Weather Impact Modes
Interprets identical underlying meteorological consensus data through 4 domain lenses:

1. **🌾 Farmer Mode:**
   - Evaluates chemical spraying feasibility (wind drift and washout risk).
   - Irrigation recommendations (suspend or continue based on rain forecast).
   - Soil compaction risk for heavy machinery and tractors.
2. **✈️ Traveller Mode:**
   - Road and highway driving conditions (surface water pooling and traction).
   - Flight delay and turbulence risk index.
   - Tailored luggage packing advisories (waterproofing gear, layers).
3. **🧭 Outdoor Enthusiast Mode:**
   - Outdoor activity feasibility rating (cycling, running, hiking).
   - Trail erosion and mud hazard warnings.
   - UV radiation load and solar protection guidance.
4. **❤️ Health & Environment Mode:**
   - Ambient Air Quality Index (AQI) and PM2.5 concentrations.
   - Thermal comfort, heat index, and hydration guidance.
   - **Prominent Non-Medical Disclaimer:** Strictly general environmental awareness; no medical diagnoses.

---

## 🏗️ Architecture & Integration Guide for Teammates

This module was intentionally architected for zero-friction integration into a larger WeatherGPT application:

```
src/
├── components/           # Reusable UI components
│   ├── Header.jsx        # Top banner, location picker, live status
│   ├── Navigation.jsx    # Tab-based sub-navigation
│   ├── StateControls.jsx # Hackathon demo switcher (Scenarios + UI states)
│   ├── WeatherCard.jsx   # Consensus weather hero card
│   ├── SourceCard.jsx    # Individual model cards (Source A, B, C)
│   ├── ConfidenceCard.jsx# Visual agreement gauge & explanation
│   ├── WhyConfidenceModal.jsx # Detailed variance breakdown modal
│   ├── ImpactModeSelector.jsx # Mode selector pills
│   ├── ImpactInsightsCard.jsx # Domain-adaptive insight cards
│   ├── AlertCard.jsx     # Active weather advisories
│   ├── RecommendationCard.jsx # Actionable checklist
│   ├── WeatherChart.jsx  # Multi-source comparison bars & hourly strip
│   └── FeedbackStates.jsx# Skeleton, Error, and Empty states
├── data/
│   └── mockWeather.js    # Multi-city, multi-scenario datasets
├── utils/
│   ├── confidence.js     # Statistical spread, stdDev, and confidence scoring
│   └── impactModes.js    # Persona heuristic rules and insights generator
├── services/
│   └── weatherService.js # Clean abstraction layer for live API replacement
└── pages/
    └── Dashboard.jsx     # Top-level orchestrator page
```

### 🔌 How to Swap in Live Weather APIs Later:
Teammates only need to edit **one single file**: [`src/services/weatherService.js`](file:///c:/Users/tasne/OneDrive/Desktop/weathergpt/src/services/weatherService.js).

Replace the mock Promise in `getWeatherData(locationId, scenarioId)` with live REST calls to endpoints like **Open-Meteo Ensemble API** (`https://api.open-meteo.com/v1/ensemble`):

```javascript
export async function getWeatherData(locationId) {
  // 1. Fetch live multi-model ensemble from Open-Meteo or custom backend
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?...`);
  const data = await response.json();

  // 2. Format into sources array [Source A, Source B, Source C]
  // 3. Pass to calculateConfidence(sources) & generateImpactInsights(mode, data)
  // 4. Return formatted payload - UI components update automatically!
}
```

---

## 📱 Responsiveness & Accessibility
- Tested on standard desktop widths ($1280\text{px}+$) down to mobile viewports ($375\text{px}$).
- Uses WCAG AA compliant contrast ratios against dark atmospheric gradients.
- Interactive controls support keyboard navigation and focus-visible rings.
