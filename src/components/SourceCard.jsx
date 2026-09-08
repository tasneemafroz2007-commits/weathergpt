import React from 'react';
import { Droplets, Wind, Thermometer, Radio } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

export function SourceCard({
  source,
  consensus,
  comparison,
  index = 0
}) {
  if (!source) return null;

  // Use the calculated ensemble average from comparison, falling back to consensus
  const avgTemp = comparison?.temperature?.avg ?? consensus?.temperature ?? source.temperature;
  const avgRain = comparison?.rainProbability?.avg ?? consensus?.rainProbability ?? source.rainProbability;

  // Calculate delta from calculated average of all queried sources
  const tempDelta = Math.round((source.temperature - avgTemp) * 10) / 10;
  const rainDelta = Math.round(source.rainProbability - avgRain);

  // Check if this model is at the extreme high or low of the spread
  const rainSpread = comparison?.rainProbability?.spread ?? 0;
  const isHighestRain = rainSpread > 5 && source.rainProbability === comparison?.rainProbability?.max;
  const isLowestRain = rainSpread > 5 && source.rainProbability === comparison?.rainProbability?.min;

  const letter = String.fromCharCode(65 + index); // A, B, C

  return (
    <div className="card source-card">
      <div className="source-card-header">
        <div className="source-title-group">
          <div className="source-badge">
            <span>Source {letter}</span>
          </div>
          <div>
            <h4 className="source-name">{source.name}</h4>
            <span className="source-meta">
              {source.providerCode} • {source.resolution}
            </span>
          </div>
        </div>

        <span className={`source-status-tag ${source.status.toLowerCase().includes('alert') || source.status.toLowerCase().includes('variance') ? 'status-warn' : 'status-ok'}`}>
          <Radio size={11} className="pulse" />
          {source.status}
        </span>
      </div>

      <div className="source-condition-bar">
        <WeatherIcon name={source.condition.toLowerCase().includes('rain') ? 'cloud-rain' : 'cloud-sun'} size={20} />
        <span className="source-condition-name">{source.condition}</span>
        {isHighestRain && (
          <span className="delta-chip delta-pos" title="Highest rain estimate among models" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
            High Bound
          </span>
        )}
        {isLowestRain && (
          <span className="delta-chip delta-neg" title="Lowest rain estimate among models" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
            Low Bound
          </span>
        )}
      </div>

      <div className="source-metrics-table">
        <div className="source-metric-row highlight-rain">
          <div className="metric-row-label">
            <Droplets size={14} className="text-blue" />
            <span>Rain Probability</span>
          </div>
          <div className="metric-row-value">
            <span className="source-num-rain">{source.rainProbability}%</span>
            <span className={`delta-chip ${rainDelta === 0 ? 'delta-zero' : rainDelta > 0 ? 'delta-pos' : 'delta-neg'}`} title="Delta relative to calculated ensemble mean">
              {rainDelta === 0 ? 'Mean' : rainDelta > 0 ? `+${rainDelta}% vs mean` : `${rainDelta}% vs mean`}
            </span>
          </div>
        </div>

        <div className="source-metric-row">
          <div className="metric-row-label">
            <Thermometer size={14} className="text-amber" />
            <span>Temperature</span>
          </div>
          <div className="metric-row-value">
            <span className="source-num-temp">{source.temperature}°C</span>
            <span className={`delta-chip ${tempDelta === 0 ? 'delta-zero' : tempDelta > 0 ? 'delta-pos' : 'delta-neg'}`} title="Delta relative to calculated ensemble mean">
              {tempDelta === 0 ? 'Mean' : tempDelta > 0 ? `+${tempDelta}° vs mean` : `${tempDelta}° vs mean`}
            </span>
          </div>
        </div>

        <div className="source-metric-row">
          <div className="metric-row-label">
            <Wind size={14} className="text-slate" />
            <span>Wind Velocity</span>
          </div>
          <div className="metric-row-value">
            <span>{source.windSpeed} km/h</span>
          </div>
        </div>

        <div className="source-metric-row">
          <div className="metric-row-label">
            <Droplets size={14} className="text-cyan" />
            <span>Relative Humidity</span>
          </div>
          <div className="metric-row-value">
            <span>{source.humidity || 75}%</span>
          </div>
        </div>
      </div>

      <div className="source-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
        <span className="source-sync-time">Synchronized {source.lastSync}</span>
        {comparison && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Spread: {comparison.rainProbability.spread}% rain • {comparison.temperature.spread}°C temp
          </span>
        )}
      </div>
    </div>
  );
}
