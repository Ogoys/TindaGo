import axios from 'axios';

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

/**
 * Convert coordinates to human-readable address (FREE - no API key needed)
 * Uses OpenStreetMap's Nominatim service
 */
export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const response = await axios.get(`${NOMINATIM_API}/reverse`, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'TindaGo-App', // Required by Nominatim
      },
    });

    const data = response.data;
    
    if (!data || !data.address) {
      return 'Address not found';
    }

    // Format address for Philippines
    const address = data.address;
    const parts = [
      address.road || address.street || address.neighbourhood,
      address.suburb || address.village,
      address.city || address.municipality || address.town,
      address.province || address.state,
    ].filter(Boolean); // Remove null/undefined

    return parts.join(', ') || data.display_name || 'Unknown address';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Unable to get address';
  }
}

/**
 * Validate coordinates are within reasonable bounds
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
}

/**
 * Check if coordinates are within Davao City (optional validation)
 */
export function isInDavaoCity(latitude: number, longitude: number): boolean {
  // Approximate bounds for Davao City
  const bounds = {
    north: 7.3,
    south: 6.9,
    east: 125.8,
    west: 125.2,
  };

  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
