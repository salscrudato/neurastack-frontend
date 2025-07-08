import {
    AlertDescription,
    AlertTitle,
    Box,
    Button,
    HStack,
    Icon,
    useColorModeValue
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { HiDownload, HiX } from 'react-icons/hi';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  const borderColor = useColorModeValue('blue.200', 'blue.500');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);

      // Check if user has already dismissed the prompt recently
      const lastDismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = lastDismissed ? parseInt(lastDismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      // Only show if not dismissed in the last 7 days and after meaningful user interaction
      if (daysSinceDismissed > 7) {
        let interactionCount = 0;

        // Wait for multiple interactions to ensure user is engaged
        const showAfterInteraction = () => {
          interactionCount++;
          if (interactionCount >= 3) { // Require 3 interactions before showing
            setTimeout(() => {
              setShowInstallPrompt(true);
              // Auto-hide after 45 seconds if no interaction
              const timer = setTimeout(() => {
                setShowInstallPrompt(false);
                setIsDismissed(true);
              }, 45000);
              setAutoHideTimer(timer);
            }, 3000); // Show 3 seconds after engagement

            // Remove listeners after showing
            document.removeEventListener('click', showAfterInteraction);
            document.removeEventListener('scroll', showAfterInteraction);
            document.removeEventListener('keydown', showAfterInteraction);
          }
        };

        // Show after meaningful user engagement
        document.addEventListener('click', showAfterInteraction);
        document.addEventListener('scroll', showAfterInteraction);
        document.addEventListener('keydown', showAfterInteraction);

        // Fallback: show after 30 seconds even without enough interaction (but only if some interaction)
        setTimeout(() => {
          if (!showInstallPrompt && interactionCount > 0) {
            setShowInstallPrompt(true);
            // Auto-hide after 30 seconds if no interaction
            const timer = setTimeout(() => {
              setShowInstallPrompt(false);
              setIsDismissed(true);
            }, 30000);
            setAutoHideTimer(timer);
          }
        }, 30000); // Increased from 15 to 30 seconds
      }
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [autoHideTimer]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      await deferredPrompt.userChoice;

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      // Silent fail for PWA install errors
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleRemindLater = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }
    // Show again in 1 day
    const oneDayFromNow = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-dismissed', oneDayFromNow.toString());
  };

  // Don't show if dismissed or no install prompt available
  if (isDismissed || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Box
      position="fixed"
      bottom={{ base: "20px", md: "24px" }}
      right={{ base: "20px", md: "24px" }}
      zIndex={9998}
      maxWidth={{ base: "calc(100vw - 40px)", md: "380px" }}
      transform={showInstallPrompt ? "translateX(0)" : "translateX(120%)"}
      transition="transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <Box
        bg={bgColor}
        backdropFilter="blur(12px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        boxShadow={`0 8px 32px ${shadowColor}`}
        p={5}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: `0 12px 40px ${shadowColor}`,
        }}
      >
        <Box position="relative">
          {/* Close button */}
          <Button
            position="absolute"
            top="-2"
            right="-2"
            size="xs"
            variant="ghost"
            onClick={handleDismiss}
            isDisabled={isInstalling}
            borderRadius="full"
            minW="auto"
            h="6"
            w="6"
            p={0}
            color="gray.500"
            _hover={{ color: "gray.700", bg: "gray.100" }}
          >
            <Icon as={HiX} boxSize={3} />
          </Button>

          <HStack spacing={3} align="start">
            <Box
              p={2}
              borderRadius="lg"
              bg="blue.50"
              color="blue.600"
              flexShrink={0}
            >
              <Icon as={HiDownload} boxSize={5} />
            </Box>

            <Box flex="1">
              <AlertTitle fontSize="md" mb={1} fontWeight="600" color="gray.800">
                Install NeuraStack
              </AlertTitle>
              <AlertDescription fontSize="sm" mb={4} color="gray.600" lineHeight="1.4">
                Get faster access, offline support, and a native app experience.
              </AlertDescription>

              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleInstallClick}
                  isLoading={isInstalling}
                  loadingText="Installing..."
                  borderRadius="lg"
                  fontWeight="600"
                  px={4}
                >
                  Install
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemindLater}
                  isDisabled={isInstalling}
                  borderRadius="lg"
                  color="gray.600"
                  _hover={{ bg: "gray.100" }}
                >
                  Later
                </Button>
              </HStack>
            </Box>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default PWAInstallPrompt;
