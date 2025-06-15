import { HStack, Button } from '@chakra-ui/react';
import { memo } from 'react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext: () => void;
  canProceed?: boolean;
  nextLabel?: string;
  backLabel?: string;
  isLoading?: boolean;
  maxWidth?: string;
}

const NavigationButtons = memo(function NavigationButtons({
  onBack,
  onNext,
  canProceed = true,
  nextLabel = 'Continue',
  backLabel = 'Back',
  isLoading = false,
  maxWidth = '500px'
}: NavigationButtonsProps) {
  return (
    <HStack 
      justify="space-between" 
      w="100%" 
      maxW={maxWidth} 
      mx="auto" 
      pt={4}
      spacing={4}
    >
      {onBack ? (
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
          borderRadius="xl"
          borderColor="gray.300"
          color="gray.700"
          flex={1}
          _hover={{
            borderColor: "gray.400",
            bg: "gray.50"
          }}
          _active={{
            transform: "scale(0.98)"
          }}
          transition="all 150ms ease"
        >
          {backLabel}
        </Button>
      ) : (
        <div /> // Spacer when no back button
      )}
      
      <Button
        onClick={onNext}
        size="lg"
        borderRadius="xl"
        bg="blue.500"
        color="white"
        flex={1}
        isDisabled={!canProceed}
        isLoading={isLoading}
        _hover={{
          bg: "blue.600"
        }}
        _disabled={{
          bg: "gray.300",
          color: "gray.500",
          cursor: "not-allowed"
        }}
        _active={{
          transform: "scale(0.98)"
        }}
        transition="all 150ms ease"
      >
        {nextLabel}
      </Button>
    </HStack>
  );
});

export default NavigationButtons;
