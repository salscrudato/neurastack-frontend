import {
  Box,
  VStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { PiPersonBold, PiHeartBold, PiTrophyBold } from 'react-icons/pi';
import { useFitnessStore } from '../../store/useFitnessStore';

const fitnessLevels = [
  {
    value: 'beginner' as const,
    label: 'Beginner',
    description: 'New to fitness or getting back into it',
    icon: PiPersonBold,
    color: 'green',
  },
  {
    value: 'intermediate' as const,
    label: 'Intermediate',
    description: 'Regular exercise routine, some experience',
    icon: PiHeartBold,
    color: 'blue',
  },
  {
    value: 'advanced' as const,
    label: 'Advanced',
    description: 'Experienced athlete or fitness enthusiast',
    icon: PiTrophyBold,
    color: 'purple',
  },
];

interface FitnessLevelStepProps {
  onNext: () => void;
}

export default function FitnessLevelStep({ onNext }: FitnessLevelStepProps) {
  const { profile, updateProfile } = useFitnessStore();
  
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLevelSelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
    updateProfile({ fitnessLevel: level });
    // Auto-advance after selection
    setTimeout(onNext, 300);
  };

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Header */}
      <VStack spacing={2} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          What's your fitness level?
        </Text>
        <Text fontSize="md" color={subtextColor}>
          This helps us create the perfect workout plan for you
        </Text>
      </VStack>

      {/* Fitness level options */}
      <VStack spacing={4} w="100%">
        {fitnessLevels.map((level) => (
          <Button
            key={level.value}
            w="100%"
            h="auto"
            p={6}
            bg={profile.fitnessLevel === level.value ? `${level.color}.50` : cardBg}
            border="2px solid"
            borderColor={
              profile.fitnessLevel === level.value
                ? `${level.color}.500`
                : borderColor
            }
            borderRadius="xl"
            onClick={() => handleLevelSelect(level.value)}
            _hover={{
              bg: profile.fitnessLevel === level.value 
                ? `${level.color}.100` 
                : useColorModeValue('gray.50', 'gray.700'),
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            transition="all 0.2s ease"
            variant="ghost"
          >
            <HStack spacing={4} w="100%" justify="start">
              <Icon
                as={level.icon}
                boxSize={8}
                color={
                  profile.fitnessLevel === level.value
                    ? `${level.color}.500`
                    : subtextColor
                }
              />
              <VStack align="start" spacing={1} flex={1}>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  color={textColor}
                  textAlign="left"
                >
                  {level.label}
                </Text>
                <Text
                  fontSize="sm"
                  color={subtextColor}
                  textAlign="left"
                >
                  {level.description}
                </Text>
              </VStack>
            </HStack>
          </Button>
        ))}
      </VStack>
    </VStack>
  );
}
