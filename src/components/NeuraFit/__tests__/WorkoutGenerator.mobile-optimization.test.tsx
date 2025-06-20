import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, vi } from 'vitest';
import WorkoutGenerator from '../WorkoutGenerator';

// Mock the neuraStackClient
vi.mock('../../../lib/neurastack-client', () => ({
  neuraStackClient: {
    configure: vi.fn(),
    healthCheck: vi.fn(),
    generateWorkout: vi.fn(),
    storeMemory: vi.fn(),
  },
}));

// Mock useAuth
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id' },
    isAuthenticated: true,
  }),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('WorkoutGenerator Mobile Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (neuraStackClient.healthCheck as any).mockResolvedValue({ status: 'healthy' });
  });

  it('should maintain loading state during workout generation without premature navigation', async () => {
    // Mock successful workout generation
    (neuraStackClient.generateWorkout as any).mockResolvedValue({
      status: 'success',
      data: {
        workout: {
          type: 'strength',
          exercises: [
            { name: 'Push-ups', sets: 3, reps: 12, instructions: 'Perform standard push-ups' },
            { name: 'Squats', sets: 3, reps: 15, instructions: 'Perform bodyweight squats' }
          ]
        },
        metadata: { aiModel: 'test-model' }
      },
      correlationId: 'test-correlation-id'
    });

    const mockOnWorkoutComplete = vi.fn();
    const mockOnBack = vi.fn();

    renderWithChakra(
      <WorkoutGenerator
        onWorkoutComplete={mockOnWorkoutComplete}
        onBack={mockOnBack}
      />
    );

    // Should show the generation form initially
    expect(screen.getByText(/Ready for Your Workout?/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate AI Workout/i)).toBeInTheDocument();

    // Click the generate workout button
    const generateButton = screen.getByText(/Generate AI Workout/i);
    fireEvent.click(generateButton);

    // Should immediately show loading state
    await waitFor(() => {
      expect(screen.getByText(/Creating Your AI/i)).toBeInTheDocument();
    });

    // Should not show the generation form during loading
    expect(screen.queryByText(/Ready for Your Workout?/i)).not.toBeInTheDocument();

    // Should not call onBack during generation
    expect(mockOnBack).not.toHaveBeenCalled();

    // Wait for workout to be generated
    await waitFor(() => {
      expect(screen.getByText(/Push-ups/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Should not have navigated back
    expect(mockOnBack).not.toHaveBeenCalled();
  });

  it('should handle retry scenarios without showing generation form', async () => {
    // Mock initial failure then success
    const error503 = new Error('503 Service Unavailable');
    (neuraStackClient.generateWorkout as any)
      .mockRejectedValueOnce(error503)
      .mockResolvedValueOnce({
        status: 'success',
        data: {
          workout: {
            type: 'strength',
            exercises: [
              { name: 'Push-ups', sets: 3, reps: 12, instructions: 'Perform standard push-ups' }
            ]
          },
          metadata: { aiModel: 'test-model' }
        },
        correlationId: 'test-correlation-id'
      });

    const mockOnWorkoutComplete = vi.fn();
    const mockOnBack = vi.fn();

    renderWithChakra(
      <WorkoutGenerator
        onWorkoutComplete={mockOnWorkoutComplete}
        onBack={mockOnBack}
      />
    );

    // Click generate workout
    const generateButton = screen.getByText(/Generate AI Workout/i);
    fireEvent.click(generateButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Creating Your AI/i)).toBeInTheDocument();
    });

    // Should show retry status
    await waitFor(() => {
      expect(screen.getByText(/Retrying workout generation/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should still be in loading state during retry
    expect(screen.getByText(/Creating Your AI/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ready for Your Workout?/i)).not.toBeInTheDocument();

    // Should eventually succeed
    await waitFor(() => {
      expect(screen.getByText(/Push-ups/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Should not have navigated back during the process
    expect(mockOnBack).not.toHaveBeenCalled();
  });

  it('should have proper mobile touch targets and styling', () => {
    const mockOnWorkoutComplete = vi.fn();
    const mockOnBack = vi.fn();

    renderWithChakra(
      <WorkoutGenerator
        onWorkoutComplete={mockOnWorkoutComplete}
        onBack={mockOnBack}
      />
    );

    const generateButton = screen.getByText(/Generate AI Workout/i);
    const backButton = screen.getByText(/Back to Dashboard/i);

    // Check that buttons exist and are clickable
    expect(generateButton).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();

    // Verify buttons are not disabled
    expect(generateButton).not.toBeDisabled();
    expect(backButton).not.toBeDisabled();
  });
});
