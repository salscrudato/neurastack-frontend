import {
  VStack,
  Text,
  useColorModeValue,
  FormControl,
  FormLabel,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Box,
  HStack,
  Switch,
  Divider,
} from '@chakra-ui/react';
import { useState, useCallback, useEffect } from 'react';
import { useFitnessStore } from '../../store/useFitnessStore';
import NavigationButtons from './NavigationButtons';

interface PersonalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isEditingFromDashboard?: boolean;
}

export default function PersonalInfoStep({ onNext, onBack, isEditingFromDashboard }: PersonalInfoStepProps) {
  const { profile, updateProfile, syncToFirestore } = useFitnessStore();
  
  // Local state for form inputs
  const [age, setAge] = useState<number>(profile.age || 25);
  const [gender, setGender] = useState<'male' | 'female' | 'rather_not_say' | ''>(profile.gender || '');
  const [weight, setWeight] = useState<number>(profile.weight || 70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(profile.weightUnit || 'kg');
  const [includeWeight, setIncludeWeight] = useState<boolean>(!!profile.weight);

  // Theme colors
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Update profile when local state changes
  useEffect(() => {
    const updates: Partial<typeof profile> = {
      age,
      gender: gender === '' ? undefined : gender,
      weight: includeWeight ? weight : undefined,
      weightUnit,
    };
    
    updateProfile(updates);
  }, [age, gender, weight, weightUnit, includeWeight, updateProfile]);

  // Handle navigation with Firebase sync
  const handleNext = useCallback(async () => {
    try {
      await syncToFirestore();
      console.log('✅ Personal info synced to Firebase before navigation');
    } catch (error) {
      console.warn('Failed to sync personal info to Firebase:', error);
    }
    onNext();
  }, [syncToFirestore, onNext]);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  // Convert weight between units
  const convertWeight = useCallback((value: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs') => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'kg' && toUnit === 'lbs') {
      return Math.round(value * 2.20462);
    } else {
      return Math.round(value / 2.20462);
    }
  }, []);

  const handleWeightUnitChange = useCallback((newUnit: 'kg' | 'lbs') => {
    const convertedWeight = convertWeight(weight, weightUnit, newUnit);
    setWeight(convertedWeight);
    setWeightUnit(newUnit);
  }, [weight, weightUnit, convertWeight]);

  const canProceed = age >= 13 && age <= 100; // Basic age validation

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
          Personal Information
        </Text>
        <Text
          fontSize="md"
          color={subtextColor}
          maxW="400px"
          lineHeight="1.5"
        >
          Help us personalize your workout experience. All information is optional except age.
        </Text>
      </VStack>

      {/* Form */}
      <VStack spacing={6} align="stretch">
        {/* Age - Required */}
        <FormControl isRequired>
          <HStack justify="space-between" align="center" mb={3}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="medium" mb={0}>
              Age
            </FormLabel>
            <Box
              bg={useColorModeValue('blue.50', 'blue.900')}
              color={useColorModeValue('blue.700', 'blue.200')}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
            >
              {age} years old
            </Box>
          </HStack>

          <Box px={2} py={4}>
            <Slider
              value={age}
              onChange={(value) => setAge(value)}
              min={13}
              max={100}
              step={1}
              colorScheme="blue"
              focusThumbOnChange={false}
            >
              <SliderTrack
                bg={useColorModeValue('gray.200', 'gray.600')}
                h={2}
                borderRadius="full"
              >
                <SliderFilledTrack
                  bg="linear-gradient(90deg, #4299E1 0%, #3182CE 100%)"
                  borderRadius="full"
                />
              </SliderTrack>
              <SliderThumb
                boxSize={6}
                bg="white"
                border="3px solid"
                borderColor="blue.500"
                boxShadow="0 2px 8px rgba(66, 153, 225, 0.3)"
                _focus={{
                  boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)"
                }}
                _active={{
                  transform: "scale(1.1)"
                }}
              />

              {/* Age range markers */}
              <SliderMark value={18} mt={3} ml={-2} fontSize="xs" color={subtextColor} fontWeight="medium">
                18
              </SliderMark>
              <SliderMark value={30} mt={3} ml={-2} fontSize="xs" color={subtextColor} fontWeight="medium">
                30
              </SliderMark>
              <SliderMark value={50} mt={3} ml={-2} fontSize="xs" color={subtextColor} fontWeight="medium">
                50
              </SliderMark>
              <SliderMark value={70} mt={3} ml={-2} fontSize="xs" color={subtextColor} fontWeight="medium">
                70
              </SliderMark>
              <SliderMark value={90} mt={3} ml={-2} fontSize="xs" color={subtextColor} fontWeight="medium">
                90
              </SliderMark>
            </Slider>
          </Box>

          <Text fontSize="xs" color={subtextColor} textAlign="center" mt={2}>
            Drag the slider or tap to select your age
          </Text>
        </FormControl>

        <Divider />

        {/* Gender - Optional */}
        <FormControl>
          <FormLabel color={textColor} fontSize="sm" fontWeight="medium">
            Gender (Optional)
          </FormLabel>
          <Select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'rather_not_say' | '')}
            placeholder="Select gender"
            bg={bgColor}
            borderColor={borderColor}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="rather_not_say">Rather Not Say</option>
          </Select>
        </FormControl>

        <Divider />

        {/* Weight - Optional */}
        <FormControl>
          <HStack justify="space-between" align="center" mb={3}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="medium" mb={0}>
              Weight (Optional)
            </FormLabel>
            <Switch
              isChecked={includeWeight}
              onChange={(e) => setIncludeWeight(e.target.checked)}
              colorScheme="blue"
              size="sm"
            />
          </HStack>
          
          {includeWeight && (
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <Box
                  bg={useColorModeValue('green.50', 'green.900')}
                  color={useColorModeValue('green.700', 'green.200')}
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  {weight} {weightUnit}
                </Box>

                <Select
                  value={weightUnit}
                  onChange={(e) => handleWeightUnitChange(e.target.value as 'kg' | 'lbs')}
                  w="80px"
                  size="sm"
                  bg={bgColor}
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </Select>
              </HStack>

              <Box px={2} py={2}>
                <Slider
                  value={weight}
                  onChange={(value) => setWeight(value)}
                  min={weightUnit === 'kg' ? 30 : 66}
                  max={weightUnit === 'kg' ? 200 : 440}
                  step={weightUnit === 'kg' ? 1 : 2}
                  colorScheme="green"
                  focusThumbOnChange={false}
                >
                  <SliderTrack
                    bg={useColorModeValue('gray.200', 'gray.600')}
                    h={2}
                    borderRadius="full"
                  >
                    <SliderFilledTrack
                      bg="linear-gradient(90deg, #48BB78 0%, #38A169 100%)"
                      borderRadius="full"
                    />
                  </SliderTrack>
                  <SliderThumb
                    boxSize={6}
                    bg="white"
                    border="3px solid"
                    borderColor="green.500"
                    boxShadow="0 2px 8px rgba(72, 187, 120, 0.3)"
                    _focus={{
                      boxShadow: "0 0 0 3px rgba(72, 187, 120, 0.6)"
                    }}
                    _active={{
                      transform: "scale(1.1)"
                    }}
                  />

                  {/* Weight range markers */}
                  {weightUnit === 'kg' ? (
                    <>
                      <SliderMark value={50} mt={3} ml={-2} fontSize="xs" color={subtextColor} fontWeight="medium">
                        50
                      </SliderMark>
                      <SliderMark value={70} mt={3} ml={-2} fontSize="xs" color={subtextColor} fontWeight="medium">
                        70
                      </SliderMark>
                      <SliderMark value={90} mt={3} ml={-2} fontSize="xs" color={subtextColor} fontWeight="medium">
                        90
                      </SliderMark>
                      <SliderMark value={120} mt={3} ml={-3} fontSize="xs" color={subtextColor} fontWeight="medium">
                        120
                      </SliderMark>
                    </>
                  ) : (
                    <>
                      <SliderMark value={110} mt={3} ml={-3} fontSize="xs" color={subtextColor} fontWeight="medium">
                        110
                      </SliderMark>
                      <SliderMark value={154} mt={3} ml={-3} fontSize="xs" color={subtextColor} fontWeight="medium">
                        154
                      </SliderMark>
                      <SliderMark value={200} mt={3} ml={-3} fontSize="xs" color={subtextColor} fontWeight="medium">
                        200
                      </SliderMark>
                      <SliderMark value={265} mt={3} ml={-3} fontSize="xs" color={subtextColor} fontWeight="medium">
                        265
                      </SliderMark>
                    </>
                  )}
                </Slider>
              </Box>

              <Text fontSize="xs" color={subtextColor} textAlign="center">
                Drag the slider to set your weight in {weightUnit}
              </Text>
            </VStack>
          )}
        </FormControl>

        {/* Info text */}
        <Box bg={useColorModeValue('blue.50', 'blue.900')} p={4} borderRadius="md">
          <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')}>
            💡 This information helps us create more personalized workout recommendations. 
            You can always update these details later in your profile settings.
          </Text>
        </Box>
      </VStack>

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
