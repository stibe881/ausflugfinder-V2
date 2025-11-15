import { ENV } from './_core/env';

export interface GeocodeResult {
  latitude: string;
  longitude: string;
}

/**
 * Geocode a destination address to get latitude and longitude
 * Uses Google Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address) return null;

  const googleMapsApiKey = ENV.GOOGLE_MAPS_SERVER_KEY || ENV.VITE_GOOGLE_MAPS_API_KEY;
  if (!googleMapsApiKey) {
    console.warn('[Geocoding] Google Maps API key not configured');
    return null;
  }

  try {
    console.log('[Geocoding] Starting geocoding for address:', address);
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleMapsApiKey}`;

    console.log('[Geocoding] Calling Google Geocoding API...');
    const response = await fetch(url);
    const data = await response.json();

    console.log('[Geocoding] API Response status:', data.status);
    console.log('[Geocoding] API Response results count:', data.results?.length || 0);

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const result = {
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
      };
      console.log('[Geocoding] Successfully geocoded:', result);
      return result;
    }

    console.warn(`[Geocoding] No results found for address: ${address}`);
    console.warn('[Geocoding] API Status:', data.status);
    return null;
  } catch (error) {
    console.error('[Geocoding] Error geocoding address:', error);
    return null;
  }
}
