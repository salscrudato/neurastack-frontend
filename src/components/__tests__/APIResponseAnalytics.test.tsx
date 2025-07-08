/**
 * APIResponseAnalytics Component Tests
 */

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { APIResponseAnalytics } from '../APIResponseAnalytics';

// Mock metadata for testing
const mockMetadata = {
  processingTimeMs: 2500,
  totalRoles: 3,
  successfulRoles: 3,
  failedRoles: 0,
  confidenceAnalysis: {
    overallConfidence: 0.85,
    modelAgreement: 0.75,
    responseConsistency: 0.80,
    qualityDistribution: {
      high: 2,
      medium: 1,
      low: 0
    }
  },
  costEstimate: {
    totalCost: 0.0025,
    totalTokens: 1250
  },
  synthesis: {
    synthesisStrategy: 'consensus'
  },
  voting: {
    winner: 'gpt4o',
    confidence: 0.85,
    margin: 0.15
  }
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('APIResponseAnalytics', () => {
  it('renders without crashing', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} />
    );
  });

  it('displays processing time correctly', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} />
    );
    
    expect(screen.getByText('2.5s')).toBeInTheDocument();
    expect(screen.getByText('RESPONSE TIME')).toBeInTheDocument();
  });

  it('displays success rate correctly', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} />
    );
    
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('SUCCESS RATE')).toBeInTheDocument();
  });

  it('displays confidence metrics correctly', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} />
    );
    
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('CONFIDENCE')).toBeInTheDocument();
  });

  it('displays cost information correctly', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} />
    );
    
    expect(screen.getByText('$0.0025')).toBeInTheDocument();
    expect(screen.getByText('COST')).toBeInTheDocument();
  });

  it('displays synthesis strategy badge', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} compact={false} />
    );
    
    expect(screen.getByText('Strategy: CONSENSUS')).toBeInTheDocument();
  });

  it('displays voting winner badge', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} compact={false} />
    );
    
    expect(screen.getByText('Winner: GPT4O')).toBeInTheDocument();
  });

  it('handles compact mode correctly', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} compact={true} />
    );
    
    // In compact mode, badges should not be displayed
    expect(screen.queryByText('Strategy: CONSENSUS')).not.toBeInTheDocument();
  });

  it('handles missing metadata gracefully', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={null} />
    );
    
    // Component should not render anything when metadata is null
    expect(screen.queryByText('RESPONSE TIME')).not.toBeInTheDocument();
  });

  it('handles mobile visibility correctly', () => {
    const { container } = renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} showOnMobile={false} />
    );
    
    // Should have display: none on mobile when showOnMobile is false
    const analyticsContainer = container.firstChild;
    expect(analyticsContainer).toHaveStyle({ display: 'none' });
  });

  it('formats time correctly for milliseconds', () => {
    const fastMetadata = {
      ...mockMetadata,
      processingTimeMs: 750
    };
    
    renderWithChakra(
      <APIResponseAnalytics metadata={fastMetadata} />
    );
    
    expect(screen.getByText('750ms')).toBeInTheDocument();
  });

  it('displays model agreement correctly', () => {
    renderWithChakra(
      <APIResponseAnalytics metadata={mockMetadata} />
    );
    
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('AGREEMENT')).toBeInTheDocument();
  });
});
