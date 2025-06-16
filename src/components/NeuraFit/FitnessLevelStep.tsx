import {
  VStack,
  Text,
  Button,
  HStack,
  Box,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState, useRef } from 'react';

import { useFitnessStore } from '../../store/useFitnessStore';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { trackFitnessLevelSelection } from '../../services/fitnessDataService';
import { fitnessLevels } from '../../constants/fitnessLevels'; // Imported fitnessLevels array

// Motion components for animations - using motion.div to avoid React prop warnings
const MotionBox = motion.div;

// Animation variants for Framer Motion moved outside component to avoid re-creation on each render
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.12
    }
  },
  hover: {
    y: -2,
    scale: 1.02,
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

interface FitnessLevelStepProps {
  onNext: () => void;
  isEditingFromDashboard?: boolean;
}

export default function FitnessLevelStep({ onNext }: FitnessLevelStepProps) {
  const { profile, updateFitnessLevel } = useFitnessStore();
  const toast = useToast();
  const prefersReducedMotion = useReducedMotion();

  // State for keyboard navigation and accessibility
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSelecting, setIsSelecting] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chakra semantic tokens for colors to support theme/dark mode
  const textColor = 'text.primary';
  const subtextColor = 'text.tertiary';
  const cardBg = 'surface.primary';
  const borderColor = 'border.medium';

  // Debounced level selection handler to prevent double submissions/spam
  // Includes analytics tracking and toast feedback
  const handleLevelSelect = useCallback((level: 'beginner' | 'intermediate' | 'advanced', code: 'B' | 'I' | 'A') => {
    if (isSelecting) return; // Prevent multiple rapid clicks

    setIsSelecting(true);
    const startTime = performance.now();
    updateFitnessLevel(level, code);

    toast({
      title: `${level.charAt(0).toUpperCase() + level.slice(1)} level selected`,
      status: 'success',
      duration: 1500,
      isClosable: false,
      position: 'top',
    });

    // Clear any existing timeout to debounce selection
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    const animationDelay = prefersReducedMotion ? 100 : 300;
    selectionTimeoutRef.current = setTimeout(() => {
      const endTime = performance.now();
      const completionTime = endTime - startTime;

      // Track analytics with completion time
      trackFitnessLevelSelection(level, code, completionTime);

      console.log(`Fitness level selection completed in ${completionTime}ms`);
      onNext();
      setIsSelecting(false);
    }, animationDelay);
  }, [updateFitnessLevel, onNext, toast, prefersReducedMotion, isSelecting]);

  // Keyboard navigation handler with accessibility support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % fitnessLevels.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? fitnessLevels.length - 1 : prev - 1);
        break;
      case 'Enter':
      case ' ':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const level = fitnessLevels[selectedIndex];
          handleLevelSelect(level.value, level.code);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedIndex(-1);
        break;
    }
  }, [selectedIndex, handleLevelSelect]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (selectedIndex >= 0 && buttonRefs.current[selectedIndex]) {
      buttonRefs.current[selectedIndex]?.focus();
    }
  }, [selectedIndex]);

  // Cleanup timeout on unmount to prevent memory leaks and test errors
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <VStack
      spacing={6}
      align="stretch"
      w="100%"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="radiogroup"
      aria-labelledby="fitness-level-heading"
      aria-describedby="fitness-level-description"
    >
      {/* Enhanced Header with proper semantic structure */}
      <VStack spacing={3} textAlign="center">
        <Text
          id="fitness-level-heading"
          as="h1"
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color={textColor}
          lineHeight="1.25"
        >
          What's your current fitness level?
        </Text>
        <Text
          id="fitness-level-description"
          fontSize="md"
          color={subtextColor}
          maxW="400px"
          lineHeight="1.5"
        >
          Select the option that best describes you.
        </Text>
      </VStack>

      {/* Enhanced Fitness Level Selection Cards */}
      <VStack spacing={{ base: 3, md: 4 }} w="100%" maxW="400px" mx="auto" px={{ base: 1, md: 0 }}>
        <AnimatePresence>
          {fitnessLevels.map((level, index: number) => {
            const isSelected = profile.fitnessLevel === level.value;
            const isFocused = selectedIndex === index;

            // IDs for accessibility labels
            const labelId = `level-${level.value}-label`;
            const descriptionId = `level-${level.value}-description`;

            return (
              <MotionBox
                key={level.value}
                style={{ width: '100%' }}
                variants={prefersReducedMotion ? {
                  initial: { opacity: 1, y: 0, scale: 1 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  hover: {},
                  tap: {}
                } : cardVariants}
                initial="initial"
                animate="animate"
                whileHover={prefersReducedMotion ? undefined : "hover"}
                whileTap={prefersReducedMotion ? undefined : "tap"}
                layout={prefersReducedMotion ? false : true}
              >
                <Button
                  ref={(el) => { buttonRefs.current[index] = el; }}
                  w="100%"
                  h={{ base: "88px", md: "80px" }} // Slightly taller on mobile for better text fit
                  p={{ base: 3, md: 4 }} // Responsive padding
                  bg={isSelected ? level.bgColor : cardBg}
                  border="2px solid"
                  borderColor={isSelected ? level.borderColor : borderColor}
                  borderRadius="xl" // 12px border radius
                  onClick={() => handleLevelSelect(level.value, level.code)}
                  isDisabled={isSelecting}
                  variant="ghost"
                  role="radio"
                  aria-checked={isSelected}
                  aria-labelledby={labelId}
                  aria-describedby={descriptionId}
                  data-cy={`fitness-level-${level.value}-card`} // Cypress selector
                  tabIndex={isFocused ? 0 : -1}
                  _hover={{
                    bg: isSelected ? level.hoverBg : 'surface.secondary',
                    borderColor: isSelected ? level.borderColor : 'border.strong',
                    transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
                    boxShadow: prefersReducedMotion ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.08)', // Clean, subtle shadow
                  }}
                  _focus={{
                    outline: '2px solid brand.primary',
                    outlineOffset: '2px',
                    bg: isSelected ? level.hoverBg : 'surface.secondary',
                  }}
                  _active={{
                    transform: prefersReducedMotion ? 'none' : 'translateY(0)',
                  }}
                  transition={prefersReducedMotion ? 'none' : 'all 120ms cubic-bezier(0.16,1,0.3,1)'}
                >
                  <HStack spacing={{ base: 3, md: 4 }} w="100%" justify="flex-start" align="center">
                    {/* React Icon */}
                    <Box
                      minW={{ base: "28px", md: "32px" }}
                      h={{ base: "28px", md: "32px" }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon
                        as={level.icon}
                        boxSize={{ base: "20px", md: "24px" }}
                        color={isSelected ? level.iconColor : 'gray.400'}
                        transition="color 120ms ease"
                      />
                    </Box>

                    {/* Text Content */}
                    <VStack align="flex-start" spacing={{ base: 0.5, md: 1 }} flex={1} minH={{ base: "52px", md: "48px" }} justify="center">
                      <Text
                        id={labelId}
                        fontSize={{ base: "md", md: "lg" }} // Responsive font size: 16px mobile, 18px desktop
                        fontWeight="semibold" // 600
                        color={textColor}
                        textAlign="left"
                        lineHeight="1.25"
                        noOfLines={1} // Prevent text overflow
                      >
                        {level.label}
                      </Text>
                      <Text
                        id={descriptionId}
                        fontSize={{ base: "xs", md: "sm" }} // Responsive font size: 12px mobile, 14px desktop
                        color={subtextColor}
                        textAlign="left"
                        lineHeight={{ base: "1.3", md: "1.4" }}
                        noOfLines={2} // Allow 2 lines max to prevent overflow
                        wordBreak="break-word" // Better text wrapping
                      >
                        {level.description}
                      </Text>
                    </VStack>
                  </HStack>
                </Button>
              </MotionBox>
            );
          })}
        </AnimatePresence>
      </VStack>

      {/* Screen reader instructions */}
      <Box
        position="absolute"
        left="-10000px"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectedIndex >= 0 && (
          <Text>
            {fitnessLevels[selectedIndex].label} selected. Press Enter to confirm or use arrow keys to navigate.
          </Text>
        )}
      </Box>
    </VStack>
  );
}
