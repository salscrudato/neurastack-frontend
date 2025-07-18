/**
 * Responsive Test Panel Component
 * 
 * A development utility component for testing and validating
 * responsive design implementation across different breakpoints.
 */

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    HStack,
    Progress,
    Text,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
    logValidationResults,
    validateAllBreakpoints,
    validateResponsiveDesign,
    type ResponsiveValidationResult,
} from '../utils/responsiveValidation';

export function ResponsiveTestPanel() {
  const [currentResult, setCurrentResult] = useState<ResponsiveValidationResult | null>(null);
  const [allResults, setAllResults] = useState<ResponsiveValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const toast = useToast();

  // Run validation on mount and window resize
  useEffect(() => {
    const runValidation = () => {
      const result = validateResponsiveDesign();
      setCurrentResult(result);
      logValidationResults(result);
    };

    runValidation();
    window.addEventListener('resize', runValidation);
    return () => window.removeEventListener('resize', runValidation);
  }, []);

  const handleValidateAll = async () => {
    setIsValidating(true);
    try {
      const results = await validateAllBreakpoints();
      setAllResults(results);
      toast({
        title: 'Validation Complete',
        description: `Tested ${results.length} breakpoints`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Validation Error',
        description: 'Failed to validate all breakpoints',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  if (!currentResult) {
    return (
      <Box p={4}>
        <Text>Loading responsive validation...</Text>
      </Box>
    );
  }

  return (
    <Box p={4} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Responsive Design Validation</Heading>
              <Badge colorScheme={getScoreColor(currentResult.score)} fontSize="lg" px={3} py={1}>
                {currentResult.score}/100
              </Badge>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Current Breakpoint: {currentResult.breakpoint.name}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  {currentResult.breakpoint.description} ({currentResult.breakpoint.minWidth}px
                  {currentResult.breakpoint.maxWidth ? ` - ${currentResult.breakpoint.maxWidth}px` : '+'}
                  )
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>Overall Score</Text>
                <Progress
                  value={currentResult.score}
                  colorScheme={getScoreColor(currentResult.score)}
                  size="lg"
                  borderRadius="md"
                />
              </Box>

              <HStack spacing={4}>
                <Box flex={1}>
                  <Text fontSize="sm" color="gray.600">Touch Targets</Text>
                  <Text fontWeight="semibold">
                    {currentResult.touchTargets.filter(t => t.isValid).length}/
                    {currentResult.touchTargets.length}
                  </Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" color="gray.600">Typography</Text>
                  <Text fontWeight="semibold">
                    {currentResult.typography.filter(t => t.isReadable).length}/
                    {currentResult.typography.length}
                  </Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" color="gray.600">Layout</Text>
                  <Text fontWeight="semibold">
                    {!currentResult.containerOverflow && !currentResult.horizontalScroll ? '✓' : '✗'}
                  </Text>
                </Box>
              </HStack>

              {currentResult.recommendations.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2} color="orange.600">
                    Recommendations
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    {currentResult.recommendations.map((rec, index) => (
                      <Text key={index} fontSize="sm" color="gray.700">
                        • {rec}
                      </Text>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Multi-Breakpoint Testing</Heading>
              <Button
                onClick={handleValidateAll}
                isLoading={isValidating}
                loadingText="Validating..."
                colorScheme="blue"
                size="sm"
              >
                Test All Breakpoints
              </Button>
            </Flex>
          </CardHeader>
          {allResults.length > 0 && (
            <CardBody>
              <Accordion allowMultiple>
                {allResults.map((result, index) => (
                  <AccordionItem key={index}>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <HStack>
                          <Text fontWeight="semibold">
                            {result.breakpoint.name} - {result.breakpoint.description}
                          </Text>
                          <Badge colorScheme={getScoreColor(result.score)}>
                            {result.score}/100
                          </Badge>
                        </HStack>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <VStack align="stretch" spacing={3}>
                        <HStack spacing={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.600">Touch Targets</Text>
                            <Text fontWeight="semibold">
                              {result.touchTargets.filter(t => t.isValid).length}/
                              {result.touchTargets.length}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600">Typography</Text>
                            <Text fontWeight="semibold">
                              {result.typography.filter(t => t.isReadable).length}/
                              {result.typography.length}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.600">Layout Issues</Text>
                            <Text fontWeight="semibold">
                              {result.containerOverflow || result.horizontalScroll ? 'Yes' : 'None'}
                            </Text>
                          </Box>
                        </HStack>
                        
                        {result.recommendations.length > 0 && (
                          <Box>
                            <Text fontWeight="semibold" mb={1} color="orange.600" fontSize="sm">
                              Issues Found:
                            </Text>
                            <VStack align="stretch" spacing={1}>
                              {result.recommendations.map((rec, recIndex) => (
                                <Text key={recIndex} fontSize="xs" color="gray.600">
                                  • {rec}
                                </Text>
                              ))}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          )}
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Responsive Design Guidelines</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontWeight="semibold" mb={1}>Touch Targets</Text>
                <Text fontSize="sm" color="gray.600">
                  Minimum 44x44px for WCAG AA compliance. Larger targets (48-56px) recommended for primary actions.
                </Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" mb={1}>Typography</Text>
                <Text fontSize="sm" color="gray.600">
                  Minimum 16px font size on mobile, 14px on desktop. Line height should be 1.4-1.6 for readability.
                </Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" mb={1}>Spacing</Text>
                <Text fontSize="sm" color="gray.600">
                  Use fluid spacing with clamp() for responsive scaling. Follow 4px/8px grid system.
                </Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" mb={1}>Breakpoints</Text>
                <Text fontSize="sm" color="gray.600">
                  Mobile-first approach: 320px (xs), 480px (sm), 768px (md), 1024px (lg), 1280px (xl).
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
