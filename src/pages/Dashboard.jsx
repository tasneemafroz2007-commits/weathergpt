import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { StateControls } from '../components/StateControls';
import { WeatherCard } from '../components/WeatherCard';
import { ConfidenceCard } from '../components/ConfidenceCard';
import { SourceCard } from '../components/SourceCard';
import { WhyConfidenceModal } from '../components/WhyConfidenceModal';
import { ImpactModeSelector } from '../components/ImpactModeSelector';
import { ImpactInsightsCard } from '../components/ImpactInsightsCard';
import { AlertCard } from '../components/AlertCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { WeatherChart } from '../components/WeatherChart';
import { SkeletonLoader, ErrorState, EmptyState } from '../components/FeedbackStates';

import { getWeatherData } from '../services/weatherService';
import { generateImpactInsights } from '../utils/impactModes';

export function Dashboard() {
  const [selectedLocation, setSelectedLocation] = useState('bengaluru');
  const [selectedScenario, setSelectedScenario] = useState('HIGH_AGREEMENT');
  const [isLiveMode, setIsLiveMode] = useState(true); // Default to real-time Open-Meteo feed
  const [activeMode, setActiveMode] = useState('farmer');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // UI test states: 'normal' | 'loading' | 'error' | 'empty'
  const [uiState, setUiState] = useState('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal control
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);

  // Fetch weather data from either Live Open-Meteo or Demo Scenarios
  const fetchData = useCallback(async (location, scenario, liveMode) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getWeatherData(location, scenario, liveMode);
      setWeatherData(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch weather telemetry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedLocation, selectedScenario, isLiveMode);
  }, [selectedLocation, selectedScenario, isLiveMode, fetchData]);

  const handleLocationChange = (locId) => {
    setSelectedLocation(locId);
    setUiState('normal');
  };

  const handleScenarioChange = (scenId) => {
    setSelectedScenario(scenId);
    setIsLiveMode(false); // Switching to a demo scenario leaves live mode
    setUiState('normal');
  };

  const handleStateChange = (stateName) => {
    setUiState(stateName);
  };

  const handleRetry = () => {
    setUiState('normal');
    fetchData(selectedLocation, selectedScenario, isLiveMode);
  };

  // Dynamically evaluate rule-based insights for the currently selected mode using the active weather truth
  const currentInsights = weatherData ? generateImpactInsights(activeMode, weatherData) : null;

  return (
    <div className="weather-dashboard-layout">
      {/* Top Application Header */}
      <Header
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        activeMode={activeMode}
        lastUpdated={weatherData?.updatedAt}
        isLiveMode={isLiveMode}
      />

      {/* Mode Controls Bar: Distinct switch between Live Open-Meteo & Demo Scenarios */}
      <StateControls
        isLiveMode={isLiveMode}
        onToggleLiveMode={(val) => {
          setIsLiveMode(val);
          setUiState('normal');
        }}
        currentScenario={selectedScenario}
        onScenarioChange={handleScenarioChange}
        currentState={uiState}
        onStateChange={handleStateChange}
        onRefresh={() => fetchData(selectedLocation, selectedScenario, isLiveMode)}
        isLoading={isLoading}
      />

      {/* Navigation Sub-header */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={weatherData?.alerts?.length || 0}
      />

      {/* Main Content Area */}
      <main className="dashboard-content" id="main-content">
        {/* State 1: Simulated / Real Loading */}
        {(isLoading || uiState === 'loading') && <SkeletonLoader />}

        {/* State 2: Error State */}
        {uiState === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <ErrorState
              error={errorMessage || 'Failed to retrieve meteorological data.'}
              onRetry={handleRetry}
            />
            {isLiveMode && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsLiveMode(false);
                  setUiState('normal');
                }}
              >
                Switch to Demo Scenarios
              </button>
            )}
          </div>
        )}

        {/* State 3: Empty State */}
        {uiState === 'empty' && (
          <EmptyState onReset={handleRetry} />
        )}

        {/* State 4: Normal Operational View */}
        {uiState === 'normal' && !isLoading && weatherData && (
          <>
            {/* Active Weather Warnings Banner */}
            <AlertCard alerts={weatherData.alerts} />

            {/* TAB 1: OVERVIEW DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="tab-view-dashboard">
                {/* Top Row: Weather Consensus Card + Confidence Agreement Card */}
                <div className="dashboard-hero-row">
                  <div className="hero-col-primary">
                    <WeatherCard
                      consensus={weatherData.consensus}
                      locationName={weatherData.locationName}
                      updatedAt={weatherData.updatedAt}
                      sourceCount={weatherData.sources.length}
                    />
                  </div>
                  <div className="hero-col-secondary">
                    <ConfidenceCard
                      confidence={weatherData.confidence}
                      onOpenWhyModal={() => setIsWhyModalOpen(true)}
                      onSwitchToDemo={() => setIsLiveMode(false)}
                    />
                  </div>
                </div>

                {/* Middle Row: Impact Mode Selector & Dynamic Insights */}
                <section className="dashboard-impact-section" aria-label="Weather Impact Intelligence">
                  <div className="section-header-bar">
                    <div className="section-title-wrap">
                      <span className="section-step-num">Step 2</span>
                      <h2 className="section-heading">Weather Impact Modes</h2>
                    </div>
                    <span className="section-hint">
                      {isLiveMode
                        ? 'Interpreting real-time Open-Meteo telemetry across 4 personas'
                        : 'Select a persona to re-interpret identical consensus data'}
                    </span>
                  </div>

                  <ImpactModeSelector
                    activeMode={activeMode}
                    onModeSelect={setActiveMode}
                  />

                  <div className="impact-display-grid">
                    <div className="impact-col-insights">
                      <ImpactInsightsCard
                        insights={currentInsights}
                        activeMode={activeMode}
                        consensus={weatherData.consensus}
                      />
                    </div>
                    <div className="impact-col-checklist">
                      <RecommendationCard activeMode={activeMode} />
                    </div>
                  </div>
                </section>

                {/* Bottom Row: Multi-Source Evidence Preview */}
                <section className="dashboard-evidence-section" aria-label="Multi-Source Evidence Preview">
                  <div className="section-header-bar">
                    <div className="section-title-wrap">
                      <span className="section-step-num">Step 1</span>
                      <h2 className="section-heading">
                        {isLiveMode ? 'Active Weather Ingestion Stream' : 'Multi-Source Evidence Breakdown'}
                      </h2>
                    </div>
                    <span className="section-hint">
                      {isLiveMode
                        ? 'Real-time telemetry from Open-Meteo REST API'
                        : `Comparison of ${weatherData.sources.length} independent forecast models`}
                    </span>
                  </div>

                  <div className="sources-card-grid">
                    {weatherData.sources.map((src, idx) => (
                      <SourceCard
                        key={src.id}
                        source={src}
                        consensus={weatherData.consensus}
                        comparison={weatherData.comparison}
                        index={idx}
                      />
                    ))}
                  </div>
                </section>

                {/* Comparison Chart */}
                <WeatherChart
                  sources={weatherData.sources}
                  consensus={weatherData.consensus}
                  hourly={weatherData.hourly}
                />
              </div>
            )}

            {/* TAB 2: EVIDENCE & CONFIDENCE ENGINE */}
            {activeTab === 'evidence' && (
              <div className="tab-view-evidence">
                <div className="evidence-hero">
                  <ConfidenceCard
                    confidence={weatherData.confidence}
                    onOpenWhyModal={() => setIsWhyModalOpen(true)}
                    onSwitchToDemo={() => setIsLiveMode(false)}
                  />
                </div>

                <div className="evidence-grid-header">
                  <h3 className="section-heading">
                    {isLiveMode ? 'Connected Real-Time Data Stream' : 'Queried Forecasting Models'}
                  </h3>
                  <p className="section-desc">
                    {isLiveMode
                      ? 'Displaying real-time observations from Open-Meteo. Switch to Demo Scenarios to view cross-model multi-source variance.'
                      : 'Each model calculates atmospheric trajectories independently. Disparities highlight regional turbulence or uncertainty.'}
                  </p>
                </div>

                <div className="sources-card-grid">
                  {weatherData.sources.map((src, idx) => (
                    <SourceCard
                      key={src.id}
                      source={src}
                      consensus={weatherData.consensus}
                      comparison={weatherData.comparison}
                      index={idx}
                    />
                  ))}
                </div>

                {/* Model Variance Details Card (Only meaningful for multi-source demo runs) */}
                {!isLiveMode && weatherData.comparison && (
                  <div className="card variance-details-card">
                    <h4 className="card-heading">Telemetry Variance Breakdown</h4>
                    <div className="variance-table-wrap">
                      <table className="variance-table">
                        <thead>
                          <tr>
                            <th>Metric</th>
                            <th>Model Spread (Min - Max)</th>
                            <th>Standard Deviation</th>
                            <th>Agreement Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Rainfall Probability</strong></td>
                            <td>{weatherData.comparison.rainProbability.min}% — {weatherData.comparison.rainProbability.max}% (Spread: {weatherData.comparison.rainProbability.spread}%)</td>
                            <td>±{weatherData.comparison.rainProbability.stdDev}%</td>
                            <td>
                              <span className={`status-badge ${weatherData.comparison.rainProbability.spread <= 10 ? 'status-badge-success' : weatherData.comparison.rainProbability.spread <= 25 ? 'status-badge-warning' : 'status-badge-danger'}`}>
                                {weatherData.comparison.rainProbability.spread <= 10 ? 'Strong Consensus' : weatherData.comparison.rainProbability.spread <= 25 ? 'Moderate' : 'Divergent'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Temperature (°C)</strong></td>
                            <td>{weatherData.comparison.temperature.min}°C — {weatherData.comparison.temperature.max}°C (Delta: {weatherData.comparison.temperature.spread}°C)</td>
                            <td>±{weatherData.comparison.temperature.stdDev}°C</td>
                            <td>
                              <span className={`status-badge ${weatherData.comparison.temperature.spread <= 1.5 ? 'status-badge-success' : 'status-badge-warning'}`}>
                                {weatherData.comparison.temperature.spread <= 1.5 ? 'High Alignment' : 'Moderate Delta'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Wind Speed</strong></td>
                            <td>{weatherData.comparison.windSpeed.min} — {weatherData.comparison.windSpeed.max} km/h (Spread: {weatherData.comparison.windSpeed.spread} km/h)</td>
                            <td>±{weatherData.comparison.windSpeed.stdDev} km/h</td>
                            <td>
                              <span className={`status-badge ${weatherData.comparison.windSpeed.spread <= 5 ? 'status-badge-success' : 'status-badge-warning'}`}>
                                {weatherData.comparison.windSpeed.spread <= 5 ? 'High Alignment' : 'Variable Gusts'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: IMPACT MODES */}
            {activeTab === 'impact' && (
              <div className="tab-view-impact">
                <ImpactModeSelector
                  activeMode={activeMode}
                  onModeSelect={setActiveMode}
                />

                <div className="impact-display-grid">
                  <div className="impact-col-insights">
                    <ImpactInsightsCard
                      insights={currentInsights}
                      activeMode={activeMode}
                      consensus={weatherData.consensus}
                    />
                  </div>
                  <div className="impact-col-checklist">
                    <RecommendationCard activeMode={activeMode} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CHARTS & COMPARISON */}
            {activeTab === 'charts' && (
              <div className="tab-view-charts">
                <WeatherChart
                  sources={weatherData.sources}
                  consensus={weatherData.consensus}
                  hourly={weatherData.hourly}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Why This Confidence? Modal */}
      <WhyConfidenceModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        sources={weatherData?.sources || []}
        isLiveMode={isLiveMode}
      />
    </div>
  );
}
