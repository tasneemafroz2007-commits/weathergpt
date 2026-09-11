import React from 'react';
import { CloudLightning } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';

export function Header({
  onSelectLocation,
  onUseCurrentLocation,
  lastUpdated,
  isLiveMode
}) {
  return (
    <header className="app-header">
      <div className="header-brand-section">
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
                ? 'Global Open-Meteo Telemetry & Domain-Adaptive Intelligence'
                : 'Multi-Source Model Consensus & Impact Forecasting'}
            </p>
          </div>
        </div>
      </div>

      <div className="header-center-search">
        <SearchBar
          onSelectLocation={onSelectLocation}
          onUseCurrentLocation={onUseCurrentLocation}
        />
      </div>

      <div className="header-controls-section">
        <ThemeToggle />

        <div className="header-meta">
          <span
            className="live-pulse-dot"
            title={isLiveMode ? 'Live Open-Meteo API stream connected' : 'Demo scenario simulation active'}
          ></span>
          <span className="sync-time">
            <strong>{isLiveMode ? 'Live API' : 'Demo Mode'}</strong> • {lastUpdated || 'just now'}
          </span>
        </div>
      </div>
    </header>
  );
}
