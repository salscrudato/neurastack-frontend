/**
 * Security Utilities for Production Chat
 * 
 * Provides comprehensive input validation, sanitization, and security measures
 * for the NeuraStack chat application.
 */

// Security configuration
const SECURITY_CONFIG = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_MESSAGES_PER_MINUTE: 30,
  BLOCKED_PATTERNS: [
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  ],
  SUSPICIOUS_KEYWORDS: [
    'eval(',
    'Function(',
    'setTimeout(',
    'setInterval(',
    'document.cookie',
    'localStorage',
    'sessionStorage',
    'window.location',
  ],
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
} as const;

// Rate limiting storage (in-memory for simplicity)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

/**
 * Comprehensive input sanitization
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    .trim()
    .slice(0, SECURITY_CONFIG.MAX_MESSAGE_LENGTH);

  // Remove potentially dangerous patterns
  SECURITY_CONFIG.BLOCKED_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Basic HTML entity encoding for display safety
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Validate input for suspicious content
 */
export function validateInput(input: string): { isValid: boolean; reason?: string } {
  if (!input || typeof input !== 'string') {
    return { isValid: false, reason: 'Invalid input type' };
  }

  if (input.length > SECURITY_CONFIG.MAX_MESSAGE_LENGTH) {
    return { isValid: false, reason: 'Message too long' };
  }

  // Check for suspicious keywords
  const lowerInput = input.toLowerCase();
  for (const keyword of SECURITY_CONFIG.SUSPICIOUS_KEYWORDS) {
    if (lowerInput.includes(keyword.toLowerCase())) {
      return { isValid: false, reason: 'Potentially unsafe content detected' };
    }
  }

  // Check for blocked patterns
  for (const pattern of SECURITY_CONFIG.BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      return { isValid: false, reason: 'Blocked content pattern detected' };
    }
  }

  return { isValid: true };
}

/**
 * Rate limiting check
 */
export function checkRateLimit(userId: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  // No previous record or window expired
  if (!userLimit || now - userLimit.windowStart > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return { allowed: true };
  }

  // Check if limit exceeded
  if (userLimit.count >= SECURITY_CONFIG.MAX_MESSAGES_PER_MINUTE) {
    const resetTime = userLimit.windowStart + SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    return { allowed: false, resetTime };
  }

  // Increment counter
  rateLimitStore.set(userId, { ...userLimit, count: userLimit.count + 1 });
  return { allowed: true };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [userId, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(userId);
    }
  }
}

/**
 * Content Security Policy headers for API responses
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://neurastack-backend-*.run.app",
    "font-src 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "frame-src 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

/**
 * Secure session ID generation
 */
export function generateSecureSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate API response to prevent injection attacks
 */
export function validateApiResponse(response: any): { isValid: boolean; sanitizedResponse?: any } {
  if (!response || typeof response !== 'object') {
    return { isValid: false };
  }

  try {
    // Deep clone to avoid modifying original
    const sanitized = JSON.parse(JSON.stringify(response));
    
    // Recursively sanitize string values
    function sanitizeObject(obj: any): any {
      if (typeof obj === 'string') {
        return sanitizeInput(obj);
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          // Sanitize key names too
          const sanitizedKey = sanitizeInput(key);
          result[sanitizedKey] = sanitizeObject(value);
        }
        return result;
      }
      
      return obj;
    }

    return { isValid: true, sanitizedResponse: sanitizeObject(sanitized) };
  } catch {
    return { isValid: false };
  }
}

/**
 * Security audit log entry
 */
export interface SecurityAuditEntry {
  timestamp: number;
  userId?: string;
  sessionId?: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

/**
 * Log security events (in production, this would go to a secure logging service)
 */
export function logSecurityEvent(entry: Omit<SecurityAuditEntry, 'timestamp'>): void {
  const auditEntry: SecurityAuditEntry = {
    ...entry,
    timestamp: Date.now(),
  };

  // In development, log to console
  if (import.meta.env.DEV) {
    console.warn('🔒 Security Event:', auditEntry);
  }

  // In production, this would be sent to a secure logging service
  // Example: sendToSecurityLog(auditEntry);
}

// Cleanup rate limit store periodically
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000); // Every 5 minutes
}
