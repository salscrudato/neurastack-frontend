// src/components/AddToHomeButton.tsx
import { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  useDisclosure,
  Icon,
  Box,
  Badge,
  Slide,
  IconButton,
  Tooltip,
  useToast,
  SlideFade,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { PiDeviceMobileBold, PiDownloadBold, PiSparkle } from 'react-icons/pi';
import { motion } from 'framer-motion';
import useInstallPrompt from "../hooks/useInstallPrompt";

const MotionBox = motion(Box);

export default function AddToHomeButton() {
  const promptEvent = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Modern color values - light mode only
  const bannerBg = '#FFFFFF';
  const bannerBorderColor = '#E2E8F0';
  const modalBg = 'rgba(79, 156, 249, 0.05)';
  const modalTextColor = '#1E40AF';

  // Check if app is already installed
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
    }
  }, []);

  // Check if user has dismissed the prompt recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    if (dismissedTime && parseInt(dismissedTime) > oneDayAgo) {
      setDismissed(true);
    }
  }, []);

  // Show banner after a delay if prompt is available
  useEffect(() => {
    if (promptEvent && !dismissed && !isInstalled) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [promptEvent, dismissed, isInstalled]);

  // Listen for successful installation
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDismissed(false);
      toast({
        title: "App Installed!",
        description: "Neurastack has been added to your home screen.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, [toast]);

  const handleInstallClick = async () => {
    if (!promptEvent) return;

    try {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        toast({
          title: "Installing...",
          description: "Neurastack is being installed.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.log('User dismissed the install prompt');
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        setDismissed(true);
      }

      setShowBanner(false);
      onClose();
    } catch (error) {
      console.error('Error during installation:', error);
      toast({
        title: "Installation Failed",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDismiss = (permanent = false) => {
    setShowBanner(false);
    onClose();

    if (permanent) {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      setDismissed(true);
    }
  };

  // Don't show anything if app is already installed or no prompt available
  if (isInstalled || !promptEvent || dismissed) return null;

  return (
    <>
      {/* Simple floating button (fallback) */}
      {!showBanner && (
        <SlideFade in>
          <Button
            pos="fixed"
            bottom={6}
            right={6}
            size="lg"
            colorScheme="blue"
            borderRadius="full"
            shadow="lg"
            onClick={onOpen}
            leftIcon={<PiDownloadBold />}
          >
            Install App
          </Button>
        </SlideFade>
      )}

      {/* Enhanced banner */}
      <Slide direction="bottom" in={showBanner}>
        <MotionBox
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          position="fixed"
          bottom={4}
          left={4}
          right={4}
          zIndex={1000}
          maxW="400px"
          mx="auto"
        >
          <Box
            bg={bannerBg}
            borderRadius="lg"
            boxShadow="xl"
            border="1px solid"
            borderColor={bannerBorderColor}
            p={4}
          >
            <HStack justify="space-between" align="start">
              <HStack spacing={3} flex={1}>
                <Icon as={PiDeviceMobileBold} boxSize={6} color="blue.500" />
                <VStack align="start" spacing={1} flex={1}>
                  <HStack>
                    <Text fontWeight="semibold" fontSize="sm">
                      Install Neurastack
                    </Text>
                    <Badge colorScheme="blue" size="sm">
                      PWA
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Get the app experience with offline support
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={1}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  leftIcon={<PiDownloadBold />}
                  onClick={onOpen}
                >
                  Install
                </Button>
                <Tooltip label="Dismiss" hasArrow>
                  <IconButton
                    aria-label="Dismiss install prompt"
                    icon={<CloseIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(true)}
                  />
                </Tooltip>
              </HStack>
            </HStack>
          </Box>
        </MotionBox>
      </Slide>

      {/* Detailed modal */}
      <Modal isOpen={isOpen} onClose={() => handleDismiss(false)} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={PiSparkle} color="blue.500" />
              <Text>Install Neurastack App</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text>
                Get the full Neurastack experience by installing our Progressive Web App:
              </Text>

              <VStack spacing={3} align="start" pl={4} w="full">
                <HStack>
                  <Icon as={PiDeviceMobileBold} color="green.500" />
                  <Text fontSize="sm">Native app-like experience</Text>
                </HStack>
                <HStack>
                  <Icon as={PiDownloadBold} color="blue.500" />
                  <Text fontSize="sm">Faster loading and better performance</Text>
                </HStack>
                <HStack>
                  <Icon as={PiSparkle} color="purple.500" />
                  <Text fontSize="sm">Works offline with cached conversations</Text>
                </HStack>
                <HStack>
                  <Icon as={PiDeviceMobileBold} color="orange.500" />
                  <Text fontSize="sm">Easy access from your home screen</Text>
                </HStack>
              </VStack>

              <Box
                bg={modalBg}
                p={3}
                borderRadius="md"
                w="full"
              >
                <Text fontSize="sm" color={modalTextColor}>
                  💡 <strong>Tip:</strong> After installation, you can uninstall anytime from your browser settings.
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => handleDismiss(true)}>
              Not Now
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleInstallClick}
              leftIcon={<PiDownloadBold />}
            >
              Install App
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}