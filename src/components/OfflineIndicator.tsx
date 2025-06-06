import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  Slide,
  IconButton,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';

interface OfflineIndicatorProps {
  onRetry?: () => void;
}

export default function OfflineIndicator({ onRetry: _onRetry }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDismiss = () => {
    setShowIndicator(false);
  };

  if (!showIndicator || isOnline) return null;

  return (
    <Slide direction="top" in={showIndicator}>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={9999}
        p={4}
      >
        <Alert
          status="warning"
          variant="solid"
          borderRadius="md"
          boxShadow="lg"
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">
              No Internet Connection
            </AlertTitle>
          </Box>
          <IconButton
            aria-label="Dismiss notification"
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={handleDismiss}
          />
        </Alert>
      </Box>
    </Slide>
  );
}

// Simple hook for detecting online/offline status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
