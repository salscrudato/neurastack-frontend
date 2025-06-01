import {
  Box,
  useToast,
} from '@chakra-ui/react';
import { AppShell } from '../components/AppShell';
import { useFitnessStore } from '../store/useFitnessStore';
import OnboardingWizard from '../components/NeuraFit/OnboardingWizard';
import Dashboard from '../components/NeuraFit/Dashboard';

export default function NeuraFitPage() {
  const { profile, resetOnboarding } = useFitnessStore();
  const toast = useToast();

  const handleOnboardingComplete = () => {
    toast({
      title: 'Welcome to NeuraFit!',
      description: 'Your profile has been set up successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleStartWorkout = () => {
    toast({
      title: 'Coming Soon!',
      description: 'AI-powered workout generation is in development.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditProfile = () => {
    resetOnboarding();
  };

  return (
    <AppShell>
      <Box h="100%" overflow="hidden">
        {!profile.completedOnboarding ? (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        ) : (
          <Dashboard
            onStartWorkout={handleStartWorkout}
            onEditProfile={handleEditProfile}
          />
        )}
      </Box>
    </AppShell>
  );
}
