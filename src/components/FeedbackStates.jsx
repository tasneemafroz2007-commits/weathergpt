import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export function SkeletonLoader() {
  return (
    <div className="skeleton-container" aria-label="Loading weather intelligence data">
      <div className="skeleton-grid-top">
        <div className="skeleton-card skeleton-weather"></div>
        <div className="skeleton-card skeleton-confidence"></div>
      </div>
      <div className="skeleton-card skeleton-modes"></div>
      <div className="skeleton-grid-sources">
        <div className="skeleton-card skeleton-source"></div>
        <div className="skeleton-card skeleton-source"></div>
        <div className="skeleton-card skeleton-source"></div>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="card feedback-state-card error-state">
      <div className="state-icon-circle error">
        <AlertCircle size={32} />
      </div>
      <h3 className="state-title">Data Ingestion Failed</h3>
      <p className="state-description">
        {error || 'An error occurred while communicating with the meteorological ensemble models.'}
      </p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        <RefreshCw size={15} />
        <span>Retry Connection</span>
      </button>
    </div>
  );
}

export function EmptyState({ onReset }) {
  return (
    <div className="card feedback-state-card empty-state">
      <div className="state-icon-circle empty">
        <Inbox size={32} />
      </div>
      <h3 className="state-title">No Weather Sources Synced</h3>
      <p className="state-description">
        No active weather prediction streams are configured for this coordinate cluster.
      </p>
      <button type="button" className="btn btn-secondary" onClick={onReset}>
        <span>Load Demo Scenario</span>
      </button>
    </div>
  );
}
