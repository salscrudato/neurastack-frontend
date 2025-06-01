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
  Badge,
} from '@chakra-ui/react';
import { useState } from 'react';
import { 
  PiWarningBold, 
  PiArrowClockwiseBold, 
  PiEyeBold,
  PiEyeSlashBold,
  PiClockBold,
  PiGearBold
} from 'react-icons/pi';

interface ErrorMessageProps {
  message: string;
  metadata?: {
    retryCount?: number;
    totalTime?: number;
    errorType?: string;
    [key: string]: any;
  };
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export function ErrorMessage({ 
  message, 
  metadata, 
  onRetry, 
  showRetryButton = true 
}: ErrorMessageProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const bgColor = useColorModeValue('red.50', 'red.900');
  const borderColor = useColorModeValue('red.200', 'red.700');
  const textColor = useColorModeValue('red.800', 'red.200');
  const subtextColor = useColorModeValue('red.600', 'red.300');

  const toggleDetails = () => setShowDetails(!showDetails);

  return (
    <Box
      p={4}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      maxW="100%"
      boxShadow="sm"
    >
      <VStack spacing={3} align="stretch">
        {/* Main Error Display */}
        <HStack spacing={3} align="start">
          <Icon 
            as={PiWarningBold} 
            color={textColor} 
            boxSize={5} 
            mt={0.5}
            flexShrink={0}
          />
          <VStack align="start" spacing={1} flex={1}>
            <Text 
              fontSize="sm" 
              fontWeight="semibold" 
              color={textColor}
              lineHeight="1.4"
            >
              {message}
            </Text>
            
            {/* Metadata badges */}
            {metadata && (
              <HStack spacing={2} flexWrap="wrap">
                {metadata.retryCount !== undefined && (
                  <Badge 
                    colorScheme="red" 
                    variant="subtle" 
                    fontSize="xs"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <PiArrowClockwiseBold size={10} />
                    {metadata.retryCount} retries
                  </Badge>
                )}
                
                {metadata.totalTime && (
                  <Badge 
                    colorScheme="orange" 
                    variant="subtle" 
                    fontSize="xs"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <PiClockBold size={10} />
                    {Math.round(metadata.totalTime / 1000)}s
                  </Badge>
                )}
                
                {metadata.errorType && (
                  <Badge 
                    colorScheme="gray" 
                    variant="subtle" 
                    fontSize="xs"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <PiGearBold size={10} />
                    {metadata.errorType}
                  </Badge>
                )}
              </HStack>
            )}
          </VStack>
        </HStack>

        {/* Action Buttons */}
        <HStack spacing={2} justify="flex-start">
          {showRetryButton && onRetry && (
            <Button
              size="sm"
              leftIcon={<PiArrowClockwiseBold />}
              onClick={onRetry}
              colorScheme="red"
              variant="outline"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'sm'
              }}
              transition="all 0.2s ease"
            >
              Try Again
            </Button>
          )}
          
          {metadata && process.env.NODE_ENV === 'development' && (
            <Button
              size="sm"
              leftIcon={showDetails ? <PiEyeSlashBold /> : <PiEyeBold />}
              onClick={toggleDetails}
              variant="ghost"
              colorScheme="red"
              fontSize="xs"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          )}
        </HStack>

        {/* Development Details */}
        {process.env.NODE_ENV === 'development' && metadata && (
          <Collapse in={showDetails} animateOpacity>
            <VStack spacing={3} align="stretch" pt={2}>
              <Box>
                <Text fontSize="xs" fontWeight="semibold" color={subtextColor} mb={2}>
                  Error Details:
                </Text>
                <Code 
                  fontSize="xs" 
                  p={3} 
                  borderRadius="md" 
                  display="block"
                  bg={useColorModeValue('red.100', 'red.800')}
                  color={textColor}
                  whiteSpace="pre-wrap"
                  maxH="200px"
                  overflowY="auto"
                >
                  {JSON.stringify(metadata, null, 2)}
                </Code>
              </Box>
              
              <Box>
                <Text fontSize="xs" color={subtextColor}>
                  💡 This detailed information is only visible in development mode
                </Text>
              </Box>
            </VStack>
          </Collapse>
        )}
      </VStack>
    </Box>
  );
}

export default ErrorMessage;
