import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Eye,
  ShieldCheck,
  ArrowDown,
  ArrowUp,
  Clock,
  Sunrise,
  Sunset,
  Gauge,
  MapPin
} from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

export function WeatherCard({
  consensus,
  locationName,
  updatedAt,
  sourceCount = 1
}) {
  if (!consensus) return null;

  return (
    <div className="card weather-card-consensus">
      <div className="card-header-subtle">
        <div className="consensus-location-title">
          <MapPin size={16} className="text-accent" />
          <h2 className="location-heading-name">{locationName}</h2>
        </div>
        <div className="consensus-time">
          <Clock size={12} />
          <span>Synced {updatedAt}</span>
        </div>
      </div>

      <div className="weather-main-grid">
        <div className="weather-primary-col">
          <div className="weather-condition-badge">
            <WeatherIcon
              code={consensus.weatherCode || 'cloud-sun'}
              size={42}
              className="weather-main-icon"
            />
            <span className="condition-text">{consensus.condition}</span>
          </div>

          <div className="temperature-hero">
            <span className="temp-value">{consensus.temperature}</span>
            <span className="temp-unit">°C</span>
          </div>

          <div className="temp-secondary-row">
            <span className="feels-like">
              Feels like <strong>{consensus.feelsLike}°C</strong>
            </span>
            <span className="temp-range">
              <ArrowDown size={13} className="text-blue" />
              {consensus.tempLow}°
              <span className="divider">/</span>
              <ArrowUp size={13} className="text-amber" />
              {consensus.tempHigh}°
            </span>
          </div>
        </div>

        <div className="weather-metrics-grid">
          <div className="metric-box">
            <div className="metric-icon-wrap rain">
              <Droplets size={16} />
            </div>
            <div className="metric-content">
              <span className="metric-label">Rain Probability</span>
              <span className="metric-value font-highlight">{consensus.rainProbability}%</span>
              <span className="metric-sub">Precipitation likelihood</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap wind">
              <Wind size={16} />
            </div>
            <div className="metric-content">
              <span className="metric-label">Wind Velocity</span>
              <span className="metric-value">{consensus.windSpeed} km/h</span>
              <span className="metric-sub">Direction: {consensus.windDirection}</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap humidity">
              <Thermometer size={16} />
            </div>
            <div className="metric-content">
              <span className="metric-label">Relative Humidity</span>
              <span className="metric-value">{consensus.humidity}%</span>
              <span className="metric-sub">Pressure: {consensus.pressure} hPa</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap uv">
              <Sun size={16} />
            </div>
            <div className="metric-content">
              <span className="metric-label">UV & Air Quality</span>
              <span className="metric-value">{consensus.uvIndex || 4} / 11</span>
              <span className="metric-sub">AQI: {consensus.airQuality?.aqi || 42} ({consensus.airQuality?.status || 'Good'})</span>
            </div>
          </div>

          {/* Extended Metrics: Sunrise, Sunset, Visibility */}
          <div className="metric-box">
            <div className="metric-icon-wrap sun-times">
              <Sunrise size={16} />
            </div>
            <div className="metric-content">
              <span className="metric-label">Sunrise / Sunset</span>
              <span className="metric-value">{consensus.sunrise || '06:15 AM'}</span>
              <span className="metric-sub">Sunset: {consensus.sunset || '06:45 PM'}</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap visibility">
              <Eye size={16} />
            </div>
            <div className="metric-content">
              <span className="metric-label">Visibility</span>
              <span className="metric-value">{consensus.visibility || '10 km'}</span>
              <span className="metric-sub">Pressure: {consensus.pressure} hPa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
