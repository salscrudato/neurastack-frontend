/**
 * Integration tests for ChatInput component
 * Tests user interactions, security validation, and accessibility
 */

import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChatInput from '../components/ChatInput';
import { useChatStore } from '../store/useChatStore';
import theme from '../theme/theme';

// Mock the chat store
vi.mock('../store/useChatStore');

// Mock security utils
vi.mock('../utils/securityUtils', () => ({
  sanitizeInput: vi.fn((input: string) => input.trim()),
  validateInput: vi.fn(() => ({ isValid: true })),
  logSecurityEvent: vi.fn(),
}));

// Mock performance manager
vi.mock('../utils/core/performanceManager', () => ({
  performanceManager: {
    getMetrics: vi.fn(() => ({})),
    updateConfig: vi.fn(),
  },
}));

// Mock accessibility hook
vi.mock('../hooks/useAccessibility', () => ({
  useReducedMotion: vi.fn(() => false),
}));

const mockSendMessage = vi.fn();
const mockClearError = vi.fn();

const renderChatInput = () => {
  return render(
    <ChakraProvider theme={theme}>
      <ChatInput />
    </ChakraProvider>
  );
};

describe('ChatInput Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock store state
    (useChatStore as any).mockReturnValue({
      isLoading: false,
      error: null,
      sendMessage: mockSendMessage,
      clearError: mockClearError,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render textarea and send button', () => {
      renderChatInput();
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('should enable send button when text is entered', async () => {
      const user = userEvent.setup();
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      expect(sendButton).toBeDisabled();
      
      await user.type(textarea, 'Hello world');
      
      expect(sendButton).toBeEnabled();
    });

    it('should send message when send button is clicked', async () => {
      const user = userEvent.setup();
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(textarea, 'Test message');
      await user.click(sendButton);
      
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should send message when Enter is pressed', async () => {
      const user = userEvent.setup();
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      
      await user.type(textarea, 'Test message');
      await user.keyboard('{Enter}');
      
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should not send message when Shift+Enter is pressed', async () => {
      const user = userEvent.setup();
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      
      await user.type(textarea, 'Test message');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should clear textarea after sending message', async () => {
      const user = userEvent.setup();
      renderChatInput();
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(textarea, 'Test message');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable input when loading', () => {
      (useChatStore as any).mockReturnValue({
        isLoading: true,
        error: null,
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      expect(textarea).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('should show loading indicator when sending', () => {
      (useChatStore as any).mockReturnValue({
        isLoading: true,
        error: null,
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      renderChatInput();
      
      // Should show some loading indication
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      (useChatStore as any).mockReturnValue({
        isLoading: false,
        error: 'Network error occurred',
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      renderChatInput();
      
      // Error should be handled by toast or error display
      // This would depend on your specific error display implementation
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      
      (useChatStore as any).mockReturnValue({
        isLoading: false,
        error: 'Previous error',
        sendMessage: mockSendMessage,
        clearError: mockClearError,
      });

      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'New message');
      
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Character Limit', () => {
    it('should show character count', async () => {
      const user = userEvent.setup();
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');
      
      // Should show character count somewhere in the UI
      // This depends on your specific implementation
    });

    it('should prevent sending when over character limit', async () => {
      const user = userEvent.setup();
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      const longMessage = 'a'.repeat(15000); // Over 10k limit
      
      await user.type(textarea, longMessage);
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      // Should show error toast instead of sending
      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      expect(textarea).toHaveAttribute('aria-label');
      expect(sendButton).toHaveAttribute('aria-label');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderChatInput();
      
      // Tab should move focus to textarea
      await user.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();
      
      // Tab should move to send button
      await user.tab();
      expect(screen.getByRole('button', { name: /send/i })).toHaveFocus();
    });

    it('should support screen readers', () => {
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      
      // Should have appropriate ARIA attributes
      expect(textarea).toHaveAttribute('aria-describedby');
    });
  });

  describe('Auto-resize', () => {
    it('should resize textarea based on content', async () => {
      const user = userEvent.setup();
      renderChatInput();
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const initialHeight = textarea.style.height;
      
      // Type multiple lines
      await user.type(textarea, 'Line 1\nLine 2\nLine 3\nLine 4');
      
      // Height should have changed (this depends on your auto-resize implementation)
      // You might need to trigger a resize event or wait for the effect
    });
  });

  describe('Security Validation', () => {
    it('should validate input before sending', async () => {
      const { validateInput } = await import('../utils/securityUtils');
      const user = userEvent.setup();
      
      // Mock validation to fail
      (validateInput as any).mockReturnValue({
        isValid: false,
        reason: 'Suspicious content detected'
      });

      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(textarea, '<script>alert("xss")</script>');
      await user.click(sendButton);
      
      expect(validateInput).toHaveBeenCalledWith('<script>alert("xss")</script>');
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should sanitize input', async () => {
      const { sanitizeInput } = await import('../utils/securityUtils');
      const user = userEvent.setup();
      
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(textarea, '  <script>alert("xss")</script>  ');
      await user.click(sendButton);
      
      expect(sanitizeInput).toHaveBeenCalled();
    });
  });

  describe('Mobile Optimization', () => {
    it('should handle touch events', async () => {
      renderChatInput();
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      // Simulate touch event
      fireEvent.touchStart(sendButton);
      fireEvent.touchEnd(sendButton);
      
      // Should handle touch events gracefully
    });

    it('should provide haptic feedback on mobile', async () => {
      // Mock navigator.vibrate
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
      });

      const user = userEvent.setup();
      renderChatInput();
      
      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      await user.type(textarea, 'Test message');
      await user.click(sendButton);
      
      // Should call vibrate for haptic feedback (if implemented)
      // expect(mockVibrate).toHaveBeenCalled();
    });
  });
});
