/**
 * String utility functions for common string operations
 */

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirst(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Convert a string to title case (capitalize first letter of each word)
 */
export function toTitleCase(value: string): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate a string to a specific length and add an ellipsis if truncated
 */
export function truncateString(value: string, maxLength = 50, ellipsis = '...'): string {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + ellipsis;
}

/**
 * Remove all HTML tags from a string
 */
export function stripHtml(value: string): string {
  if (!value) return '';
  return value.replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 * Generate a slug from a string (for URLs)
 */
export function slugify(value: string): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Check if a string is empty or whitespace only
 */
export function isEmptyString(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === '';
}

/**
 * Generate a random string with specified length
 */
export function generateRandomString(length = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Format a string with placeholders (e.g., "Hello, {name}!")
 */
export function formatString(template: string, params: Record<string, string | number>): string {
  if (!template) return '';
  return template.replace(/{(\w+)}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : ''
  );
}
