/**
 * Admin Access Control Tests
 * 
 * Tests for admin access control functionality to ensure
 * only authorized users can access admin features.
 */

import { describe, it, expect } from 'vitest';
import { hasAdminAccess, getAdminPermission, hasAdminPermission, AdminPermission, ADMIN_EMAIL } from '../config/admin';

describe('Admin Access Control', () => {
  describe('hasAdminAccess', () => {
    it('should grant access to authorized admin email', () => {
      const adminUser = {
        email: ADMIN_EMAIL,
        isAnonymous: false,
        uid: 'admin-uid-123'
      };

      expect(hasAdminAccess(adminUser)).toBe(true);
    });

    it('should deny access to unauthorized email', () => {
      const unauthorizedUser = {
        email: 'unauthorized@example.com',
        isAnonymous: false,
        uid: 'user-uid-456'
      };

      expect(hasAdminAccess(unauthorizedUser)).toBe(false);
    });

    it('should deny access to anonymous users', () => {
      const anonymousUser = {
        email: null,
        isAnonymous: true,
        uid: 'anon-uid-789'
      };

      expect(hasAdminAccess(anonymousUser)).toBe(false);
    });

    it('should deny access to null/undefined user', () => {
      expect(hasAdminAccess(null)).toBe(false);
      expect(hasAdminAccess(undefined)).toBe(false);
    });

    it('should deny access to user without email', () => {
      const userWithoutEmail = {
        email: null,
        isAnonymous: false,
        uid: 'user-uid-999'
      };

      expect(hasAdminAccess(userWithoutEmail)).toBe(false);
    });
  });

  describe('getAdminPermission', () => {
    it('should return SUPER_ADMIN for authorized admin', () => {
      const adminUser = {
        email: ADMIN_EMAIL,
        isAnonymous: false,
        uid: 'admin-uid-123'
      };

      expect(getAdminPermission(adminUser)).toBe(AdminPermission.SUPER_ADMIN);
    });

    it('should return null for unauthorized user', () => {
      const unauthorizedUser = {
        email: 'unauthorized@example.com',
        isAnonymous: false,
        uid: 'user-uid-456'
      };

      expect(getAdminPermission(unauthorizedUser)).toBe(null);
    });
  });

  describe('hasAdminPermission', () => {
    const adminUser = {
      email: ADMIN_EMAIL,
      isAnonymous: false,
      uid: 'admin-uid-123'
    };

    const unauthorizedUser = {
      email: 'unauthorized@example.com',
      isAnonymous: false,
      uid: 'user-uid-456'
    };

    it('should grant all permissions to super admin', () => {
      expect(hasAdminPermission(adminUser, AdminPermission.READ_ONLY)).toBe(true);
      expect(hasAdminPermission(adminUser, AdminPermission.FULL_ACCESS)).toBe(true);
      expect(hasAdminPermission(adminUser, AdminPermission.SUPER_ADMIN)).toBe(true);
    });

    it('should deny all permissions to unauthorized user', () => {
      expect(hasAdminPermission(unauthorizedUser, AdminPermission.READ_ONLY)).toBe(false);
      expect(hasAdminPermission(unauthorizedUser, AdminPermission.FULL_ACCESS)).toBe(false);
      expect(hasAdminPermission(unauthorizedUser, AdminPermission.SUPER_ADMIN)).toBe(false);
    });
  });

  describe('Admin Configuration', () => {
    it('should have correct admin email configured', () => {
      expect(ADMIN_EMAIL).toBe('sal.scrudato@gmail.com');
    });

    it('should validate admin email format', () => {
      expect(ADMIN_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle case-sensitive email comparison', () => {
      const userWithUppercaseEmail = {
        email: 'SAL.SCRUDATO@GMAIL.COM',
        isAnonymous: false,
        uid: 'user-uid-case'
      };

      // Should be case-sensitive (deny access for different case)
      expect(hasAdminAccess(userWithUppercaseEmail)).toBe(false);
    });

    it('should handle email with extra whitespace', () => {
      const userWithWhitespace = {
        email: ' sal.scrudato@gmail.com ',
        isAnonymous: false,
        uid: 'user-uid-whitespace'
      };

      // Should be exact match (deny access for whitespace)
      expect(hasAdminAccess(userWithWhitespace)).toBe(false);
    });

    it('should handle similar but different email', () => {
      const userWithSimilarEmail = {
        email: 'sal.scrudato@gmail.co', // Missing 'm'
        isAnonymous: false,
        uid: 'user-uid-similar'
      };

      expect(hasAdminAccess(userWithSimilarEmail)).toBe(false);
    });
  });
});
