import {
    Box,
    Button,
    Divider,
    FormControl,
    SimpleGrid,
    Text,
    useColorModeValue,
    useToast,
    VStack
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useFitnessStore } from '../../store/useFitnessStore';
import NavigationButtons from './NavigationButtons';

interface PersonalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isEditingFromDashboard?: boolean;
}

// Age and weight range definitions - 6 optimized ranges each
const ageRanges = [
  { label: '13-17', value: '13-17', midpoint: 15 },
  { label: '18-25', value: '18-25', midpoint: 22 },
  { label: '26-35', value: '26-35', midpoint: 30 },
  { label: '36-45', value: '36-45', midpoint: 40 },
  { label: '46-55', value: '46-55', midpoint: 50 },
  { label: '56+', value: '56+', midpoint: 65 },
];

const weightRanges = [
  { label: '90-125', value: '90-125', midpoint: 108 },
  { label: '126-150', value: '126-150', midpoint: 138 },
  { label: '151-175', value: '151-175', midpoint: 163 },
  { label: '176-200', value: '176-200', midpoint: 188 },
  { label: '201-225', value: '201-225', midpoint: 213 },
  { label: '226+', value: '226+', midpoint: 240 },
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
      {/* Header - Compact */}
      <VStack spacing={1} textAlign="center" flex="0 0 auto" mb={4}>
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          color={textColor}
          lineHeight="1.2"
        >
          Personal Information
        </Text>
      </VStack>

      {/* Mobile-Optimized Form */}
      <VStack spacing={{ base: 5, md: 6 }} align="stretch" flex="1 1 auto" px={{ base: 1, md: 2 }}>
        {/* Age Selection - 6 Boxes */}
        <FormControl isRequired>
          <Text fontSize="md" fontWeight="semibold" color={textColor} mb={3} textAlign="center">
            Age Range
          </Text>
          <SimpleGrid columns={3} spacing={2} w="100%">
            {ageRanges.map((range) => (
              <Button
                key={range.value}
                variant={age === range.midpoint ? "solid" : "outline"}
                colorScheme={age === range.midpoint ? "blue" : "gray"}
                onClick={() => setAge(range.midpoint)}
                h={{ base: "48px", md: "52px" }}
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="bold"
                bg={age === range.midpoint ?
                  'linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)' :
                  'rgba(255, 255, 255, 0.9)'
                }
                backdropFilter="blur(12px)"
                borderRadius="xl"
                borderWidth="2px"
                borderColor={age === range.midpoint ?
                  "transparent" :
                  "rgba(255, 255, 255, 0.4)"
                }
                color={age === range.midpoint ? "white" : textColor}
                shadow={age === range.midpoint ?
                  "0 4px 20px rgba(79, 156, 249, 0.4)" :
                  "0 2px 8px rgba(31, 38, 135, 0.1)"
                }
                _hover={{
                  transform: 'translateY(-1px)',
                  shadow: age === range.midpoint ?
                    "0 6px 24px rgba(79, 156, 249, 0.5)" :
                    "0 4px 12px rgba(31, 38, 135, 0.15)",
                  bg: age === range.midpoint ?
                    'linear-gradient(135deg, #3182CE 0%, #553C9A 100%)' :
                    'rgba(255, 255, 255, 0.95)',
                  borderColor: age === range.midpoint ?
                    "transparent" :
                    "rgba(79, 156, 249, 0.3)"
                }}
                _active={{
                  transform: 'translateY(0px)'
                }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                {range.label}
              </Button>
            ))}
          </SimpleGrid>
        </FormControl>

        <Divider opacity={0.3} />

        {/* Weight Selection - 6 Boxes */}
        <FormControl>
          <Text fontSize="md" fontWeight="semibold" color={textColor} mb={3} textAlign="center">
            Weight Range (lbs)
          </Text>
          <SimpleGrid columns={3} spacing={2} w="100%">
            {weightRanges.map((range) => (
              <Button
                key={range.value}
                variant={weight === range.midpoint ? "solid" : "outline"}
                colorScheme={weight === range.midpoint ? "green" : "gray"}
                onClick={() => setWeight(range.midpoint)}
                h={{ base: "48px", md: "52px" }}
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="bold"
                bg={weight === range.midpoint ?
                  'linear-gradient(135deg, #48BB78 0%, #38A169 100%)' :
                  'rgba(255, 255, 255, 0.9)'
                }
                backdropFilter="blur(12px)"
                borderRadius="xl"
                borderWidth="2px"
                borderColor={weight === range.midpoint ?
                  "transparent" :
                  "rgba(255, 255, 255, 0.4)"
                }
                color={weight === range.midpoint ? "white" : textColor}
                shadow={weight === range.midpoint ?
                  "0 4px 20px rgba(72, 187, 120, 0.4)" :
                  "0 2px 8px rgba(31, 38, 135, 0.1)"
                }
                _hover={{
                  transform: 'translateY(-1px)',
                  shadow: weight === range.midpoint ?
                    "0 6px 24px rgba(72, 187, 120, 0.5)" :
                    "0 4px 12px rgba(31, 38, 135, 0.15)",
                  bg: weight === range.midpoint ?
                    'linear-gradient(135deg, #38A169 0%, #2F855A 100%)' :
                    'rgba(255, 255, 255, 0.95)',
                  borderColor: weight === range.midpoint ?
                    "transparent" :
                    "rgba(72, 187, 120, 0.3)"
                }}
                _active={{
                  transform: 'translateY(0px)'
                }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                {range.label}
              </Button>
            ))}
          </SimpleGrid>
        </FormControl>

        {/* Gender Selection - 3 Boxes */}
        <FormControl>
          <Text fontSize="md" fontWeight="semibold" color={textColor} mb={3} textAlign="center">
            Gender (Optional)
          </Text>
          <SimpleGrid columns={3} spacing={2} w="100%">
            <Button
              variant={gender === 'male' ? "solid" : "outline"}
              colorScheme={gender === 'male' ? "purple" : "gray"}
              onClick={() => setGender(gender === 'male' ? '' : 'male')}
              h={{ base: "48px", md: "52px" }}
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="bold"
              bg={gender === 'male' ?
                'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)' :
                'rgba(255, 255, 255, 0.9)'
              }
              backdropFilter="blur(12px)"
              borderRadius="xl"
              borderWidth="2px"
              borderColor={gender === 'male' ?
                "transparent" :
                "rgba(255, 255, 255, 0.4)"
              }
              color={gender === 'male' ? "white" : textColor}
              shadow={gender === 'male' ?
                "0 4px 20px rgba(139, 92, 246, 0.4)" :
                "0 2px 8px rgba(31, 38, 135, 0.1)"
              }
              _hover={{
                transform: 'translateY(-1px)',
                shadow: gender === 'male' ?
                  "0 6px 24px rgba(139, 92, 246, 0.5)" :
                  "0 4px 12px rgba(31, 38, 135, 0.15)",
                bg: gender === 'male' ?
                  'linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)' :
                  'rgba(255, 255, 255, 0.95)',
                borderColor: gender === 'male' ?
                  "transparent" :
                  "rgba(139, 92, 246, 0.3)"
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              Male
            </Button>

            <Button
              variant={gender === 'female' ? "solid" : "outline"}
              colorScheme={gender === 'female' ? "purple" : "gray"}
              onClick={() => setGender(gender === 'female' ? '' : 'female')}
              h={{ base: "48px", md: "52px" }}
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="bold"
              bg={gender === 'female' ?
                'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)' :
                'rgba(255, 255, 255, 0.9)'
              }
              backdropFilter="blur(12px)"
              borderRadius="xl"
              borderWidth="2px"
              borderColor={gender === 'female' ?
                "transparent" :
                "rgba(255, 255, 255, 0.4)"
              }
              color={gender === 'female' ? "white" : textColor}
              shadow={gender === 'female' ?
                "0 4px 20px rgba(139, 92, 246, 0.4)" :
                "0 2px 8px rgba(31, 38, 135, 0.1)"
              }
              _hover={{
                transform: 'translateY(-1px)',
                shadow: gender === 'female' ?
                  "0 6px 24px rgba(139, 92, 246, 0.5)" :
                  "0 4px 12px rgba(31, 38, 135, 0.15)",
                bg: gender === 'female' ?
                  'linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)' :
                  'rgba(255, 255, 255, 0.95)',
                borderColor: gender === 'female' ?
                  "transparent" :
                  "rgba(139, 92, 246, 0.3)"
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              Female
            </Button>

            <Button
              variant={gender === 'rather_not_say' ? "solid" : "outline"}
              colorScheme={gender === 'rather_not_say' ? "purple" : "gray"}
              onClick={() => setGender(gender === 'rather_not_say' ? '' : 'rather_not_say')}
              h={{ base: "48px", md: "52px" }}
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="bold"
              bg={gender === 'rather_not_say' ?
                'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)' :
                'rgba(255, 255, 255, 0.9)'
              }
              backdropFilter="blur(12px)"
              borderRadius="xl"
              borderWidth="2px"
              borderColor={gender === 'rather_not_say' ?
                "transparent" :
                "rgba(255, 255, 255, 0.4)"
              }
              color={gender === 'rather_not_say' ? "white" : textColor}
              shadow={gender === 'rather_not_say' ?
                "0 4px 20px rgba(139, 92, 246, 0.4)" :
                "0 2px 8px rgba(31, 38, 135, 0.1)"
              }
              _hover={{
                transform: 'translateY(-1px)',
                shadow: gender === 'rather_not_say' ?
                  "0 6px 24px rgba(139, 92, 246, 0.5)" :
                  "0 4px 12px rgba(31, 38, 135, 0.15)",
                bg: gender === 'rather_not_say' ?
                  'linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)' :
                  'rgba(255, 255, 255, 0.95)',
                borderColor: gender === 'rather_not_say' ?
                  "transparent" :
                  "rgba(139, 92, 246, 0.3)"
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              Skip
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
