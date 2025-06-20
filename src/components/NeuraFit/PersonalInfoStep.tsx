import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    Icon,
    SimpleGrid,
    Text,
    useColorModeValue,
    useToast,
    VStack
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FaUser, FaUserFriends, FaUserSlash } from 'react-icons/fa';
import { ageCategories, weightCategories } from '../../constants/personalInfoOptions';
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
        {/* Age Category - Required */}
        <FormControl isRequired>
          <FormLabel color={textColor} fontSize="sm" fontWeight="medium" mb={3}>
            Age Range
          </FormLabel>
          <SimpleGrid columns={2} spacing={3} w="100%">
            {ageCategories.map((category) => {
              // Calculate representative age for this category
              const categoryAge = (() => {
                const range = category.range;
                if (range.includes('+')) {
                  const minAge = parseInt(range.replace('+', ''));
                  return minAge + 4; // 66+ becomes 70
                }
                if (range.includes('-')) {
                  const [min, max] = range.split('-').map(num => parseInt(num.trim()));
                  return Math.round((min + max) / 2);
                }
                return parseInt(range) || 25;
              })();

              const isSelected = age === categoryAge;
              return (
                <Button
                  key={category.code}
                  variant={isSelected ? 'solid' : 'outline'}
                  colorScheme={isSelected ? category.color : 'gray'}
                  onClick={() => setAge(isSelected ? undefined : categoryAge)}
                  h="70px"
                  flexDirection="column"
                  bg={isSelected ? `${category.color}.500` : bgColor}
                  borderColor={isSelected ? `${category.color}.500` : borderColor}
                  color={isSelected ? 'white' : textColor}
                  _hover={{
                    bg: isSelected ? `${category.color}.600` : hoverBgColor,
                    borderColor: isSelected ? `${category.color}.600` : hoverBorderColor,
                  }}
                >
                  <Icon as={category.icon} boxSize={5} mb={1} />
                  <VStack spacing={0}>
                    <Text fontSize="xs" fontWeight="medium">{category.label}</Text>
                    <Text fontSize="2xs" opacity={0.8}>{category.range}</Text>
                  </VStack>
                </Button>
              );
            })}
          </SimpleGrid>
        </FormControl>

        <Divider />

        {/* Weight Category - Optional */}
        <FormControl>
          <FormLabel color={textColor} fontSize="sm" fontWeight="medium" mb={3}>
            Weight Range (Optional)
          </FormLabel>
          <SimpleGrid columns={2} spacing={3} w="100%">
            {weightCategories.map((category) => {
              // Calculate representative weight for this category
              const categoryWeight = (() => {
                const range = category.range;
                if (range.includes('+')) {
                  const minWeight = parseInt(range.replace('+', ''));
                  return minWeight + 14; // 226+ becomes 240
                }
                if (range.includes('-')) {
                  const [min, max] = range.split('-').map(num => parseInt(num.trim()));
                  return Math.round((min + max) / 2);
                }
                return parseInt(range) || 150;
              })();

              const isSelected = weight === categoryWeight;
              return (
                <Button
                  key={category.code}
                  variant={isSelected ? 'solid' : 'outline'}
                  colorScheme={isSelected ? category.color : 'gray'}
                  onClick={() => setWeight(isSelected ? undefined : categoryWeight)}
                  h="70px"
                  flexDirection="column"
                  bg={isSelected ? `${category.color}.500` : bgColor}
                  borderColor={isSelected ? `${category.color}.500` : borderColor}
                  color={isSelected ? 'white' : textColor}
                  _hover={{
                    bg: isSelected ? `${category.color}.600` : hoverBgColor,
                    borderColor: isSelected ? `${category.color}.600` : hoverBorderColor,
                  }}
                >
                  <Icon as={category.icon} boxSize={5} mb={1} />
                  <VStack spacing={0}>
                    <Text fontSize="xs" fontWeight="medium">{category.label}</Text>
                    <Text fontSize="2xs" opacity={0.8}>{category.range} lbs</Text>
                  </VStack>
                </Button>
              );
            })}
          </SimpleGrid>
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
