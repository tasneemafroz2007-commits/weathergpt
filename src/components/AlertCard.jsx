import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ShieldCheck, CheckCircle } from 'lucide-react';

export function AlertCard({ alerts = [] }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="card alert-card-clean">
        <div className="alert-clean-content">
          <CheckCircle size={18} className="text-emerald" />
          <div className="alert-clean-text">
            <span className="clean-title">No Severe Weather Warnings Active</span>
            <span className="clean-sub">All queried models project conditions within nominal seasonal limits.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-container">
      {alerts.map((alert) => {
        const isWarning = alert.severity === 'warning';
        const isCaution = alert.severity === 'caution';

        return (
          <div
            key={alert.id}
            className={`card alert-card ${isWarning ? 'alert-warning' : isCaution ? 'alert-caution' : 'alert-advisory'}`}
          >
            <div className="alert-header">
              <div className="alert-icon-title">
                {isWarning ? (
                  <AlertOctagon size={20} className="alert-icon text-rose" />
                ) : (
                  <AlertTriangle size={20} className="alert-icon text-amber" />
                )}
                <div className="alert-title-wrap">
                  <span className="alert-severity-badge">
                    {alert.severity.toUpperCase()}
                  </span>
                  <h4 className="alert-heading">{alert.title}</h4>
                </div>
              </div>
            </div>

            <p className="alert-body">{alert.description}</p>

            {alert.sourceAgreementNotice && (
              <div className="alert-agreement-foot">
                <Info size={13} />
                <span>
                  <strong>Source Consensus:</strong> {alert.sourceAgreementNotice}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
