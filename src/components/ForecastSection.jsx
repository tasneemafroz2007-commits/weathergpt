import React, { useState } from 'react';
import { Calendar, Clock, Umbrella, Wind, Sun, Sunrise, Sunset, Eye, Compass, Gauge } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

export function ForecastSection({ hourly = [], dailyForecast = [] }) {
  const [activeSubTab, setActiveSubTab] = useState('hourly'); // 'hourly' | 'daily'

  return (
    <section className="forecast-section-card" aria-label="Detailed Weather Forecast">
      <div className="forecast-header-bar">
        <div className="forecast-title-wrap">
          <h3 className="section-heading">Detailed Weather Outlook</h3>
          <span className="section-subtitle">Real-time Open-Meteo hourly projections & 7-day trajectory</span>
        </div>

        <div className="forecast-tab-pills" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'hourly'}
            className={`forecast-pill ${activeSubTab === 'hourly' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('hourly')}
          >
            <Clock size={15} />
            <span>24-Hour Hourly</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'daily'}
            className={`forecast-pill ${activeSubTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('daily')}
          >
            <Calendar size={15} />
            <span>7-Day Extended</span>
          </button>
        </div>
      </div>

      {/* 24-Hour Hourly Forecast Scroll */}
      {activeSubTab === 'hourly' && (
        <div className="hourly-scroll-container">
          <div className="hourly-items-wrapper">
            {hourly.map((node, idx) => (
              <div key={idx} className={`hourly-card ${idx === 0 ? 'current-hour' : ''}`}>
                <span className="hourly-time">{idx === 0 ? 'Now' : node.time}</span>
                <div className="hourly-icon-wrap">
                  <WeatherIcon code={node.icon} size={28} />
                </div>
                <span className="hourly-temp">{node.temp}°C</span>

                <div className="hourly-meta-pill" title="Precipitation Probability">
                  <Umbrella size={12} className="meta-icon rain-icon" />
                  <span>{node.rain}%</span>
                </div>

                <div className="hourly-meta-pill" title="Wind Velocity">
                  <Wind size={12} className="meta-icon wind-icon" />
                  <span>{node.wind} <small>km/h</small></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Extended Daily Forecast Grid */}
      {activeSubTab === 'daily' && (
        <div className="daily-forecast-grid">
          {dailyForecast.map((day, idx) => (
            <div key={idx} className={`daily-card ${idx === 0 ? 'today-card' : ''}`}>
              <div className="daily-day-header">
                <span className="daily-day-name">{day.day}</span>
                <span className="daily-date">{day.date}</span>
              </div>

              <div className="daily-icon-block">
                <WeatherIcon code={day.weatherCode} size={34} />
                <span className="daily-condition-text">{day.condition}</span>
              </div>

              <div className="daily-temp-bar-wrap">
                <span className="temp-low">{day.tempMin}°</span>
                <div className="temp-bar-bg">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: '20%',
                      width: '60%'
                    }}
                  ></div>
                </div>
                <span className="temp-high">{day.tempMax}°C</span>
              </div>

              <div className="daily-metrics-row">
                <div className="daily-metric" title="Rain probability">
                  <Umbrella size={13} className="text-info" />
                  <span>{day.rainProb}%</span>
                </div>

                <div className="daily-metric" title="Max Wind Speed">
                  <Wind size={13} className="text-secondary" />
                  <span>{day.windMax} km/h</span>
                </div>

                {day.sunrise && day.sunset && (
                  <div className="daily-metric sun-times" title={`Sunrise: ${day.sunrise} | Sunset: ${day.sunset}`}>
                    <Sun size={13} className="text-warning" />
                    <span>{day.sunrise}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
