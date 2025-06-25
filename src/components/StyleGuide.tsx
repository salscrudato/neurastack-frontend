/**
 * Style Guide Component
 * Demonstrates the consolidated styling system usage
 */

import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    Input,
    Progress,
    SimpleGrid,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { memo } from 'react';

const StyleGuide = memo(function StyleGuide() {
  return (
    <Box w="100%" minH="100%" bg="#FAFBFC" position="relative" overflowX="hidden" p={6}>
      <VStack spacing={8} align="stretch" maxW="1200px" mx="auto">
        
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" className="text-gradient" mb={2}>
            NeuraStack Design System
          </Heading>
          <Text className="text-secondary">
            Consolidated styling system with CSS custom properties and Chakra UI theme
          </Text>
        </Box>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <Heading size="md">Button Variants</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <VStack spacing={3}>
                <Text fontWeight="semibold">Standard Variants</Text>
                <Button variant="solid">Primary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="glass">Glass Button</Button>
              </VStack>
              
              <VStack spacing={3}>
                <Text fontWeight="semibold">NeuraFit Variants</Text>
                <Button variant="neurafit-primary">NeuraFit Primary</Button>
                <Button variant="neurafit-secondary">NeuraFit Secondary</Button>
                <Button size="mobile-lg">Mobile Large</Button>
              </VStack>
              
              <VStack spacing={3}>
                <Text fontWeight="semibold">Utility Classes</Text>
                <Button className="glass-button">CSS Glass Button</Button>
                <Button className="button-press-feedback">Press Feedback</Button>
                <Button className="hover-lift">Hover Lift</Button>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <Heading size="md">Form Elements</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Input placeholder="Standard input" />
              <Input variant="glass" placeholder="Glass input" />
              <Input variant="mobile-optimized" placeholder="Mobile optimized input" />
              <Textarea placeholder="Standard textarea" />
              <Textarea variant="mobile-optimized" placeholder="Mobile optimized textarea" />
            </VStack>
          </CardBody>
        </Card>

        {/* Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardHeader>
              <Heading size="sm">Standard Card</Heading>
            </CardHeader>
            <CardBody>
              <Text>Default card styling with hover effects</Text>
            </CardBody>
          </Card>
          
          <Card variant="glass">
            <CardHeader>
              <Heading size="sm">Glass Card</Heading>
            </CardHeader>
            <CardBody>
              <Text>Glass morphism card with backdrop blur</Text>
            </CardBody>
          </Card>
          
          <Card variant="neurafit">
            <CardHeader>
              <Heading size="sm">NeuraFit Card</Heading>
            </CardHeader>
            <CardBody>
              <Text>NeuraFit specific card styling</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Progress & Badges */}
        <Card>
          <CardHeader>
            <Heading size="md">Progress & Badges</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={2}>Standard Progress</Text>
                <Progress value={65} />
              </Box>
              
              <Box>
                <Text mb={2}>NeuraFit Progress</Text>
                <Progress variant="neurafit" value={80} />
              </Box>
              
              <Flex gap={3} wrap="wrap">
                <Badge>Default Badge</Badge>
                <Badge variant="glass">Glass Badge</Badge>
                <Badge variant="neurafit-status" colorScheme="green">Status Badge</Badge>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Layout Variants */}
        <Card>
          <CardHeader>
            <Heading size="md">Layout Variants</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Flex align="center" justify="space-between" w="full" p={4} bg="gray.50" borderRadius="md">
                <Text>Space Between Layout</Text>
                <Button size="sm">Action</Button>
              </Flex>

              <Flex align="center" justify="center" w="full" p={4} bg="gray.50" borderRadius="md">
                <Text>Centered Layout</Text>
              </Flex>
            </VStack>
          </CardBody>
        </Card>

        {/* Utility Classes */}
        <Card>
          <CardHeader>
            <Heading size="md">Utility Classes</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack spacing={3} align="stretch">
                <Text fontWeight="semibold">Glass Effects</Text>
                <Box className="glass-card" p={4}>
                  <Text>Glass Card Utility</Text>
                </Box>
                
                <Text fontWeight="semibold">Gradients</Text>
                <Box className="gradient-primary" p={4} borderRadius="md">
                  <Text color="white">Primary Gradient</Text>
                </Box>
                
                <Box className="gradient-secondary" p={4} borderRadius="md">
                  <Text color="white">Secondary Gradient</Text>
                </Box>
              </VStack>
              
              <VStack spacing={3} align="stretch">
                <Text fontWeight="semibold">Animations</Text>
                <Box className="animate-float" p={4} bg="blue.100" borderRadius="md">
                  <Text>Floating Animation</Text>
                </Box>
                
                <Box className="animate-pulse-glow" p={4} bg="purple.100" borderRadius="md">
                  <Text>Pulse Glow Animation</Text>
                </Box>
                
                <Text fontWeight="semibold">Loading States</Text>
                <Box className="loading-shimmer" h="40px" borderRadius="md" />
                
                <Box className="loading-dots-enhanced">
                  <div className="loading-dot-enhanced"></div>
                  <div className="loading-dot-enhanced"></div>
                  <div className="loading-dot-enhanced"></div>
                </Box>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* CSS Custom Properties */}
        <Card>
          <CardHeader>
            <Heading size="md">CSS Custom Properties</Heading>
          </CardHeader>
          <CardBody>
            <Text mb={4} className="text-secondary">
              The design system uses CSS custom properties for consistent theming:
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <VStack align="stretch" spacing={2}>
                <Text fontWeight="semibold">Colors</Text>
                <Text fontSize="sm" fontFamily="mono">--color-brand-primary</Text>
                <Text fontSize="sm" fontFamily="mono">--color-surface-glass</Text>
                <Text fontSize="sm" fontFamily="mono">--gradient-primary</Text>
              </VStack>
              
              <VStack align="stretch" spacing={2}>
                <Text fontWeight="semibold">Spacing & Effects</Text>
                <Text fontSize="sm" fontFamily="mono">--space-md, --space-lg</Text>
                <Text fontSize="sm" fontFamily="mono">--radius-xl, --radius-2xl</Text>
                <Text fontSize="sm" fontFamily="mono">--shadow-glass, --shadow-glow</Text>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

      </VStack>
    </Box>
  );
});

export default StyleGuide;
