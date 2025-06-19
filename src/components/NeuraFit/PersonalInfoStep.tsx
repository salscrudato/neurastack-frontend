import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Icon,
    SimpleGrid,
    Slider,
    SliderFilledTrack,
    SliderMark,
    SliderThumb,
    SliderTrack,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { FaUser, FaUserFriends, FaUserSlash } from 'react-icons/fa';
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
  const [weight, setWeight] = useState<number>(profile.weight || 150); // Default to 150 lbs

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
      weight,
    };

    updateProfile(updates);
  }, [age, gender, weight, updateProfile]);

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



  const canProceed = age >= 13 && age <= 100; // Basic age validation

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
        {/* Age - Required */}
        <FormControl isRequired>
          <HStack justify="space-between" align="center" mb={2}>
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

        {/* Weight - Optional */}
        <FormControl>
          <HStack justify="space-between" align="center" mb={3}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="medium" mb={0}>
              Weight (Optional)
            </FormLabel>
            <Box
              bg={useColorModeValue('green.50', 'green.900')}
              color={useColorModeValue('green.700', 'green.200')}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="semibold"
            >
              {weight} lbs
            </Box>
          </HStack>

          <Box px={2} py={2}>
            <Slider
              value={weight}
              onChange={(value) => setWeight(value)}
              min={66}
              max={440}
              step={2}
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
            </Slider>
          </Box>

          <Text fontSize="xs" color={subtextColor} textAlign="center">
            Drag the slider to set your weight in lbs
          </Text>
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
