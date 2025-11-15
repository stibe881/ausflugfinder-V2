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
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleMapsApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
      };
    }

    console.warn(`[Geocoding] No results found for address: ${address}`);
    return null;
  } catch (error) {
    console.error('[Geocoding] Error geocoding address:', error);
    return null;
  }
}
