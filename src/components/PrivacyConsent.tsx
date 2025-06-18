/**
 * Privacy Consent Component
 * 
 * GDPR/CCPA compliant consent banner for analytics and cookies.
 * Only enables advanced tracking after user consent.
 */

import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    HStack,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Switch,
    Text,
    VStack,
    useColorModeValue,
    useDisclosure
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MotionBox = motion(Box);

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ConsentPreferences {
  analytics: boolean;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
}

export interface PrivacyConsentProps {
  onConsentChange?: (preferences: ConsentPreferences) => void;
}

// ============================================================================
// Main Component
// ============================================================================

export default function PrivacyConsent({ onConsentChange }: PrivacyConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: false,
    performance: true, // Essential for app functionality
    functional: true,  // Essential for app functionality
    marketing: false
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  // Check if user has already made a consent choice
  useEffect(() => {
    const consentData = localStorage.getItem('privacy_consent');
    if (!consentData) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    } else {
      try {
        const savedPreferences = JSON.parse(consentData);
        setPreferences(savedPreferences);
        onConsentChange?.(savedPreferences);
      } catch (error) {
        console.warn('Failed to parse saved consent preferences:', error);
        setShowBanner(true);
      }
    }
  }, [onConsentChange]);

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      analytics: true,
      performance: true,
      functional: true,
      marketing: true
    };
    
    saveConsent(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    const essentialOnly: ConsentPreferences = {
      analytics: false,
      performance: true,
      functional: true,
      marketing: false
    };
    
    saveConsent(essentialOnly);
    setShowBanner(false);
  };

  const handleCustomizeConsent = () => {
    onOpen();
  };

  const handleSaveCustomPreferences = () => {
    saveConsent(preferences);
    setShowBanner(false);
    onClose();
  };

  const saveConsent = (consentPreferences: ConsentPreferences) => {
    try {
      localStorage.setItem('privacy_consent', JSON.stringify(consentPreferences));
      localStorage.setItem('consent_timestamp', Date.now().toString());
      setPreferences(consentPreferences);
      onConsentChange?.(consentPreferences);
    } catch (error) {
      console.warn('Failed to save consent preferences:', error);
    }
  };

  const handlePreferenceChange = (key: keyof ConsentPreferences, value: boolean) => {
    // Prevent disabling essential cookies
    if ((key === 'performance' || key === 'functional') && !value) {
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <MotionBox
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg={bgColor}
          borderTop="1px solid"
          borderColor={borderColor}
          p={4}
          zIndex={9999}
          boxShadow="0 -4px 12px rgba(0, 0, 0, 0.1)"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <VStack spacing={4} align="stretch" maxW="6xl" mx="auto">
            <Text color={textColor} fontSize="sm" lineHeight="1.5">
              We use cookies and similar technologies to enhance your experience, analyze usage, 
              and provide personalized content. By clicking "Accept All", you consent to our use 
              of cookies for analytics and marketing purposes.{' '}
              <Link 
                color="blue.500" 
                href="/privacy" 
                textDecoration="underline"
                _hover={{ color: 'blue.600' }}
              >
                Learn more
              </Link>
            </Text>
            
            <HStack spacing={3} justify={{ base: 'stretch', md: 'flex-end' }} flexWrap="wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAcceptEssential}
                minW={{ base: 'full', md: 'auto' }}
              >
                Essential Only
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleCustomizeConsent}
                minW={{ base: 'full', md: 'auto' }}
              >
                Customize
              </Button>
              
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleAcceptAll}
                minW={{ base: 'full', md: 'auto' }}
              >
                Accept All
              </Button>
            </HStack>
          </VStack>
        </MotionBox>
      </AnimatePresence>

      {/* Customization Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Privacy Preferences</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Text fontSize="sm" color={textColor}>
                Customize your privacy settings. Essential cookies are required for the app to function properly.
              </Text>

              <VStack spacing={4} align="stretch">
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box flex="1" mr={4}>
                    <FormLabel mb={1} fontSize="sm" fontWeight="semibold">
                      Essential Cookies
                    </FormLabel>
                    <Text fontSize="xs" color={textColor}>
                      Required for basic app functionality, authentication, and security.
                    </Text>
                  </Box>
                  <Switch 
                    isChecked={preferences.functional && preferences.performance}
                    isDisabled={true}
                    colorScheme="blue"
                  />
                </FormControl>

                <Divider />

                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box flex="1" mr={4}>
                    <FormLabel mb={1} fontSize="sm" fontWeight="semibold">
                      Analytics Cookies
                    </FormLabel>
                    <Text fontSize="xs" color={textColor}>
                      Help us understand how you use the app to improve your experience.
                    </Text>
                  </Box>
                  <Switch 
                    isChecked={preferences.analytics}
                    onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>

                <Divider />

                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box flex="1" mr={4}>
                    <FormLabel mb={1} fontSize="sm" fontWeight="semibold">
                      Marketing Cookies
                    </FormLabel>
                    <Text fontSize="xs" color={textColor}>
                      Used to show you relevant content and advertisements.
                    </Text>
                  </Box>
                  <Switch 
                    isChecked={preferences.marketing}
                    onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSaveCustomPreferences}>
                Save Preferences
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if user has consented to analytics
 */
export function hasAnalyticsConsent(): boolean {
  try {
    const consentData = localStorage.getItem('privacy_consent');
    if (!consentData) return false;
    
    const preferences = JSON.parse(consentData) as ConsentPreferences;
    return preferences.analytics;
  } catch {
    return false;
  }
}

/**
 * Get current consent preferences
 */
export function getConsentPreferences(): ConsentPreferences | null {
  try {
    const consentData = localStorage.getItem('privacy_consent');
    if (!consentData) return null;
    
    return JSON.parse(consentData) as ConsentPreferences;
  } catch {
    return null;
  }
}

/**
 * Update consent preferences
 */
export function updateConsentPreferences(preferences: ConsentPreferences): void {
  try {
    localStorage.setItem('privacy_consent', JSON.stringify(preferences));
    localStorage.setItem('consent_timestamp', Date.now().toString());
  } catch (error) {
    console.warn('Failed to update consent preferences:', error);
  }
}
