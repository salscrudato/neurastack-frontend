import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { neuraStackClient } from '../../../lib/neurastack-client';
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

describe('WorkoutGenerator Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (neuraStackClient.healthCheck as any).mockResolvedValue({ status: 'healthy' });
  });

  it('should handle 503 Service Unavailable error with retry logic', async () => {
    // Mock 503 error
    const error503 = new Error('Workout generation service temporarily unavailable');
    (error503 as any).statusCode = 503;

    (neuraStackClient.generateWorkout as any)
      .mockRejectedValueOnce(error503)
      .mockRejectedValueOnce(error503)
      .mockResolvedValueOnce({
        status: 'success',
        data: {
          workout: {
            exercises: [
              { name: 'Push-ups', sets: 3, reps: 10 }
            ]
          },
          metadata: { aiModel: 'test-model' }
        },
        correlationId: 'test-correlation-id'
      });

    renderWithChakra(<WorkoutGenerator onWorkoutComplete={vi.fn()} onBack={vi.fn()} />);

    // Click generate workout button
    const generateButton = screen.getByText(/generate workout/i);
    fireEvent.click(generateButton);

    // Should show retry status
    await waitFor(() => {
      expect(screen.getByText(/retrying workout generation/i)).toBeInTheDocument();
    });

    // Should eventually succeed after retries
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Workout Generated!',
          status: 'success',
        })
      );
    }, { timeout: 10000 });

    // Should have called generateWorkout 3 times (initial + 2 retries)
    expect(neuraStackClient.generateWorkout).toHaveBeenCalledTimes(3);
  });

  it('should show service status indicator when service is degraded', async () => {
    // Mock degraded health check
    (neuraStackClient.healthCheck as any).mockResolvedValue({ status: 'degraded' });

    renderWithChakra(<WorkoutGenerator onWorkoutComplete={vi.fn()} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/workout service experiencing issues/i)).toBeInTheDocument();
    });
  });

  it('should fall back to backup workout when all retries fail', async () => {
    // Mock persistent 503 error
    const error503 = new Error('Workout generation service temporarily unavailable');
    (error503 as any).statusCode = 503;

    (neuraStackClient.generateWorkout as any).mockRejectedValue(error503);

    renderWithChakra(<WorkoutGenerator onWorkoutComplete={vi.fn()} onBack={vi.fn()} />);

    // Click generate workout button
    const generateButton = screen.getByText(/generate workout/i);
    fireEvent.click(generateButton);

    // Should eventually show fallback workout toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Backup Workout Generated',
          status: 'warning',
          description: expect.stringContaining('AI service temporarily unavailable'),
        })
      );
    }, { timeout: 15000 });

    // Should have attempted max retries
    expect(neuraStackClient.generateWorkout).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('should handle network errors appropriately', async () => {
    // Mock network error
    const networkError = new Error('Failed to connect to NeuraStack API');
    (neuraStackClient.generateWorkout as any).mockRejectedValue(networkError);

    renderWithChakra(<WorkoutGenerator onWorkoutComplete={vi.fn()} onBack={vi.fn()} />);

    // Click generate workout button
    const generateButton = screen.getByText(/generate workout/i);
    fireEvent.click(generateButton);

    // Should show network error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Connection Error',
          status: 'error',
          description: expect.stringContaining('check your internet connection'),
        })
      );
    });
  });

  it('should handle timeout errors with appropriate messaging', async () => {
    // Mock timeout error
    const timeoutError = new Error('Request timed out');
    (neuraStackClient.generateWorkout as any).mockRejectedValue(timeoutError);

    renderWithChakra(<WorkoutGenerator onWorkoutComplete={vi.fn()} onBack={vi.fn()} />);

    // Click generate workout button
    const generateButton = screen.getByText(/generate workout/i);
    fireEvent.click(generateButton);

    // Should show timeout error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Request Timeout',
          status: 'error',
          description: expect.stringContaining('timed out'),
        })
      );
    });
  });
});
