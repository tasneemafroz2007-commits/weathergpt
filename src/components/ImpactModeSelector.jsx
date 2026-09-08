import React from 'react';
import { Wheat, Plane, Compass, HeartPulse } from 'lucide-react';
import { IMPACT_MODES } from '../utils/impactModes';

const MODE_ICONS = {
  farmer: Wheat,
  traveller: Plane,
  outdoor: Compass,
  health: HeartPulse
};

export function ImpactModeSelector({
  activeMode,
  onModeSelect
}) {
  return (
    <div className="impact-mode-selector-wrap">
      <div className="mode-selector-header">
        <span className="mode-selector-label">Weather Impact Lenses:</span>
        <span className="mode-selector-hint">Select a persona to contextualize identical consensus data</span>
      </div>

      <div className="mode-buttons-grid">
        {IMPACT_MODES.map((mode) => {
          const IconComponent = MODE_ICONS[mode.id] || Compass;
          const isActive = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              className={`mode-btn ${isActive ? 'active' : ''}`}
              style={{ '--accent-mode': mode.accentColor }}
              onClick={() => onModeSelect(mode.id)}
              aria-pressed={isActive}
            >
              <div className="mode-btn-icon-wrap">
                <IconComponent size={20} className="mode-btn-icon" />
              </div>
              <div className="mode-btn-text">
                <span className="mode-btn-title">{mode.name}</span>
                <span className="mode-btn-desc">{mode.shortDescription}</span>
              </div>
              {isActive && <div className="mode-active-glow"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
