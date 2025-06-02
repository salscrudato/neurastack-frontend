import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Dashboard from '../../../components/NeuraFit/Dashboard';
import { useFitnessStore } from '../../../store/useFitnessStore';

// Mock the fitness store
vi.mock('../../../store/useFitnessStore');

const mockUseFitnessStore = useFitnessStore as any;

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('Dashboard Component', () => {
  const mockOnStartWorkout = vi.fn();
  const mockOnEditProfile = vi.fn();
  const mockOnViewProgress = vi.fn();

  const mockProfile = {
    fitnessLevel: 'beginner' as const,
    goals: ['weight_loss', 'muscle_gain'],
    equipment: ['bodyweight', 'dumbbells'],
    availableTime: 30,
    workoutDays: ['monday', 'wednesday', 'friday'],
    timeAvailability: {
      daysPerWeek: 3,
      minutesPerSession: 30,
    },
    completedOnboarding: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFitnessStore.mockReturnValue({
      profile: mockProfile,
    });
  });

  it('renders dashboard with user profile information', () => {
    renderWithChakra(
      <Dashboard
        onStartWorkout={mockOnStartWorkout}
        onEditProfile={mockOnEditProfile}
        onViewProgress={mockOnViewProgress}
      />
    );

    expect(screen.getByText('neurafit')).toBeInTheDocument();
    expect(screen.getByText('Generate AI Workout')).toBeInTheDocument();
    expect(screen.getByText('View Progress')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  it('displays fitness level correctly', () => {
    renderWithChakra(
      <Dashboard
        onStartWorkout={mockOnStartWorkout}
        onEditProfile={mockOnEditProfile}
        onViewProgress={mockOnViewProgress}
      />
    );

    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('displays goals correctly', () => {
    renderWithChakra(
      <Dashboard
        onStartWorkout={mockOnStartWorkout}
        onEditProfile={mockOnEditProfile}
        onViewProgress={mockOnViewProgress}
      />
    );

    expect(screen.getByText(/weight_loss/)).toBeInTheDocument();
    expect(screen.getByText(/muscle_gain/)).toBeInTheDocument();
  });

  it('calls onStartWorkout when Generate AI Workout button is clicked', () => {
    renderWithChakra(
      <Dashboard
        onStartWorkout={mockOnStartWorkout}
        onEditProfile={mockOnEditProfile}
        onViewProgress={mockOnViewProgress}
      />
    );

    const startWorkoutButton = screen.getByText('Generate AI Workout');
    fireEvent.click(startWorkoutButton);

    expect(mockOnStartWorkout).toHaveBeenCalledTimes(1);
  });

  it('calls onViewProgress when View Progress button is clicked', () => {
    renderWithChakra(
      <Dashboard
        onStartWorkout={mockOnStartWorkout}
        onEditProfile={mockOnEditProfile}
        onViewProgress={mockOnViewProgress}
      />
    );

    const viewProgressButton = screen.getByText('View Progress');
    fireEvent.click(viewProgressButton);

    expect(mockOnViewProgress).toHaveBeenCalledTimes(1);
  });

  it('calls onEditProfile when Edit Profile button is clicked', () => {
    renderWithChakra(
      <Dashboard
        onStartWorkout={mockOnStartWorkout}
        onEditProfile={mockOnEditProfile}
        onViewProgress={mockOnViewProgress}
      />
    );

    const editProfileButton = screen.getByText('Edit Profile');
    fireEvent.click(editProfileButton);

    expect(mockOnEditProfile).toHaveBeenCalledTimes(1);
  });

  it('displays workout schedule information', () => {
    renderWithChakra(
      <Dashboard
        onStartWorkout={mockOnStartWorkout}
        onEditProfile={mockOnEditProfile}
        onViewProgress={mockOnViewProgress}
      />
    );

    expect(screen.getByText(/3 days per week/)).toBeInTheDocument();
    expect(screen.getByText(/30 minutes per session/)).toBeInTheDocument();
  });

  it('handles empty goals gracefully', () => {
    mockUseFitnessStore.mockReturnValue({
      profile: {
        ...mockProfile,
        goals: [],
      },
    });

    renderWithChakra(
      <Dashboard
        onStartWorkout={mockOnStartWorkout}
        onEditProfile={mockOnEditProfile}
        onViewProgress={mockOnViewProgress}
      />
    );

    expect(screen.getByText('neurafit')).toBeInTheDocument();
  });

  it('handles empty equipment list gracefully', () => {
    mockUseFitnessStore.mockReturnValue({
      profile: {
        ...mockProfile,
        equipment: [],
      },
    });

    renderWithChakra(
      <Dashboard
        onStartWorkout={mockOnStartWorkout}
        onEditProfile={mockOnEditProfile}
        onViewProgress={mockOnViewProgress}
      />
    );

    expect(screen.getByText('neurafit')).toBeInTheDocument();
  });
});
