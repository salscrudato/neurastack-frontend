import {
    Alert,
    AlertIcon,
    Badge,
    Button,
    Card,
    CardBody,
    HStack,
    Icon,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Spinner,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import {
    PiCheckBold,
    PiClockBold,
    PiRepeatBold,
    PiSwapBold,
    PiTargetBold,
} from 'react-icons/pi';
import { neuraStackClient } from '../../lib/neurastack-client';
import type { Exercise } from '../../lib/types';
import { useAuthStore } from '../../store/useAuthStore';
import { useFitnessStore } from '../../store/useFitnessStore';

interface ExerciseSwapperProps {
  isOpen: boolean;
  onClose: () => void;
  currentExercise: Exercise;
  onSwapExercise: (newExercise: Exercise) => void;
  workoutType: string;
}

interface AlternativeExercise extends Exercise {
  reason: string; // Why this alternative was suggested
  similarity: number; // 0-100 similarity score
}

export default function ExerciseSwapper({
  isOpen,
  onClose,
  currentExercise,
  onSwapExercise,
  workoutType,
}: ExerciseSwapperProps) {
  const { profile } = useFitnessStore();
  const { user } = useAuthStore();
  const [alternatives, setAlternatives] = useState<AlternativeExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  // Generate alternative exercises using AI
  const generateAlternatives = useCallback(async () => {
    if (!currentExercise || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Configure the API client
      neuraStackClient.configure({
        userId: user?.uid || '',
      });

      // Create a prompt for alternative exercises
      const prompt = `Generate exactly 3 alternative exercises for "${currentExercise.name}".

Requirements:
- Target same muscles: ${currentExercise.targetMuscles.join(', ')}
- ${profile.fitnessLevel} fitness level
- Available equipment: ${profile.equipment.join(', ')}
- ${workoutType} workout type
- Similar to ${currentExercise.sets} sets, ${currentExercise.reps} reps
- Avoid injuries: ${profile.injuries?.join(', ') || 'none'}

CRITICAL: Your response must be ONLY valid JSON. No text before or after. No markdown. No code blocks. No explanations.

Start your response with [ and end with ]. Use double quotes for all strings. No trailing commas.

Example format:
[
  {
    "name": "Exercise Name",
    "sets": ${currentExercise.sets},
    "reps": ${currentExercise.reps},
    "duration": ${currentExercise.duration},
    "restTime": ${currentExercise.restTime},
    "instructions": "Clear step-by-step instructions",
    "tips": "Helpful form tip",
    "targetMuscles": ["muscle1", "muscle2"],
    "reason": "Why this is a good alternative",
    "similarity": 85
  }
]

Return exactly 3 exercises in this format. Nothing else.`;

      const response = await neuraStackClient.queryAI(prompt, {
        useEnsemble: true,
        temperature: 0.7,
      });

      // Parse the AI response with robust JSON extraction
      let jsonString = response.answer.trim();
      try {

        console.log('Raw AI response for debugging:', jsonString);

        // Remove markdown code blocks if present
        if (jsonString.includes('```json')) {
          const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonString = jsonMatch[1].trim();
          }
        } else if (jsonString.includes('```')) {
          const codeMatch = jsonString.match(/```\s*([\s\S]*?)\s*```/);
          if (codeMatch) {
            jsonString = codeMatch[1].trim();
          }
        }

        // Try to extract JSON array if it's embedded in text
        if (!jsonString.startsWith('[')) {
          const arrayMatch = jsonString.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            jsonString = arrayMatch[0];
          }
        }

        // Clean up common JSON formatting issues
        jsonString = jsonString
          .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
          .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/(\w+):/g, '"$1":') // Quote unquoted keys
          .replace(/:\s*([^",\[\]{}]+)(?=\s*[,}\]])/g, ': "$1"'); // Quote unquoted string values

        console.log('Cleaned JSON string:', jsonString);

        const alternativeExercises = JSON.parse(jsonString);
        if (Array.isArray(alternativeExercises) && alternativeExercises.length > 0) {
          // Validate each exercise has required fields
          const validAlternatives = alternativeExercises.filter(alt =>
            alt.name && typeof alt.name === 'string' &&
            typeof alt.sets === 'number' &&
            typeof alt.reps === 'number'
          ).map(alt => ({
            ...alt,
            similarity: typeof alt.similarity === 'number' ? alt.similarity : 80,
            reason: typeof alt.reason === 'string' ? alt.reason : 'Alternative exercise option'
          }));

          if (validAlternatives.length > 0) {
            setAlternatives(validAlternatives);
          } else {
            throw new Error('No valid alternatives found in response');
          }
        } else {
          throw new Error('Invalid response format - not an array');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.log('Raw AI response:', response.answer);
        console.log('Attempted to parse:', jsonString);

        // Try one more time with a more aggressive cleanup
        try {
          // Extract just the array part more aggressively
          const arrayStart = response.answer.indexOf('[');
          const arrayEnd = response.answer.lastIndexOf(']');

          if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
            const extractedArray = response.answer.substring(arrayStart, arrayEnd + 1);
            console.log('Extracted array attempt:', extractedArray);

            const alternativeExercises = JSON.parse(extractedArray);
            if (Array.isArray(alternativeExercises) && alternativeExercises.length > 0) {
              const validAlternatives = alternativeExercises.filter(alt =>
                alt.name && typeof alt.name === 'string' &&
                typeof alt.sets === 'number' &&
                typeof alt.reps === 'number'
              ).map(alt => ({
                ...alt,
                similarity: typeof alt.similarity === 'number' ? alt.similarity : 80,
                reason: typeof alt.reason === 'string' ? alt.reason : 'Alternative exercise option'
              }));

              if (validAlternatives.length > 0) {
                setAlternatives(validAlternatives);
                return; // Success with aggressive parsing
              }
            }
          }
        } catch (secondParseError) {
          console.error('Second parse attempt also failed:', secondParseError);
        }

        // Fallback to predefined alternatives
        setError('AI response format was invalid. Using fallback alternatives.');
        setAlternatives(generateFallbackAlternatives());
      }
    } catch (error) {
      console.error('Error generating alternatives:', error);
      setError('Failed to generate alternatives. Showing fallback options.');
      setAlternatives(generateFallbackAlternatives());
    } finally {
      setIsLoading(false);
    }
  }, [currentExercise, profile, user?.uid, workoutType]);

  // Generate fallback alternatives based on exercise type
  const generateFallbackAlternatives = useCallback((): AlternativeExercise[] => {
    const baseExercise = {
      sets: currentExercise.sets,
      reps: currentExercise.reps,
      duration: currentExercise.duration,
      restTime: currentExercise.restTime,
      targetMuscles: currentExercise.targetMuscles,
    };

    // Simple fallback alternatives based on common exercise patterns
    if (currentExercise.name.toLowerCase().includes('push')) {
      return [
        {
          ...baseExercise,
          name: 'Modified Push-ups',
          instructions: 'Perform push-ups with knees on ground if needed',
          tips: 'Keep your core tight throughout the movement',
          reason: 'Easier variation of push-up movement',
          similarity: 90,
        },
        {
          ...baseExercise,
          name: 'Wall Push-ups',
          instructions: 'Stand arm\'s length from wall, place palms flat against wall',
          tips: 'Great for beginners or those with wrist issues',
          reason: 'Low-impact alternative targeting same muscles',
          similarity: 85,
        },
      ];
    }

    // Generic alternatives
    return [
      {
        ...baseExercise,
        name: 'Bodyweight Alternative',
        instructions: 'Perform a bodyweight version of the movement',
        tips: 'Focus on proper form over speed',
        reason: 'No equipment needed',
        similarity: 80,
      },
      {
        ...baseExercise,
        name: 'Modified Version',
        instructions: 'Perform a modified version suitable for your level',
        tips: 'Adjust intensity as needed',
        reason: 'Adapted for your fitness level',
        similarity: 75,
      },
    ];
  }, [currentExercise]);

  // Load alternatives when modal opens
  useEffect(() => {
    if (isOpen && alternatives.length === 0) {
      generateAlternatives();
    }
  }, [isOpen, alternatives.length, generateAlternatives]);

  const handleSwap = useCallback((alternative: AlternativeExercise) => {
    const { reason, similarity, ...exercise } = alternative;
    onSwapExercise(exercise);
    onClose();
  }, [onSwapExercise, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor} maxH="90vh">
        <ModalHeader>
          <HStack>
            <Icon as={PiSwapBold} color="blue.500" />
            <Text>Swap Exercise</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Current Exercise */}
            <Card bg={useColorModeValue('blue.50', 'blue.900')} borderColor="blue.200">
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="bold" color={textColor}>
                    Current Exercise
                  </Text>
                  <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                    {currentExercise.name}
                  </Text>
                  <HStack spacing={4} fontSize="sm" color={subtextColor}>
                    <HStack>
                      <Icon as={PiRepeatBold} />
                      <Text>{currentExercise.sets} sets</Text>
                    </HStack>
                    <HStack>
                      <Icon as={PiTargetBold} />
                      <Text>{currentExercise.reps} reps</Text>
                    </HStack>
                    {currentExercise.duration > 0 && (
                      <HStack>
                        <Icon as={PiClockBold} />
                        <Text>{currentExercise.duration}s</Text>
                      </HStack>
                    )}
                  </HStack>
                  <Text fontSize="sm" color={subtextColor}>
                    {currentExercise.instructions}
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <Card>
                <CardBody>
                  <VStack spacing={3}>
                    <Spinner color="blue.500" />
                    <Text color={subtextColor}>
                      Finding alternative exercises...
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Error State */}
            {error && (
              <Alert status="warning">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Alternative Exercises */}
            {alternatives.length > 0 && (
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" color={textColor}>
                  Alternative Exercises
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {alternatives.map((alternative, index) => (
                    <Card
                      key={index}
                      bg={bgColor}
                      borderColor={borderColor}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'md',
                        borderColor: 'blue.300',
                      }}
                      onClick={() => handleSwap(alternative)}
                    >
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="semibold" color={textColor}>
                              {alternative.name}
                            </Text>
                            <Badge colorScheme="green" variant="subtle">
                              {alternative.similarity}% match
                            </Badge>
                          </HStack>
                          
                          <HStack spacing={4} fontSize="sm" color={subtextColor}>
                            <Text>{alternative.sets} sets</Text>
                            <Text>{alternative.reps} reps</Text>
                            {alternative.duration > 0 && (
                              <Text>{alternative.duration}s</Text>
                            )}
                          </HStack>
                          
                          <Text fontSize="sm" color={subtextColor} noOfLines={2}>
                            {alternative.instructions}
                          </Text>
                          
                          <Text fontSize="xs" color="blue.500" fontStyle="italic">
                            {alternative.reason}
                          </Text>
                          
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<Icon as={PiCheckBold} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSwap(alternative);
                            }}
                          >
                            Use This Exercise
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            )}

            {/* Regenerate Button */}
            <Button
              variant="outline"
              colorScheme="blue"
              onClick={generateAlternatives}
              isLoading={isLoading}
              loadingText="Generating..."
            >
              Generate More Alternatives
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
