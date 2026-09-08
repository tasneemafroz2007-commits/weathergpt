import React, { useState } from 'react';
import { BarChart3, Clock, Droplets, Thermometer, Wind } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

export function WeatherChart({ sources = [], consensus, hourly = [] }) {
  const [metricTab, setMetricTab] = useState('rain'); // 'rain' | 'temp' | 'wind'

  if (!sources || sources.length === 0) return null;

  // Items to plot: Sources + Consensus
  const chartItems = [
    ...sources.map((s, idx) => ({
      name: `Source ${String.fromCharCode(65 + idx)} (${s.providerCode.split('-')[0]})`,
      rain: s.rainProbability,
      temp: s.temperature,
      wind: s.windSpeed,
      isConsensus: false
    })),
    {
      name: 'Consensus Average',
      rain: consensus?.rainProbability || 0,
      temp: consensus?.temperature || 0,
      wind: consensus?.windSpeed || 0,
      isConsensus: true
    }
  ];

  // Helper for scale max
  const getScaleMax = (metric) => {
    if (metric === 'rain') return 100;
    if (metric === 'temp') return 45;
    if (metric === 'wind') return 50;
    return 100;
  };

  const scaleMax = getScaleMax(metricTab);
  const metricUnit = metricTab === 'rain' ? '%' : metricTab === 'temp' ? '°C' : ' km/h';

  return (
    <div className="card weather-chart-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <BarChart3 size={18} className="text-accent" />
          <h4 className="card-heading">Multi-Source Model Comparison</h4>
        </div>

        <div className="chart-tab-pills">
          <button
            type="button"
            className={`chart-pill ${metricTab === 'rain' ? 'active rain' : ''}`}
            onClick={() => setMetricTab('rain')}
          >
            <Droplets size={13} />
            Rain Chance (%)
          </button>
          <button
            type="button"
            className={`chart-pill ${metricTab === 'temp' ? 'active temp' : ''}`}
            onClick={() => setMetricTab('temp')}
          >
            <Thermometer size={13} />
            Temperature (°C)
          </button>
          <button
            type="button"
            className={`chart-pill ${metricTab === 'wind' ? 'active wind' : ''}`}
            onClick={() => setMetricTab('wind')}
          >
            <Wind size={13} />
            Wind (km/h)
          </button>
        </div>
      </div>

      {/* Bar Comparison Graphic */}
      <div className="bar-comparison-graphic">
        {chartItems.map((item, idx) => {
          const val = item[metricTab];
          const pct = Math.min(100, Math.max(5, (val / scaleMax) * 100));

          return (
            <div
              key={idx}
              className={`comparison-bar-row ${item.isConsensus ? 'is-consensus-row' : ''}`}
            >
              <div className="bar-label-area">
                <span className="bar-item-name">{item.name}</span>
                {item.isConsensus && <span className="consensus-chip">Consensus</span>}
              </div>

              <div className="bar-track-wrap">
                <div className="bar-track">
                  <div
                    className={`bar-fill-bar ${metricTab}-fill ${item.isConsensus ? 'consensus-fill' : ''}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <span className="bar-value-text">
                  {val}
                  {metricUnit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Forecast Strip */}
      {hourly && hourly.length > 0 && (
        <div className="hourly-forecast-strip">
          <div className="hourly-header">
            <Clock size={14} />
            <span>24-Hour Projected Progression</span>
          </div>

          <div className="hourly-grid">
            {hourly.map((h, idx) => (
              <div key={idx} className="hourly-node">
                <span className="hourly-time">{h.time}</span>
                <div className="hourly-icon-wrap">
                  <WeatherIcon name={h.icon} size={22} />
                </div>
                <span className="hourly-temp">{h.temp}°</span>
                <div className="hourly-rain-tag">
                  <Droplets size={11} className="text-blue" />
                  <span>{h.rain}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
