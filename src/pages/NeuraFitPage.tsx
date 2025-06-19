import {
    Box,
    useToast,
} from '@chakra-ui/react';
import { lazy, Suspense, useState } from 'react';
import type { WorkoutPlan } from '../lib/types';
import { useFitnessStore } from '../store/useFitnessStore';

// Lazy load NeuraFit components for better performance
const Dashboard = lazy(() => import('../components/NeuraFit/Dashboard'));
const OnboardingWizard = lazy(() => import('../components/NeuraFit/OnboardingWizard'));
const ProgressTracker = lazy(() => import('../components/NeuraFit/ProgressTracker'));
const WorkoutGenerator = lazy(() => import('../components/NeuraFit/WorkoutGenerator'));

// Loading fallback component
const NeuraFitLoading = () => (
  <Box
    h="100vh"
    display="flex"
    alignItems="center"
    justifyContent="center"
    bg="linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)"
  >
    <Box textAlign="center">
      <Box
        w="40px"
        h="40px"
        border="3px solid #e2e8f0"
        borderTop="3px solid #3182ce"
        borderRadius="50%"
        animation="spin 1s linear infinite"
        mx="auto"
        mb={4}
      />
      <Box fontSize="sm" color="gray.600">Loading NeuraFit...</Box>
    </Box>
  </Box>
);

type ViewState = 'dashboard' | 'workout' | 'progress';

export default function NeuraFitPage() {
  const { profile, completeOnboarding, startEditingFromDashboard, finishEditingFromDashboard } = useFitnessStore();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const toast = useToast();

  const handleOnboardingComplete = () => {
    completeOnboarding();
    toast({
      title: 'Welcome to NeuraFit!',
      description: 'Your profile has been set up successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleStartWorkout = () => {
    setCurrentView('workout');
  };

  const handleViewProgress = () => {
    setCurrentView('progress');
  };



  const handleEditSpecificSetting = (step: number) => {
    // Start editing mode and navigate to specific step
    startEditingFromDashboard(step);
    setCurrentView('dashboard');
  };

  const handleFinishEditing = () => {
    // Finish editing and return to dashboard
    finishEditingFromDashboard();
    setCurrentView('dashboard');
    toast({
      title: 'Settings Updated',
      description: 'Your fitness settings have been saved successfully.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleWorkoutComplete = (workout: WorkoutPlan) => {
    setCurrentView('dashboard');
    toast({
      title: 'Workout Complete!',
      description: `Great job completing "${workout.name}"!`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    if (!profile.completedOnboarding || useFitnessStore.getState().isEditingFromDashboard) {
      return (
        <Suspense fallback={<NeuraFitLoading />}>
          <OnboardingWizard onComplete={useFitnessStore.getState().isEditingFromDashboard ? handleFinishEditing : handleOnboardingComplete} />
        </Suspense>
      );
    }

    switch (currentView) {
      case 'workout':
        return (
          <Suspense fallback={<NeuraFitLoading />}>
            <WorkoutGenerator
              onWorkoutComplete={handleWorkoutComplete}
              onBack={handleBackToDashboard}
            />
          </Suspense>
        );
      case 'progress':
        return (
          <Suspense fallback={<NeuraFitLoading />}>
            <ProgressTracker
              onBack={handleBackToDashboard}
              onStartNewWorkout={handleStartWorkout}
            />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<NeuraFitLoading />}>
            <Dashboard
              onStartWorkout={handleStartWorkout}
              onViewProgress={handleViewProgress}
              onEditSpecificSetting={handleEditSpecificSetting}
            />
          </Suspense>
        );
    }
  };

  return (
    <Box
      h="100%"
      bg="#FAFBFC"
      overflow="auto"
      position="relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
      data-testid="page-content"
      className="mobile-scroll-container neurafit-page-container"
    >
      {renderCurrentView()}
    </Box>
  );
}
