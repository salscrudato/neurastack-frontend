import {
  VStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
  HStack,
  Wrap,
  WrapItem,
  Badge,
} from '@chakra-ui/react';
import {
  PiHeartBold,
  PiTargetBold,
  PiPersonBold,
  PiBarbell,
  PiTrophyBold,
  PiPlayBold,
} from 'react-icons/pi';
import { useFitnessStore } from '../../store/useFitnessStore';

const fitnessGoals = [
  {
    value: 'lose_weight',
    label: 'Lose Weight',
    description: 'Burn calories and reduce body fat',
    icon: PiPersonBold,
    color: 'red',
  },
  {
    value: 'build_muscle',
    label: 'Build Muscle',
    description: 'Increase strength and muscle mass',
    icon: PiBarbell,
    color: 'orange',
  },
  {
    value: 'improve_cardio',
    label: 'Improve Cardio',
    description: 'Enhance cardiovascular endurance',
    icon: PiHeartBold,
    color: 'pink',
  },
  {
    value: 'increase_flexibility',
    label: 'Increase Flexibility',
    description: 'Improve mobility and range of motion',
    icon: PiPlayBold,
    color: 'purple',
  },
  {
    value: 'general_fitness',
    label: 'General Fitness',
    description: 'Overall health and wellness',
    icon: PiTargetBold,
    color: 'blue',
  },
  {
    value: 'athletic_performance',
    label: 'Athletic Performance',
    description: 'Enhance sports performance',
    icon: PiTrophyBold,
    color: 'green',
  },
];

interface GoalsStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function GoalsStep({ onNext, onPrev }: GoalsStepProps) {
  const { profile, updateProfile } = useFitnessStore();
  
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleGoalToggle = (goalValue: string) => {
    const currentGoals = profile.goals || [];
    const isSelected = currentGoals.includes(goalValue);
    
    let newGoals;
    if (isSelected) {
      newGoals = currentGoals.filter(goal => goal !== goalValue);
    } else {
      newGoals = [...currentGoals, goalValue];
    }
    
    updateProfile({ goals: newGoals });
  };

  const isGoalSelected = (goalValue: string) => {
    return profile.goals?.includes(goalValue) || false;
  };

  const canProceed = profile.goals && profile.goals.length > 0;

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Header */}
      <VStack spacing={2} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          What are your fitness goals?
        </Text>
        <Text fontSize="md" color={subtextColor}>
          Select all that apply - we'll customize your plan accordingly
        </Text>
        {profile.goals && profile.goals.length > 0 && (
          <Badge colorScheme="blue" variant="subtle">
            {profile.goals.length} goal{profile.goals.length !== 1 ? 's' : ''} selected
          </Badge>
        )}
      </VStack>

      {/* Goals grid */}
      <Wrap spacing={3} justify="center">
        {fitnessGoals.map((goal) => {
          const isSelected = isGoalSelected(goal.value);
          
          return (
            <WrapItem key={goal.value}>
              <Button
                w={{ base: "140px", md: "160px" }}
                h="120px"
                bg={isSelected ? `${goal.color}.50` : cardBg}
                border="2px solid"
                borderColor={isSelected ? `${goal.color}.500` : borderColor}
                borderRadius="xl"
                onClick={() => handleGoalToggle(goal.value)}
                _hover={{
                  bg: isSelected 
                    ? `${goal.color}.100` 
                    : useColorModeValue('gray.50', 'gray.700'),
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
                variant="ghost"
                flexDirection="column"
                p={4}
              >
                <VStack spacing={2}>
                  <Icon
                    as={goal.icon}
                    boxSize={8}
                    color={isSelected ? `${goal.color}.500` : subtextColor}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={textColor}
                    textAlign="center"
                    lineHeight="short"
                  >
                    {goal.label}
                  </Text>
                </VStack>
              </Button>
            </WrapItem>
          );
        })}
      </Wrap>

      {/* Navigation buttons */}
      <HStack spacing={4} justify="space-between" pt={4}>
        <Button
          variant="outline"
          onClick={onPrev}
          size="lg"
          flex={1}
        >
          Back
        </Button>
        <Button
          colorScheme="blue"
          onClick={onNext}
          size="lg"
          flex={1}
          isDisabled={!canProceed}
        >
          Continue
        </Button>
      </HStack>
    </VStack>
  );
}
