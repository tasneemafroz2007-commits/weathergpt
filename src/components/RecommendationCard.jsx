import React, { useState } from 'react';
import { CheckSquare, Square, ListChecks, Sparkles } from 'lucide-react';

const MODE_CHECKLISTS = {
  farmer: [
    { id: 'f1', text: 'Check drainage channels and low-lying field beds for standing water' },
    { id: 'f2', text: 'Secure polytunnel plastic sheets and loose shade netting against wind gusts' },
    { id: 'f3', text: 'Hold agrochemical and pesticide applications until wind drops below 15 km/h' },
    { id: 'f4', text: 'Prioritize grain / harvest storage in elevated, dry-pad sheds' }
  ],
  traveller: [
    { id: 't1', text: 'Pack compact waterproof umbrella and water-resistant footwear' },
    { id: 't2', text: 'Add 20–30 minutes buffer for evening airport / rail transit' },
    { id: 't3', text: 'Check real-time highway waterlogging reports before evening departure' },
    { id: 't4', text: 'Store electronics in dry-bags or waterproof backpack compartments' }
  ],
  outdoor: [
    { id: 'o1', text: 'Target morning training window (8:00 AM – 11:30 AM) before afternoon rain' },
    { id: 'o2', text: 'Wear high-traction trail footwear suitable for damp asphalt/mud' },
    { id: 'o3', text: 'Carry water-repellent shell jacket in daypack' },
    { id: 'o4', text: 'Identify quick-shelter points if cycling or hiking open routes' }
  ],
  health: [
    { id: 'h1', text: 'Maintain consistent daily hydration (2.5L–3.0L) under current humidity levels' },
    { id: 'h2', text: 'Wear UV-blocking sunglasses and broad-spectrum sunscreen if outdoors midday' },
    { id: 'h3', text: 'Keep indoor ventilation active during cooler morning hours' },
    { id: 'h4', text: 'General awareness: pace intense physical exertion during humid intervals' }
  ]
};

export function RecommendationCard({ activeMode }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklist = MODE_CHECKLISTS[activeMode] || MODE_CHECKLISTS.farmer;

  return (
    <div className="card recommendation-card">
      <div className="card-header-flex">
        <div className="card-title-group">
          <ListChecks size={18} className="text-accent" />
          <h4 className="card-heading">Actionable Readiness Checklist</h4>
        </div>
        <span className="checklist-sub">Interactive planner</span>
      </div>

      <p className="recommendation-intro">
        Suggested preparations based on today's consensus forecast:
      </p>

      <div className="checklist-items">
        {checklist.map((item) => {
          const isChecked = !!checkedItems[item.id];
          return (
            <div
              key={item.id}
              className={`checklist-item ${isChecked ? 'item-checked' : ''}`}
              onClick={() => toggleCheck(item.id)}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleCheck(item.id);
                }
              }}
            >
              <div className="checkbox-icon">
                {isChecked ? (
                  <CheckSquare size={17} className="text-emerald" />
                ) : (
                  <Square size={17} className="text-slate" />
                )}
              </div>
              <span className="checklist-text">{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
