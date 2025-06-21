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

// Age and weight range definitions
const ageRanges = [
  { label: 'Teen', range: '13-17', midpoint: 15, color: 'purple', icon: PiSparkle },
  { label: 'Young Adult', range: '18-25', midpoint: 22, color: 'blue', icon: PiTrendUp },
  { label: 'Adult', range: '26-35', midpoint: 30, color: 'green', icon: PiCalendarBold },
  { label: 'Middle Adult', range: '36-45', midpoint: 40, color: 'orange', icon: PiCalendarBold },
  { label: 'Mature Adult', range: '46-55', midpoint: 50, color: 'red', icon: PiCalendarBold },
  { label: 'Senior', range: '56-65', midpoint: 60, color: 'teal', icon: PiCalendarBold },
  { label: 'Elder', range: '66+', midpoint: 70, color: 'gray', icon: PiCalendarBold },
];

const weightRanges = [
  { label: 'Light', range: '90-125', midpoint: 108, color: 'cyan', icon: PiSparkle },
  { label: 'Moderate Light', range: '126-150', midpoint: 138, color: 'blue', icon: PiTrendUp },
  { label: 'Moderate', range: '151-175', midpoint: 163, color: 'green', icon: PiScalesBold },
  { label: 'Moderate Heavy', range: '176-200', midpoint: 188, color: 'orange', icon: PiScalesBold },
  { label: 'Heavy', range: '201-225', midpoint: 213, color: 'red', icon: PiScalesBold },
  { label: 'Very Heavy', range: '226+', midpoint: 240, color: 'purple', icon: PiScalesBold },
];

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

  // Helper functions for range selection
  const handleAgeRangeSelect = (midpoint: number) => {
    setAge(midpoint);
  };

  const handleWeightRangeSelect = (midpoint: number) => {
    setWeight(midpoint);
  };

  // Get selected range for display
  const getSelectedAgeRange = () => {
    if (!age) return null;
    return ageRanges.find(range =>
      age >= parseInt(range.range.split('-')[0]) &&
      (range.range.includes('+') ? true : age <= parseInt(range.range.split('-')[1]))
    );
  };

  const getSelectedWeightRange = () => {
    if (!weight) return null;
    return weightRanges.find(range =>
      weight >= parseInt(range.range.split('-')[0]) &&
      (range.range.includes('+') ? true : weight <= parseInt(range.range.split('-')[1]))
    );
  };

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
      {/* Header - Simplified */}
      <VStack spacing={2} textAlign="center" flex="0 0 auto">
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color={textColor}
          lineHeight="1.25"
        >
          Personal Information
        </Text>
      </VStack>

      {/* Optimized Form */}
      <VStack spacing={{ base: 6, md: 7 }} align="stretch" flex="1 1 auto" justify="center" px={{ base: 1, md: 0 }}>
        {/* Age Input - Enhanced with Range Selectors */}
        <FormControl isRequired>
          <FormLabel color={textColor} fontSize="md" fontWeight="semibold" mb={4}>
            <HStack spacing={3}>
              <Icon as={PiCalendarBold} color="blue.500" boxSize={5} />
              <Text>Age</Text>
              {getSelectedAgeRange() && (
                <Badge colorScheme={getSelectedAgeRange()!.color} variant="subtle" fontSize="xs">
                  {getSelectedAgeRange()!.label}
                </Badge>
              )}
            </HStack>
          </FormLabel>

          <VStack spacing={4}>
            {/* Age Range Quick Selectors */}
            <Box w="100%">
              <Text fontSize="sm" color={subtextColor} mb={3} textAlign="center">
                Quick Select Age Range
              </Text>
              <Wrap justify="center" spacing={2}>
                {ageRanges.map((range) => (
                  <WrapItem key={range.label}>
                    <Tooltip label={`${range.range} years`} hasArrow>
                      <Button
                        size="sm"
                        variant={getSelectedAgeRange()?.label === range.label ? "solid" : "outline"}
                        colorScheme={range.color}
                        onClick={() => handleAgeRangeSelect(range.midpoint)}
                        leftIcon={<Icon as={range.icon} boxSize={3} />}
                        fontSize="xs"
                        h="32px"
                        px={3}
                        bg={getSelectedAgeRange()?.label === range.label ?
                          `${range.color}.500` :
                          'rgba(255, 255, 255, 0.8)'
                        }
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor={getSelectedAgeRange()?.label === range.label ?
                          `${range.color}.500` :
                          'rgba(255, 255, 255, 0.3)'
                        }
                        _hover={{
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
                          bg: getSelectedAgeRange()?.label === range.label ?
                            `${range.color}.600` :
                            'rgba(255, 255, 255, 0.95)'
                        }}
                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      >
                        {range.range}
                      </Button>
                    </Tooltip>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            {/* Precise Age Input */}
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
              bg="rgba(255, 255, 255, 0.9)"
              backdropFilter="blur(12px)"
              borderRadius="xl"
              borderWidth="2px"
              borderColor={age ? "blue.300" : "rgba(255, 255, 255, 0.3)"}
              shadow="0 8px 32px rgba(31, 38, 135, 0.15)"
              _hover={{
                borderColor: "blue.400",
                shadow: "0 12px 40px rgba(31, 38, 135, 0.2)",
                bg: "rgba(255, 255, 255, 0.95)"
              }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1), 0 16px 40px rgba(79, 156, 249, 0.15)"
              }}
            >
              <NumberInputField
                placeholder="Enter exact age"
                textAlign="center"
                fontWeight="bold"
                fontSize={{ base: "xl", md: "2xl" }}
                h={{ base: "72px", md: "80px" }}
                color={age ? "blue.600" : textColor}
                _placeholder={{
                  color: subtextColor,
                  fontSize: { base: "md", md: "lg" },
                  fontWeight: "medium"
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              />
              <NumberInputStepper w={{ base: "48px", md: "40px" }}>
                <NumberIncrementStepper
                  bg="rgba(255, 255, 255, 0.8)"
                  backdropFilter="blur(8px)"
                  _hover={{
                    bg: "rgba(79, 156, 249, 0.1)",
                    borderColor: "blue.300"
                  }}
                  _active={{
                    bg: "rgba(79, 156, 249, 0.2)",
                    transform: "scale(0.95)"
                  }}
                  borderColor="rgba(255, 255, 255, 0.3)"
                  h={{ base: "36px", md: "40px" }}
                  transition="all 0.2s"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <Icon as={PiPlusBold} boxSize={{ base: 5, md: 4 }} color="blue.500" />
                </NumberIncrementStepper>
                <NumberDecrementStepper
                  bg="rgba(255, 255, 255, 0.8)"
                  backdropFilter="blur(8px)"
                  _hover={{
                    bg: "rgba(79, 156, 249, 0.1)",
                    borderColor: "blue.300"
                  }}
                  _active={{
                    bg: "rgba(79, 156, 249, 0.2)",
                    transform: "scale(0.95)"
                  }}
                  borderColor="rgba(255, 255, 255, 0.3)"
                  h={{ base: "36px", md: "40px" }}
                  transition="all 0.2s"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <Icon as={PiMinusBold} boxSize={{ base: 5, md: 4 }} color="blue.500" />
                </NumberDecrementStepper>
              </NumberInputStepper>
            </NumberInput>
          </VStack>
        </FormControl>

        <Divider />

        {/* Weight Input - Enhanced with Range Selectors */}
        <FormControl>
          <FormLabel color={textColor} fontSize="md" fontWeight="semibold" mb={4}>
            <HStack spacing={3}>
              <Icon as={PiScalesBold} color="green.500" boxSize={5} />
              <Text>Weight (Optional)</Text>
              {getSelectedWeightRange() && (
                <Badge colorScheme={getSelectedWeightRange()!.color} variant="subtle" fontSize="xs">
                  {getSelectedWeightRange()!.label}
                </Badge>
              )}
            </HStack>
          </FormLabel>

          <VStack spacing={4}>
            {/* Weight Range Quick Selectors */}
            <Box w="100%">
              <Text fontSize="sm" color={subtextColor} mb={3} textAlign="center">
                Quick Select Weight Range (lbs)
              </Text>
              <Wrap justify="center" spacing={2}>
                {weightRanges.map((range) => (
                  <WrapItem key={range.label}>
                    <Tooltip label={`${range.range} lbs`} hasArrow>
                      <Button
                        size="sm"
                        variant={getSelectedWeightRange()?.label === range.label ? "solid" : "outline"}
                        colorScheme={range.color}
                        onClick={() => handleWeightRangeSelect(range.midpoint)}
                        leftIcon={<Icon as={range.icon} boxSize={3} />}
                        fontSize="xs"
                        h="32px"
                        px={3}
                        bg={getSelectedWeightRange()?.label === range.label ?
                          `${range.color}.500` :
                          'rgba(255, 255, 255, 0.8)'
                        }
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor={getSelectedWeightRange()?.label === range.label ?
                          `${range.color}.500` :
                          'rgba(255, 255, 255, 0.3)'
                        }
                        _hover={{
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
                          bg: getSelectedWeightRange()?.label === range.label ?
                            `${range.color}.600` :
                            'rgba(255, 255, 255, 0.95)'
                        }}
                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      >
                        {range.range}
                      </Button>
                    </Tooltip>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            {/* Precise Weight Input */}
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
              bg="rgba(255, 255, 255, 0.9)"
              backdropFilter="blur(12px)"
              borderRadius="xl"
              borderWidth="2px"
              borderColor={weight ? "green.300" : "rgba(255, 255, 255, 0.3)"}
              shadow="0 8px 32px rgba(31, 38, 135, 0.15)"
              _hover={{
                borderColor: "green.400",
                shadow: "0 12px 40px rgba(31, 38, 135, 0.2)",
                bg: "rgba(255, 255, 255, 0.95)"
              }}
              _focus={{
                borderColor: "green.500",
                boxShadow: "0 0 0 3px rgba(72, 187, 120, 0.1), 0 16px 40px rgba(72, 187, 120, 0.15)"
              }}
            >
              <NumberInputField
                placeholder="Enter exact weight (lbs)"
                textAlign="center"
                fontWeight="bold"
                fontSize={{ base: "xl", md: "2xl" }}
                h={{ base: "72px", md: "80px" }}
                color={weight ? "green.600" : textColor}
                _placeholder={{
                  color: subtextColor,
                  fontSize: { base: "md", md: "lg" },
                  fontWeight: "medium"
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              />
              <NumberInputStepper w={{ base: "48px", md: "40px" }}>
                <NumberIncrementStepper
                  bg="rgba(255, 255, 255, 0.8)"
                  backdropFilter="blur(8px)"
                  _hover={{
                    bg: "rgba(72, 187, 120, 0.1)",
                    borderColor: "green.300"
                  }}
                  _active={{
                    bg: "rgba(72, 187, 120, 0.2)",
                    transform: "scale(0.95)"
                  }}
                  borderColor="rgba(255, 255, 255, 0.3)"
                  h={{ base: "36px", md: "40px" }}
                  transition="all 0.2s"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <Icon as={PiPlusBold} boxSize={{ base: 5, md: 4 }} color="green.500" />
                </NumberIncrementStepper>
                <NumberDecrementStepper
                  bg="rgba(255, 255, 255, 0.8)"
                  backdropFilter="blur(8px)"
                  _hover={{
                    bg: "rgba(72, 187, 120, 0.1)",
                    borderColor: "green.300"
                  }}
                  _active={{
                    bg: "rgba(72, 187, 120, 0.2)",
                    transform: "scale(0.95)"
                  }}
                  borderColor="rgba(255, 255, 255, 0.3)"
                  h={{ base: "36px", md: "40px" }}
                  transition="all 0.2s"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <Icon as={PiMinusBold} boxSize={{ base: 5, md: 4 }} color="green.500" />
                </NumberDecrementStepper>
              </NumberInputStepper>
            </NumberInput>

            {/* Skip Weight Option */}
            <Button
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={() => setWeight(undefined)}
              fontSize="sm"
              fontWeight="medium"
              minH={{ base: "44px", md: "auto" }}
              bg="rgba(255, 255, 255, 0.6)"
              backdropFilter="blur(8px)"
              border="1px solid rgba(255, 255, 255, 0.2)"
              _hover={{
                bg: "rgba(255, 255, 255, 0.8)",
                transform: "translateY(-1px)"
              }}
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              Skip weight (optional)
            </Button>
          </VStack>
        </FormControl>

        <Divider />

        {/* Gender - Enhanced with Glass Morphism */}
        <FormControl>
          <FormLabel color={textColor} fontSize="md" fontWeight="semibold" mb={4}>
            Gender (Optional)
          </FormLabel>
          <SimpleGrid columns={3} spacing={{ base: 3, md: 4 }} w="100%">
            {/* Male */}
            <Button
              variant={gender === 'male' ? 'solid' : 'outline'}
              colorScheme={gender === 'male' ? 'blue' : 'gray'}
              onClick={() => setGender(gender === 'male' ? '' : 'male')}
              h={{ base: "72px", md: "68px" }}
              flexDirection="column"
              bg={gender === 'male' ? 'blue.500' : 'rgba(255, 255, 255, 0.8)'}
              backdropFilter="blur(12px)"
              borderColor={gender === 'male' ? 'blue.500' : 'rgba(255, 255, 255, 0.3)'}
              borderWidth="2px"
              color={gender === 'male' ? 'white' : textColor}
              shadow={gender === 'male' ? "0 8px 32px rgba(79, 156, 249, 0.3)" : "0 8px 32px rgba(31, 38, 135, 0.15)"}
              _hover={{
                bg: gender === 'male' ? 'blue.600' : 'rgba(255, 255, 255, 0.95)',
                borderColor: gender === 'male' ? 'blue.600' : 'rgba(79, 156, 249, 0.4)',
                shadow: gender === 'male' ? "0 12px 40px rgba(79, 156, 249, 0.4)" : "0 12px 40px rgba(31, 38, 135, 0.2)",
                transform: 'translateY(-2px)'
              }}
              _active={{
                transform: 'translateY(0px)',
                shadow: gender === 'male' ? "0 4px 16px rgba(79, 156, 249, 0.3)" : "0 4px 16px rgba(31, 38, 135, 0.15)"
              }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <Icon as={FaUser} boxSize={{ base: 6, md: 5 }} mb={2} />
              <Text fontSize={{ base: "sm", md: "xs" }} fontWeight="semibold">Male</Text>
            </Button>

            {/* Female */}
            <Button
              variant={gender === 'female' ? 'solid' : 'outline'}
              colorScheme={gender === 'female' ? 'pink' : 'gray'}
              onClick={() => setGender(gender === 'female' ? '' : 'female')}
              h={{ base: "72px", md: "68px" }}
              flexDirection="column"
              bg={gender === 'female' ? 'pink.500' : 'rgba(255, 255, 255, 0.8)'}
              backdropFilter="blur(12px)"
              borderColor={gender === 'female' ? 'pink.500' : 'rgba(255, 255, 255, 0.3)'}
              borderWidth="2px"
              color={gender === 'female' ? 'white' : textColor}
              shadow={gender === 'female' ? "0 8px 32px rgba(236, 72, 153, 0.3)" : "0 8px 32px rgba(31, 38, 135, 0.15)"}
              _hover={{
                bg: gender === 'female' ? 'pink.600' : 'rgba(255, 255, 255, 0.95)',
                borderColor: gender === 'female' ? 'pink.600' : 'rgba(236, 72, 153, 0.4)',
                shadow: gender === 'female' ? "0 12px 40px rgba(236, 72, 153, 0.4)" : "0 12px 40px rgba(31, 38, 135, 0.2)",
                transform: 'translateY(-2px)'
              }}
              _active={{
                transform: 'translateY(0px)',
                shadow: gender === 'female' ? "0 4px 16px rgba(236, 72, 153, 0.3)" : "0 4px 16px rgba(31, 38, 135, 0.15)"
              }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <Icon as={FaUserFriends} boxSize={{ base: 6, md: 5 }} mb={2} />
              <Text fontSize={{ base: "sm", md: "xs" }} fontWeight="semibold">Female</Text>
            </Button>

            {/* Rather Not Say */}
            <Button
              variant={gender === 'rather_not_say' ? 'solid' : 'outline'}
              colorScheme={gender === 'rather_not_say' ? 'purple' : 'gray'}
              onClick={() => setGender(gender === 'rather_not_say' ? '' : 'rather_not_say')}
              h={{ base: "72px", md: "68px" }}
              flexDirection="column"
              bg={gender === 'rather_not_say' ? 'purple.500' : 'rgba(255, 255, 255, 0.8)'}
              backdropFilter="blur(12px)"
              borderColor={gender === 'rather_not_say' ? 'purple.500' : 'rgba(255, 255, 255, 0.3)'}
              borderWidth="2px"
              color={gender === 'rather_not_say' ? 'white' : textColor}
              shadow={gender === 'rather_not_say' ? "0 8px 32px rgba(139, 92, 246, 0.3)" : "0 8px 32px rgba(31, 38, 135, 0.15)"}
              _hover={{
                bg: gender === 'rather_not_say' ? 'purple.600' : 'rgba(255, 255, 255, 0.95)',
                borderColor: gender === 'rather_not_say' ? 'purple.600' : 'rgba(139, 92, 246, 0.4)',
                shadow: gender === 'rather_not_say' ? "0 12px 40px rgba(139, 92, 246, 0.4)" : "0 12px 40px rgba(31, 38, 135, 0.2)",
                transform: 'translateY(-2px)'
              }}
              _active={{
                transform: 'translateY(0px)',
                shadow: gender === 'rather_not_say' ? "0 4px 16px rgba(139, 92, 246, 0.3)" : "0 4px 16px rgba(31, 38, 135, 0.15)"
              }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <Icon as={FaUserSlash} boxSize={{ base: 6, md: 5 }} mb={2} />
              <Text fontSize={{ base: "xs", md: "2xs" }} fontWeight="semibold" textAlign="center" lineHeight="1.2">
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
