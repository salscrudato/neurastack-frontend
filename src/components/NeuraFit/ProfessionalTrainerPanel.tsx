/**
 * Professional Trainer Panel Component
 * 
 * Displays professional trainer elements including certifications,
 * coaching tips, safety considerations, and progression guidance
 * from the optimized API response.
 */

import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
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
    PiCertificateBold,
    PiLightbulbBold,
    PiShieldCheckBold,
    PiTrendUpBold,
    PiUserBold
} from 'react-icons/pi';

interface ProfessionalTrainerPanelProps {
  professionalNotes?: {
    trainerCertifications?: string[];
    safetyConsiderations?: string[];
    progressionGuidance?: string[];
    coachingTips?: string[];
  };
  estimatedCalories?: number;
  targetHeartRateZone?: string;
  workoutType?: string;
  difficulty?: string;
}

const ProfessionalTrainerPanel = memo(function ProfessionalTrainerPanel({
  professionalNotes,
  estimatedCalories,
  targetHeartRateZone,
  workoutType,
  difficulty
}: ProfessionalTrainerPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Color values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const certColor = useColorModeValue('blue.500', 'blue.300');
  const safetyColor = useColorModeValue('red.500', 'red.300');
  const progressColor = useColorModeValue('green.500', 'green.300');
  const tipColor = useColorModeValue('purple.500', 'purple.300');

  if (!professionalNotes && !estimatedCalories && !targetHeartRateZone) {
    return null;
  }

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card bg={bgColor} borderColor={borderColor} shadow="md">
      <CardHeader pb={2}>
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={PiUserBold} color={certColor} boxSize={5} />
            <Text fontWeight="bold" color={textColor} fontSize="md">
              Professional Guidance
            </Text>
          </HStack>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={isExpanded ? PiCaretUpBold : PiCaretDownBold} />}
            onClick={handleToggle}
            fontSize="sm"
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Quick Stats */}
          <HStack spacing={4} justify="space-around" flexWrap="wrap">
            {estimatedCalories && (
              <VStack spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  {estimatedCalories}
                </Text>
                <Text fontSize="xs" color={subtextColor}>Calories</Text>
              </VStack>
            )}
            
            {targetHeartRateZone && (
              <VStack spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  {targetHeartRateZone}
                </Text>
                <Text fontSize="xs" color={subtextColor}>HR Zone</Text>
              </VStack>
            )}
            
            {difficulty && (
              <VStack spacing={1}>
                <Badge colorScheme="blue" size="lg" textTransform="capitalize">
                  {difficulty}
                </Badge>
                <Text fontSize="xs" color={subtextColor}>Difficulty</Text>
              </VStack>
            )}
          </HStack>

          {/* Expanded Professional Content */}
          <Collapse in={isExpanded} animateOpacity>
            <VStack spacing={4} align="stretch">
              <Divider />

              {/* Trainer Certifications */}
              {professionalNotes?.trainerCertifications && professionalNotes.trainerCertifications.length > 0 && (
                <Box bg={useColorModeValue('blue.50', 'blue.900')} p={3} borderRadius="md">
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Icon as={PiCertificateBold} color={certColor} />
                      <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('blue.700', 'blue.200')}>
                        Trainer Certifications
                      </Text>
                    </HStack>
                    <HStack spacing={2} flexWrap="wrap">
                      {professionalNotes.trainerCertifications.map((cert, idx) => (
                        <Badge key={idx} colorScheme="blue" size="sm">
                          {cert}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Safety Considerations */}
              {professionalNotes?.safetyConsiderations && professionalNotes.safetyConsiderations.length > 0 && (
                <Box bg={useColorModeValue('red.50', 'red.900')} p={3} borderRadius="md">
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Icon as={PiShieldCheckBold} color={safetyColor} />
                      <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('red.700', 'red.200')}>
                        Safety Considerations
                      </Text>
                    </HStack>
                    <VStack spacing={1} align="start">
                      {professionalNotes.safetyConsiderations.map((safety, idx) => (
                        <Text key={idx} fontSize="sm" color={useColorModeValue('red.700', 'red.200')}>
                          • {safety}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              )}

              {/* Progression Guidance */}
              {professionalNotes?.progressionGuidance && professionalNotes.progressionGuidance.length > 0 && (
                <Box bg={useColorModeValue('green.50', 'green.900')} p={3} borderRadius="md">
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Icon as={PiTrendUpBold} color={progressColor} />
                      <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('green.700', 'green.200')}>
                        Progression Guidance
                      </Text>
                    </HStack>
                    <VStack spacing={1} align="start">
                      {professionalNotes.progressionGuidance.map((guidance, idx) => (
                        <Text key={idx} fontSize="sm" color={useColorModeValue('green.700', 'green.200')}>
                          • {guidance}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              )}

              {/* Coaching Tips */}
              {professionalNotes?.coachingTips && professionalNotes.coachingTips.length > 0 && (
                <Box bg={useColorModeValue('purple.50', 'purple.900')} p={3} borderRadius="md">
                  <VStack spacing={2} align="start">
                    <HStack>
                      <Icon as={PiLightbulbBold} color={tipColor} />
                      <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('purple.700', 'purple.200')}>
                        Coaching Tips
                      </Text>
                    </HStack>
                    <VStack spacing={1} align="start">
                      {professionalNotes.coachingTips.map((tip, idx) => (
                        <Text key={idx} fontSize="sm" color={useColorModeValue('purple.700', 'purple.200')}>
                          💡 {tip}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              )}

              {/* Workout Summary */}
              {workoutType && (
                <Box bg={useColorModeValue('gray.50', 'gray.700')} p={3} borderRadius="md">
                  <HStack justify="space-between" align="center">
                    <Text fontSize="sm" color={subtextColor}>
                      Workout Type: <Text as="span" fontWeight="semibold" color={textColor} textTransform="capitalize">{workoutType}</Text>
                    </Text>
                  </HStack>
                </Box>
              )}
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
});

export default ProfessionalTrainerPanel;
