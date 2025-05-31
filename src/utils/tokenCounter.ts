/**
 * Token counting utility for estimating token usage in chat inputs
 * 
 * This provides a rough estimation of tokens based on common tokenization patterns.
 * For GPT-style models, tokens are roughly:
 * - 1 token ≈ 4 characters for English text
 * - 1 token ≈ 0.75 words for English text
 * - Punctuation and special characters may be separate tokens
 */

// Common words that are typically single tokens
const COMMON_SINGLE_TOKEN_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'
]);

// Special characters that are typically separate tokens
const SPECIAL_TOKEN_CHARS = /[.,!?;:()[\]{}"'`~@#$%^&*+=<>\/\\|_-]/g;

/**
 * Estimates the number of tokens in a given text
 * Uses a hybrid approach combining character count and word analysis
 */
export function estimateTokenCount(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  const trimmedText = text.trim();
  
  // Count special characters/punctuation as separate tokens
  const specialCharMatches = trimmedText.match(SPECIAL_TOKEN_CHARS);
  const specialCharTokens = specialCharMatches ? specialCharMatches.length : 0;
  
  // Remove special characters for word analysis
  const cleanText = trimmedText.replace(SPECIAL_TOKEN_CHARS, ' ');
  
  // Split into words and filter out empty strings
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  
  let wordTokens = 0;
  
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    
    if (COMMON_SINGLE_TOKEN_WORDS.has(lowerWord)) {
      // Common words are usually single tokens
      wordTokens += 1;
    } else if (word.length <= 3) {
      // Very short words are usually single tokens
      wordTokens += 1;
    } else if (word.length <= 6) {
      // Medium words might be 1-2 tokens
      wordTokens += 1.2;
    } else if (word.length <= 10) {
      // Longer words are often split into multiple tokens
      wordTokens += Math.ceil(word.length / 4);
    } else {
      // Very long words (likely compound or technical terms)
      wordTokens += Math.ceil(word.length / 3.5);
    }
  }
  
  // Add tokens for whitespace (roughly 1 token per 4 spaces)
  const whitespaceCount = (trimmedText.match(/\s/g) || []).length;
  const whitespaceTokens = Math.ceil(whitespaceCount / 4);
  
  // Combine all token estimates
  const totalTokens = Math.ceil(wordTokens + specialCharTokens + whitespaceTokens);
  
  // Apply a slight adjustment factor based on empirical observations
  // GPT models tend to use slightly more tokens than simple estimates
  return Math.ceil(totalTokens * 1.1);
}

/**
 * Gets a rough cost estimate for the tokens (in USD)
 * Based on approximate GPT-4 pricing as of 2024
 */
export function estimateTokenCost(tokenCount: number): number {
  // Rough estimate: $0.03 per 1K input tokens for GPT-4
  const costPer1KTokens = 0.03;
  return (tokenCount / 1000) * costPer1KTokens;
}

/**
 * Formats token count for display with appropriate units
 */
export function formatTokenCount(tokenCount: number): string {
  if (tokenCount === 0) return '0';
  if (tokenCount < 1000) return tokenCount.toString();
  if (tokenCount < 10000) return `${(tokenCount / 1000).toFixed(1)}k`;
  return `${Math.round(tokenCount / 1000)}k`;
}

/**
 * Gets a color indicator based on token count relative to common model limits
 */
export function getTokenCountColor(tokenCount: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (tokenCount < 1000) return 'green';      // Very safe
  if (tokenCount < 2000) return 'yellow';     // Getting higher
  if (tokenCount < 4000) return 'orange';     // Approaching limits
  return 'red';                               // High usage
}

/**
 * Checks if token count is approaching common model limits
 */
export function isTokenCountHigh(tokenCount: number): boolean {
  return tokenCount > 3000; // Conservative threshold
}
