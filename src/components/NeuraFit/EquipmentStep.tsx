import {
  Box,
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
  PiPersonBold,
  PiHeartBold,
  PiTargetBold,
  PiTrophyBold,
  PiPlayBold,
  PiBarbell,
} from 'react-icons/pi';
import { useFitnessStore } from '../../store/useFitnessStore';

const equipmentOptions = [
  {
    value: 'none',
    label: 'No Equipment',
    description: 'Bodyweight exercises only',
    icon: PiPersonBold,
    color: 'green',
  },
  {
    value: 'dumbbells',
    label: 'Dumbbells',
    description: 'Adjustable or fixed weights',
    icon: PiBarbell,
    color: 'blue',
  },
  {
    value: 'resistance_bands',
    label: 'Resistance Bands',
    description: 'Elastic bands for strength training',
    icon: PiTargetBold,
    color: 'purple',
  },
  {
    value: 'yoga_mat',
    label: 'Yoga Mat',
    description: 'For floor exercises and stretching',
    icon: PiPlayBold,
    color: 'pink',
  },
  {
    value: 'cardio_machine',
    label: 'Cardio Machine',
    description: 'Treadmill, bike, elliptical, etc.',
    icon: PiHeartBold,
    color: 'red',
  },
  {
    value: 'kettlebell',
    label: 'Kettlebell',
    description: 'For functional strength training',
    icon: PiTrophyBold,
    color: 'orange',
  },
];

interface EquipmentStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function EquipmentStep({ onNext, onPrev }: EquipmentStepProps) {
  const { profile, updateProfile } = useFitnessStore();
  
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleEquipmentToggle = (equipmentValue: string) => {
    const currentEquipment = profile.equipment || [];
    const isSelected = currentEquipment.includes(equipmentValue);
    
    let newEquipment;
    if (isSelected) {
      newEquipment = currentEquipment.filter(eq => eq !== equipmentValue);
    } else {
      // If selecting "none", clear all other equipment
      if (equipmentValue === 'none') {
        newEquipment = ['none'];
      } else {
        // If selecting other equipment, remove "none" if it exists
        newEquipment = currentEquipment.filter(eq => eq !== 'none');
        newEquipment = [...newEquipment, equipmentValue];
      }
    }
    
    updateProfile({ equipment: newEquipment });
  };

  const isEquipmentSelected = (equipmentValue: string) => {
    return profile.equipment?.includes(equipmentValue) || false;
  };

  const canProceed = profile.equipment && profile.equipment.length > 0;

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Header */}
      <VStack spacing={2} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          What equipment do you have?
        </Text>
        <Text fontSize="md" color={subtextColor}>
          Select all available equipment to personalize your workouts
        </Text>
        {profile.equipment && profile.equipment.length > 0 && (
          <Badge colorScheme="blue" variant="subtle">
            {profile.equipment.length} item{profile.equipment.length !== 1 ? 's' : ''} selected
          </Badge>
        )}
      </VStack>

      {/* Equipment grid */}
      <Wrap spacing={3} justify="center">
        {equipmentOptions.map((equipment) => {
          const isSelected = isEquipmentSelected(equipment.value);
          
          return (
            <WrapItem key={equipment.value}>
              <Button
                w={{ base: "140px", md: "160px" }}
                h="120px"
                bg={isSelected ? `${equipment.color}.50` : cardBg}
                border="2px solid"
                borderColor={isSelected ? `${equipment.color}.500` : borderColor}
                borderRadius="xl"
                onClick={() => handleEquipmentToggle(equipment.value)}
                _hover={{
                  bg: isSelected 
                    ? `${equipment.color}.100` 
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
                    as={equipment.icon}
                    boxSize={8}
                    color={isSelected ? `${equipment.color}.500` : subtextColor}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={textColor}
                    textAlign="center"
                    lineHeight="short"
                  >
                    {equipment.label}
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
