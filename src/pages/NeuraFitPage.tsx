import {
  Box,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useFitnessStore } from '../store/useFitnessStore';
import OnboardingWizard from '../components/NeuraFit/OnboardingWizard';
import Dashboard from '../components/NeuraFit/Dashboard';
import WorkoutGenerator from '../components/NeuraFit/WorkoutGenerator';
import ProgressTracker from '../components/NeuraFit/ProgressTracker';
import type { WorkoutPlan } from '../lib/types';

type ViewState = 'dashboard' | 'workout' | 'progress';

export default function NeuraFitPage() {
  const { profile, resetOnboarding, completeOnboarding } = useFitnessStore();
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

  const handleEditProfile = () => {
    resetOnboarding();
    setCurrentView('dashboard');
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
    if (!profile.completedOnboarding) {
      return <OnboardingWizard onComplete={handleOnboardingComplete} />;
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
            onEditProfile={handleEditProfile}
            onViewProgress={handleViewProgress}
          />
        );
    }
  };

  return (
    <AppShell>
      <Box h="100%" overflow="hidden">
        {renderCurrentView()}
      </Box>
    </AppShell>
  );
}
