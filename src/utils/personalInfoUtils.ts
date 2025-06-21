import { ageCategories, weightCategories } from '../constants/personalInfoOptions';

/**
 * Convert age category code to a representative numeric age for API calls
 * @param ageCategory - The age category code (e.g., 'YOUNG_ADULT', 'ADULT')
 * @returns A representative age number, or undefined if category not found
 */
export function convertAgeCategoryToAge(ageCategory?: string): number | undefined {
  if (!ageCategory) return undefined;

  const category = ageCategories.find(cat => cat.code === ageCategory);
  if (!category) return undefined;

  // Extract the range and return the midpoint
  const range = category.range;
  if (range.includes('+')) {
    // Handle "66+" case - return 70 as a reasonable representative age
    const minAge = parseInt(range.replace('+', ''));
    return minAge + 4; // 66+ becomes 70
  }

  if (range.includes('-')) {
    // Handle "18-25" case - return the midpoint
    const [min, max] = range.split('-').map(num => parseInt(num.trim()));
    return Math.round((min + max) / 2);
  }

  // Fallback - try to parse as a single number
  const parsed = parseInt(range);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Convert weight category code to a representative numeric weight for API calls
 * @param weightCategory - The weight category code (e.g., 'MODERATE', 'HEAVY')
 * @returns A representative weight number in lbs, or undefined if category not found
 */
export function convertWeightCategoryToWeight(weightCategory?: string): number | undefined {
  if (!weightCategory) return undefined;

  const category = weightCategories.find(cat => cat.code === weightCategory);
  if (!category) return undefined;

  // Extract the range and return the midpoint
  const range = category.range;
  if (range.includes('+')) {
    // Handle "226+" case - return 240 as a reasonable representative weight
    const minWeight = parseInt(range.replace('+', ''));
    return minWeight + 14; // 226+ becomes 240
  }

  if (range.includes('-')) {
    // Handle "151-175" case - return the midpoint
    const [min, max] = range.split('-').map(num => parseInt(num.trim()));
    return Math.round((min + max) / 2);
  }

  // Fallback - try to parse as a single number
  const parsed = parseInt(range);
  return isNaN(parsed) ? undefined : parsed;
}

// getRepresentativeAge and getRepresentativeWeight functions removed
// Backend handles complex data processing - frontend uses simple fallbacks
