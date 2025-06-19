import {
    Box,
    useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import Dashboard from '../components/NeuraFit/Dashboard';
import OnboardingWizard from '../components/NeuraFit/OnboardingWizard';
import ProgressTracker from '../components/NeuraFit/ProgressTracker';
import WorkoutGenerator from '../components/NeuraFit/WorkoutGenerator';
import type { WorkoutPlan } from '../lib/types';
import { useFitnessStore } from '../store/useFitnessStore';

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
      return <OnboardingWizard onComplete={useFitnessStore.getState().isEditingFromDashboard ? handleFinishEditing : handleOnboardingComplete} />;
    }

    switch (currentView) {
      case 'workout':
        return (
          <WorkoutGenerator
            onWorkoutComplete={handleWorkoutComplete}
            onBack={handleBackToDashboard}
          />
        );
      case 'progress':
        return (
          <ProgressTracker
            onBack={handleBackToDashboard}
            onStartNewWorkout={handleStartWorkout}
          />
        );
      default:
        return (
          <Dashboard
            onStartWorkout={handleStartWorkout}
            onViewProgress={handleViewProgress}
            onEditSpecificSetting={handleEditSpecificSetting}
          />
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
