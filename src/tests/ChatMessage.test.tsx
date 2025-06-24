/**
 * Test file for ChatMessage component with ensemble response display
 */

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { describe, it, expect } from 'vitest';
import ChatMessage from '../components/ChatMessage';
import type { Message } from '../store/useChatStore';

// Mock ensemble response data matching the API structure
const mockEnsembleMessage: Message = {
  id: 'test-message-1',
  role: 'assistant',
  text: 'Here are some jokes to brighten your day!',
  timestamp: Date.now(),
  metadata: {
    models: ['gpt-4o', 'gemini-2.0-flash', 'claude-3-5-haiku-latest'],
    responseTime: 6488,
    retryCount: 0,
    executionTime: '6488ms',
    ensembleMode: true,
    modelsUsed: {
      'gpt-4o': true,
      'gemini-2.0-flash': true,
      'claude-3-5-haiku-latest': true
    },
    individualResponses: [
      {
        model: 'gpt-4o-mini',
        content: 'Why did the scarecrow win an award? Because he was outstanding in his field!',
        role: 'gpt4o',
        provider: 'openai',
        status: 'fulfilled',
        confidence: {
          score: 0.7,
          level: 'medium',
          factors: ['Response generated successfully', 'Well-structured response']
        },
        responseTime: 1102,
        wordCount: 19,
        characterCount: 121
      },
      {
        model: 'gemini-2.0-flash',
        content: 'Why don\'t scientists trust atoms? Because they make up everything!',
        role: 'gemini',
        provider: 'gemini',
        status: 'fulfilled',
        confidence: {
          score: 0.7,
          level: 'medium',
          factors: ['Response generated successfully', 'Well-structured response']
        },
        responseTime: 568,
        wordCount: 9,
        characterCount: 68
      },
      {
        model: 'claude-3-5-haiku-latest',
        content: 'Here\'s a lighthearted joke for you: Why don\'t scientists trust atoms? Because they make up everything!',
        role: 'claude',
        provider: 'claude',
        status: 'fulfilled',
        confidence: {
          score: 0.9,
          level: 'high',
          factors: ['Response generated successfully', 'Adequate response length']
        },
        responseTime: 3265,
        wordCount: 48,
        characterCount: 283
      }
    ],
    metadata: {
      synthesis: {
        provider: 'openai',
        model: 'gpt-4o'
      },
      confidenceAnalysis: {
        overallConfidence: 0.8366666666666666,
        responseConsistency: 0.6621032031025568
      },
      totalRoles: 3,
      successfulRoles: 3,
      failedRoles: 0
    }
  }
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('ChatMessage Ensemble Response Display', () => {
  it('displays provider information in the header', () => {
    renderWithChakra(<ChatMessage message={mockEnsembleMessage} />);
    
    // Should show the provider from synthesis
    expect(screen.getByText('OPENAI')).toBeInTheDocument();
    expect(screen.getByText('GPT-4O')).toBeInTheDocument();
  });

  it('displays confidence metrics correctly', () => {
    renderWithChakra(<ChatMessage message={mockEnsembleMessage} />);
    
    // Should show overall confidence rounded to nearest percent
    expect(screen.getByText('84%')).toBeInTheDocument();
    expect(screen.getByText('Confidence:')).toBeInTheDocument();
    
    // Should show response consistency rounded to nearest percent
    expect(screen.getByText('66%')).toBeInTheDocument();
    expect(screen.getByText('Consistency:')).toBeInTheDocument();
  });

  it('displays individual model responses', () => {
    renderWithChakra(<ChatMessage message={mockEnsembleMessage} />);
    
    // Should show model cards with provider-model format
    expect(screen.getByText(/OPENAI - GPT 4O Mini/i)).toBeInTheDocument();
    expect(screen.getByText(/GEMINI - Gemini 2.0 Flash/i)).toBeInTheDocument();
    expect(screen.getByText(/CLAUDE - Claude 3 5 Haiku Latest/i)).toBeInTheDocument();
  });

  it('handles user messages without ensemble data', () => {
    const userMessage: Message = {
      id: 'user-message-1',
      role: 'user',
      text: 'Tell me a joke',
      timestamp: Date.now()
    };

    renderWithChakra(<ChatMessage message={userMessage} />);
    
    // Should not show confidence header for user messages
    expect(screen.queryByText('Confidence:')).not.toBeInTheDocument();
    expect(screen.queryByText('OPENAI')).not.toBeInTheDocument();
    
    // Should show the user message text
    expect(screen.getByText('Tell me a joke')).toBeInTheDocument();
  });

  it('handles messages without confidence data gracefully', () => {
    const messageWithoutConfidence: Message = {
      ...mockEnsembleMessage,
      metadata: {
        ...mockEnsembleMessage.metadata!,
        metadata: {
          synthesis: {
            provider: 'openai',
            model: 'gpt-4o'
          }
          // No confidenceAnalysis
        }
      }
    };

    renderWithChakra(<ChatMessage message={messageWithoutConfidence} />);
    
    // Should still show provider info
    expect(screen.getByText('OPENAI')).toBeInTheDocument();
    
    // Should not show confidence metrics
    expect(screen.queryByText('Confidence:')).not.toBeInTheDocument();
    expect(screen.queryByText('Consistency:')).not.toBeInTheDocument();
  });
});
