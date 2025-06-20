import {
    Badge,
    Box,
    Checkbox,
    Divider,
    HStack,
    Icon,
    SimpleGrid,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { PiHeartBold, PiShieldCheckBold, PiWarningBold } from 'react-icons/pi';
import { useFitnessStore } from '../../store/useFitnessStore';
import NavigationButtons from './NavigationButtons';

interface InjuriesStepProps {
  onNext: () => void;
  onBack: () => void;
  isEditingFromDashboard?: boolean;
}

const COMMON_INJURIES = [
  { id: 'lower_back', label: 'Lower Back', icon: PiWarningBold },
  { id: 'knee', label: 'Knee', icon: PiWarningBold },
  { id: 'shoulder', label: 'Shoulder', icon: PiWarningBold },
  { id: 'neck', label: 'Neck', icon: PiWarningBold },
  { id: 'ankle', label: 'Ankle', icon: PiWarningBold },
  { id: 'wrist', label: 'Wrist', icon: PiWarningBold },
  { id: 'hip', label: 'Hip', icon: PiWarningBold },
  { id: 'elbow', label: 'Elbow', icon: PiWarningBold },
];

export default function InjuriesStep({ onNext, onBack, isEditingFromDashboard }: InjuriesStepProps) {
  const { profile, updateProfile, syncToFirestore } = useFitnessStore();
  
  // Local state for selected injuries
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>(profile.injuries || []);

  // Theme colors
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('blue.200', 'blue.600');
  const warningBg = useColorModeValue('orange.50', 'orange.900');
  const warningTextColor = useColorModeValue('orange.700', 'orange.200');
  const warningSubtextColor = useColorModeValue('orange.600', 'orange.300');
  const infoBg = useColorModeValue('blue.50', 'blue.900');
  const infoTextColor = useColorModeValue('blue.700', 'blue.200');

  // Update profile when injuries change
  useEffect(() => {
    updateProfile({ injuries: selectedInjuries });
  }, [selectedInjuries, updateProfile]);

  // Handle navigation with Firebase sync
  const handleNext = useCallback(async () => {
    try {
      await syncToFirestore();
      console.log('✅ Injuries info synced to Firebase before navigation');
    } catch (error) {
      console.warn('Failed to sync injuries info to Firebase:', error);
    }
    onNext();
  }, [syncToFirestore, onNext]);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleInjuryToggle = useCallback((injuryId: string) => {
    setSelectedInjuries(prev => {
      if (prev.includes(injuryId)) {
        return prev.filter(id => id !== injuryId);
      } else {
        return [...prev, injuryId];
      }
    });
  }, []);

  const canProceed = true; // Always can proceed, injuries are optional

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Header */}
      <VStack spacing={3} textAlign="center">
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color={textColor}
          lineHeight="1.25"
        >
          Any Current Injuries?
        </Text>
        <Text
          fontSize="md"
          color={subtextColor}
          maxW="400px"
          lineHeight="1.5"
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          fontWeight="medium"
        >
          Let us know about any injuries or limitations so we can create safer workouts for you.
        </Text>
      </VStack>

      {/* No Injuries Option */}
      <Box
        p={4}
        bg={selectedInjuries.length === 0 ? selectedBg : bgColor}
        border="2px solid"
        borderColor={selectedInjuries.length === 0 ? selectedBorder : borderColor}
        borderRadius="lg"
        cursor="pointer"
        onClick={() => setSelectedInjuries([])}
        transition="all 0.2s"
        _hover={{ borderColor: selectedInjuries.length === 0 ? selectedBorder : 'blue.300' }}
      >
        <HStack spacing={3}>
          <Icon as={PiShieldCheckBold} boxSize={6} color="green.500" />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="semibold" color={textColor}>
              No Current Injuries
            </Text>
            <Text fontSize="sm" color={subtextColor}>
              I'm injury-free and ready for any workout
            </Text>
          </VStack>
          {selectedInjuries.length === 0 && (
            <Badge colorScheme="green" variant="solid">
              Selected
            </Badge>
          )}
        </HStack>
      </Box>

      <Divider />

      {/* Injuries Grid */}
      <VStack spacing={4} align="stretch">
        <Text fontSize="md" fontWeight="medium" color={textColor}>
          Or select any current injuries or limitations:
        </Text>
        
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
          {COMMON_INJURIES.map((injury) => {
            const isSelected = selectedInjuries.includes(injury.id);
            
            return (
              <Box
                key={injury.id}
                p={4}
                bg={isSelected ? selectedBg : bgColor}
                border="2px solid"
                borderColor={isSelected ? selectedBorder : borderColor}
                borderRadius="lg"
                cursor="pointer"
                onClick={() => handleInjuryToggle(injury.id)}
                transition="all 0.2s"
                _hover={{ borderColor: isSelected ? selectedBorder : 'blue.300' }}
              >
                <HStack spacing={3}>
                  <Icon as={injury.icon} boxSize={5} color={isSelected ? 'blue.500' : 'orange.500'} />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="medium" color={textColor} fontSize="sm">
                      {injury.label}
                    </Text>
                  </VStack>
                  <Checkbox
                    isChecked={isSelected}
                    onChange={() => handleInjuryToggle(injury.id)}
                    colorScheme="blue"
                    size="md"
                  />
                </HStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>

      {/* Selected Injuries Summary */}
      {selectedInjuries.length > 0 && (
        <Box bg={warningBg} p={4} borderRadius="md">
          <HStack spacing={2} mb={2}>
            <Icon as={PiHeartBold} color="orange.500" />
            <Text fontSize="sm" fontWeight="medium" color={warningTextColor}>
              Selected Injuries/Limitations:
            </Text>
          </HStack>
          <HStack spacing={2} flexWrap="wrap">
            {selectedInjuries.map((injuryId) => {
              const injury = COMMON_INJURIES.find(i => i.id === injuryId);
              return (
                <Badge key={injuryId} colorScheme="orange" variant="solid" fontSize="xs">
                  {injury?.label}
                </Badge>
              );
            })}
          </HStack>
          <Text fontSize="xs" color={warningSubtextColor} mt={2}>
            We'll modify exercises to accommodate these areas and suggest safer alternatives.
          </Text>
        </Box>
      )}

      {/* Info text */}
      <Box bg={infoBg} p={4} borderRadius="md">
        <Text fontSize="sm" color={infoTextColor}>
          💡 This information helps us create safer, more appropriate workouts.
          You can always update this information later in your profile settings.
        </Text>
      </Box>

      {/* Navigation */}
      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        canProceed={canProceed}
        nextLabel={isEditingFromDashboard ? "Save" : "Continue"}
        backLabel={isEditingFromDashboard ? "Back to Dashboard" : "Back"}
      />
    </VStack>
  );
}
