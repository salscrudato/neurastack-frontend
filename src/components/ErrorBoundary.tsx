import { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Collapse,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
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
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          showDetails={this.state.showDetails}
          onToggleDetails={this.toggleDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onReset: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}

function ErrorFallback({
  error,
  errorInfo,
  onReset,
  showDetails,
  onToggleDetails
}: ErrorFallbackProps) {
  return (
    <Box
      minH="100vh"
      bg={useColorModeValue("gray.50", "gray.900")}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box maxW="md" w="full">
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          p={8}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Oops! Something went wrong
          </AlertTitle>
          <AlertDescription maxWidth="sm" mb={6}>
            We encountered an unexpected error. Don't worry, your data is safe.
            You can try refreshing the page or contact support if the problem persists.
          </AlertDescription>

          <VStack spacing={4} w="full">
            <Button
              colorScheme="blue"
              onClick={onReset}
              size="lg"
              w="full"
            >
              Try Again
            </Button>

            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              size="sm"
            >
              Refresh Page
            </Button>

            {(error || errorInfo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleDetails}
                rightIcon={showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
              >
                {showDetails ? 'Hide' : 'Show'} Error Details
              </Button>
            )}
          </VStack>

          <Collapse in={showDetails} animateOpacity>
            <Box mt={6} p={4} bg={useColorModeValue("gray.100", "gray.800")} borderRadius="md">
              {error && (
                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Error Message:
                  </Text>
                  <Code p={2} borderRadius="md" fontSize="xs" display="block">
                    {error.message}
                  </Code>
                </Box>
              )}

              {error?.stack && (
                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Stack Trace:
                  </Text>
                  <Code
                    p={2}
                    borderRadius="md"
                    fontSize="xs"
                    display="block"
                    whiteSpace="pre-wrap"
                    maxH="200px"
                    overflowY="auto"
                  >
                    {error.stack}
                  </Code>
                </Box>
              )}

              {errorInfo?.componentStack && (
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Component Stack:
                  </Text>
                  <Code
                    p={2}
                    borderRadius="md"
                    fontSize="xs"
                    display="block"
                    whiteSpace="pre-wrap"
                    maxH="200px"
                    overflowY="auto"
                  >
                    {errorInfo.componentStack}
                  </Code>
                </Box>
              )}
            </Box>
          </Collapse>
        </Alert>
      </Box>
    </Box>
  );
}

export default ErrorBoundary;
