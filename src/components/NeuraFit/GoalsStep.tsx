import {
  VStack,
  Text,
  Button,
  HStack,
  Box,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState, useRef } from 'react';

import { useFitnessStore } from '../../store/useFitnessStore';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { trackGoalSelection, trackGoalStepCompletion } from '../../services/fitnessDataService';
import { FITNESS_GOALS } from '../../constants/fitnessGoals'; // Moved constants import
import NavigationButtons from './NavigationButtons';

// Motion components for animations
const MotionBox = motion.div;

// Animation variants for Framer Motion moved outside component to avoid re-creation on each render
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      delay: index * 0.04, // 40ms stagger
      duration: 0.12
    }
  }),
  hover: {
    y: -2,
    scale: 1.03,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      duration: 0.12
    }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.05 }
  }
};

interface GoalsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function GoalsStep({ onNext, onBack }: GoalsStepProps) {
  const { profile, syncToFirestore } = useFitnessStore();
  const prefersReducedMotion = useReducedMotion();

  // State for keyboard navigation and accessibility
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Debounce timer ref for goal toggling
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Modern, minimalistic color scheme
  const textColor = 'gray.900';
  const subtextColor = 'gray.600';
  const cardBg = 'white';
  const borderColor = 'gray.200';
  const borderStrong = 'gray.300';
  const surfaceSecondary = 'gray.50';
  const brandPrimary = 'blue.500';

