import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Slide,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { CloseIcon, RepeatIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

interface OfflineIndicatorProps {
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export default function OfflineIndicator({
  onRetry,
  showRetryButton = true
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show "back online" message briefly
        setShowIndicator(true);
        setTimeout(() => {
          setShowIndicator(false);
          setWasOffline(false);
        }, 3000);
      } else {
        setShowIndicator(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - reload the page
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowIndicator(false);
  };

  if (!showIndicator) return null;

  return (
    <AnimatePresence>
      <Slide direction="top" in={showIndicator}>
        <MotionBox
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={9999}
          p={4}
        >
          <Alert
            status={isOnline ? "success" : "warning"}
            variant="solid"
            borderRadius="md"
            boxShadow="lg"
          >
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="sm">
                {isOnline ? "Back Online!" : "No Internet Connection"}
              </AlertTitle>
              <AlertDescription fontSize="xs">
                {isOnline
                  ? "Your connection has been restored."
                  : "Please check your network connection. Some features may not work properly."
                }
              </AlertDescription>
            </Box>

            <HStack spacing={2}>
              {!isOnline && showRetryButton && (
                <Tooltip label="Retry connection" hasArrow>
                  <IconButton
                    aria-label="Retry connection"
                    icon={<RepeatIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    onClick={handleRetry}
                  />
                </Tooltip>
              )}

              <Tooltip label="Dismiss" hasArrow>
                <IconButton
                  aria-label="Dismiss notification"
                  icon={<CloseIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="whiteAlpha"
                  onClick={handleDismiss}
                />
              </Tooltip>
            </HStack>
          </Alert>
        </MotionBox>
      </Slide>
    </AnimatePresence>
  );
}

// Hook for detecting online/offline status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Get connection info if available
    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection ||
                        (navigator as any).mozConnection ||
                        (navigator as any).webkitConnection;

      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo(); // Initial check
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  return { isOnline, connectionType };
}

// Component for showing connection quality
export function ConnectionQuality() {
  const { isOnline, connectionType } = useNetworkStatus();

  if (!isOnline) return null;

  const getQualityColor = (type: string) => {
    switch (type) {
      case '4g':
      case 'wifi':
        return 'green';
      case '3g':
        return 'yellow';
      case '2g':
      case 'slow-2g':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getQualityLabel = (type: string) => {
    switch (type) {
      case '4g':
        return 'Fast';
      case '3g':
        return 'Good';
      case '2g':
        return 'Slow';
      case 'slow-2g':
        return 'Very Slow';
      default:
        return 'Unknown';
    }
  };

  if (connectionType === 'unknown') return null;

  return (
    <Tooltip
      label={`Connection: ${getQualityLabel(connectionType)} (${connectionType})`}
      hasArrow
    >
      <Box
        position="fixed"
        bottom={4}
        left={4}
        zIndex={1000}
      >
        <Box
          w={3}
          h={3}
          borderRadius="full"
          bg={`${getQualityColor(connectionType)}.400`}
          opacity={0.7}
          animation="pulse 2s infinite"
        />
      </Box>
    </Tooltip>
  );
}
