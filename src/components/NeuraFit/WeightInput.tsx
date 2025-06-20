import {
    Box,
    Button,
    HStack,
    Icon,
    InputRightAddon,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { memo, useCallback, useEffect, useState } from 'react';
import { PiMinusBold, PiPlusBold, PiScalesBold } from 'react-icons/pi';

interface WeightInputProps {
  value?: number;
  onChange: (weight: number | undefined) => void;
  placeholder?: string;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showQuickButtons?: boolean;
  min?: number;
  max?: number;
  step?: number;
  previousWeight?: number; // For showing previous weight as reference
  exerciseName?: string; // For context
}

export const WeightInput = memo<WeightInputProps>(({
  value,
  onChange,
  placeholder = "Weight (lbs)",
  isDisabled = false,
  size = 'md',
  showQuickButtons = true,
  min = 0,
  max = 1000,
  step = 2.5,
  previousWeight
}) => {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || '');
  const [isFocused, setIsFocused] = useState(false);

  // Color scheme
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const focusBorderColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.900', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const buttonBg = useColorModeValue('gray.50', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.100', 'gray.600');

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  // Note: handleInputChange removed as it's not used with NumberInput

  // Handle number input change
  const handleNumberChange = useCallback((valueString: string, valueNumber: number) => {
    setInputValue(valueString);
    if (!isNaN(valueNumber) && valueNumber >= min && valueNumber <= max) {
      onChange(valueNumber);
    } else if (valueString === '') {
      onChange(undefined);
    }
  }, [onChange, min, max]);

  // Quick adjustment buttons
  const handleQuickAdjust = useCallback((adjustment: number) => {
    const currentValue = value || 0;
    const newValue = Math.max(min, Math.min(max, currentValue + adjustment));
    onChange(newValue);
  }, [value, onChange, min, max]);

  // Quick weight presets based on common increments
  const quickWeights = [5, 10, 15, 20, 25];

  return (
    <VStack spacing={3} align="stretch">
      {/* Weight input with stepper */}
      <Box>
        <HStack spacing={2} align="center" mb={2}>
          <Icon as={PiScalesBold} color="blue.500" boxSize={4} />
          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
            Weight
          </Text>
          {previousWeight && (
            <Text fontSize="xs" color={subtextColor}>
              (Last: {previousWeight} lbs)
            </Text>
          )}
        </HStack>

        <NumberInput
          value={inputValue}
          onChange={handleNumberChange}
          min={min}
          max={max}
          step={step}
          precision={1}
          isDisabled={isDisabled}
          size={size}
          bg={bgColor}
          borderColor={isFocused ? focusBorderColor : borderColor}
          borderRadius="xl"
          _hover={{
            borderColor: focusBorderColor,
          }}
          _focus={{
            borderColor: focusBorderColor,
            boxShadow: `0 0 0 1px ${focusBorderColor}`,
          }}
        >
          <NumberInputField
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            textAlign="center"
            fontWeight="semibold"
            fontSize={size === 'lg' ? 'lg' : 'md'}
          />
          <InputRightAddon
            bg={buttonBg}
            borderColor={isFocused ? focusBorderColor : borderColor}
            color={subtextColor}
            fontSize="sm"
            fontWeight="medium"
          >
            lbs
          </InputRightAddon>
          <NumberInputStepper>
            <NumberIncrementStepper
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              borderColor={borderColor}
            >
              <Icon as={PiPlusBold} boxSize={3} />
            </NumberIncrementStepper>
            <NumberDecrementStepper
              bg={buttonBg}
              _hover={{ bg: buttonHoverBg }}
              borderColor={borderColor}
            >
              <Icon as={PiMinusBold} boxSize={3} />
            </NumberDecrementStepper>
          </NumberInputStepper>
        </NumberInput>
      </Box>

      {/* Quick adjustment buttons */}
      {showQuickButtons && !isDisabled && (
        <VStack spacing={2}>
          <Text fontSize="xs" color={subtextColor} textAlign="center">
            Quick Adjust
          </Text>
          <HStack spacing={2} justify="center" flexWrap="wrap">
            <Button
              size="xs"
              variant="outline"
              colorScheme="red"
              onClick={() => handleQuickAdjust(-step)}
              isDisabled={!value || value <= min}
              borderRadius="lg"
              minW="60px"
            >
              -{step}
            </Button>
            <Button
              size="xs"
              variant="outline"
              colorScheme="green"
              onClick={() => handleQuickAdjust(step)}
              isDisabled={value !== undefined && value >= max}
              borderRadius="lg"
              minW="60px"
            >
              +{step}
            </Button>
          </HStack>

          {/* Quick weight presets */}
          <HStack spacing={1} justify="center" flexWrap="wrap">
            {quickWeights.map((weight) => (
              <Button
                key={weight}
                size="xs"
                variant="ghost"
                colorScheme="blue"
                onClick={() => onChange(weight)}
                borderRadius="md"
                fontSize="xs"
                minW="40px"
                h="24px"
              >
                {weight}
              </Button>
            ))}
          </HStack>
        </VStack>
      )}

      {/* Clear button */}
      {value !== undefined && !isDisabled && (
        <Button
          size="xs"
          variant="ghost"
          colorScheme="gray"
          onClick={() => onChange(undefined)}
          alignSelf="center"
          borderRadius="md"
        >
          Clear Weight
        </Button>
      )}
    </VStack>
  );
});

WeightInput.displayName = 'WeightInput';
