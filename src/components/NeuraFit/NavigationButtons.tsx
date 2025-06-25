import { Button, HStack } from '@chakra-ui/react';
import { memo } from 'react';

// Import optimized NeuraFit styles
import '../../styles/neurafit-components.css';

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
          onClick={onBack}
          className="neurafit-nav-button back"
          size="lg"
        >
          {backLabel}
        </Button>
      ) : (
        <div /> // Spacer when no back button
      )}

      <Button
        onClick={onNext}
        className="neurafit-nav-button next"
        size="lg"
        isDisabled={!canProceed}
        isLoading={isLoading}
      >
        {nextLabel}
      </Button>
    </HStack>
  );
});

export default NavigationButtons;
