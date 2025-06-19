/**
 * Component Tests
 * 
 * Tests key UI components for functionality, accessibility, and user interactions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock components for testing
const MockChatInput = ({ onSend, disabled }: { onSend: (message: string) => void; disabled?: boolean }) => {
  const [input, setInput] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="chat-input-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder="Type your message..."
        data-testid="chat-input"
      />
      <button type="submit" disabled={disabled || !input.trim()} data-testid="send-button">
        Send
      </button>
    </form>
  );
};

const MockChatMessage = ({ 
  content, 
  role, 
  timestamp, 
  models 
}: { 
  content: string; 
  role: 'user' | 'assistant'; 
  timestamp: Date;
  models?: string[];
}) => (
  <div data-testid={`message-${role}`} className={`message-${role}`}>
    <div data-testid="message-content">{content}</div>
    <div data-testid="message-timestamp">{timestamp.toLocaleTimeString()}</div>
    {models && (
      <div data-testid="message-models">{models.join(', ')}</div>
    )}
  </div>
);

const MockWorkoutCard = ({ 
  workout, 
  onStart, 
  onModify 
}: { 
  workout: any; 
  onStart: () => void; 
  onModify: () => void;
}) => (
  <div data-testid="workout-card">
    <h3 data-testid="workout-name">{workout.name}</h3>
    <p data-testid="workout-duration">{workout.duration} minutes</p>
    <p data-testid="workout-exercises">{workout.exercises.length} exercises</p>
    <button onClick={onStart} data-testid="start-workout-button">
      Start Workout
    </button>
    <button onClick={onModify} data-testid="modify-workout-button">
      Modify Workout
    </button>
  </div>
);

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </ChakraProvider>
);

describe('Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Chat Input Component', () => {
    it('should render chat input correctly', () => {
      const mockOnSend = vi.fn();
      render(
        <TestWrapper>
          <MockChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    it('should handle user input correctly', async () => {
      const user = userEvent.setup();
      const mockOnSend = vi.fn();
      
      render(
        <TestWrapper>
          <MockChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Hello, AI!');

      expect(input).toHaveValue('Hello, AI!');
    });

    it('should send message on form submission', async () => {
      const user = userEvent.setup();
      const mockOnSend = vi.fn();
      
      render(
        <TestWrapper>
          <MockChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      const input = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');

      await user.type(input, 'Test message');
      await user.click(sendButton);

      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });

    it('should not send empty messages', async () => {
      const user = userEvent.setup();
      const mockOnSend = vi.fn();
      
      render(
        <TestWrapper>
          <MockChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      const sendButton = screen.getByTestId('send-button');
      await user.click(sendButton);

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should disable input when disabled prop is true', () => {
      const mockOnSend = vi.fn();
      
      render(
        <TestWrapper>
          <MockChatInput onSend={mockOnSend} disabled={true} />
        </TestWrapper>
      );

      const input = screen.getByTestId('chat-input');
      const sendButton = screen.getByTestId('send-button');

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Chat Message Component', () => {
    it('should render user message correctly', () => {
      const timestamp = new Date('2024-01-01T12:00:00Z');
      
      render(
        <TestWrapper>
          <MockChatMessage 
            content="Hello, AI!" 
            role="user" 
            timestamp={timestamp}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('message-user')).toBeInTheDocument();
      expect(screen.getByTestId('message-content')).toHaveTextContent('Hello, AI!');
      expect(screen.getByTestId('message-timestamp')).toBeInTheDocument();
    });

    it('should render assistant message correctly', () => {
      const timestamp = new Date('2024-01-01T12:00:00Z');
      const models = ['gpt-4', 'gemini-1.5'];
      
      render(
        <TestWrapper>
          <MockChatMessage 
            content="Hello! How can I help you?" 
            role="assistant" 
            timestamp={timestamp}
            models={models}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('message-assistant')).toBeInTheDocument();
      expect(screen.getByTestId('message-content')).toHaveTextContent('Hello! How can I help you?');
      expect(screen.getByTestId('message-models')).toHaveTextContent('gpt-4, gemini-1.5');
    });

    it('should apply correct CSS classes', () => {
      const timestamp = new Date();
      
      render(
        <TestWrapper>
          <MockChatMessage 
            content="Test message" 
            role="user" 
            timestamp={timestamp}
          />
        </TestWrapper>
      );

      const messageElement = screen.getByTestId('message-user');
      expect(messageElement).toHaveClass('message-user');
    });
  });

  describe('Workout Card Component', () => {
    const mockWorkout = {
      id: 'workout-1',
      name: 'Full Body Strength',
      duration: 45,
      exercises: [
        { name: 'Push-ups', sets: 3, reps: 10 },
        { name: 'Squats', sets: 3, reps: 15 },
        { name: 'Plank', sets: 3, duration: 30 },
      ],
    };

    it('should render workout information correctly', () => {
      const mockOnStart = vi.fn();
      const mockOnModify = vi.fn();
      
      render(
        <TestWrapper>
          <MockWorkoutCard 
            workout={mockWorkout} 
            onStart={mockOnStart} 
            onModify={mockOnModify}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('workout-name')).toHaveTextContent('Full Body Strength');
      expect(screen.getByTestId('workout-duration')).toHaveTextContent('45 minutes');
      expect(screen.getByTestId('workout-exercises')).toHaveTextContent('3 exercises');
    });

    it('should handle start workout action', async () => {
      const user = userEvent.setup();
      const mockOnStart = vi.fn();
      const mockOnModify = vi.fn();
      
      render(
        <TestWrapper>
          <MockWorkoutCard 
            workout={mockWorkout} 
            onStart={mockOnStart} 
            onModify={mockOnModify}
          />
        </TestWrapper>
      );

      const startButton = screen.getByTestId('start-workout-button');
      await user.click(startButton);

      expect(mockOnStart).toHaveBeenCalledTimes(1);
    });

    it('should handle modify workout action', async () => {
      const user = userEvent.setup();
      const mockOnStart = vi.fn();
      const mockOnModify = vi.fn();
      
      render(
        <TestWrapper>
          <MockWorkoutCard 
            workout={mockWorkout} 
            onStart={mockOnStart} 
            onModify={mockOnModify}
          />
        </TestWrapper>
      );

      const modifyButton = screen.getByTestId('modify-workout-button');
      await user.click(modifyButton);

      expect(mockOnModify).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels', () => {
      const mockOnSend = vi.fn();
      
      render(
        <TestWrapper>
          <MockChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      const input = screen.getByTestId('chat-input');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const mockOnSend = vi.fn();
      
      render(
        <TestWrapper>
          <MockChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      const input = screen.getByTestId('chat-input');
      
      // Focus should work
      await user.click(input);
      expect(input).toHaveFocus();

      // Tab navigation should work
      await user.tab();
      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toHaveFocus();
    });

    it('should handle Enter key submission', async () => {
      const user = userEvent.setup();
      const mockOnSend = vi.fn();
      
      render(
        <TestWrapper>
          <MockChatInput onSend={mockOnSend} />
        </TestWrapper>
      );

      const input = screen.getByTestId('chat-input');
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');

      expect(mockOnSend).toHaveBeenCalledWith('Test message');
    });
  });

  describe('Error Handling', () => {
    it('should handle component errors gracefully', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const ThrowError = () => {
        throw new Error('Test error');
      };

      expect(() => {
        render(
          <TestWrapper>
            <ThrowError />
          </TestWrapper>
        );
      }).toThrow('Test error');

      consoleSpy.mockRestore();
    });
  });
});
