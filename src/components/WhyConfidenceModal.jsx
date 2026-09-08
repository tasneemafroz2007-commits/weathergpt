import React from 'react';
import { X, Info, CheckCircle2, AlertTriangle, AlertCircle, Calculator, Radio } from 'lucide-react';
import { getConfidenceExplanationDetails } from '../utils/confidence';

export function WhyConfidenceModal({
  isOpen,
  onClose,
  sources = [],
  isLiveMode = false
}) {
  if (!isOpen) return null;

  const isSingleSource = isLiveMode || sources.length <= 1;
  const details = !isSingleSource ? getConfidenceExplanationDetails(sources) : null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog why-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Calculator size={20} className="text-accent" />
          </div>
          <div className="modal-header-text">
            <h3 className="modal-title">
              {isSingleSource ? 'Live Single-Source Verification' : 'Why This Confidence Score?'}
            </h3>
            <span className="modal-subtitle">
              {isSingleSource
                ? 'Open-Meteo real-time single stream active'
                : `Mathematical derivation of the ${details?.score}% Source Agreement (${details?.level}) index`}
            </span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* SINGLE SOURCE LIVE VIEW */}
          {isSingleSource ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="why-summary-card">
                <div className="why-score-pill-row">
                  <span className="confidence-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <Radio size={14} className="pulse" />
                    LIVE FEED ACTIVE
                  </span>
                  <span className="formula-tag">
                    Source: Open-Meteo REST API (Real-Time)
                  </span>
                </div>

                <p className="why-summary-text">
                  You are currently viewing live real-world weather data streamed directly from the Open-Meteo forecast service.
                </p>

                <div style={{ background: 'var(--bg-card-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    Why is there no multi-source confidence percentage?
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Multi-source confidence represents <strong>cross-model consensus</strong> (e.g. comparing GFS, ECMWF, and Radar AI against each other). Because live weather mode currently streams a single verified weather feed, computing a multi-source agreement spread is mathematically inapplicable.
                  </p>
                </div>
              </div>

              <div className="methodology-note">
                <div className="methodology-icon">
                  <Info size={16} />
                </div>
                <div className="methodology-content">
                  <strong>Multi-Source Consensus Testing</strong>
                  <p>
                    To explore multi-source variance analysis, standard deviations, and agreement scores, switch to <strong>Demo Scenarios</strong> in the top control bar.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* MULTI-SOURCE DEMO SCENARIO VIEW */
            details && (
              <>
                {/* Agreement Formula Breakdown */}
                <div className="why-summary-card">
                  <div className="why-score-pill-row">
                    <span className={`confidence-pill ${details.level.toLowerCase()}`}>
                      {details.level === 'HIGH' && <CheckCircle2 size={14} />}
                      {details.level === 'MEDIUM' && <AlertTriangle size={14} />}
                      {details.level === 'LOW' && <AlertCircle size={14} />}
                      {details.level} AGREEMENT
                    </span>
                    <span className="formula-tag">
                      Weighted Formula: Rain (45%) + Temp (30%) + Wind (25%)
                    </span>
                  </div>

                  <p className="why-summary-text">
                    The confidence engine analyzes variance across all {sources.length} independent numerical weather models. A high score means all sources project tight convergence; a lower score indicates divergent forecasting tracks.
                  </p>

                  <div className="sub-scores-grid">
                    <div className="sub-score-card">
                      <span className="sub-score-title">Rain Agreement (45%)</span>
                      <span className="sub-score-value font-highlight">{details.metricScores.rain}%</span>
                      <span className="sub-score-spread">Spread: {details.comparison.rainProbability.spread}%</span>
                    </div>
                    <div className="sub-score-card">
                      <span className="sub-score-title">Temp Agreement (30%)</span>
                      <span className="sub-score-value">{details.metricScores.temperature}%</span>
                      <span className="sub-score-spread">Delta: ±{details.comparison.temperature.spread}°C</span>
                    </div>
                    <div className="sub-score-card">
                      <span className="sub-score-title">Wind Agreement (25%)</span>
                      <span className="sub-score-value">{details.metricScores.wind}%</span>
                      <span className="sub-score-spread">Delta: ±{details.comparison.windSpeed.spread} km/h</span>
                    </div>
                  </div>
                </div>

                {/* Metric By Metric Points */}
                <div className="why-points-section">
                  <h4 className="section-title-sm">Detailed Parameter Spread:</h4>
                  <div className="why-points-list">
                    {details.points.map((pt, idx) => (
                      <div key={idx} className="why-point-row">
                        <div className="point-header">
                          <span className="point-metric-name">{pt.metric}</span>
                          <span className={`point-status-badge ${pt.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {pt.status}
                          </span>
                        </div>
                        <p className="point-detail">{pt.detail}</p>
                        <p className="point-impact">
                          <strong>Interpretation:</strong> {pt.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Methodology Notice */}
                <div className="methodology-note">
                  <div className="methodology-icon">
                    <Info size={16} />
                  </div>
                  <div className="methodology-content">
                    <strong>Multi-Model Ensemble Methodology</strong>
                    <p>{details.scientificMethodologyNotice}</p>
                  </div>
                </div>

                {/* Explicit Disclaimer */}
                <div className="formal-disclaimer">
                  <AlertTriangle size={15} className="text-amber" />
                  <span>{details.disclaimer}</span>
                </div>
              </>
            )
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
