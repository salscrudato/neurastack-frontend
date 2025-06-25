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

// Import the new NeuraFit component styles
import '../../styles/neurafit-components.css';

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

  // Theme colors - optimized for light mode only as per user preferences
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
        {/* Age Selection - 6 Boxes with optimized styling */}
        <FormControl isRequired>
          <Text className="neurafit-form-title">
            Age Range
          </Text>
          <div className="neurafit-selection-grid">
            {ageRanges.map((range) => (
              <Button
                key={range.value}
                variant={age === range.midpoint ? "neurafit-primary" : "neurafit-outline"}
                onClick={() => setAge(range.midpoint)}
                className={`neurafit-selection-button ${age === range.midpoint ? 'selected age' : ''}`}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </FormControl>

        <Divider opacity={0.3} />

        {/* Weight Selection - 6 Boxes with optimized styling */}
        <FormControl>
          <Text className="neurafit-form-title">
            Weight Range (lbs)
          </Text>
          <div className="neurafit-selection-grid">
            {weightRanges.map((range) => (
              <Button
                key={range.value}
                variant={weight === range.midpoint ? "neurafit-success" : "neurafit-outline"}
                onClick={() => setWeight(range.midpoint)}
                className={`neurafit-selection-button ${weight === range.midpoint ? 'selected weight' : ''}`}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </FormControl>

        {/* Gender Selection - 3 Boxes with optimized styling */}
        <FormControl>
          <Text className="neurafit-form-title">
            Gender (Optional)
          </Text>
          <div className="neurafit-selection-grid">
            <Button
              variant={gender === 'male' ? "neurafit-purple" : "neurafit-outline"}
              onClick={() => setGender(gender === 'male' ? '' : 'male')}
              className={`neurafit-selection-button ${gender === 'male' ? 'selected gender' : ''}`}
            >
              Male
            </Button>

            <Button
              variant={gender === 'female' ? "neurafit-purple" : "neurafit-outline"}
              onClick={() => setGender(gender === 'female' ? '' : 'female')}
              className={`neurafit-selection-button ${gender === 'female' ? 'selected gender' : ''}`}
            >
              Female
            </Button>

            <Button
              variant={gender === 'rather_not_say' ? "neurafit-purple" : "neurafit-outline"}
              onClick={() => setGender(gender === 'rather_not_say' ? '' : 'rather_not_say')}
              className={`neurafit-selection-button ${gender === 'rather_not_say' ? 'selected gender' : ''}`}
              fontSize={{ base: "xs", md: "sm" }}
            >
              Skip
            </Button>
          </div>
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