  // Optimized goal selection - immediate UI update, no Firebase save until navigation
  const handleGoalToggle = useCallback((goalCode: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Immediate UI update for smooth responsiveness
    const currentGoals = profile.goals || [];
    const isSelected = currentGoals.includes(goalCode);

    let newGoals;
    if (isSelected) {
      newGoals = currentGoals.filter(goal => goal !== goalCode);
    } else {
      newGoals = [...currentGoals, goalCode];
    }

    // Update local state immediately for smooth UX
    const { updateProfile } = useFitnessStore.getState();
    updateProfile({ goals: newGoals });

    // Track analytics
    const startTime = performance.now();
    const endTime = performance.now();
    const completionTime = endTime - startTime;
    trackGoalSelection(goalCode, !isSelected, completionTime);

    console.log(`Goal ${goalCode} toggled locally in ${completionTime}ms`);
  }, [profile.goals]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % FITNESS_GOALS.length);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? FITNESS_GOALS.length - 1 : prev - 1);
        break;
      case 'Enter':
      case ' ':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const goal = FITNESS_GOALS[selectedIndex];
          handleGoalToggle(goal.code);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedIndex(-1);
        break;
    }
  }, [selectedIndex, handleGoalToggle]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (selectedIndex >= 0 && buttonRefs.current[selectedIndex]) {
      buttonRefs.current[selectedIndex]?.focus();
    }
  }, [selectedIndex]);

  const isGoalSelected = useCallback((goalCode: string) => {
    return profile.goals?.includes(goalCode) || false;
  }, [profile.goals]);

  const canProceed = profile.goals && profile.goals.length > 0;

  // Handle navigation with Firebase sync
  const handleNext = useCallback(async () => {
    const startTime = performance.now();

    // Sync to Firebase before navigation
    try {
      await syncToFirestore();
      console.log('✅ Goals synced to Firebase before navigation');
    } catch (error) {
      console.warn('Failed to sync goals to Firebase:', error);
    }

    const endTime = performance.now();
    const completionTime = endTime - startTime;

    // Track step completion
    trackGoalStepCompletion(profile.goals || [], completionTime);
    onNext();
  }, [syncToFirestore, profile.goals, onNext]);

  const handleBack = useCallback(async () => {
    // Sync to Firebase before navigation
    try {
      await syncToFirestore();
      console.log('✅ Goals synced to Firebase before back navigation');
    } catch (error) {
      console.warn('Failed to sync goals to Firebase:', error);
    }

    onBack();
  }, [syncToFirestore, onBack]);

  return (
    <VStack
      spacing={4}
      align="stretch"
      w="100%"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="group"
      aria-labelledby="goals-heading"
      aria-describedby="goals-description"
    >
      {/* Modern Header with enhanced typography */}
      <VStack spacing={3} textAlign="center" mb={1}>
        <Text
          id="goals-heading"
          as="h1"
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="700"
          color={textColor}
          lineHeight="1.2"
          letterSpacing="-0.02em"
        >
          What are your fitness goals?
        </Text>
        <Text
          id="goals-description"
          fontSize={{ base: "md", md: "lg" }}
          color={subtextColor}
          maxW="480px"
          lineHeight="1.4"
          letterSpacing="-0.01em"
          fontWeight="400"
        >
          Pick all that apply – we'll tailor your plan.
        </Text>
      </VStack>

      {/* Enhanced Goal Selection Grid */}
      <Box
        as="fieldset"
        aria-labelledby="goals-heading"
        aria-describedby="goals-description"
        w="100%"
        maxW="500px"
        mx="auto"
      >
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
          <AnimatePresence>
            {FITNESS_GOALS.map((goal, index: number) => {
              const isSelected = isGoalSelected(goal.code);
              const isFocused = selectedIndex === index;
              const labelId = `goal-label-${goal.code}`;

              return (
                <MotionBox
                  key={goal.code}
                  style={{ width: '100%' }}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  custom={index}
                  whileHover={prefersReducedMotion ? {} : "hover"}
                  whileTap={prefersReducedMotion ? {} : "tap"}
                  layout
                >
                  <Button
                    ref={(el) => { buttonRefs.current[index] = el; }}
                    w="100%"
                    h="88px" // Slightly taller for better mobile experience
                    p={5}
                    bg={isSelected ? goal.bgColor : cardBg}
                    border="1px solid"
                    borderColor={isSelected ? goal.borderColor : borderColor}
                    borderRadius="2xl" // 16px border radius for modern look
                    onClick={() => handleGoalToggle(goal.code)}
                    variant="ghost"
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-describedby={`goal-${goal.code}-description`}
                    aria-labelledby={labelId}
                    tabIndex={isFocused ? 0 : -1}
                    data-cy={`goal-card-${goal.code}`}
                    boxShadow={isSelected ? `0 0 0 2px ${goal.borderColor}20` : '0 1px 3px rgba(0, 0, 0, 0.05)'}
                    _hover={{
                      bg: isSelected ? goal.hoverBg : surfaceSecondary,
                      borderColor: isSelected ? goal.borderColor : borderStrong,
                      transform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
                      boxShadow: prefersReducedMotion ?
                        (isSelected ? `0 0 0 2px ${goal.borderColor}30` : '0 2px 8px rgba(0, 0, 0, 0.08)') :
                        (isSelected ? `0 0 0 2px ${goal.borderColor}30, 0 4px 12px rgba(0, 0, 0, 0.08)` : '0 4px 12px rgba(0, 0, 0, 0.08)'),
                    }}
                    _focus={{
                      outline: `2px solid ${brandPrimary}`,
                      outlineOffset: '2px',
                      bg: isSelected ? goal.hoverBg : surfaceSecondary,
                    }}
                    _active={{
                      transform: prefersReducedMotion ? 'none' : 'scale(0.98)',
                    }}
                    transition={prefersReducedMotion ? 'none' : 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'}
                  >
                    <HStack spacing={4} w="100%" justify="flex-start" align="center">
                      {/* Modern Icon Container */}
                      <Box
                        minW="40px"
                        h="40px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="xl"
                        bg={isSelected ? `${goal.borderColor}15` : 'gray.50'}
                        transition="all 150ms ease"
                      >
                        <Icon
                          as={goal.icon}
                          boxSize="20px"
                          color={isSelected ? goal.iconColor : 'gray.500'}
                          transition="color 150ms ease"
                        />
                      </Box>

                      {/* Enhanced Text Content */}
                      <VStack align="flex-start" spacing={0.5} flex={1} minH="48px" justify="center">
                        <Text
                          id={labelId}
                          fontSize={{ base: "md", md: "lg" }}
                          fontWeight="600"
                          color={textColor}
                          textAlign="left"
                          lineHeight="1.2"
                          letterSpacing="-0.01em"
                        >
                          {goal.label}
                        </Text>
                        <Text
                          id={`goal-${goal.code}-description`}
                          fontSize={{ base: "sm", md: "md" }}
                          color={subtextColor}
                          textAlign="left"
                          lineHeight="1.3"
                          letterSpacing="-0.005em"
                        >
                          {goal.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Button>
                </MotionBox>
              );
            })}
          </AnimatePresence>
        </SimpleGrid>
      </Box>

      {/* Navigation */}
      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        canProceed={canProceed}
      />

      {/* Screen reader instructions */}
      <Box
        position="absolute"
        left="-10000px"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectedIndex >= 0 && (
          <Text>
            {FITNESS_GOALS[selectedIndex].label} selected. Press Enter to toggle or use arrow keys to navigate.
          </Text>
        )}
        {profile.goals && profile.goals.length > 0 && (
          <Text>
            {profile.goals.length} goal{profile.goals.length !== 1 ? 's' : ''} selected.
          </Text>
        )}
      </Box>

      {/* Hidden help text for continue button */}
      <Text
        id="continue-help"
        position="absolute"
        left="-10000px"
        aria-hidden="true"
      >
        {!canProceed ? 'Please select at least one goal to continue' : 'Continue to next step'}
      </Text>
    </VStack>
  );
}
