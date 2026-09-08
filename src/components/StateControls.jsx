import React from 'react';
import { Sliders, RefreshCw, AlertCircle, Inbox, CheckCircle, Radio } from 'lucide-react';

export function StateControls({
  isLiveMode,
  onToggleLiveMode,
  currentScenario,
  onScenarioChange,
  currentState,
  onStateChange,
  onRefresh,
  isLoading
}) {
  return (
    <div className="state-controls-panel">
      <div className="controls-row">
        {/* Left: Mode Selection (Live vs Demo) */}
        <div className="controls-group">
          <div className="controls-label">
            <Radio size={14} className={isLiveMode ? 'text-emerald' : ''} />
            <span>Data Mode:</span>
          </div>

          <div className="scenario-buttons">
            {/* Live Weather Button */}
            <button
              type="button"
              className={`scenario-btn ${isLiveMode ? 'active high live-active-btn' : ''}`}
              onClick={() => onToggleLiveMode(true)}
              title="Query real-time meteorological observations from Open-Meteo API"
            >
              <span className={`btn-indicator ${isLiveMode ? 'high live-pulse' : ''}`}></span>
              Live Weather (Open-Meteo)
            </button>

            {/* Separator */}
            <span style={{ color: 'var(--border-subtle)', padding: '0 0.2rem' }}>|</span>

            <span className="controls-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Sliders size={12} />
              <span>Demo Consensus:</span>
            </span>

            {/* Demo Scenario Buttons */}
            <button
              type="button"
              className={`scenario-btn ${!isLiveMode && currentScenario === 'HIGH_AGREEMENT' ? 'active high' : ''}`}
              onClick={() => {
                onToggleLiveMode(false);
                onScenarioChange('HIGH_AGREEMENT');
              }}
              title="Test 3 models in tight agreement (High Confidence)"
            >
              <span className="btn-indicator high"></span>
              High Agreement
            </button>
            <button
              type="button"
              className={`scenario-btn ${!isLiveMode && currentScenario === 'MODERATE_AGREEMENT' ? 'active med' : ''}`}
              onClick={() => {
                onToggleLiveMode(false);
                onScenarioChange('MODERATE_AGREEMENT');
              }}
              title="Test 3 models with moderate divergence (Medium Confidence)"
            >
              <span className="btn-indicator med"></span>
              Moderate Agreement
            </button>
            <button
              type="button"
              className={`scenario-btn ${!isLiveMode && currentScenario === 'LOW_AGREEMENT' ? 'active low' : ''}`}
              onClick={() => {
                onToggleLiveMode(false);
                onScenarioChange('LOW_AGREEMENT');
              }}
              title="Test 3 conflicting models (Low Confidence)"
            >
              <span className="btn-indicator low"></span>
              Divergent Models
            </button>
          </div>
        </div>

        {/* Right: UI Resilience State Toggles */}
        <div className="controls-group demo-states">
          <div className="controls-label">
            <span>UI State:</span>
          </div>
          <div className="state-buttons">
            <button
              type="button"
              className={`state-toggle-btn ${currentState === 'normal' ? 'active' : ''}`}
              onClick={() => onStateChange('normal')}
              title="Standard operational view"
            >
              <CheckCircle size={13} />
              Normal
            </button>
            <button
              type="button"
              className={`state-toggle-btn ${currentState === 'loading' ? 'active' : ''}`}
              onClick={() => onStateChange('loading')}
              title="Test skeleton / loading state"
            >
              <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
              Loading
            </button>
            <button
              type="button"
              className={`state-toggle-btn ${currentState === 'error' ? 'active' : ''}`}
              onClick={() => onStateChange('error')}
              title="Test error boundary state"
            >
              <AlertCircle size={13} />
              Error
            </button>
            <button
              type="button"
              className={`state-toggle-btn ${currentState === 'empty' ? 'active' : ''}`}
              onClick={() => onStateChange('empty')}
              title="Test empty data state"
            >
              <Inbox size={13} />
              Empty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
