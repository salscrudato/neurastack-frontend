import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  FormControl,
  FormLabel,
  useColorModeValue,
  Divider,
  Badge,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useState } from 'react';
import type { TravelSearchParams } from '../lib/types';

interface TravelPreferencesProps {
  onPreferencesChange: (preferences: TravelSearchParams) => void;
  initialPreferences?: TravelSearchParams;
}

export default function TravelPreferences({
  onPreferencesChange,
  initialPreferences = {}
}: TravelPreferencesProps) {
  const [preferences, setPreferences] = useState<TravelSearchParams>({
    tripType: 'roundtrip',
    cabinClass: 'economy',
    passengers: 1,
    ...initialPreferences
  });

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  const updatePreference = (key: keyof TravelSearchParams, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    onPreferencesChange(newPreferences);
  };

  const cabinClassOptions = [
    { value: 'economy', label: 'Economy', description: 'Best value' },
    { value: 'premium_economy', label: 'Premium Economy', description: 'Extra comfort' },
    { value: 'business', label: 'Business', description: 'Premium service' },
    { value: 'first', label: 'First Class', description: 'Luxury experience' }
  ];

  const tripTypeOptions = [
    { value: 'roundtrip', label: 'Round Trip', description: 'Return journey' },
    { value: 'oneway', label: 'One Way', description: 'Single journey' },
    { value: 'multicity', label: 'Multi-City', description: 'Multiple destinations' }
  ];

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="semibold" color={textColor}>
          Travel Preferences
        </Text>

        {/* Trip Type */}
        <FormControl>
          <FormLabel fontSize="sm" color={subtextColor}>Trip Type</FormLabel>
          <Wrap spacing={2}>
            {tripTypeOptions.map((option) => (
              <WrapItem key={option.value}>
                <Button
                  size="sm"
                  variant={preferences.tripType === option.value ? "solid" : "outline"}
                  colorScheme={preferences.tripType === option.value ? "blue" : "gray"}
                  onClick={() => updatePreference('tripType', option.value)}
                >
                  {option.label}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </FormControl>

        <Divider />

        {/* Passengers */}
        <FormControl>
          <FormLabel fontSize="sm" color={subtextColor}>Passengers</FormLabel>
          <NumberInput
            value={preferences.passengers || 1}
            min={1}
            max={9}
            onChange={(_, value) => updatePreference('passengers', value)}
            size="sm"
            maxW="120px"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        {/* Cabin Class */}
        <FormControl>
          <FormLabel fontSize="sm" color={subtextColor}>Cabin Class</FormLabel>
          <VStack spacing={2} align="stretch">
            {cabinClassOptions.map((option) => (
              <Box
                key={option.value}
                p={3}
                border="1px solid"
                borderColor={preferences.cabinClass === option.value ? 'blue.500' : borderColor}
                borderRadius="md"
                cursor="pointer"
                transition="all 0.2s ease"
                bg={preferences.cabinClass === option.value ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                _hover={{
                  borderColor: 'blue.300',
                  bg: useColorModeValue('blue.25', 'blue.800')
                }}
                onClick={() => updatePreference('cabinClass', option.value)}
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                      {option.label}
                    </Text>
                    <Text fontSize="xs" color={subtextColor}>
                      {option.description}
                    </Text>
                  </VStack>
                  {preferences.cabinClass === option.value && (
                    <Badge colorScheme="blue" size="sm">
                      Selected
                    </Badge>
                  )}
                </HStack>
              </Box>
            ))}
          </VStack>
        </FormControl>

        <Divider />

        {/* Quick Filters */}
        <VStack spacing={3} align="stretch">
          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            Quick Filters
          </Text>
          
          <HStack justify="space-between">
            <Text fontSize="sm" color={subtextColor}>Direct flights only</Text>
            <Switch
              colorScheme="blue"
              onChange={(e) => updatePreference('directFlightsOnly', e.target.checked)}
            />
          </HStack>
          
          <HStack justify="space-between">
            <Text fontSize="sm" color={subtextColor}>Flexible dates (±3 days)</Text>
            <Switch
              colorScheme="blue"
              onChange={(e) => updatePreference('flexibleDates', e.target.checked)}
            />
          </HStack>
          
          <HStack justify="space-between">
            <Text fontSize="sm" color={subtextColor}>Include nearby airports</Text>
            <Switch
              colorScheme="blue"
              onChange={(e) => updatePreference('includeNearbyAirports', e.target.checked)}
            />
          </HStack>
        </VStack>

        {/* Budget Range */}
        <FormControl>
          <FormLabel fontSize="sm" color={subtextColor}>Budget Range (per person)</FormLabel>
          <Select
            placeholder="Select budget range"
            size="sm"
            onChange={(e) => updatePreference('budgetRange', e.target.value)}
          >
            <option value="budget">Budget ($0 - $500)</option>
            <option value="mid">Mid-range ($500 - $1,500)</option>
            <option value="premium">Premium ($1,500 - $3,000)</option>
            <option value="luxury">Luxury ($3,000+)</option>
          </Select>
        </FormControl>

        {/* Summary */}
        <Box
          bg={useColorModeValue('blue.50', 'blue.900')}
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor={useColorModeValue('blue.200', 'blue.700')}
        >
          <Text fontSize="xs" color={useColorModeValue('blue.700', 'blue.300')} textAlign="center">
            ✓ Preferences saved automatically • Zero booking fees
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
