import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Sliders,
  ShieldAlert,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

export function ImpactInsightsCard({
  insights,
  activeMode,
  consensus
}) {
  if (!insights) return null;

  const {
    modeName,
    feasibilityScore,
    feasibilityLabel,
    primaryMessage,
    considerations,
    metrics,
    disclaimer
  } = insights;

  // Feasibility status badge color
  let scoreClass = 'score-high';
  if (feasibilityScore < 40) scoreClass = 'score-low';
  else if (feasibilityScore < 70) scoreClass = 'score-med';

  return (
    <div className={`card impact-insights-card impact-${activeMode}`}>
      {/* Header with Feasibility Score */}
      <div className="impact-header-row">
        <div className="impact-title-group">
          <div className="impact-mode-tag">
            <WeatherIcon name={activeMode} size={18} />
            <span>{modeName} Insights</span>
          </div>
          <span className="impact-feasibility-text">{feasibilityLabel}</span>
        </div>

        <div className="feasibility-meter-badge">
          <div className="feasibility-meter-circle">
            <span className={`feasibility-val ${scoreClass}`}>{feasibilityScore}%</span>
            <span className="feasibility-sub">Feasibility</span>
          </div>
        </div>
      </div>

      {/* Primary Contextual Advisory Message */}
      <div className="primary-advisory-box">
        <div className="advisory-icon-wrap">
          <Sparkles size={18} className="text-accent" />
        </div>
        <div className="advisory-text">
          <h4 className="advisory-heading">Contextual Weather Impact</h4>
          <p className="advisory-desc">{primaryMessage}</p>
        </div>
      </div>

      {/* Domain-specific considerations table/list */}
      <div className="considerations-section">
        <h4 className="section-title-sm">Operational Considerations:</h4>
        <div className="considerations-list">
          {considerations.map((item, idx) => {
            let badgeIcon = <CheckCircle2 size={14} />;
            let badgeClass = 'status-badge-success';

            if (item.type === 'warning') {
              badgeIcon = <AlertTriangle size={14} />;
              badgeClass = 'status-badge-warning';
            } else if (item.type === 'danger') {
              badgeIcon = <AlertOctagon size={14} />;
              badgeClass = 'status-badge-danger';
            } else if (item.type === 'info') {
              badgeIcon = <Info size={14} />;
              badgeClass = 'status-badge-info';
            }

            return (
              <div key={idx} className="consideration-item">
                <div className="consideration-top">
                  <span className="consideration-label">{item.label}</span>
                  <span className={`status-badge ${badgeClass}`}>
                    {badgeIcon}
                    {item.status}
                  </span>
                </div>
                <p className="consideration-desc">{item.description}</p>
                {item.weatherFactor && (
                  <div className="consideration-factor" style={{ marginTop: '0.45rem', display: 'flex' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--accent-cyan)',
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.22)',
                        padding: '0.15rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      Weather Trigger: <strong style={{ color: 'var(--text-primary)' }}>{item.weatherFactor}</strong>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Specific metrics grid for this mode */}
      <div className="impact-metrics-grid">
        {metrics.map((m, idx) => (
          <div key={idx} className="impact-metric-pill">
            <span className="pill-label">{m.label}</span>
            <span className="pill-value">{m.value}</span>
            <span className="pill-detail">{m.detail}</span>
          </div>
        ))}
      </div>

      {/* Medical / Non-clinical Disclaimer for Health Mode & General notices */}
      {disclaimer && (
        <div className={`impact-disclaimer-box ${activeMode === 'health' ? 'health-notice' : ''}`}>
          <ShieldAlert size={15} className="disclaimer-icon" />
          <span>{disclaimer}</span>
        </div>
      )}
    </div>
  );
}
