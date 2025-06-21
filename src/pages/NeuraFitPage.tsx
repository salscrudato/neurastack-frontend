import {
    Box,
    useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import Dashboard from '../components/NeuraFit/Dashboard';
import OnboardingWizard from '../components/NeuraFit/OnboardingWizard';
import ProgressTracker from '../components/NeuraFit/ProgressTracker';
import WorkoutErrorBoundary from '../components/NeuraFit/WorkoutErrorBoundary';
import WorkoutGenerator from '../components/NeuraFit/WorkoutGenerator';
import WorkoutHistory from '../components/NeuraFit/WorkoutHistory';
import type { WorkoutPlan } from '../lib/types';
import { useFitnessStore } from '../store/useFitnessStore';

type ViewState = 'dashboard' | 'workout' | 'progress' | 'history';

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

  const handleViewHistory = () => {
    setCurrentView('history');
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
      return <OnboardingWizard onComplete={useFitnessStore.getState().isEditingFromDashboard ? handleFinishEditing : handleOnboardingComplete} />;
    }

    switch (currentView) {
      case 'workout':
        return (
          <WorkoutErrorBoundary
            onRetry={() => {
              // Force re-render of WorkoutGenerator
              setCurrentView('dashboard');
              setTimeout(() => setCurrentView('workout'), 100);
            }}
            onBackToDashboard={handleBackToDashboard}
          >
            <WorkoutGenerator
              onWorkoutComplete={handleWorkoutComplete}
              onBack={handleBackToDashboard}
            />
          </WorkoutErrorBoundary>
        );
      case 'progress':
        return (
          <ProgressTracker
            onBack={handleBackToDashboard}
            onStartNewWorkout={handleStartWorkout}
          />
        );
      case 'history':
        return (
          <WorkoutHistory
            onBack={handleBackToDashboard}
            onStartNewWorkout={handleStartWorkout}
          />
        );
      default:
        return (
          <Dashboard
            onStartWorkout={handleStartWorkout}
            onViewProgress={handleViewProgress}
            onViewHistory={handleViewHistory}
            onEditSpecificSetting={handleEditSpecificSetting}
          />
        );
    }
  };

  return (
    <Box
      w="100%"
      minH="100%"
      bg="#FAFBFC"
      position="relative"
      data-testid="page-content"
      className="mobile-scroll-container neurafit-page-container"
      // Enhanced mobile scrolling support with proper header spacing
      sx={{
        overflowX: 'hidden',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        // Mobile viewport support with proper header spacing
        '@media (max-width: 768px)': {
          // Full viewport height minus fixed header
          height: 'calc(100vh - 56px)',
          minHeight: 'calc(100vh - 56px)',
          maxHeight: 'calc(100vh - 56px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        },
        // Desktop viewport support
        '@media (min-width: 769px)': {
          height: 'calc(100vh - 64px)',
          minHeight: 'calc(100vh - 64px)',
          maxHeight: 'calc(100vh - 64px)',
        },
        '@supports (-webkit-touch-callout: none)': {
          '@media (max-width: 768px)': {
            height: 'calc(-webkit-fill-available - 56px)',
            minHeight: 'calc(-webkit-fill-available - 56px)',
            maxHeight: 'calc(-webkit-fill-available - 56px)',
          },
          '@media (min-width: 769px)': {
            height: 'calc(-webkit-fill-available - 64px)',
            minHeight: 'calc(-webkit-fill-available - 64px)',
            maxHeight: 'calc(-webkit-fill-available - 64px)',
          }
        }
      }}
    >
      {renderCurrentView()}
    </Box>
  );
}
