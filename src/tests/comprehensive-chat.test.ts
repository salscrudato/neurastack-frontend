/**
 * Comprehensive Chat and History Functionality Test
 * 
 * This test suite validates all chat and history functionality
 * before go-live deployment.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatStore } from '../store/useChatStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { neuraStackClient } from '../lib/neurastack-client';

// Mock the API client
vi.mock('../lib/neurastack-client', () => ({
  neuraStackClient: {
    configure: vi.fn(),
    queryAI: vi.fn(),
    healthCheck: vi.fn(),
  }
}));

// Mock Firebase
vi.mock('../firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-123',
      isAnonymous: false
    }
  },
  db: {}
}));

describe('Comprehensive Chat Functionality', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useChatStore.getState().clearMessages();
    useHistoryStore.getState().clearSessions();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock responses
    (neuraStackClient.queryAI as any).mockResolvedValue({
      answer: 'Test AI response',
      confidence: 0.95,
      tokenCount: 50,
      memoryContext: [],
      sessionId: 'test-session'
    });
    
    (neuraStackClient.healthCheck as any).mockResolvedValue({
      status: 'healthy',
      message: 'API is operational'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Chat Store Functionality', () => {
    it('should initialize with empty state', () => {
      const { messages, isLoading, error } = useChatStore.getState();
      
      expect(messages).toEqual([]);
      expect(isLoading).toBe(false);
      expect(error).toBeNull();
    });

    it('should add user message correctly', async () => {
      const store = useChatStore.getState();
      
      await act(async () => {
        await store.send('Hello, AI!');
      });

      const { messages } = useChatStore.getState();
      
      expect(messages).toHaveLength(2); // User message + AI response
      expect(messages[0].role).toBe('user');
      expect(messages[0].text).toBe('Hello, AI!');
      expect(messages[1].role).toBe('assistant');
      expect(messages[1].text).toBe('Test AI response');
    });

    it('should handle API errors gracefully', async () => {
      (neuraStackClient.queryAI as any).mockRejectedValue(new Error('API Error'));
      
      const store = useChatStore.getState();
      
      await act(async () => {
        try {
          await store.send('Test message');
        } catch (error) {
          // Expected to throw
        }
      });

      const { messages, error } = useChatStore.getState();
      
      expect(messages).toHaveLength(2); // User message + error message
      expect(messages[1].role).toBe('assistant');
      expect(messages[1].text).toContain('error');
    });

    it('should clear messages correctly', () => {
      const store = useChatStore.getState();
      
      // Add some messages first
      store.addMessage({
        id: '1',
        role: 'user',
        text: 'Test',
        timestamp: Date.now()
      });
      
      expect(store.messages).toHaveLength(1);
      
      store.clearMessages();
      
      expect(store.messages).toHaveLength(0);
    });

    it('should sanitize input correctly', async () => {
      const store = useChatStore.getState();
      
      await act(async () => {
        await store.send('<script>alert("xss")</script>Hello');
      });

      const { messages } = useChatStore.getState();
      
      // Should sanitize the script tag
      expect(messages[0].text).not.toContain('<script>');
      expect(messages[0].text).toContain('Hello');
    });
  });

  describe('History Store Functionality', () => {
    it('should save session correctly', async () => {
      const chatStore = useChatStore.getState();
      const historyStore = useHistoryStore.getState();
      
      // Add some messages to chat
      chatStore.addMessage({
        id: '1',
        role: 'user',
        text: 'Hello',
        timestamp: Date.now()
      });
      
      chatStore.addMessage({
        id: '2',
        role: 'assistant',
        text: 'Hi there!',
        timestamp: Date.now()
      });

      await act(async () => {
        await historyStore.saveSession(chatStore.messages, 'Test Session');
      });

      const { sessions } = useHistoryStore.getState();
      
      expect(sessions).toHaveLength(1);
      expect(sessions[0].title).toBe('Test Session');
      expect(sessions[0].messages).toHaveLength(2);
    });

    it('should load session correctly', async () => {
      const chatStore = useChatStore.getState();
      const historyStore = useHistoryStore.getState();
      
      // Create a test session
      const testMessages = [
        {
          id: '1',
          role: 'user' as const,
          text: 'Test message',
          timestamp: Date.now()
        }
      ];

      const sessionId = await historyStore.saveSession(testMessages, 'Test Session');
      
      // Clear chat
      chatStore.clearMessages();
      expect(chatStore.messages).toHaveLength(0);

      // Load session
      await act(async () => {
        await historyStore.loadSession(sessionId);
      });

      const { messages } = useChatStore.getState();
      
      expect(messages).toHaveLength(1);
      expect(messages[0].text).toBe('Test message');
    });

    it('should delete session correctly', async () => {
      const historyStore = useHistoryStore.getState();
      
      // Create a test session
      const testMessages = [
        {
          id: '1',
          role: 'user' as const,
          text: 'Test message',
          timestamp: Date.now()
        }
      ];

      const sessionId = await historyStore.saveSession(testMessages, 'Test Session');
      
      expect(historyStore.sessions).toHaveLength(1);

      await act(async () => {
        await historyStore.deleteSession(sessionId);
      });

      const { sessions } = useHistoryStore.getState();
      
      expect(sessions).toHaveLength(0);
    });

    it('should generate appropriate titles from messages', async () => {
      const historyStore = useHistoryStore.getState();
      
      const testMessages = [
        {
          id: '1',
          role: 'user' as const,
          text: 'What is the capital of France?',
          timestamp: Date.now()
        },
        {
          id: '2',
          role: 'assistant' as const,
          text: 'The capital of France is Paris.',
          timestamp: Date.now()
        }
      ];

      await act(async () => {
        await historyStore.saveSession(testMessages);
      });

      const { sessions } = useHistoryStore.getState();
      
      expect(sessions[0].title).toContain('What is the capital');
    });
  });

  describe('API Integration', () => {
    it('should configure API client correctly', async () => {
      const store = useChatStore.getState();
      
      await act(async () => {
        await store.send('Test message');
      });

      expect(neuraStackClient.configure).toHaveBeenCalledWith({
        sessionId: expect.any(String),
        userId: 'test-user-123',
        useEnsemble: true
      });
    });

    it('should call API with correct parameters', async () => {
      const store = useChatStore.getState();
      
      await act(async () => {
        await store.send('Test message');
      });

      expect(neuraStackClient.queryAI).toHaveBeenCalledWith('Test message', {
        useEnsemble: true,
        temperature: 0.7,
        sessionId: expect.any(String)
      });
    });

    it('should handle rate limiting', async () => {
      const store = useChatStore.getState();
      
      // Simulate rate limiting by making many requests
      const promises = Array.from({ length: 35 }, (_, i) => 
        store.send(`Message ${i}`)
      );

      await act(async () => {
        await Promise.allSettled(promises);
      });

      const { rateLimitInfo } = useChatStore.getState();
      
      // Should detect rate limiting
      expect(rateLimitInfo.requestCount).toBeGreaterThan(30);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should limit maximum messages', async () => {
      const store = useChatStore.getState();
      
      // Add more than max messages
      for (let i = 0; i < 105; i++) {
        store.addMessage({
          id: `${i}`,
          role: i % 2 === 0 ? 'user' : 'assistant',
          text: `Message ${i}`,
          timestamp: Date.now()
        });
      }

      expect(store.messages.length).toBeLessThanOrEqual(100);
    });

    it('should track memory usage', () => {
      const store = useChatStore.getState();
      
      // Add some messages
      store.addMessage({
        id: '1',
        role: 'user',
        text: 'A'.repeat(1000), // Large message
        timestamp: Date.now()
      });

      expect(store.memoryUsage).toBeGreaterThan(0);
    });

    it('should cleanup old data', async () => {
      const store = useChatStore.getState();
      
      // Set last cleanup to old time
      store.lastCleanup = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      
      await act(async () => {
        await store.send('Test message');
      });

      // Should have updated cleanup time
      expect(store.lastCleanup).toBeGreaterThan(Date.now() - 1000);
    });
  });
});

describe('Error Handling and Edge Cases', () => {
  it('should handle empty messages', async () => {
    const store = useChatStore.getState();
    
    await act(async () => {
      try {
        await store.send('');
      } catch (error) {
        // Expected to throw for empty message
      }
    });

    expect(store.messages).toHaveLength(0);
  });

  it('should handle very long messages', async () => {
    const store = useChatStore.getState();
    const longMessage = 'A'.repeat(15000); // Longer than max
    
    await act(async () => {
      await store.send(longMessage);
    });

    const { messages } = useChatStore.getState();
    
    // Should truncate the message
    expect(messages[0].text.length).toBeLessThanOrEqual(10000);
  });

  it('should handle network errors', async () => {
    (neuraStackClient.queryAI as any).mockRejectedValue(new Error('Network error'));
    
    const store = useChatStore.getState();
    
    await act(async () => {
      try {
        await store.send('Test message');
      } catch (error) {
        // Expected to throw
      }
    });

    const { error } = useChatStore.getState();
    
    expect(error).toBeTruthy();
  });
});
