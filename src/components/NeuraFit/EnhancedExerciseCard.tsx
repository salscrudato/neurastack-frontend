/**
 * Enhanced Exercise Card Component
 * 
 * Displays exercise details with professional trainer elements
 * including form cues, coaching tips, and safety considerations
 * from the optimized API response.
 */

import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Collapse,
    Divider,
    HStack,
    Icon,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { memo, useState } from 'react';
import {
    PiCaretDownBold,
    PiCaretUpBold,
    PiCheckBold,
    PiHeartBold,
    PiLightbulbBold,
    PiShieldCheckBold,
    PiSwapBold,
    PiTargetBold
} from 'react-icons/pi';
import type { Exercise } from '../../lib/types';

interface EnhancedExerciseCardProps {
  exercise: Exercise;
  index: number;
  isCompleted: boolean;
  isActive?: boolean;
  onSwap?: (index: number) => void;
  showSwapButton?: boolean;
  isWorkoutActive?: boolean;
}

const EnhancedExerciseCard = memo(function EnhancedExerciseCard({
  exercise,
  index,
  isCompleted,
  isActive = false,
  onSwap,
  showSwapButton = true,
  isWorkoutActive = false
}: EnhancedExerciseCardProps) {
  const [showDetails, setShowDetails] = useState(isActive);

  // Color values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const completedColor = useColorModeValue('green.500', 'green.300');
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');
  const tipColor = useColorModeValue('purple.500', 'purple.300');

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Card
      bg={bgColor}
      borderColor={isActive ? activeColor : borderColor}
      borderWidth={isActive ? "2px" : "1px"}
      opacity={isCompleted ? 0.7 : 1}
      shadow={isActive ? "lg" : "md"}
      _hover={{
        shadow: "lg",
        transform: "translateY(-1px)"
      }}
      transition="all 0.2s ease-in-out"
    >
      <CardBody p={{ base: 4, md: 3 }}>
        <VStack spacing={3} align="stretch">
          {/* Exercise Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1} flex={1}>
              <HStack spacing={2} align="center">
                <Text 
                  fontWeight="bold" 
                  color={textColor} 
                  fontSize={{ base: "md", md: "sm" }} 
                  lineHeight="1.2"
                >
                  {exercise.name}
                </Text>
                {isCompleted && (
                  <Icon as={PiCheckBold} color={completedColor} boxSize={{ base: 5, md: 4 }} />
                )}
                {isActive && (
                  <Badge colorScheme="blue" size="sm">Active</Badge>
                )}
              </HStack>
              
              {/* Exercise Stats */}
              <HStack spacing={4} fontSize={{ base: "sm", md: "xs" }} color={subtextColor}>
                <Text>{exercise.sets} sets</Text>
                <Text>{exercise.reps} reps</Text>
                <Text>{exercise.restTime}s rest</Text>
              </HStack>
            </VStack>

            {/* Action Buttons */}
            <HStack spacing={2}>
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<Icon as={showDetails ? PiCaretUpBold : PiCaretDownBold} />}
                onClick={handleToggleDetails}
                fontSize="xs"
              >
                {showDetails ? 'Less' : 'More'}
              </Button>
              
              {showSwapButton && onSwap && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="blue"
                  leftIcon={<Icon as={PiSwapBold} />}
                  onClick={() => onSwap(index)}
                  isDisabled={isWorkoutActive}
                  fontSize="xs"
                >
                  Swap
                </Button>
              )}
            </HStack>
          </HStack>

          {/* Basic Instructions (Always Visible) */}
          <Text 
            fontSize={{ base: "sm", md: "xs" }} 
            color={subtextColor} 
            noOfLines={showDetails ? undefined : 2} 
            lineHeight="1.4"
          >
            {exercise.instructions}
          </Text>

          {/* Detailed Information (Collapsible) */}
          <Collapse in={showDetails} animateOpacity>
            <VStack spacing={3} align="stretch">
              <Divider />

              {/* Form Cues */}
              {exercise.tips && (
                <Box bg={useColorModeValue('blue.50', 'blue.900')} p={3} borderRadius="md">
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Icon as={PiTargetBold} color={useColorModeValue('blue.600', 'blue.300')} />
                      <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('blue.700', 'blue.200')}>
                        Form Cues
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')}>
                      {exercise.tips}
                    </Text>
                  </VStack>
                </Box>
              )}

              {/* Exercise Modifications */}
              {exercise.modifications && exercise.modifications.length > 0 && (
                <Box bg={useColorModeValue('purple.50', 'purple.900')} p={3} borderRadius="md">
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Icon as={PiLightbulbBold} color={tipColor} />
                      <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('purple.700', 'purple.200')}>
                        Modifications
                      </Text>
                    </HStack>
                    <VStack spacing={1} align="start">
                      {exercise.modifications.map((mod, idx) => (
                        <Text key={idx} fontSize="sm" color={useColorModeValue('purple.700', 'purple.200')}>
                          • {mod}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              )}

              {/* Target Muscles */}
              {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                <Box bg={useColorModeValue('green.50', 'green.900')} p={3} borderRadius="md">
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Icon as={PiHeartBold} color={useColorModeValue('green.600', 'green.300')} />
                      <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('green.700', 'green.200')}>
                        Target Muscles
                      </Text>
                    </HStack>
                    <HStack spacing={2} flexWrap="wrap">
                      {exercise.targetMuscles.map((muscle, idx) => (
                        <Badge key={idx} colorScheme="green" size="sm" textTransform="capitalize">
                          {muscle}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Equipment */}
              {exercise.equipment && exercise.equipment.length > 0 && (
                <Box bg={useColorModeValue('orange.50', 'orange.900')} p={3} borderRadius="md">
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Icon as={PiShieldCheckBold} color={warningColor} />
                      <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('orange.700', 'orange.200')}>
                        Equipment Needed
                      </Text>
                    </HStack>
                    <HStack spacing={2} flexWrap="wrap">
                      {exercise.equipment.map((item, idx) => (
                        <Badge key={idx} colorScheme="orange" size="sm" textTransform="capitalize">
                          {item}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Exercise Category */}
              {exercise.category && (
                <HStack justify="space-between" align="center">
                  <Text fontSize="xs" color={subtextColor}>
                    Category: <Text as="span" fontWeight="semibold" textTransform="capitalize">{exercise.category}</Text>
                  </Text>
                  {exercise.duration > 0 && (
                    <Text fontSize="xs" color={subtextColor}>
                      Duration: <Text as="span" fontWeight="semibold">{exercise.duration}s</Text>
                    </Text>
                  )}
                </HStack>
              )}
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
});

export default EnhancedExerciseCard;
