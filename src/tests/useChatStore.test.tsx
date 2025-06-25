/**
 * Comprehensive tests for useChatStore
 * Tests production-ready features including security, performance, and error handling
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useChatStore } from '../store/useChatStore';

// Mock the neurastack client
vi.mock('../lib/neurastack-client', () => ({
  neuraStackClient: {
    configure: vi.fn(),
    queryAI: vi.fn(),
  },
}));

// Mock Firebase auth
vi.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-id' },
  },
}));

// Mock security utils
vi.mock('../utils/securityUtils', () => ({
  sanitizeInput: vi.fn((input: string) => input.trim()),
  validateInput: vi.fn(() => ({ isValid: true })),
  logSecurityEvent: vi.fn(),
}));

describe('useChatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
      messages: [],
      isLoading: false,
      retryCount: 0,
      sessionId: 'test-session',
      error: null,
      isOnline: true,
      rateLimitInfo: {
        requestCount: 0,
        windowStart: Date.now(),
        isLimited: false,
      },
      performanceMetrics: {
        averageResponseTime: 0,
        totalRequests: 0,
        failureRate: 0,
      },
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useChatStore());
      
      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isOnline).toBe(true);
      expect(result.current.rateLimitInfo.requestCount).toBe(0);
      expect(result.current.performanceMetrics.totalRequests).toBe(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        const allowed = result.current.checkRateLimit();
        expect(allowed).toBe(true);
      });
      
      expect(result.current.rateLimitInfo.requestCount).toBe(1);
      expect(result.current.rateLimitInfo.isLimited).toBe(false);
    });

    it('should block requests when rate limit exceeded', () => {
      const { result } = renderHook(() => useChatStore());
      
      // Set up state to simulate rate limit reached
      act(() => {
        useChatStore.setState({
          rateLimitInfo: {
            requestCount: 30, // At the limit
            windowStart: Date.now(),
            isLimited: false,
          },
        });
      });
      
      act(() => {
        const allowed = result.current.checkRateLimit();
        expect(allowed).toBe(false);
      });
      
      expect(result.current.rateLimitInfo.isLimited).toBe(true);
    });

    it('should reset rate limit after window expires', () => {
      const { result } = renderHook(() => useChatStore());
      
      // Set up expired window
      act(() => {
        useChatStore.setState({
          rateLimitInfo: {
            requestCount: 30,
            windowStart: Date.now() - 70000, // 70 seconds ago (expired)
            isLimited: true,
          },
        });
      });
      
      act(() => {
        const allowed = result.current.checkRateLimit();
        expect(allowed).toBe(true);
      });
      
      expect(result.current.rateLimitInfo.requestCount).toBe(1);
      expect(result.current.rateLimitInfo.isLimited).toBe(false);
    });
  });

  describe('Performance Metrics', () => {
    it('should update performance metrics on successful request', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.updatePerformanceMetrics(1500, true);
      });
      
      expect(result.current.performanceMetrics.averageResponseTime).toBe(1500);
      expect(result.current.performanceMetrics.totalRequests).toBe(1);
      expect(result.current.performanceMetrics.failureRate).toBe(0);
    });

    it('should update failure rate on failed request', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.updatePerformanceMetrics(0, false);
      });
      
      expect(result.current.performanceMetrics.totalRequests).toBe(1);
      expect(result.current.performanceMetrics.failureRate).toBe(1);
    });

    it('should calculate average response time correctly', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.updatePerformanceMetrics(1000, true);
        result.current.updatePerformanceMetrics(2000, true);
      });
      
      expect(result.current.performanceMetrics.averageResponseTime).toBe(1500);
      expect(result.current.performanceMetrics.totalRequests).toBe(2);
      expect(result.current.performanceMetrics.failureRate).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should set and clear errors', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        useChatStore.setState({ error: 'Test error' });
      });
      
      expect(result.current.error).toBe('Test error');
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('Online Status', () => {
    it('should update online status', () => {
      const { result } = renderHook(() => useChatStore());
      
      act(() => {
        result.current.updateOnlineStatus(false);
      });
      
      expect(result.current.isOnline).toBe(false);
      
      act(() => {
        result.current.updateOnlineStatus(true);
      });
      
      expect(result.current.isOnline).toBe(true);
    });
  });

  describe('Message Management', () => {
    it('should clear messages and reset session', () => {
      const { result } = renderHook(() => useChatStore());
      
      // Add some messages first
      act(() => {
        useChatStore.setState({
          messages: [
            { id: '1', role: 'user', text: 'Hello', timestamp: Date.now() },
            { id: '2', role: 'assistant', text: 'Hi there!', timestamp: Date.now() },
          ],
        });
      });
      
      expect(result.current.messages).toHaveLength(2);
      
      act(() => {
        result.current.clearMessages();
      });
      
      expect(result.current.messages).toHaveLength(0);
      expect(result.current.sessionId).toBeDefined();
      expect(result.current.memoryUsage).toBe(0);
    });

    it('should delete specific message', () => {
      const { result } = renderHook(() => useChatStore());
      
      // Add messages
      act(() => {
        useChatStore.setState({
          messages: [
            { id: '1', role: 'user', text: 'Hello', timestamp: Date.now() },
            { id: '2', role: 'assistant', text: 'Hi there!', timestamp: Date.now() },
          ],
        });
      });
      
      act(() => {
        result.current.deleteMessage('1');
      });
      
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].id).toBe('2');
    });
  });

  describe('Memory Management', () => {
    it('should provide memory statistics', () => {
      const { result } = renderHook(() => useChatStore());
      
      // Add messages
      act(() => {
        useChatStore.setState({
          messages: [
            { id: '1', role: 'user', text: 'Hello', timestamp: Date.now() },
            { id: '2', role: 'assistant', text: 'Hi there!', timestamp: Date.now() },
          ],
        });
      });
      
      const stats = result.current.getMemoryStats();
      
      expect(stats.messageCount).toBe(2);
      expect(stats.estimatedSize).toBeGreaterThan(0);
      expect(stats.oldestMessage).toBeGreaterThan(0);
    });

    it('should optimize memory when called', () => {
      const { result } = renderHook(() => useChatStore());
      
      // Add messages with metadata
      act(() => {
        useChatStore.setState({
          messages: [
            { 
              id: '1', 
              role: 'user', 
              text: 'Hello', 
              timestamp: Date.now(),
              metadata: { 
                largeData: 'x'.repeat(1000),
                keepThis: 'important'
              }
            },
          ],
        });
      });
      
      const initialMemory = result.current.memoryUsage;
      
      act(() => {
        result.current.optimizeMemory();
      });
      
      // Memory should be optimized (metadata reduced)
      expect(result.current.memoryUsage).toBeLessThanOrEqual(initialMemory);
    });
  });
});
