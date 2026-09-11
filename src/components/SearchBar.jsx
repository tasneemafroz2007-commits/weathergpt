import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, X, Navigation, MapPin, History, AlertCircle } from 'lucide-react';
import {
  searchLocations,
  reverseGeocode,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches
} from '../services/geocodingService';

export function SearchBar({ onSelectLocation, onUseCurrentLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLocating, setIsLocating] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Load recent search history on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search logic
  const handleSearch = useCallback((searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsLoading(false);
      setErrorMsg(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await searchLocations(searchTerm);
        setResults(res);
        setSelectedIndex(-1);
        if (res.length === 0) {
          setErrorMsg(`No locations found matching "${searchTerm}". Try checking for spelling errors.`);
        }
      } catch (err) {
        setErrorMsg('Network error while searching locations. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    handleSearch(value);
  };

  const handleSelect = (locationObj) => {
    setQuery('');
    setIsOpen(false);
    saveRecentSearch(locationObj);
    setRecentSearches(getRecentSearches());
    if (onSelectLocation) {
      onSelectLocation(locationObj);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setErrorMsg(null);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearHistory = (e) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setIsOpen(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const locObj = await reverseGeocode(lat, lon);
          saveRecentSearch(locObj);
          setRecentSearches(getRecentSearches());
          if (onUseCurrentLocation) {
            onUseCurrentLocation(locObj);
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
          alert('Could not determine city name from your coordinates.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can search for your location manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'The request to get your location timed out.';
        }
        alert(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    const totalItems = results.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < totalItems) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-input-icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search any city, town, village or country worldwide..."
          className="search-input"
          aria-label="Search location"
          autoComplete="off"
        />

        {isLoading && <Loader2 size={18} className="search-spinner animate-spin" />}

        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear-btn"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={handleUseMyLocation}
          className={`btn-use-location ${isLocating ? 'locating' : ''}`}
          title="Use my current browser location"
          disabled={isLocating}
        >
          {isLocating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Navigation size={15} className="location-nav-icon" />
          )}
          <span className="btn-location-text">
            {isLocating ? 'Locating...' : 'Use My Location'}
          </span>
        </button>
      </div>

      {/* Autocomplete & Recent Searches Dropdown */}
      {isOpen && (
        <div className="search-dropdown-menu">
          {/* State 1: Active query with results */}
          {query.trim() && results.length > 0 && (
            <div className="search-results-list" role="listbox">
              <div className="dropdown-section-title">Global Location Matches</div>
              {results.map((loc, idx) => (
                <div
                  key={loc.id || idx}
                  className={`search-result-item ${idx === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelect(loc)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  role="option"
                  aria-selected={idx === selectedIndex}
                >
                  <MapPin size={16} className="result-pin-icon" />
                  <div className="result-text-group">
                    <span className="result-main-name">{loc.name}</span>
                    <span className="result-sub-location">{loc.displayName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* State 2: Active query with no results / error */}
          {query.trim() && !isLoading && results.length === 0 && errorMsg && (
            <div className="search-no-results">
              <AlertCircle size={20} className="no-results-icon" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* State 3: Empty query (Shows Recent Searches + Quick Geolocation option) */}
          {!query.trim() && (
            <div className="recent-searches-block">
              <div
                className="search-result-item location-my-loc-item"
                onClick={handleUseMyLocation}
              >
                <Navigation size={16} className="result-nav-icon" />
                <div className="result-text-group">
                  <span className="result-main-name">Use Current Browser Location</span>
                  <span className="result-sub-location">Detect latitude & longitude automatically</span>
                </div>
              </div>

              {recentSearches.length > 0 && (
                <>
                  <div className="recent-header">
                    <span className="dropdown-section-title">
                      <History size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      className="btn-clear-history"
                      onClick={handleClearHistory}
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((item, idx) => (
                    <div
                      key={`recent-${item.id || idx}`}
                      className="search-result-item recent-item"
                      onClick={() => handleSelect(item)}
                    >
                      <MapPin size={16} className="recent-pin-icon" />
                      <div className="result-text-group">
                        <span className="result-main-name">{item.name}</span>
                        <span className="result-sub-location">{item.displayName}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
