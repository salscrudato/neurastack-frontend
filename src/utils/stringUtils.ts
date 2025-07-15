/**
 * String Utilities
 * Simple, robust utilities for safe string operations
 */

/**
 * Safely convert any value to uppercase string
 * Handles undefined, null, numbers, objects, etc.
 */
export function safeToUpperCase(value: any): string {
  if (value === null || value === undefined) {
    return 'UNKNOWN';
  }
  
  try {
    return String(value).toUpperCase();
  } catch (error) {
    console.warn('safeToUpperCase failed for value:', value, error);
    return 'UNKNOWN';
  }
}

/**
 * Safely convert any value to lowercase string
 * Handles undefined, null, numbers, objects, etc.
 */
export function safeToLowerCase(value: any): string {
  if (value === null || value === undefined) {
    return 'unknown';
  }
  
  try {
    return String(value).toLowerCase();
  } catch (error) {
    console.warn('safeToLowerCase failed for value:', value, error);
    return 'unknown';
  }
}

/**
 * Safely convert any value to string
 * Handles undefined, null, numbers, objects, etc.
 */
export function safeToString(value: any, fallback: string = 'unknown'): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  try {
    return String(value);
  } catch (error) {
    console.warn('safeToString failed for value:', value, error);
    return fallback;
  }
}

/**
 * Safely check if a value includes a substring
 * Handles undefined, null, numbers, objects, etc.
 */
export function safeIncludes(value: any, searchString: string): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  
  try {
    return String(value).toLowerCase().includes(searchString.toLowerCase());
  } catch (error) {
    console.warn('safeIncludes failed for value:', value, error);
    return false;
  }
}
