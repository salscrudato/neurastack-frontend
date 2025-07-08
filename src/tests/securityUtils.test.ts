/**
 * Comprehensive tests for security utilities
 * Tests input sanitization, validation, and security measures
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    checkRateLimit,
    cleanupRateLimitStore,
    generateSecureSessionId,
    logSecurityEvent,
    sanitizeInput,
    validateApiResponse,
    validateInput,
} from '../utils/securityUtils';

describe('Security Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear rate limit store
    cleanupRateLimitStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sanitizeInput', () => {
    it('should sanitize basic HTML entities', () => {
      // Test with non-blocked HTML that should be encoded
      const input = '<div>Hello "world" & friends</div>';
      const result = sanitizeInput(input);
      expect(result).toBe('&lt;div&gt;Hello &quot;world&quot; &amp; friends&lt;&#x2F;div&gt;');
    });

    it('should remove dangerous patterns', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeInput(input);
      expect(result).not.toContain('javascript:');
    });

    it('should handle empty or invalid input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
      expect(sanitizeInput(123 as any)).toBe('');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = sanitizeInput(input);
      expect(result).toBe('hello world');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(15000);
      const result = sanitizeInput(longInput);
      expect(result.length).toBeLessThanOrEqual(10000);
    });

    it('should encode special characters', () => {
      const input = '&<>"\'\/';
      const result = sanitizeInput(input);
      expect(result).toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F;');
    });
  });

  describe('validateInput', () => {
    it('should validate normal input', () => {
      const result = validateInput('Hello, how are you?');
      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject empty or invalid input', () => {
      expect(validateInput('').isValid).toBe(false);
      expect(validateInput(null as any).isValid).toBe(false);
      expect(validateInput(undefined as any).isValid).toBe(false);
    });

    it('should reject input that is too long', () => {
      const longInput = 'a'.repeat(15000);
      const result = validateInput(longInput);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Message too long');
    });

    it('should detect suspicious keywords', () => {
      const suspiciousInputs = [
        'eval(malicious_code)',
        'document.cookie = "steal"',
        'localStorage.setItem("hack", "data")',
        'window.location = "evil.com"',
      ];

      suspiciousInputs.forEach(input => {
        const result = validateInput(input);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('Potentially unsafe content detected');
      });
    });

    it('should detect blocked patterns', () => {
      const blockedInputs = [
        '<script>alert("xss")</script>',
        '<iframe src="evil.com"></iframe>',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'onclick="alert(\'xss\')"',
      ];

      blockedInputs.forEach(input => {
        const result = validateInput(input);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('Blocked content pattern detected');
      });
    });
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('user1');
      expect(result.allowed).toBe(true);
      expect(result.resetTime).toBeUndefined();
    });

    it('should track multiple requests', () => {
      // Make several requests
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit('user1');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block when rate limit exceeded', () => {
      // Make maximum allowed requests
      for (let i = 0; i < 30; i++) {
        checkRateLimit('user1');
      }

      // Next request should be blocked
      const result = checkRateLimit('user1');
      expect(result.allowed).toBe(false);
      expect(result.resetTime).toBeDefined();
    });

    it('should handle different users separately', () => {
      // Max out user1
      for (let i = 0; i < 30; i++) {
        checkRateLimit('user1');
      }

      // user2 should still be allowed
      const result = checkRateLimit('user2');
      expect(result.allowed).toBe(true);
    });

    it('should reset after time window', () => {
      // Mock Date.now to simulate time passage
      const originalNow = Date.now;
      let mockTime = originalNow();
      vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

      // Max out requests
      for (let i = 0; i < 30; i++) {
        checkRateLimit('user1');
      }

      // Should be blocked
      expect(checkRateLimit('user1').allowed).toBe(false);

      // Advance time past window
      mockTime += 70000; // 70 seconds

      // Should be allowed again
      const result = checkRateLimit('user1');
      expect(result.allowed).toBe(true);

      Date.now = originalNow;
    });
  });

  describe('validateApiResponse', () => {
    it('should validate clean response', () => {
      const response = {
        answer: 'Hello, how can I help you?',
        metadata: { model: 'gpt-4' },
      };

      const result = validateApiResponse(response);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedResponse).toBeDefined();
    });

    it('should sanitize malicious response', () => {
      const response = {
        answer: '<script>alert("xss")</script>Hello',
        metadata: { 
          model: 'gpt-4',
          'javascript:': 'malicious'
        },
      };

      const result = validateApiResponse(response);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedResponse?.answer).not.toContain('<script>');
    });

    it('should handle invalid response', () => {
      const result = validateApiResponse(null);
      expect(result.isValid).toBe(false);
      expect(result.sanitizedResponse).toBeUndefined();
    });

    it('should handle nested objects', () => {
      const response = {
        data: {
          nested: {
            value: '<script>alert("nested")</script>',
          },
        },
        array: ['<script>alert("array")</script>', 'safe value'],
      };

      const result = validateApiResponse(response);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedResponse?.data.nested.value).not.toContain('<script>');
      expect(result.sanitizedResponse?.array[0]).not.toContain('<script>');
    });
  });

  describe('generateSecureSessionId', () => {
    it('should generate valid UUID format', () => {
      const sessionId = generateSecureSessionId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(sessionId).toMatch(uuidRegex);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSecureSessionId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('logSecurityEvent', () => {
    it('should log security events in development', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock development environment
      vi.stubEnv('DEV', true);

      logSecurityEvent({
        action: 'test_action',
        severity: 'medium',
        details: { test: 'data' },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔒 Security Event:',
        expect.objectContaining({
          action: 'test_action',
          severity: 'medium',
          details: { test: 'data' },
          timestamp: expect.any(Number),
        })
      );

      consoleSpy.mockRestore();
    });

    it('should not log in production', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock production environment
      vi.stubEnv('DEV', false);

      logSecurityEvent({
        action: 'test_action',
        severity: 'medium',
        details: { test: 'data' },
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('cleanupRateLimitStore', () => {
    it('should remove expired entries', () => {
      const originalNow = Date.now;
      let mockTime = originalNow();
      vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

      // Add some entries
      checkRateLimit('user1');
      checkRateLimit('user2');

      // Advance time
      mockTime += 70000; // 70 seconds

      // Add new entry (should trigger cleanup)
      checkRateLimit('user3');

      // Cleanup should have removed expired entries
      cleanupRateLimitStore();

      // Old users should be allowed again (fresh start)
      expect(checkRateLimit('user1').allowed).toBe(true);
      expect(checkRateLimit('user2').allowed).toBe(true);

      Date.now = originalNow;
    });
  });
});
