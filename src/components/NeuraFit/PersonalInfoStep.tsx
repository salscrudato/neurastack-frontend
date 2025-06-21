import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Icon,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    SimpleGrid,
    Text,
    useColorModeValue,
    useToast,
    VStack
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FaUser, FaUserFriends, FaUserSlash } from 'react-icons/fa';
import { PiCalendarBold, PiMinusBold, PiPlusBold, PiScalesBold } from 'react-icons/pi';
import { useFitnessStore } from '../../store/useFitnessStore';
import NavigationButtons from './NavigationButtons';

interface PersonalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isEditingFromDashboard?: boolean;
}

export default function PersonalInfoStep({ onNext, onBack, isEditingFromDashboard }: PersonalInfoStepProps) {
  const { profile, updateProfile, syncToFirestore } = useFitnessStore();
  const toast = useToast();

  // Local state for form inputs - using numeric values directly
  const [age, setAge] = useState<number | undefined>(profile.age);
  const [gender, setGender] = useState<'male' | 'female' | 'rather_not_say' | ''>(profile.gender || '');
  const [weight, setWeight] = useState<number | undefined>(profile.weight);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  // Theme colors
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const hoverBorderColor = useColorModeValue('gray.300', 'gray.500');

  // Validation function
  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!age || age < 13 || age > 100) {
      errors.push('Please select a valid age range');
    }

    // Weight is optional, but if provided should be reasonable
    if (weight && (weight < 50 || weight > 500)) {
      errors.push('Please select a valid weight range');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [age, weight]);

  // Update profile when local state changes
  useEffect(() => {
    const updates: Partial<typeof profile> = {
      age: age,
      gender: gender === '' ? undefined : gender,
      weight: weight,
    };

    updateProfile(updates);

    // Validate form when values change
    if (showValidation) {
      validateForm();
    }
  }, [age, gender, weight, updateProfile, showValidation, validateForm]);

  // Handle navigation with validation and Firebase sync
  const handleNext = useCallback(async () => {
    setShowValidation(true);

    if (!validateForm()) {
      toast({
        title: 'Please complete required fields',
        description: validationErrors.join(', '),
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      await syncToFirestore();
      console.log('✅ Personal info synced to Firebase before navigation');
    } catch (error) {
      console.warn('Failed to sync personal info to Firebase:', error);
      toast({
        title: 'Sync Error',
        description: 'Failed to save your information. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    onNext();
  }, [validateForm, validationErrors, syncToFirestore, onNext, toast]);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);



  const canProceed = age !== undefined && age > 0; // Age is required

  return (
    <VStack
      spacing={{ base: 4, md: 5 }}
      align="stretch"
      w="100%"
      h="100%"
      justify="space-between"
      p={{ base: 3, md: 4 }}
      overflow="hidden"
    >
      {/* Compact Header */}
      <VStack spacing={2} textAlign="center" flex="0 0 auto">
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color={textColor}
          lineHeight="1.25"
        >
          Personal Information
        </Text>
        <Text
          fontSize={{ base: "sm", md: "md" }}
          color={subtextColor}
          maxW="350px"
          lineHeight="1.4"
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          fontWeight="medium"
        >
          Help us personalize your experience
        </Text>
      </VStack>

      {/* Compact Form */}
      <VStack spacing={{ base: 4, md: 5 }} align="stretch" flex="1 1 auto" justify="center">
        {/* Age Input - Required */}
        <FormControl isRequired>
          <FormLabel color={textColor} fontSize="sm" fontWeight="medium" mb={3}>
            <HStack spacing={2}>
              <Icon as={PiCalendarBold} color="blue.500" boxSize={4} />
              <Text>Age</Text>
            </HStack>
          </FormLabel>

          <Box position="relative">
            <NumberInput
              value={age || ''}
              onChange={(valueString, valueNumber) => {
                if (valueString === '') {
                  setAge(undefined);
                } else if (!isNaN(valueNumber) && valueNumber >= 13 && valueNumber <= 100) {
                  setAge(valueNumber);
                }
              }}
              min={13}
              max={100}
              step={1}
              size="lg"
              bg={bgColor}
              borderRadius="xl"
              borderColor={borderColor}
              _hover={{
                borderColor: "blue.300",
              }}
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
              }}
            >
              <NumberInputField
                placeholder="Enter your age"
                textAlign="center"
                fontWeight="semibold"
                fontSize={{ base: "lg", md: "xl" }}
                h={{ base: "56px", md: "60px" }}
                _placeholder={{
                  color: subtextColor,
                  fontSize: { base: "sm", md: "md" }
                }}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <NumberInputStepper w={{ base: "40px", md: "32px" }}>
                <NumberIncrementStepper
                  bg={bgColor}
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.300"
                  }}
                  _active={{
                    bg: "blue.100",
                    transform: "scale(0.95)"
                  }}
                  borderColor={borderColor}
                  h={{ base: "28px", md: "30px" }}
                  transition="all 0.2s"
                >
                  <Icon as={PiPlusBold} boxSize={{ base: 4, md: 3 }} color="blue.500" />
                </NumberIncrementStepper>
                <NumberDecrementStepper
                  bg={bgColor}
                  _hover={{
                    bg: "blue.50",
                    borderColor: "blue.300"
                  }}
                  _active={{
                    bg: "blue.100",
                    transform: "scale(0.95)"
                  }}
                  borderColor={borderColor}
                  h={{ base: "28px", md: "30px" }}
                  transition="all 0.2s"
                >
                  <Icon as={PiMinusBold} boxSize={{ base: 4, md: 3 }} color="blue.500" />
                </NumberDecrementStepper>
              </NumberInputStepper>
            </NumberInput>

            {/* Age validation hint and clear button */}
            <HStack justify="space-between" align="center" mt={2}>
              <Text fontSize="xs" color={subtextColor} flex="1" textAlign="center">
                Age must be between 13-100 years
              </Text>
              {age && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => setAge(undefined)}
                  fontSize="xs"
                  h="20px"
                  minW="auto"
                  px={2}
                  _hover={{
                    bg: "red.50",
                    color: "red.500"
                  }}
                >
                  Clear
                </Button>
              )}
            </HStack>
          </Box>
        </FormControl>

        <Divider />

        {/* Weight Input - Optional */}
        <FormControl>
          <FormLabel color={textColor} fontSize="sm" fontWeight="medium" mb={3}>
            <HStack spacing={2}>
              <Icon as={PiScalesBold} color="green.500" boxSize={4} />
              <Text>Weight (Optional)</Text>
            </HStack>
          </FormLabel>

          <Box position="relative">
            <NumberInput
              value={weight || ''}
              onChange={(valueString, valueNumber) => {
                if (valueString === '') {
                  setWeight(undefined);
                } else if (!isNaN(valueNumber) && valueNumber >= 50 && valueNumber <= 500) {
                  setWeight(valueNumber);
                }
              }}
              min={50}
              max={500}
              step={1}
              size="lg"
              bg={bgColor}
              borderRadius="xl"
              borderColor={borderColor}
              _hover={{
                borderColor: "green.300",
              }}
              _focus={{
                borderColor: "green.400",
                boxShadow: "0 0 0 1px var(--chakra-colors-green-400)"
              }}
            >
              <NumberInputField
                placeholder="Enter weight in lbs"
                textAlign="center"
                fontWeight="semibold"
                fontSize={{ base: "lg", md: "xl" }}
                h={{ base: "56px", md: "60px" }}
                _placeholder={{
                  color: subtextColor,
                  fontSize: { base: "sm", md: "md" }
                }}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <NumberInputStepper w={{ base: "40px", md: "32px" }}>
                <NumberIncrementStepper
                  bg={bgColor}
                  _hover={{
                    bg: "green.50",
                    borderColor: "green.300"
                  }}
                  _active={{
                    bg: "green.100",
                    transform: "scale(0.95)"
                  }}
                  borderColor={borderColor}
                  h={{ base: "28px", md: "30px" }}
                  transition="all 0.2s"
                >
                  <Icon as={PiPlusBold} boxSize={{ base: 4, md: 3 }} color="green.500" />
                </NumberIncrementStepper>
                <NumberDecrementStepper
                  bg={bgColor}
                  _hover={{
                    bg: "green.50",
                    borderColor: "green.300"
                  }}
                  _active={{
                    bg: "green.100",
                    transform: "scale(0.95)"
                  }}
                  borderColor={borderColor}
                  h={{ base: "28px", md: "30px" }}
                  transition="all 0.2s"
                >
                  <Icon as={PiMinusBold} boxSize={{ base: 4, md: 3 }} color="green.500" />
                </NumberDecrementStepper>
              </NumberInputStepper>
            </NumberInput>

            {/* Weight validation hint and clear button */}
            <HStack justify="space-between" align="center" mt={2}>
              <Text fontSize="xs" color={subtextColor} flex="1" textAlign="center">
                Weight should be between 50-500 lbs (optional)
              </Text>
              {weight && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => setWeight(undefined)}
                  fontSize="xs"
                  h="20px"
                  minW="auto"
                  px={2}
                  _hover={{
                    bg: "red.50",
                    color: "red.500"
                  }}
                >
                  Clear
                </Button>
              )}
            </HStack>

            {/* Quick weight presets for common ranges */}
            <Box mt={4}>
              <Text fontSize="xs" color={subtextColor} textAlign="center" mb={2}>
                Quick select:
              </Text>
              <HStack spacing={{ base: 1, md: 2 }} justify="center" flexWrap="wrap">
                {[100, 125, 150, 175, 200, 225].map((presetWeight) => (
                  <Button
                    key={presetWeight}
                    size="xs"
                    variant={weight === presetWeight ? "solid" : "ghost"}
                    colorScheme="green"
                    onClick={() => setWeight(presetWeight)}
                    borderRadius="full"
                    fontSize={{ base: "xs", md: "xs" }}
                    minW={{ base: "42px", md: "45px" }}
                    h={{ base: "32px", md: "28px" }}
                    _hover={{
                      bg: weight === presetWeight ? "green.600" : "green.50",
                      color: weight === presetWeight ? "white" : "green.600",
                      transform: "scale(1.05)"
                    }}
                    _active={{
                      transform: "scale(0.95)"
                    }}
                    transition="all 0.2s"
                    fontWeight="semibold"
                  >
                    {presetWeight}
                  </Button>
                ))}
              </HStack>
            </Box>
          </Box>
        </FormControl>

        <Divider />

        {/* Gender - Optional with Icon Toggle Boxes */}
        <FormControl>
          <FormLabel color={textColor} fontSize="sm" fontWeight="medium" mb={3}>
            Gender (Optional)
          </FormLabel>
          <SimpleGrid columns={3} spacing={3} w="100%">
            {/* Male */}
            <Button
              variant={gender === 'male' ? 'solid' : 'outline'}
              colorScheme={gender === 'male' ? 'blue' : 'gray'}
              onClick={() => setGender(gender === 'male' ? '' : 'male')}
              h="60px"
              flexDirection="column"
              bg={gender === 'male' ? 'blue.500' : bgColor}
              borderColor={gender === 'male' ? 'blue.500' : borderColor}
              color={gender === 'male' ? 'white' : textColor}
              _hover={{
                bg: gender === 'male' ? 'blue.600' : hoverBgColor,
                borderColor: gender === 'male' ? 'blue.600' : hoverBorderColor,
              }}
            >
              <Icon as={FaUser} boxSize={5} mb={1} />
              <Text fontSize="xs" fontWeight="medium">Male</Text>
            </Button>

            {/* Female */}
            <Button
              variant={gender === 'female' ? 'solid' : 'outline'}
              colorScheme={gender === 'female' ? 'pink' : 'gray'}
              onClick={() => setGender(gender === 'female' ? '' : 'female')}
              h="60px"
              flexDirection="column"
              bg={gender === 'female' ? 'pink.500' : bgColor}
              borderColor={gender === 'female' ? 'pink.500' : borderColor}
              color={gender === 'female' ? 'white' : textColor}
              _hover={{
                bg: gender === 'female' ? 'pink.600' : hoverBgColor,
                borderColor: gender === 'female' ? 'pink.600' : hoverBorderColor,
              }}
            >
              <Icon as={FaUserFriends} boxSize={5} mb={1} />
              <Text fontSize="xs" fontWeight="medium">Female</Text>
            </Button>

            {/* Rather Not Say */}
            <Button
              variant={gender === 'rather_not_say' ? 'solid' : 'outline'}
              colorScheme={gender === 'rather_not_say' ? 'purple' : 'gray'}
              onClick={() => setGender(gender === 'rather_not_say' ? '' : 'rather_not_say')}
              h="60px"
              flexDirection="column"
              bg={gender === 'rather_not_say' ? 'purple.500' : bgColor}
              borderColor={gender === 'rather_not_say' ? 'purple.500' : borderColor}
              color={gender === 'rather_not_say' ? 'white' : textColor}
              _hover={{
                bg: gender === 'rather_not_say' ? 'purple.600' : hoverBgColor,
                borderColor: gender === 'rather_not_say' ? 'purple.600' : hoverBorderColor,
              }}
            >
              <Icon as={FaUserSlash} boxSize={5} mb={1} />
              <Text fontSize="2xs" fontWeight="medium" textAlign="center" lineHeight="1.1">
                Rather Not Say
              </Text>
            </Button>
          </SimpleGrid>
        </FormControl>
      </VStack>

      {/* Fixed Navigation */}
      <Box flex="0 0 auto" w="100%">
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          canProceed={canProceed}
          nextLabel={isEditingFromDashboard ? "Save" : "Continue"}
          backLabel={isEditingFromDashboard ? "Back to Dashboard" : "Back"}
        />
      </Box>
    </VStack>
  );
}
