import {
  Box,
  useColorModeValue,
  Container,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitnessStore } from '../../store/useFitnessStore';
import ProgressIndicator from './ProgressIndicator';
import FitnessLevelStep from './FitnessLevelStep';
import GoalsStep from './GoalsStep';
import EquipmentStep from './EquipmentStep';
import TimeStep from './TimeStep';
import { memo, useMemo, useCallback } from 'react';

const MotionBox = motion.div;



interface OnboardingWizardProps {
  onComplete: () => void;
}

const OnboardingWizard = memo(function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { currentStep, totalSteps, nextStep, prevStep, isEditingFromDashboard, finishEditingFromDashboard } = useFitnessStore();

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const handleNext = useCallback(() => {
    if (isEditingFromDashboard) {
      // When editing from dashboard, save changes and return to dashboard
      finishEditingFromDashboard();
      onComplete();
    } else if (currentStep < totalSteps - 1) {
      nextStep();
    } else {
      onComplete();
    }
  }, [isEditingFromDashboard, finishEditingFromDashboard, onComplete, currentStep, totalSteps, nextStep]);

  const handlePrev = useCallback(() => {
    if (isEditingFromDashboard) {
      // When editing from dashboard, back should return to dashboard
      finishEditingFromDashboard();
      onComplete();
    } else {
      prevStep();
    }
  }, [isEditingFromDashboard, finishEditingFromDashboard, onComplete, prevStep]);

  const currentStepComponent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <FitnessLevelStep onNext={handleNext} isEditingFromDashboard={isEditingFromDashboard} />;
      case 1:
        return <GoalsStep onNext={handleNext} onBack={handlePrev} isEditingFromDashboard={isEditingFromDashboard} />;
      case 2:
        return <EquipmentStep onNext={handleNext} onPrev={handlePrev} isEditingFromDashboard={isEditingFromDashboard} />;
      case 3:
        return <TimeStep onNext={handleNext} onPrev={handlePrev} isEditingFromDashboard={isEditingFromDashboard} />;
      default:
        return <FitnessLevelStep onNext={handleNext} isEditingFromDashboard={isEditingFromDashboard} />;
    }
  }, [currentStep, handleNext, handlePrev, isEditingFromDashboard]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };



  return (
    <Box
      minH="100vh"
      bg={bgColor}
      overflow="visible"
      position="relative"
      style={{ WebkitOverflowScrolling: 'touch' }}
      className="neurafit-onboarding-container"
    >
      <Container
        maxW="md"
        minH="100vh"
        py={{ base: 6, md: 8 }}
        px={{ base: 4, md: 6 }}
        display="flex"
        flexDirection="column"
      >
        {/* Progress indicator - closer to header */}
        <Box
          position="sticky"
          top={0}
          zIndex={10}
          bg={bgColor}
          py={2}
          mb={3}
          borderRadius="md"
          boxShadow="sm"
        >
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </Box>

        {/* Step content with animation - scrollable */}
        <Box
          flex={1}
          w="100%"
          position="relative"
          overflow="visible"
          minH="calc(100vh - 200px)"
          display="flex"
          flexDirection="column"
        >
          <AnimatePresence mode="wait" custom={currentStep}>
            <MotionBox
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              // Disable horizontal dragging to lock screen from scrolling left/right
              style={{
                width: "100%",
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                paddingTop: "1rem",
                paddingBottom: "1rem"
              }}
            >
              <Box w="100%" maxW="400px" flex={1}>
                {currentStepComponent}
              </Box>
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Container>
    </Box>
  );
});

export default OnboardingWizard;
