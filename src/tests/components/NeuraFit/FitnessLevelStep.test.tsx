import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useFitnessStore } from '../../../store/useFitnessStore';
import FitnessLevelStep from '../../../components/NeuraFit/FitnessLevelStep';
import { trackFitnessLevelSelection } from '../../../services/fitnessDataService';
import theme from '../../../theme/theme';

// Mock the hooks
vi.mock('../../../hooks/useAccessibility', () => ({
  useReducedMotion: () => false,
}));

// Mock Firebase auth
vi.mock('../../../firebase', () => ({
  auth: {
    currentUser: null
  }
}));

// Mock the Firestore service
vi.mock('../../../services/fitnessDataService', () => ({
  saveFitnessProfile: vi.fn().mockResolvedValue(undefined),
  loadFitnessProfile: vi.fn().mockResolvedValue(null),
  updateFitnessLevel: vi.fn().mockResolvedValue(undefined),
  saveWorkoutPlan: vi.fn().mockResolvedValue(undefined),
  loadWorkoutPlans: vi.fn().mockResolvedValue([]),
  subscribeFitnessProfile: vi.fn().mockReturnValue(() => {}),
  trackFitnessLevelSelection: vi.fn()
}));

// Mock console.log for analytics tracking
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider theme={theme}>
    {children}
  </ChakraProvider>
);

describe('FitnessLevelStep', () => {
  const mockOnNext = vi.fn();

  beforeEach(() => {
    // Reset store state before each test
    const store = useFitnessStore.getState();
    store.resetOnboarding();

    // Clear mocks
    mockOnNext.mockClear();
    mockConsoleLog.mockClear();
    vi.mocked(trackFitnessLevelSelection).mockClear();
  });

  it('renders correctly with all fitness levels', () => {
    render(
      <TestWrapper>
        <FitnessLevelStep onNext={mockOnNext} />
      </TestWrapper>
    );

    // Check heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("What's your current fitness level?");
    
    // Check description
    expect(screen.getByText('Select the option that best describes you.')).toBeInTheDocument();
    
    // Check all fitness level options
    expect(screen.getByRole('radio', { name: /beginner/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /intermediate/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /advanced/i })).toBeInTheDocument();
    
    // Check descriptions
    expect(screen.getByText('New to fitness or returning after a break')).toBeInTheDocument();
    expect(screen.getByText('Have a regular workout routine')).toBeInTheDocument();
    expect(screen.getByText('Athlete or fitness enthusiast')).toBeInTheDocument();

    // Check React icons are present (they render as SVG elements)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0); // Should have React icons rendered as SVGs
  });

  it('handles beginner level selection correctly', async () => {
    render(
      <TestWrapper>
        <FitnessLevelStep onNext={mockOnNext} />
      </TestWrapper>
    );

    const beginnerButton = screen.getByRole('radio', { name: /beginner/i });
    fireEvent.click(beginnerButton);

    // Check that the store was updated
    await waitFor(() => {
      const state = useFitnessStore.getState();
      expect(state.profile.fitnessLevel).toBe('beginner');
      expect(state.profile.fitnessLevelCode).toBe('B');
    });

    // Check that onNext is called after delay and analytics tracking happens
    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalled();
      expect(vi.mocked(trackFitnessLevelSelection)).toHaveBeenCalledWith(
        'beginner',
        'B',
        expect.any(Number) // completion time
      );
    }, { timeout: 1000 });
  });

  it('handles intermediate level selection correctly', async () => {
    render(
      <TestWrapper>
        <FitnessLevelStep onNext={mockOnNext} />
      </TestWrapper>
    );

    const intermediateButton = screen.getByRole('radio', { name: /intermediate/i });
    fireEvent.click(intermediateButton);

    await waitFor(() => {
      const state = useFitnessStore.getState();
      expect(state.profile.fitnessLevel).toBe('intermediate');
      expect(state.profile.fitnessLevelCode).toBe('I');
    });

    await waitFor(() => {
      expect(vi.mocked(trackFitnessLevelSelection)).toHaveBeenCalledWith(
        'intermediate',
        'I',
        expect.any(Number)
      );
    }, { timeout: 1000 });
  });

  it('handles advanced level selection correctly', async () => {
    render(
      <TestWrapper>
        <FitnessLevelStep onNext={mockOnNext} />
      </TestWrapper>
    );

    const advancedButton = screen.getByRole('radio', { name: /advanced/i });
    fireEvent.click(advancedButton);

    await waitFor(() => {
      const state = useFitnessStore.getState();
      expect(state.profile.fitnessLevel).toBe('advanced');
      expect(state.profile.fitnessLevelCode).toBe('A');
    });

    await waitFor(() => {
      expect(vi.mocked(trackFitnessLevelSelection)).toHaveBeenCalledWith(
        'advanced',
        'A',
        expect.any(Number)
      );
    }, { timeout: 1000 });
  });

  it('shows selected state correctly', () => {
    // Pre-select intermediate level
    const store = useFitnessStore.getState();
    store.updateFitnessLevel('intermediate', 'I');

    render(
      <TestWrapper>
        <FitnessLevelStep onNext={mockOnNext} />
      </TestWrapper>
    );

    const intermediateButton = screen.getByRole('radio', { name: /intermediate/i });
    expect(intermediateButton).toHaveAttribute('aria-checked', 'true');
    
    const beginnerButton = screen.getByRole('radio', { name: /beginner/i });
    expect(beginnerButton).toHaveAttribute('aria-checked', 'false');
    
    const advancedButton = screen.getByRole('radio', { name: /advanced/i });
    expect(advancedButton).toHaveAttribute('aria-checked', 'false');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <FitnessLevelStep onNext={mockOnNext} />
      </TestWrapper>
    );

    // Check radiogroup
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('aria-labelledby', 'fitness-level-heading');
    expect(radioGroup).toHaveAttribute('aria-describedby', 'fitness-level-description');

    // Check individual radio buttons
    const buttons = screen.getAllByRole('radio');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-describedby');
    });
  });

  it('supports keyboard navigation', () => {
    render(
      <TestWrapper>
        <FitnessLevelStep onNext={mockOnNext} />
      </TestWrapper>
    );

    const radioGroup = screen.getByRole('radiogroup');
    
    // Test arrow down navigation
    fireEvent.keyDown(radioGroup, { key: 'ArrowDown' });
    // First button should be focused (implementation detail)
    
    // Test enter key selection
    fireEvent.keyDown(radioGroup, { key: 'Enter' });
    
    // Test escape key
    fireEvent.keyDown(radioGroup, { key: 'Escape' });
  });

  it('handles performance tracking', async () => {
    // Mock performance.now
    const mockPerformanceNow = vi.spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(150);

    render(
      <TestWrapper>
        <FitnessLevelStep onNext={mockOnNext} />
      </TestWrapper>
    );

    const beginnerButton = screen.getByRole('radio', { name: /beginner/i });
    fireEvent.click(beginnerButton);

    await waitFor(() => {
      // Check that performance tracking console.log was called
      const performanceCalls = mockConsoleLog.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0].includes('Fitness level selection completed in')
      );
      expect(performanceCalls.length).toBeGreaterThan(0);
    }, { timeout: 1000 });

    mockPerformanceNow.mockRestore();
  });
});
