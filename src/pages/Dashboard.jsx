import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { StateControls } from '../components/StateControls';
import { WeatherCard } from '../components/WeatherCard';
import { ForecastSection } from '../components/ForecastSection';
import { WeatherGPTAssistant } from '../components/WeatherGPTAssistant';
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
  // Selected location object: defaults to Bengaluru
  const [selectedLocationObj, setSelectedLocationObj] = useState({
    id: 'bengaluru',
    name: 'Bengaluru',
    displayName: 'Bengaluru, Karnataka, India',
    latitude: 12.9716,
    longitude: 77.5946,
    country: 'India'
  });

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

  // Fetch weather data for selected location object (live coordinates or demo scenario)
  const fetchData = useCallback(async (locObj, scenario, liveMode) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const customCoords = {
        lat: locObj.latitude,
        lon: locObj.longitude,
        displayName: locObj.displayName || locObj.name
      };
      const data = await getWeatherData(locObj.id || 'bengaluru', scenario, liveMode, customCoords);
      setWeatherData(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch weather telemetry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedLocationObj, selectedScenario, isLiveMode);
  }, [selectedLocationObj, selectedScenario, isLiveMode, fetchData]);

  // Handle location selected from SearchBar dropdown
  const handleSelectLocation = (locObj) => {
    setSelectedLocationObj(locObj);
    setIsLiveMode(true); // Searching for a location defaults to Live Weather
    setUiState('normal');
  };

  // Handle "Use My Location" browser geolocation
  const handleUseCurrentLocation = (locObj) => {
    setSelectedLocationObj(locObj);
    setIsLiveMode(true);
    setUiState('normal');
  };

  const handleScenarioChange = (scenId) => {
    setSelectedScenario(scenId);
    setIsLiveMode(false); // Switching to demo scenario disables live feed
    setUiState('normal');
  };

  const handleStateChange = (stateName) => {
    setUiState(stateName);
  };

  const handleRetry = () => {
    setUiState('normal');
    fetchData(selectedLocationObj, selectedScenario, isLiveMode);
  };

  // Dynamically evaluate rule-based insights for active mode
  const currentInsights = weatherData ? generateImpactInsights(activeMode, weatherData) : null;

  return (
    <div className="weather-dashboard-layout">
      {/* Top Application Header & Search Bar */}
      <Header
        onSelectLocation={handleSelectLocation}
        onUseCurrentLocation={handleUseCurrentLocation}
        lastUpdated={weatherData?.updatedAt}
        isLiveMode={isLiveMode}
      />

      {/* Mode Controls Bar: Live Open-Meteo & Demo Scenarios */}
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
        onRefresh={() => fetchData(selectedLocationObj, selectedScenario, isLiveMode)}
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
        {/* State 1: Loading Skeleton */}
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
                {/* Hero Row: Weather Consensus Card + Confidence Agreement Card */}
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

                {/* Forecast Section: 24-Hour & 7-Day */}
                <ForecastSection
                  hourly={weatherData.hourly}
                  dailyForecast={weatherData.dailyForecast}
                />

                {/* WeatherGPT Assistant Interactive Panel */}
                <WeatherGPTAssistant weatherData={weatherData} />

                {/* Impact Mode Selector & Dynamic Insights */}
                <section className="dashboard-impact-section" aria-label="Weather Impact Intelligence">
                  <div className="section-header-bar">
                    <div className="section-title-wrap">
                      <span className="section-step-num">Impact Engine</span>
                      <h2 className="section-heading">Weather Impact Modes</h2>
                    </div>
                    <span className="section-hint">
                      {isLiveMode
                        ? `Interpreting live weather in ${weatherData.locationName} across 4 personas`
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

                {/* Multi-Source Evidence Preview */}
                <section className="dashboard-evidence-section" aria-label="Multi-Source Evidence Preview">
                  <div className="section-header-bar">
                    <div className="section-title-wrap">
                      <span className="section-step-num">Multi-Source</span>
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

            {/* TAB 2: DETAILED FORECASTS */}
            {activeTab === 'forecasts' && (
              <div className="tab-view-forecasts">
                <ForecastSection
                  hourly={weatherData.hourly}
                  dailyForecast={weatherData.dailyForecast}
                />
              </div>
            )}

            {/* TAB 3: WEATHERGPT AI ASSISTANT */}
            {activeTab === 'assistant' && (
              <div className="tab-view-assistant">
                <WeatherGPTAssistant weatherData={weatherData} />
              </div>
            )}

            {/* TAB 4: EVIDENCE & CONFIDENCE ENGINE */}
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

                {/* Model Variance Breakdown */}
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

            {/* TAB 5: IMPACT MODES */}
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

            {/* TAB 6: CHARTS & COMPARISON */}
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
