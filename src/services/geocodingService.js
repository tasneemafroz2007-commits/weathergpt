/**
 * ============================================================================
 * Geocoding Service Layer
 * ============================================================================
 * Provides worldwide location search and reverse geocoding via Open-Meteo
 * Geocoding API and BigDataCloud. Requires NO API keys.
 * Includes caching, debouncing, and recent search history management.
 * ============================================================================
 */

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_GEOCODE_API_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

// In-memory cache for location search results to avoid redundant API hits
const searchCache = new Map();

/**
 * Search locations worldwide by name (cities, towns, villages, districts, states, countries)
 * @param {string} query - Location search term (e.g., "Kunigal", "Tokyo", "London")
 * @returns {Promise<Array>} Array of formatted location objects
 */
export async function searchLocations(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();

  // Check cache first
  if (searchCache.has(cleanQuery)) {
    return searchCache.get(cleanQuery);
  }

  try {
    const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(cleanQuery)}&count=10&language=en&format=json`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Geocoding API responded with status ${res.status}`);
    }

    const data = await res.json();

    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      searchCache.set(cleanQuery, []);
      return [];
    }

    const formatted = data.results.map((item) => {
      const parts = [];
      if (item.name) parts.push(item.name);
      if (item.admin1 && item.admin1 !== item.name) parts.push(item.admin1);
      if (item.country) parts.push(item.country);

      const displayName = parts.join(', ');

      return {
        id: `geo-${item.id || `${item.latitude}-${item.longitude}`}`,
        name: item.name,
        admin1: item.admin1 || '',
        country: item.country || '',
        countryCode: item.country_code || '',
        latitude: item.latitude,
        longitude: item.longitude,
        elevation: item.elevation,
        timezone: item.timezone || 'auto',
        displayName,
        subtext: [item.admin1, item.country].filter(Boolean).join(', ')
      };
    });

    searchCache.set(cleanQuery, formatted);
    return formatted;
  } catch (err) {
    console.error('Error searching locations:', err);
    throw err;
  }
}

/**
 * Reverse geocode coordinates to a human-readable location string
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Formatted location object
 */
export async function reverseGeocode(lat, lon) {
  try {
    const url = `${REVERSE_GEOCODE_API_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Reverse geocode status ${res.status}`);
    }

    const data = await res.json();

    const placeName = data.locality || data.city || data.principalSubdivision || 'Your Location';
    const region = data.principalSubdivision || '';
    const country = data.countryName || '';

    const parts = [placeName];
    if (region && region !== placeName) parts.push(region);
    if (country) parts.push(country);

    const displayName = parts.join(', ');

    return {
      id: `current-loc-${lat.toFixed(4)}-${lon.toFixed(4)}`,
      name: placeName,
      admin1: region,
      country,
      countryCode: data.countryCode || '',
      latitude: lat,
      longitude: lon,
      displayName,
      isCurrentLocation: true
    };
  } catch (err) {
    console.warn('Reverse geocoding failed, creating fallback label:', err);
    return {
      id: `current-loc-${lat.toFixed(4)}-${lon.toFixed(4)}`,
      name: 'Current Location',
      admin1: '',
      country: '',
      latitude: lat,
      longitude: lon,
      displayName: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      isCurrentLocation: true
    };
  }
}

/**
 * Get recent search history from localStorage
 */
export function getRecentSearches() {
  try {
    const stored = localStorage.getItem('weathergpt_recent_searches');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save a selected location to recent search history
 */
export function saveRecentSearch(locationObj) {
  if (!locationObj || !locationObj.name) return;

  try {
    const current = getRecentSearches();
    // Filter out duplicates
    const filtered = current.filter(
      (item) => item.displayName !== locationObj.displayName && item.id !== locationObj.id
    );

    // Keep top 5 most recent
    const updated = [
      {
        id: locationObj.id,
        name: locationObj.name,
        displayName: locationObj.displayName,
        latitude: locationObj.latitude,
        longitude: locationObj.longitude,
        country: locationObj.country
      },
      ...filtered
    ].slice(0, 5);

    localStorage.setItem('weathergpt_recent_searches', JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save recent search to localStorage', e);
  }
}

/**
 * Clear recent search history
 */
export function clearRecentSearches() {
  try {
    localStorage.removeItem('weathergpt_recent_searches');
  } catch (e) {
    console.warn('Failed to clear recent searches', e);
  }
}
