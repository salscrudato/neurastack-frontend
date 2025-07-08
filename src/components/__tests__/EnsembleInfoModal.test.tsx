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
      score: 0.70,
      level: 'high',
      factors: ['Response generated successfully', 'Well-structured response']
    },
    qualityScore: 0.95,
    metadata: {
      basedOnResponses: 3,
      averageConfidence: 0.42,
      consensusLevel: 'medium'
    }
  },
  voting: {
    winner: 'gemini',
    consensus: 'moderate',
    confidence: 0.65,
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
    processingTimeMs: 4520,
    averageConfidence: 0.42,
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
      confidence: 0.70,
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
      confidence: 0.70,
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
      confidence: 0.90,
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

    expect(screen.getByText('AI Intelligence Analysis')).toBeInTheDocument();
    expect(screen.getByText('Multi-model synthesis performance')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={false}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.queryByText('AI Intelligence Analysis')).not.toBeInTheDocument();
  });

  it('displays model performance section correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('Model Performance')).toBeInTheDocument();
    expect(screen.getByText('Quality Analysis')).toBeInTheDocument();
  });

  it('displays confidence analysis correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('AI Intelligence Analysis')).toBeInTheDocument();

    // Should display confidence and agreement labels
    expect(screen.getByText('Confidence')).toBeInTheDocument();
    expect(screen.getByText('Agreement')).toBeInTheDocument();

    // Should display percentage values (any percentage format)
    const percentageElements = screen.getAllByText(/%$/);
    expect(percentageElements.length).toBeGreaterThan(0);
  });

  it('displays voting analysis correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('AI Intelligence Analysis')).toBeInTheDocument();

    // Should display winning model (any model name in uppercase)
    expect(screen.getByText('GEMINI')).toBeInTheDocument();

    // Should display voting section
    expect(screen.getByText('Model Voting Weights')).toBeInTheDocument();

    // Component should render without errors
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays performance metrics correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('AI Intelligence Analysis')).toBeInTheDocument();

    // Should display processing time (any time format ending with 's')
    const timeElements = screen.getAllByText(/\d+s$/);
    expect(timeElements.length).toBeGreaterThan(0);

    // Should display success rate label
    expect(screen.getByText('Success Rate')).toBeInTheDocument();

    // Note: Cost information is excluded per user preferences
  });

  it('displays model information correctly', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    expect(screen.getByText('AI Intelligence Analysis')).toBeInTheDocument();

    // Should display model names (any model names from the voting weights)
    expect(screen.getByText('GPT4O')).toBeInTheDocument();
    expect(screen.getByText('GEMINI')).toBeInTheDocument();
    expect(screen.getByText('CLAUDE')).toBeInTheDocument();

    // Should display voting weights section
    expect(screen.getByText('Model Voting Weights')).toBeInTheDocument();
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

    expect(screen.getByText('AI Intelligence Analysis')).toBeInTheDocument();
    // Should not crash with empty data
  });

  it('displays all required sections', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    // Check for main sections
    expect(screen.getByText('AI Intelligence Analysis')).toBeInTheDocument();
    expect(screen.getByText('Multi-model synthesis performance')).toBeInTheDocument();

    // Check for metric labels
    expect(screen.getByText('Confidence')).toBeInTheDocument();
    expect(screen.getByText('Agreement')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
  });

  it('displays progress indicators', () => {
    renderWithChakra(
      <EnsembleInfoModal
        isOpen={true}
        onClose={mockOnClose}
        ensembleData={mockEnsembleData}
      />
    );

    // Should have progress bars for various metrics
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });
});
