import { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
  HStack,
  useColorModeValue,
  Slide,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { PiXBold, PiArrowClockwiseBold, PiDownloadBold } from 'react-icons/pi';
import { useUpdateManager, setupAutoUpdateOnFocus, setupUpdateOnReconnect } from '../utils/updateManager';

export const UpdateNotification = () => {
  const { offlineReady, needRefresh, handleUpdate, dismissUpdate } = useUpdateManager();
  const [showOfflineReady, setShowOfflineReady] = useState(false);
  const [showNeedRefresh, setShowNeedRefresh] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (offlineReady) {
      // Check if we've already shown this notification in this session
      const hasShownOffline = sessionStorage.getItem('neurastack_offline_shown');

      if (!hasShownOffline) {
        setShowOfflineReady(true);
        sessionStorage.setItem('neurastack_offline_shown', 'true');

        // Auto-hide offline ready notification after 5 seconds
        setTimeout(() => setShowOfflineReady(false), 5000);
      }
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh && !isDismissed) {
      setShowNeedRefresh(true);

      // Auto-dismiss after 30 seconds if user doesn't interact
      const autoHideTimer = setTimeout(() => {
        setIsDismissed(true);
        setShowNeedRefresh(false);
        dismissUpdate();
      }, 30000);

      return () => clearTimeout(autoHideTimer);
    } else if (!needRefresh) {
      setShowNeedRefresh(false);
      setIsDismissed(false); // Reset dismissal when needRefresh becomes false
    }
  }, [needRefresh, isDismissed, dismissUpdate]);

  useEffect(() => {
    // Setup auto-update listeners
    const cleanupFocus = setupAutoUpdateOnFocus();
    const cleanupReconnect = setupUpdateOnReconnect();

    return () => {
      cleanupFocus();
      cleanupReconnect();
    };
  }, []);

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    setShowNeedRefresh(false); // Hide banner immediately
    try {
      await handleUpdate();
      // Page will reload, so no need to reset state
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      setShowNeedRefresh(true); // Show banner again if update failed
    }
  };

  const handleDismissUpdate = useCallback(() => {
    if (isDismissed) return; // Prevent multiple dismissals
    console.log('Dismissing update notification');
    setIsDismissed(true);
    setShowNeedRefresh(false);
    dismissUpdate(); // Also dismiss in the PWA state
  }, [isDismissed, dismissUpdate]);

  const handleDismissOffline = () => {
    setShowOfflineReady(false);
  };

  return (
    <>
      {/* Update Available Notification */}
      <Slide direction="top" in={showNeedRefresh} style={{ zIndex: 1000 }}>
        <Box
          position="fixed"
          top={4}
          left={4}
          right={4}
          mx="auto"
          maxW="md"
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="xl"
          p={4}
          backdropFilter="blur(10px)"
        >
          <VStack spacing={3} align="stretch">
            <HStack spacing={3} align="center">
              <Box
                p={2}
                borderRadius="full"
                bg={useColorModeValue('blue.50', 'blue.900')}
              >
                <PiDownloadBold
                  size={20}
                  color={useColorModeValue('#3182CE', '#63B3ED')}
                />
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <Text fontWeight="semibold" fontSize="sm" color={useColorModeValue('gray.800', 'white')}>
                  Update Available
                </Text>
                <Text fontSize="xs" color={useColorModeValue('gray.700', 'gray.300')}>
                  A new version of the app is ready
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<PiArrowClockwiseBold />}
                onClick={handleUpdateClick}
                isLoading={isUpdating}
                loadingText="Updating..."
                flex={1}
              >
                Update Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismissUpdate}
              >
                Later
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Slide>

      {/* Offline Ready Notification */}
      <Slide direction="top" in={showOfflineReady} style={{ zIndex: 999 }}>
        <Box
          position="fixed"
          top={4}
          left={4}
          right={4}
          mx="auto"
          maxW="md"
          bg={useColorModeValue('green.50', 'green.900')}
          borderWidth="1px"
          borderColor={useColorModeValue('green.200', 'green.600')}
          borderRadius="xl"
          boxShadow="lg"
          p={4}
        >
          <Alert status="success" variant="subtle" borderRadius="lg">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="sm">App Ready Offline!</AlertTitle>
              <AlertDescription fontSize="xs">
                You can now use the app without an internet connection.
              </AlertDescription>
            </Box>
            <IconButton
              aria-label="Dismiss offline notification"
              icon={<PiXBold />}
              size="sm"
              variant="ghost"
              onClick={handleDismissOffline}
              ml={2}
            />
          </Alert>
        </Box>
      </Slide>
    </>
  );
};

// Hook for manual update checking
export const useManualUpdateCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  
  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          console.log('Manual update check completed');
        }
      }
    } catch (error) {
      console.error('Manual update check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return { checkForUpdates, isChecking };
};

export default UpdateNotification;
