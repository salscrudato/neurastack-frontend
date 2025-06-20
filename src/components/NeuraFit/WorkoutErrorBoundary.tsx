import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    Collapse,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { FiChevronDown, FiChevronUp, FiHome, FiRefreshCw } from 'react-icons/fi';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onBackToDashboard?: () => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
  retryCount: number;
}

class WorkoutErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      showDetails: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WorkoutErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo, 'workout-generation');
    }
  }

  handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
      retryCount: prev.retryCount + 1,
    }));

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleBackToDashboard = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
      retryCount: 0,
    });

    if (this.props.onBackToDashboard) {
      this.props.onBackToDashboard();
    }
  };

  toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <WorkoutErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onBackToDashboard={this.handleBackToDashboard}
          showDetails={this.state.showDetails}
          onToggleDetails={this.toggleDetails}
          retryCount={this.state.retryCount}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onRetry: () => void;
  onBackToDashboard: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  retryCount: number;
}

function WorkoutErrorFallback({
  error,
  errorInfo: _errorInfo,
  onRetry,
  onBackToDashboard,
  showDetails,
  onToggleDetails,
  retryCount
}: ErrorFallbackProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  // Determine error type and provide specific guidance
  const getErrorGuidance = () => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to our workout generation service. Please check your internet connection and try again.',
        icon: '🌐',
        canRetry: true
      };
    }
    
    if (errorMessage.includes('timeout')) {
      return {
        title: 'Request Timeout',
        description: 'The workout generation is taking longer than expected. This might be due to high demand.',
        icon: '⏱️',
        canRetry: true
      };
    }
    
    if (errorMessage.includes('503') || errorMessage.includes('service unavailable')) {
      return {
        title: 'Service Temporarily Unavailable',
        description: 'Our workout generation service is temporarily down for maintenance. Please try again in a few minutes.',
        icon: '🔧',
        canRetry: true
      };
    }
    
    return {
      title: 'Workout Generation Error',
      description: 'Something went wrong while generating your workout. Don\'t worry, your profile data is safe.',
      icon: '⚠️',
      canRetry: true
    };
  };

  const guidance = getErrorGuidance();
  const maxRetries = 3;

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box maxW="md" w="full">
        <VStack
          spacing={6}
          bg={cardBg}
          borderRadius="2xl"
          p={8}
          boxShadow="xl"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          {/* Error Icon and Title */}
          <VStack spacing={3} textAlign="center">
            <Text fontSize="4xl" role="img" aria-label="Error">
              {guidance.icon}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              {guidance.title}
            </Text>
            <Text fontSize="md" color={subtextColor} lineHeight="1.6">
              {guidance.description}
            </Text>
          </VStack>

          {/* Action Buttons */}
          <VStack spacing={3} w="full">
            {guidance.canRetry && retryCount < maxRetries && (
              <Button
                leftIcon={<FiRefreshCw />}
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={onRetry}
              >
                Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
              </Button>
            )}
            
            <Button
              leftIcon={<FiHome />}
              variant="outline"
              size="lg"
              w="full"
              onClick={onBackToDashboard}
            >
              Back to Dashboard
            </Button>
          </VStack>

          {/* Retry Limit Warning */}
          {retryCount >= maxRetries && (
            <Alert status="warning" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Maximum retries reached</AlertTitle>
                <AlertDescription fontSize="sm">
                  Please return to the dashboard and try again later, or contact support if the problem persists.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Error Details Toggle */}
          <Box w="full">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDetails}
              rightIcon={showDetails ? <FiChevronUp /> : <FiChevronDown />}
              w="full"
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>
            
            <Collapse in={showDetails}>
              <Box
                mt={3}
                p={4}
                bg={useColorModeValue('gray.100', 'gray.700')}
                borderRadius="lg"
                fontSize="sm"
                fontFamily="mono"
              >
                <Text fontWeight="bold" mb={2}>Error Details:</Text>
                <Text color={subtextColor} mb={2}>
                  {error?.name}: {error?.message}
                </Text>
                {error?.stack && (
                  <Box>
                    <Text fontWeight="bold" mb={1}>Stack Trace:</Text>
                    <Text
                      fontSize="xs"
                      color={subtextColor}
                      whiteSpace="pre-wrap"
                      maxH="200px"
                      overflowY="auto"
                    >
                      {error.stack}
                    </Text>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>

          {/* Help Text */}
          <Text fontSize="sm" color={subtextColor} textAlign="center">
            If this problem continues, please contact support with the error details above.
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}

export default WorkoutErrorBoundary;
