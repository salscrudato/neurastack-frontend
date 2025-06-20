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
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { PiMinusBold, PiPlusBold, PiScalesBold } from 'react-icons/pi';

interface WeightInputProps {
  value?: number;
  onChange: (weight: number | undefined) => void;
  placeholder?: string;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showQuickButtons?: boolean;
  showNAOption?: boolean; // Show N/A button for bodyweight exercises
  min?: number;
  max?: number;
  step?: number;
  previousWeight?: number; // For showing previous weight as reference
  exerciseName?: string; // For context
  weightHistory?: number[]; // Historical weights for suggestions
  onWeightSuggestionSelect?: (weight: number) => void; // Callback for weight suggestions
}

export const WeightInput = memo<WeightInputProps>(({
  value,
  onChange,
  placeholder = "Weight (lbs)",
  isDisabled = false,
  size = 'md',
  showQuickButtons = true,
  showNAOption = false,
  min = 0,
  max = 1000,
  step = 2.5,
  previousWeight,
  exerciseName,
  weightHistory = [],
  onWeightSuggestionSelect
}) => {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isNA, setIsNA] = useState<boolean>(false);

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
    console.log('⚖️ WeightInput change:', { valueString, valueNumber, exerciseName });
    setInputValue(valueString);
    setIsNA(false); // Clear N/A when user enters a number
    if (!isNaN(valueNumber) && valueNumber >= min && valueNumber <= max) {
      console.log('⚖️ Calling onChange with:', valueNumber);
      onChange(valueNumber);
    } else if (valueString === '') {
      console.log('⚖️ Calling onChange with: undefined');
      onChange(undefined);
    }
  }, [onChange, min, max, exerciseName]);

  const handleNAToggle = useCallback(() => {
    if (isNA) {
      // Clear N/A
      setIsNA(false);
      setInputValue('');
      onChange(undefined);
    } else {
      // Set N/A
      setIsNA(true);
      setInputValue('');
      onChange(undefined);
    }
  }, [isNA, onChange]);

  const handleWeightSuggestion = useCallback((suggestedWeight: number) => {
    setInputValue(suggestedWeight.toString());
    setIsNA(false);
    onChange(suggestedWeight);
    if (onWeightSuggestionSelect) {
      onWeightSuggestionSelect(suggestedWeight);
    }
  }, [onChange, onWeightSuggestionSelect]);

  // Quick adjustment buttons
  const handleQuickAdjust = useCallback((adjustment: number) => {
    const currentValue = value || 0;
    const newValue = Math.max(min, Math.min(max, currentValue + adjustment));
    setIsNA(false);
    onChange(newValue);
  }, [value, onChange, min, max]);

  // Generate weight suggestions based on history
  const weightSuggestions = useMemo(() => {
    if (!weightHistory.length) return [];

    const uniqueWeights = [...new Set(weightHistory)]
      .filter(w => w > 0)
      .sort((a, b) => b - a)
      .slice(0, 3); // Show top 3 recent weights

    return uniqueWeights;
  }, [weightHistory]);

  // Quick weight presets based on common increments
  const quickWeights = [5, 10, 15, 20, 25];

  return (
    <VStack spacing={3} align="stretch">
      {/* Weight input with stepper */}
      <Box>
        <HStack spacing={2} align="center" mb={2} justify="space-between">
          <HStack spacing={2}>
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

          {/* N/A Button */}
          {showNAOption && (
            <Button
              size="xs"
              variant={isNA ? "solid" : "outline"}
              colorScheme={isNA ? "orange" : "gray"}
              onClick={handleNAToggle}
              borderRadius="md"
              fontSize="xs"
              px={3}
            >
              {isNA ? "✓ N/A" : "N/A"}
            </Button>
          )}
        </HStack>

        <NumberInput
          value={isNA ? '' : inputValue}
          onChange={handleNumberChange}
          min={min}
          max={max}
          step={step}
          precision={1}
          isDisabled={isDisabled || isNA}
          size={size}
          bg={isNA ? useColorModeValue('orange.50', 'orange.900') : bgColor}
          borderColor={isNA ? 'orange.200' : (isFocused ? focusBorderColor : borderColor)}
          borderRadius="xl"
          _hover={{
            borderColor: isNA ? 'orange.300' : focusBorderColor,
          }}
          _focus={{
            borderColor: isNA ? 'orange.300' : focusBorderColor,
            boxShadow: `0 0 0 1px ${isNA ? 'orange.300' : focusBorderColor}`,
          }}
        >
          <NumberInputField
            placeholder={isNA ? "N/A - No weight needed" : placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            textAlign="center"
            fontWeight="semibold"
            fontSize={size === 'lg' ? 'lg' : 'md'}
            color={isNA ? useColorModeValue('orange.600', 'orange.300') : undefined}
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

      {/* Weight Suggestions */}
      {weightSuggestions.length > 0 && !isNA && !isDisabled && (
        <VStack spacing={2}>
          <Text fontSize="xs" color={subtextColor} textAlign="center">
            Recent Weights
          </Text>
          <HStack spacing={2} justify="center" flexWrap="wrap">
            {weightSuggestions.map((weight) => (
              <Button
                key={weight}
                size="xs"
                variant="outline"
                colorScheme="blue"
                onClick={() => handleWeightSuggestion(weight)}
                borderRadius="lg"
                fontSize="xs"
                minW="50px"
                h="28px"
                isDisabled={value === weight}
              >
                {weight} lbs
              </Button>
            ))}
          </HStack>
        </VStack>
      )}

      {/* Quick adjustment buttons */}
      {showQuickButtons && !isDisabled && !isNA && (
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
      {(value !== undefined || isNA) && !isDisabled && (
        <Button
          size="xs"
          variant="ghost"
          colorScheme="gray"
          onClick={() => {
            onChange(undefined);
            setIsNA(false);
            setInputValue('');
          }}
          alignSelf="center"
          borderRadius="md"
        >
          {isNA ? "Clear N/A" : "Clear Weight"}
        </Button>
      )}
    </VStack>
  );
});

WeightInput.displayName = 'WeightInput';
