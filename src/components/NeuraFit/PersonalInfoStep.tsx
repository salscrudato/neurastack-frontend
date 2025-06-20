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

  // Local state for form inputs
  const [ageCategory, setAgeCategory] = useState<string>(profile.ageCategory || '');
  const [gender, setGender] = useState<'male' | 'female' | 'rather_not_say' | ''>(profile.gender || '');
  const [weightCategory, setWeightCategory] = useState<string>(profile.weightCategory || '');

  // Theme colors
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Update profile when local state changes
  useEffect(() => {
    const updates: Partial<typeof profile> = {
      ageCategory: ageCategory === '' ? undefined : ageCategory,
      gender: gender === '' ? undefined : gender,
      weightCategory: weightCategory === '' ? undefined : weightCategory,
    };

    updateProfile(updates);
  }, [ageCategory, gender, weightCategory, updateProfile]);

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



  const canProceed = ageCategory !== ''; // Age category is required

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
              const isSelected = ageCategory === category.code;
              return (
                <Button
                  key={category.code}
                  variant={isSelected ? 'solid' : 'outline'}
                  colorScheme={isSelected ? category.color : 'gray'}
                  onClick={() => setAgeCategory(isSelected ? '' : category.code)}
                  h="70px"
                  flexDirection="column"
                  bg={isSelected ? `${category.color}.500` : bgColor}
                  borderColor={isSelected ? `${category.color}.500` : borderColor}
                  color={isSelected ? 'white' : textColor}
                  _hover={{
                    bg: isSelected ? `${category.color}.600` : useColorModeValue('gray.50', 'gray.700'),
                    borderColor: isSelected ? `${category.color}.600` : useColorModeValue('gray.300', 'gray.500'),
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
              const isSelected = weightCategory === category.code;
              return (
                <Button
                  key={category.code}
                  variant={isSelected ? 'solid' : 'outline'}
                  colorScheme={isSelected ? category.color : 'gray'}
                  onClick={() => setWeightCategory(isSelected ? '' : category.code)}
                  h="70px"
                  flexDirection="column"
                  bg={isSelected ? `${category.color}.500` : bgColor}
                  borderColor={isSelected ? `${category.color}.500` : borderColor}
                  color={isSelected ? 'white' : textColor}
                  _hover={{
                    bg: isSelected ? `${category.color}.600` : useColorModeValue('gray.50', 'gray.700'),
                    borderColor: isSelected ? `${category.color}.600` : useColorModeValue('gray.300', 'gray.500'),
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
                bg: gender === 'male' ? 'blue.600' : useColorModeValue('gray.50', 'gray.700'),
                borderColor: gender === 'male' ? 'blue.600' : useColorModeValue('gray.300', 'gray.500'),
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
                bg: gender === 'female' ? 'pink.600' : useColorModeValue('gray.50', 'gray.700'),
                borderColor: gender === 'female' ? 'pink.600' : useColorModeValue('gray.300', 'gray.500'),
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
                bg: gender === 'rather_not_say' ? 'purple.600' : useColorModeValue('gray.50', 'gray.700'),
                borderColor: gender === 'rather_not_say' ? 'purple.600' : useColorModeValue('gray.300', 'gray.500'),
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
