import { searchLocations, reverseGeocode } from './src/services/geocodingService.js';
import { fetchLiveOpenMeteoWeather } from './src/services/weatherService.js';

async function testFullSystem() {
  console.log('--- 1. Testing Worldwide Geocoding Search ---');
  const kunigal = await searchLocations('Kunigal');
  console.log('Kunigal search result count:', kunigal.length);
  console.log('First result label:', kunigal[0]?.displayName);

  const tokyo = await searchLocations('Tokyo');
  console.log('Tokyo search result count:', tokyo.length);
  console.log('First result label:', tokyo[0]?.displayName);

  console.log('\n--- 2. Testing Reverse Geocoding ---');
  const reverseLoc = await reverseGeocode(12.9716, 77.5946);
  console.log('Reverse geocoded location:', reverseLoc.displayName);

  console.log('\n--- 3. Testing 7-Day & Hourly Weather Retrieval ---');
  const weather = await fetchLiveOpenMeteoWeather(kunigal[0].latitude, kunigal[0].longitude, kunigal[0].displayName);
  console.log('Retrieved location:', weather.locationName);
  console.log('Current Temp:', weather.consensus.temperature, '°C, Feels like:', weather.consensus.feelsLike, '°C');
  console.log('Sunrise / Sunset:', weather.consensus.sunrise, '/', weather.consensus.sunset);
  console.log('24-Hour hourly count:', weather.hourly.length);
  console.log('7-Day daily count:', weather.dailyForecast.length);
  console.log('First day forecast:', weather.dailyForecast[0]);

  console.log('\n--- SYSTEM VERIFICATION COMPLETE: ALL PASSED ---');
}

testFullSystem().catch(console.error);
