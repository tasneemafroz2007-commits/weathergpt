import React from 'react';
import { LayoutDashboard, Layers, Sparkles, BarChart2 } from 'lucide-react';

export function Navigation({ activeTab, onTabChange, alertCount = 0 }) {
  const tabs = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'evidence', label: 'Evidence & Confidence', icon: Layers },
    { id: 'impact', label: 'Impact Modes', icon: Sparkles, badge: alertCount > 0 ? alertCount : null },
    { id: 'charts', label: 'Source Comparison', icon: BarChart2 }
  ];

  return (
    <nav className="sub-navigation" aria-label="Module Sections">
      <div className="nav-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} className="nav-icon" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="nav-badge" title="Active advisory">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
