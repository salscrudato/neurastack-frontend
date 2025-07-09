/**
 * Ensemble Accessibility Demo Component
 * 
 * Demonstrates the enhanced accessibility features for the ensemble info modal
 * in chat message response cards.
 */

import {
  Box,
  VStack,
  Text,
  Heading,
  List,
  ListItem,
  ListIcon,
  Badge,
  Flex,
  HStack,
} from '@chakra-ui/react';
import { PiCheckBold, PiSparkle, PiInfoBold } from 'react-icons/pi';

export const EnsembleAccessibilityDemo = () => {
  return (
    <Box
      p={6}
      bg="linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)"
      borderRadius="xl"
      border="1px solid rgba(226, 232, 240, 0.8)"
      boxShadow="0 4px 16px rgba(0, 0, 0, 0.08)"
    >
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" color="#4F9CF9" mb={2}>
            Enhanced Ensemble Modal Accessibility
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Multiple ways to access ensemble analysis from chat responses
          </Text>
        </Box>

        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontWeight="600" mb={3} color="gray.700">
              🎯 Access Points Added:
            </Text>
            <List spacing={2}>
              <ListItem>
                <ListIcon as={PiCheckBold} color="green.500" />
                <Text as="span" fontWeight="500">Enhanced Ensemble Badge</Text>
                <Text as="span" color="gray.600" ml={2}>
                  - Larger, more prominent with visual indicators
                </Text>
              </ListItem>
              
              <ListItem>
                <ListIcon as={PiCheckBold} color="green.500" />
                <Text as="span" fontWeight="500">Dedicated Action Button</Text>
                <Text as="span" color="gray.600" ml={2}>
                  - Quick access icon in message actions area
                </Text>
              </ListItem>
              
              <ListItem>
                <ListIcon as={PiCheckBold} color="green.500" />
                <Text as="span" fontWeight="500">Visual Message Indicators</Text>
                <Text as="span" color="gray.600" ml={2}>
                  - Special styling and header for ensemble responses
                </Text>
              </ListItem>
            </List>
          </Box>

          <Box>
            <Text fontWeight="600" mb={3} color="gray.700">
              ✨ Visual Enhancements:
            </Text>
            
            {/* Demo Ensemble Badge */}
            <Flex gap={3} mb={4} flexWrap="wrap">
              <Badge
                variant="subtle"
                colorScheme="blue"
                fontSize="sm"
                px={5}
                py={3}
                minH="48px"
                borderRadius="full"
                cursor="pointer"
                bg="linear-gradient(135deg, rgba(79, 156, 249, 0.12) 0%, rgba(139, 92, 246, 0.1) 100%)"
                border="2px solid rgba(79, 156, 249, 0.3)"
                color="#4F9CF9"
                fontWeight="700"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{
                  bg: "linear-gradient(135deg, rgba(79, 156, 249, 0.18) 0%, rgba(139, 92, 246, 0.15) 100%)",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(79, 156, 249, 0.25)',
                }}
                transition="all 0.2s ease"
              >
                <HStack spacing={1.5}>
                  <PiSparkle size={16} />
                  <Text>AI Ensemble</Text>
                  <Box
                    w="4px"
                    h="4px"
                    borderRadius="full"
                    bg="currentColor"
                    opacity={0.6}
                  />
                </HStack>
              </Badge>
              
              <Text fontSize="sm" color="gray.600" alignSelf="center">
                ← Enhanced with better visibility and touch targets
              </Text>
            </Flex>

            <List spacing={2}>
              <ListItem>
                <ListIcon as={PiInfoBold} color="blue.500" />
                <Text as="span" fontWeight="500">Distinctive Message Styling</Text>
                <Text as="span" color="gray.600" ml={2}>
                  - Blue gradient borders and enhanced shadows
                </Text>
              </ListItem>
              
              <ListItem>
                <ListIcon as={PiInfoBold} color="blue.500" />
                <Text as="span" fontWeight="500">Header Indicators</Text>
                <Text as="span" color="gray.600" ml={2}>
                  - "AI Ensemble Response" label with animated pulse
                </Text>
              </ListItem>
              
              <ListItem>
                <ListIcon as={PiInfoBold} color="blue.500" />
                <Text as="span" fontWeight="500">Mobile Optimized</Text>
                <Text as="span" color="gray.600" ml={2}>
                  - Larger touch targets and responsive design
                </Text>
              </ListItem>
            </List>
          </Box>

          <Box
            p={4}
            bg="rgba(79, 156, 249, 0.05)"
            borderRadius="lg"
            border="1px solid rgba(79, 156, 249, 0.1)"
          >
            <Text fontSize="sm" color="gray.700">
              <Text as="span" fontWeight="600">💡 Pro Tip:</Text> Look for the sparkle icon (✨) 
              and blue styling to quickly identify ensemble responses and access detailed analysis.
            </Text>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};

export default EnsembleAccessibilityDemo;
