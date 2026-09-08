import React from 'react';
import { CloudLightning, MapPin } from 'lucide-react';
import { LOCATIONS } from '../data/mockWeather';

export function Header({
  selectedLocation,
  onLocationChange,
  activeMode,
  lastUpdated,
  isLiveMode
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-badge">
          <div className="brand-icon">
            <CloudLightning size={22} className="text-accent" />
          </div>
          <div className="brand-info">
            <div className="brand-title-row">
              <span className="brand-name">WeatherGPT</span>
              <span className="brand-module-tag">Intelligence & Impact</span>
            </div>
            <p className="brand-subtitle">
              {isLiveMode
                ? 'Real-Time Open-Meteo Ingestion & Domain-Adaptive Impact Forecasting'
                : 'Multi-Source Consensus & Domain-Adaptive Forecasting'}
            </p>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="location-picker">
          <MapPin size={16} className="location-icon" />
          <label htmlFor="location-select" className="sr-only">Select Location</label>
          <select
            id="location-select"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="location-select"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}, {loc.region}
              </option>
            ))}
          </select>
        </div>

        <div className="header-meta">
          <span className="live-pulse-dot" title={isLiveMode ? "Live Open-Meteo stream connected" : "Demo model simulation active"}></span>
          <span className="sync-time">
            <strong>{isLiveMode ? 'Live API' : 'Demo Mode'}</strong> • {lastUpdated || 'just now'}
          </span>
        </div>
      </div>
    </header>
  );
}
