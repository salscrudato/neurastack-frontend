/**
 * Test file for EnsembleInfoModal component
 */

import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnsembleInfoModal } from '../EnsembleInfoModal';

// Mock ensemble data matching actual API response structure
const mockEnsembleData = {
  synthesis: {
    content: "Here's a test response from the AI ensemble.",
    model: 'gpt-4.1-mini',
    provider: 'openai',
    status: 'success',
    synthesisStrategy: 'simple',
    overallConfidence: 0.8,
    confidence: {
      score: 0.92,
      level: 'high',
      factors: ['Response generated successfully', 'Well-structured response']
    },
    qualityScore: 0.95,
    metadata: {
      basedOnResponses: 3,
      averageConfidence: 0.75,
      consensusLevel: 'medium'
    }
  },
  voting: {
    winner: 'gemini',
    consensus: 'moderate',
    confidence: 0.43,
    weights: {
      gpt4o: 0.21,
      gemini: 0.43,
      claude: 0.36,
    },
  },
  metadata: {
    totalRoles: 3,
    successfulRoles: 3,
    failedRoles: 0,
    processingTimeMs: 4516,
    averageConfidence: 0.75,
    consensusLevel: 'medium'
  },
  roles: [
    {
      role: 'gpt4o',
      content: 'Test response from GPT-4o',
      provider: 'openai',
      model: 'gpt-4o-mini',
      status: 'fulfilled',
      wordCount: 14,
      characterCount: 105,
      responseTime: 699,
      confidence: {
        score: 0.73,
        level: 'medium',
        factors: ['Response generated successfully', 'Well-structured response'],
      },
      qualityScore: 0.8,
      metadata: {
        confidenceLevel: 'medium',
        modelReliability: 0.8,
        processingTime: 699,
        tokenCount: 27,
        complexity: 'high'
      }
    },
    {
      role: 'gemini',
      content: 'Test response from Gemini',
      provider: 'google',
      model: 'gemini-1.5-flash',
      status: 'fulfilled',
      wordCount: 126,
      characterCount: 580,
      responseTime: 1358,
      confidence: {
        score: 0.83,
        level: 'high',
        factors: ['Response generated successfully', 'Adequate response length'],
      },
      qualityScore: 0.9,
      metadata: {
        confidenceLevel: 'high',
        modelReliability: 0.9,
        processingTime: 1358,
        tokenCount: 145,
        complexity: 'medium'
      }
    },
    {
      role: 'claude',
      content: 'Test response from Claude',
      provider: 'anthropic',
      model: 'claude-3-5-haiku-latest',
      status: 'fulfilled',
      wordCount: 15,
      responseTime: 1925,
      confidence: {
        score: 0.76,
        level: 'medium',
        factors: ['Response generated successfully'],
      },
    },
  ],
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('EnsembleInfoModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when open', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('AI Ensemble Information')).toBeInTheDocument();
    expect(screen.getByText('Detailed insights into the ensemble approach and model collaboration')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={false}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.queryByText('AI Ensemble Information')).not.toBeInTheDocument();
  });

  it('displays synthesis overview correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('Synthesis Overview')).toBeInTheDocument();
    expect(screen.getByText('Simple')).toBeInTheDocument();
    expect(screen.getByText('SUCCESS')).toBeInTheDocument();
  });

  it('displays confidence analysis correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('Confidence Analysis')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument(); // Overall confidence
    expect(screen.getByText('42%')).toBeInTheDocument(); // Model agreement
  });

  it('displays voting analysis correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('Voting Analysis')).toBeInTheDocument();
    expect(screen.getByText('GEMINI')).toBeInTheDocument();
    expect(screen.getByText('Moderate Consensus')).toBeInTheDocument();
  });

  it('displays performance metrics correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('4.52s')).toBeInTheDocument(); // Processing time
    expect(screen.getByText('3/3')).toBeInTheDocument(); // Success rate
    expect(screen.getByText('$0.000198')).toBeInTheDocument(); // Cost estimate
  });

  it('displays model information correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('Model Information')).toBeInTheDocument();
    expect(screen.getByText('OPENAI - GPT-4O-MINI')).toBeInTheDocument();
    expect(screen.getByText('GEMINI - GEMINI-1.5-FLASH')).toBeInTheDocument();
    expect(screen.getByText('CLAUDE - CLAUDE-3-5-HAIKU-LATEST')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles missing data gracefully', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={{}}
      />
    );

    expect(screen.getByText('AI Ensemble Information')).toBeInTheDocument();
    // Should not crash with empty data
  });
});
