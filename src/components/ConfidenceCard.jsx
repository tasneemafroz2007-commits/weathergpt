import React from 'react';
import { HelpCircle, CheckCircle2, AlertCircle, AlertTriangle, ChevronRight, Info, Radio } from 'lucide-react';

export function ConfidenceCard({
  confidence,
  onOpenWhyModal,
  onSwitchToDemo
}) {
  if (!confidence) return null;

  const { isLiveSingleSource, level, score, shortExplanation, comparison } = confidence;

  // --------------------------------------------------------------------------
  // LIVE SINGLE-SOURCE MODE (Requirements 8 & 9)
  // Do not fake multi-source consensus for a single Open-Meteo stream.
  // --------------------------------------------------------------------------
  if (isLiveSingleSource) {
    return (
      <div className="card confidence-card confidence-live" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
        <div className="confidence-header">
          <div className="confidence-title-group">
            <span className="confidence-overline">Live Weather Source Verification</span>
            <div className="confidence-badge-row">
              <span className="confidence-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <Radio size={14} className="pulse" />
                Live Feed (Open-Meteo)
              </span>
              <span className="agreement-sub-badge" style={{ color: 'var(--text-muted)' }}>
                Consensus Score: Paused (1 Source)
              </span>
            </div>
          </div>

          <button
            type="button"
            className="why-confidence-btn"
            onClick={onOpenWhyModal}
            title="See single-source explanation"
          >
            <HelpCircle size={14} />
            <span>Why no confidence score?</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="confidence-body">
          <div className="single-source-banner" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
              {shortExplanation}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.4 }}>
              Multi-source model agreement scoring requires <strong>2 or more independent weather models</strong>. Because live telemetry is currently streaming from a single provider (Open-Meteo), cross-model agreement calculation is intentionally paused.
            </p>
          </div>

          <div className="confidence-disclaimer" style={{ borderLeftColor: 'var(--accent-cyan)' }}>
            <Info size={14} className="disclaimer-icon text-cyan" />
            <span>
              <strong>Note:</strong> To view multi-source model consensus and variance scoring, click{' '}
              <button
                type="button"
                onClick={onSwitchToDemo}
                style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Demo Scenarios
              </button>{' '}
              above.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // DEMO SCENARIO MODE (Multi-source consensus active)
  // --------------------------------------------------------------------------
  const levelClass = (level || 'medium').toLowerCase();
  const rainSpread = comparison?.rainProbability?.spread ?? 0;
  const tempSpread = comparison?.temperature?.spread ?? 0;
  const windSpread = comparison?.windSpeed?.spread ?? 0;
  const rainStdDev = comparison?.rainProbability?.stdDev ?? 0;
  const tempStdDev = comparison?.temperature?.stdDev ?? 0;

  return (
    <div className={`card confidence-card confidence-${levelClass}`}>
      <div className="confidence-header">
        <div className="confidence-title-group">
          <span className="confidence-overline">Source Agreement & Consensus</span>
          <div className="confidence-badge-row">
            <span className={`confidence-pill ${levelClass}`}>
              {level === 'HIGH' && <CheckCircle2 size={15} />}
              {level === 'MEDIUM' && <AlertTriangle size={15} />}
              {level === 'LOW' && <AlertCircle size={15} />}
              Confidence: {level}
            </span>
            <span className="agreement-sub-badge">
              {score}% Agreement Index
            </span>
          </div>
        </div>

        <button
          type="button"
          className="why-confidence-btn"
          onClick={onOpenWhyModal}
          title="See detailed variance and mathematical derivation"
        >
          <HelpCircle size={14} />
          <span>Why this confidence?</span>
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="confidence-body">
        {/* Consensus progress bar */}
        <div className="agreement-bar-container">
          <div className="agreement-bar-labels">
            <span className="bar-label">Cross-Model Agreement</span>
            <span className="bar-value">{score}%</span>
          </div>
          <div className="agreement-track">
            <div
              className={`agreement-fill ${levelClass}`}
              style={{ width: `${Math.max(8, score)}%` }}
            ></div>
          </div>
          <div className="agreement-tiers">
            <span className={score < 50 ? 'tier-active' : ''}>Low (&lt;50%)</span>
            <span className={score >= 50 && score < 80 ? 'tier-active' : ''}>Moderate (50-79%)</span>
            <span className={score >= 80 ? 'tier-active' : ''}>High (80-100%)</span>
          </div>
        </div>

        {/* Dynamic explanation based on calculated variance */}
        <div className="confidence-explanation-box">
          <p className="confidence-primary-expl">{shortExplanation}</p>
          <div className="quick-deltas">
            <span className="delta-tag">
              Rain Spread: <strong>{rainSpread}%</strong> (σ: ±{rainStdDev}%)
            </span>
            <span className="delta-tag">
              Temp Spread: <strong>{tempSpread}°C</strong> (σ: ±{tempStdDev}°C)
            </span>
            <span className="delta-tag">
              Wind Spread: <strong>{windSpread} km/h</strong>
            </span>
          </div>
        </div>

        {/* Required Framing Notice */}
        <div className="confidence-disclaimer">
          <Info size={13} className="disclaimer-icon" />
          <span>
            <strong>Important:</strong> This score reflects <em>source agreement</em> among the 3 queried weather forecast models, not a scientifically validated certainty of atmospheric events.
          </span>
        </div>
      </div>
    </div>
  );
}
