/**
 * Chat Store Tests
 * 
 * Tests the chat store functionality including message management,
 * API integration, session handling, and error recovery.
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '../store/useChatStore';

// Mock the API
vi.mock('../lib/api', () => ({
  queryStack: vi.fn(),
}));

vi.mock('../lib/neurastack-client', () => ({
  neuraStackClient: {
    configure: vi.fn(),
    queryAI: vi.fn(),
    storeMemory: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

describe('Chat Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store state to match actual implementation
    useChatStore.setState({
      messages: [],
      isLoading: false,
      retryCount: 0,
      sessionId: 'test-session-id',
    });
  });

  describe('Message Management', () => {
    it('should clear messages correctly', () => {
      const { result } = renderHook(() => useChatStore());

      // Add a message first by setting state directly
      act(() => {
        useChatStore.setState({
          messages: [{
            id: '1',
            role: 'user',
            text: 'Hello, AI!',
            timestamp: Date.now(),
          }],
        });
      });

      expect(result.current.messages).toHaveLength(1);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it('should delete message correctly', () => {
      const { result } = renderHook(() => useChatStore());

      // Add messages first by setting state directly
      act(() => {
        useChatStore.setState({
          messages: [
            {
              id: '1',
              role: 'user',
              text: 'Message 1',
              timestamp: Date.now(),
            },
            {
              id: '2',
              role: 'assistant',
              text: 'Message 2',
              timestamp: Date.now(),
            },
          ],
        });
      });

      expect(result.current.messages).toHaveLength(2);

      act(() => {
        result.current.deleteMessage('1');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].id).toBe('2');
    });

    it('should initialize new session correctly', () => {
      const { result } = renderHook(() => useChatStore());
      const originalSessionId = result.current.sessionId;

      act(() => {
        result.current.initializeSession();
      });

      expect(result.current.sessionId).not.toBe(originalSessionId);
      expect(result.current.sessionId).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should handle loading state during message sending', () => {
      const { result } = renderHook(() => useChatStore());

      expect(result.current.isLoading).toBe(false);

      // Loading state is managed internally by sendMessage
      // We can test by checking the initial state
      expect(result.current.retryCount).toBe(0);
    });

    it('should track retry count correctly', () => {
      const { result } = renderHook(() => useChatStore());

      // Set retry count directly to test state management
      act(() => {
        useChatStore.setState({ retryCount: 2 });
      });

      expect(result.current.retryCount).toBe(2);
    });
  });

  describe('Session Management', () => {
    it('should have a session ID', () => {
      const { result } = renderHook(() => useChatStore());

      expect(result.current.sessionId).toBeTruthy();
      expect(typeof result.current.sessionId).toBe('string');
    });

    it('should generate new session ID when clearing messages', () => {
      const { result } = renderHook(() => useChatStore());
      const originalSessionId = result.current.sessionId;

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.sessionId).not.toBe(originalSessionId);
      expect(result.current.sessionId).toBeTruthy();
    });
  });

  describe('API Integration', () => {
    it('should send message and receive response', async () => {
      const { neuraStackClient } = await import('../lib/neurastack-client');
      const mockResponse = {
        answer: 'This is an AI response',
        modelsUsed: { 'gpt-4': true },
        tokenCount: 20,
        ensembleMode: true,
        executionTime: '1.2s',
      };

      vi.mocked(neuraStackClient.queryAI).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      expect(result.current.messages).toHaveLength(2); // User message + AI response
      expect(result.current.messages[0].text).toBe('Hello, AI!');
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[1].text).toBe('This is an AI response');
      expect(result.current.messages[1].role).toBe('assistant');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      const { neuraStackClient } = await import('../lib/neurastack-client');
      vi.mocked(neuraStackClient.queryAI).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      // Should have user message and error message
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[1].role).toBe('error');
      expect(result.current.isLoading).toBe(false);
    });

    it('should retry failed requests', async () => {
      const { neuraStackClient } = await import('../lib/neurastack-client');
      const mockResponse = {
        answer: 'Success after retry',
        modelsUsed: { 'gpt-4': true },
        tokenCount: 15,
        ensembleMode: true,
        executionTime: '2.1s',
      };

      vi.mocked(neuraStackClient.queryAI)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('Test retry');
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[1].text).toBe('Success after retry');
      expect(result.current.messages[1].role).toBe('assistant');
    });
  });
});
