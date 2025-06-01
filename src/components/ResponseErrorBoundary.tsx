import React, { Component } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Collapse,
  Code,
} from '@chakra-ui/react';
import { PiWarningBold, PiArrowClockwiseBold, PiEyeBold } from 'react-icons/pi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  showDetails: boolean;
}

// Clean error logging for AI responses
function logResponseError(error: Error, errorInfo: React.ErrorInfo): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 AI Response Error Boundary Triggered`);
    console.log(`🔍 Error: ${error.name}`);
    console.log(`💬 Message: ${error.message}`);
    console.log(`📍 Component Stack:`);
    console.log(errorInfo.componentStack);
    if (error.stack) {
      console.log(`📚 Error Stack:`);
      console.log(error.stack);
    }
    console.groupEnd();
  }
}

class ResponseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logResponseError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default elegant error UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          showDetails={this.state.showDetails}
          onReset={this.handleReset}
          onToggleDetails={this.toggleDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Elegant error fallback component
function ErrorFallback({
  error,
  errorInfo,
  showDetails,
  onReset,
  onToggleDetails,
}: {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  showDetails: boolean;
  onReset: () => void;
  onToggleDetails: () => void;
}) {
  const bgColor = useColorModeValue('red.50', 'red.900');
  const borderColor = useColorModeValue('red.200', 'red.700');
  const textColor = useColorModeValue('red.800', 'red.200');

  return (
    <Box
      p={4}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      maxW="100%"
    >
      <VStack spacing={3} align="stretch">
        <HStack spacing={3}>
          <Icon as={PiWarningBold} color={textColor} boxSize={5} />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              Response Display Error
            </Text>
            <Text fontSize="xs" color={textColor} opacity={0.8}>
              Something went wrong while displaying this response
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={2}>
          <Button
            size="sm"
            leftIcon={<PiArrowClockwiseBold />}
            onClick={onReset}
            colorScheme="red"
            variant="outline"
          >
            Retry
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <Button
              size="sm"
              leftIcon={<PiEyeBold />}
              onClick={onToggleDetails}
              variant="ghost"
              colorScheme="red"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          )}
        </HStack>

        {process.env.NODE_ENV === 'development' && (
          <Collapse in={showDetails} animateOpacity>
            <VStack spacing={2} align="stretch" pt={2}>
              {error && (
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" mb={1}>
                    Error Details:
                  </Text>
                  <Code fontSize="xs" p={2} borderRadius="md" display="block">
                    {error.name}: {error.message}
                  </Code>
                </Box>
              )}
              
              {errorInfo?.componentStack && (
                <Box>
                  <Text fontSize="xs" fontWeight="semibold" mb={1}>
                    Component Stack:
                  </Text>
                  <Code fontSize="xs" p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
                    {errorInfo.componentStack.slice(0, 500)}
                    {errorInfo.componentStack.length > 500 ? '...' : ''}
                  </Code>
                </Box>
              )}
            </VStack>
          </Collapse>
        )}
      </VStack>
    </Box>
  );
}

export default ResponseErrorBoundary;
