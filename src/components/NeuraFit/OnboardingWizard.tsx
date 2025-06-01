import {
  Box,
  VStack,
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

const MotionBox = motion(Box);

const stepLabels = [
  'Choose your fitness level',
  'Select your goals',
  'Pick your equipment',
  'Set your schedule'
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { currentStep, totalSteps, nextStep, prevStep } = useFitnessStore();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      nextStep();
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <FitnessLevelStep onNext={handleNext} />;
      case 1:
        return <GoalsStep onNext={handleNext} onPrev={handlePrev} />;
      case 2:
        return <EquipmentStep onNext={handleNext} onPrev={handlePrev} />;
      case 3:
        return <TimeStep onNext={handleNext} onPrev={handlePrev} />;
      default:
        return <FitnessLevelStep onNext={handleNext} />;
    }
  };

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

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <Box
      h="100%"
      bg={bgColor}
      overflow="hidden"
    >
      <Container
        maxW="md"
        h="100%"
        py={{ base: 4, md: 8 }}
        px={{ base: 4, md: 6 }}
      >
        <VStack spacing={6} h="100%" justify="center">
          {/* Progress indicator */}
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepLabels={stepLabels}
          />

          {/* Step content with animation */}
          <Box
            flex={1}
            w="100%"
            position="relative"
            overflow="hidden"
            display="flex"
            alignItems="center"
            justifyContent="center"
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
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold && currentStep < totalSteps - 1) {
                    handleNext();
                  } else if (swipe > swipeConfidenceThreshold && currentStep > 0) {
                    handlePrev();
                  }
                }}
                w="100%"
                h="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box w="100%" maxW="400px">
                  {renderStep()}
                </Box>
              </MotionBox>
            </AnimatePresence>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
