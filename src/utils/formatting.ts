/**
 * Formatting Utilities
 *
 * Functions for formatting data for display (prices, dates, distances, etc.)
 */

/**
 * Format price in Philippine Peso
 */
export function formatPrice(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }

  if (format === 'time') {
    return dateObj.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return dateObj.toLocaleDateString('en-PH');
}

/**
 * Format distance in meters to km or m
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format phone number to Philippine format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as +63 XXX XXX XXXX or 09XX XXX XXXX
  if (cleaned.startsWith('63')) {
    return `+63 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Format weight/unit display
 */
export function formatWeight(weight: string | undefined, unit: string | undefined): string {
  if (!weight) return '';
  return unit ? `${weight}${unit}` : weight;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-PH');
}

/**
 * Format rating (e.g., 4.5 stars)
 */
export function formatRating(rating: number): string {
  return `${rating.toFixed(1)}⭐`;
}
