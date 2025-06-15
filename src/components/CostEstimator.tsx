/**
 * Cost Estimator Component
 * 
 * Provides real-time cost estimation for prompts with tier comparison,
 * token analysis, and cost breakdown visualization.
 */

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Textarea,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,

  Alert,
  AlertIcon,
  Badge,

  Tooltip,
  Icon,
  useColorModeValue,
  FormControl,
  FormLabel,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import {
  PiCalculatorBold,
  PiCurrencyDollarBold,
  PiLightningBold,
  PiTrendUpBold,
  PiInfoBold
} from 'react-icons/pi';
import { useState, useCallback, useEffect } from 'react';
import { useCostEstimation } from '../hooks/useEnhancedMonitoring';
import type { NeuraStackTier, CostEstimateResponse } from '../lib/types';

// ============================================================================
// Component Props
// ============================================================================

interface CostEstimatorProps {
  /** Initial prompt text */
  initialPrompt?: string;
  /** Whether to show tier comparison */
  showComparison?: boolean;
  /** Compact view for smaller spaces */
  compact?: boolean;
  /** Callback when estimation is complete */
  onEstimationComplete?: (estimation: CostEstimateResponse) => void;
}

// ============================================================================
// Helper Components
// ============================================================================

function CostBreakdownCard({ estimation }: { estimation: CostEstimateResponse }) {
  const { data } = estimation;
  
  return (
    <Card>
      <CardHeader pb={2}>
        <HStack>
          <Icon as={PiCurrencyDollarBold} color="green.500" />
          <Text fontWeight="semibold">Cost Breakdown</Text>
          <Badge colorScheme="blue" variant="subtle" textTransform="uppercase">
            {data.tier}
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Total Cost */}
          <Box textAlign="center" p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="md">
            <Text fontSize="sm" color="gray.600" mb={1}>Estimated Total Cost</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {data.estimatedCost.total}
            </Text>
          </Box>

          {/* Breakdown */}
          <SimpleGrid columns={3} spacing={3}>
            <Stat size="sm" textAlign="center">
              <StatLabel fontSize="xs">Prompt Tokens</StatLabel>
              <StatNumber fontSize="md">{data.estimatedCost.breakdown.promptTokens}</StatNumber>
            </Stat>
            <Stat size="sm" textAlign="center">
              <StatLabel fontSize="xs">Response Tokens</StatLabel>
              <StatNumber fontSize="md">{data.estimatedCost.breakdown.responseTokens}</StatNumber>
            </Stat>
            <Stat size="sm" textAlign="center">
              <StatLabel fontSize="xs">Models Used</StatLabel>
              <StatNumber fontSize="md">{data.estimatedCost.breakdown.modelsUsed}</StatNumber>
            </Stat>
          </SimpleGrid>

          {/* Prompt Analysis */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Prompt Analysis</Text>
            <HStack justify="space-between" fontSize="sm">
              <Text color="gray.600">Length:</Text>
              <Text fontWeight="medium">{data.prompt.length} characters</Text>
            </HStack>
            <HStack justify="space-between" fontSize="sm">
              <Text color="gray.600">Estimated Tokens:</Text>
              <Text fontWeight="medium">{data.prompt.estimatedTokens}</Text>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}

function TierComparisonCard({ estimation }: { estimation: CostEstimateResponse }) {
  const { data } = estimation;
  
  return (
    <Card>
      <CardHeader pb={2}>
        <HStack>
          <Icon as={PiTrendUpBold} color="purple.500" />
          <Text fontWeight="semibold">Tier Comparison</Text>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Tier</Th>
              <Th isNumeric>Cost</Th>
              <Th>Savings</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <Badge colorScheme="blue" variant="subtle">Free</Badge>
              </Td>
              <Td isNumeric fontWeight="medium">{data.comparison.free}</Td>
              <Td>
                <Badge colorScheme="green" variant="subtle">90-95%</Badge>
              </Td>
            </Tr>
            <Tr>
              <Td>
                <Badge colorScheme="purple" variant="subtle">Premium</Badge>
              </Td>
              <Td isNumeric fontWeight="medium">{data.comparison.premium}</Td>
              <Td>
                <Badge colorScheme="gray" variant="subtle">Baseline</Badge>
              </Td>
            </Tr>
          </Tbody>
        </Table>
        
        <Alert status="info" mt={3} size="sm">
          <AlertIcon />
          <Text fontSize="xs">
            Free tier offers 90-95% cost savings with 85-90% quality retention
          </Text>
        </Alert>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CostEstimator({
  initialPrompt = '',
  showComparison = true,
  compact = false,
  onEstimationComplete
}: CostEstimatorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedTier, setSelectedTier] = useState<NeuraStackTier>('free');
  const [autoEstimate] = useState(false);

  const {
    estimateCost,
    estimation,
    loading,
    error,
    clearError,
    clearEstimation
  } = useCostEstimation();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleEstimate = useCallback(async () => {
    if (!prompt.trim()) return;
    
    try {
      const result = await estimateCost(prompt, selectedTier);
      if (onEstimationComplete) {
        onEstimationComplete(result);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }, [prompt, selectedTier, estimateCost, onEstimationComplete]);

  // Auto-estimate when prompt changes (debounced)
  useEffect(() => {
    if (!autoEstimate || !prompt.trim()) return;

    const timeoutId = setTimeout(() => {
      handleEstimate();
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [prompt, selectedTier, autoEstimate, handleEstimate]);

  const promptLength = prompt.length;
  const estimatedTokens = Math.ceil(promptLength / 4); // Rough estimation
  const isLongPrompt = promptLength > 1000;

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={PiCalculatorBold} color="blue.500" />
              <Text fontSize="lg" fontWeight="bold">Cost Estimator</Text>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Estimate costs before sending your prompt
            </Text>
          </VStack>
          
          {estimation && (
            <Button size="sm" variant="ghost" onClick={clearEstimation}>
              Clear
            </Button>
          )}
        </HStack>

        {/* Input Section */}
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm">Prompt Text</FormLabel>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt to estimate costs..."
              rows={compact ? 3 : 5}
              resize="vertical"
            />
            <HStack justify="space-between" mt={1}>
              <Text fontSize="xs" color="gray.500">
                {promptLength} characters • ~{estimatedTokens} tokens
              </Text>
              {isLongPrompt && (
                <Tooltip label="Long prompts may have higher costs">
                  <HStack spacing={1}>
                    <Icon as={PiInfoBold} color="orange.500" boxSize={3} />
                    <Text fontSize="xs" color="orange.500">Long prompt</Text>
                  </HStack>
                </Tooltip>
              )}
            </HStack>
          </FormControl>

          <HStack spacing={4}>
            <FormControl maxW="200px">
              <FormLabel fontSize="sm">Tier</FormLabel>
              <Select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as NeuraStackTier)}
                size="sm"
              >
                <option value="free">Free Tier</option>
                <option value="premium">Premium Tier</option>
              </Select>
            </FormControl>

            <Button
              colorScheme="blue"
              onClick={handleEstimate}
              isLoading={loading}
              isDisabled={!prompt.trim()}
              leftIcon={<Icon as={PiLightningBold} />}
              alignSelf="end"
            >
              Estimate Cost
            </Button>
          </HStack>
        </VStack>

        {/* Error Display */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text>{error}</Text>
            <Button size="sm" ml="auto" onClick={clearError}>
              Dismiss
            </Button>
          </Alert>
        )}

        {/* Results */}
        {estimation && (
          <VStack spacing={4} align="stretch">
            <Divider />
            
            <SimpleGrid columns={{ base: 1, md: showComparison && !compact ? 2 : 1 }} spacing={4}>
              <CostBreakdownCard estimation={estimation} />
              {showComparison && <TierComparisonCard estimation={estimation} />}
            </SimpleGrid>

            {/* Usage Tips */}
            <Card variant="outline" bg={useColorModeValue('blue.50', 'blue.900')}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={PiInfoBold} color="blue.500" />
                    <Text fontSize="sm" fontWeight="semibold">Cost Optimization Tips</Text>
                  </HStack>
                  <VStack align="start" spacing={1} fontSize="xs" color="gray.600">
                    <Text>• Use Free tier for 90-95% cost savings with minimal quality loss</Text>
                    <Text>• Keep prompts concise to reduce token usage</Text>
                    <Text>• Consider batch processing for multiple similar requests</Text>
                    <Text>• Monitor your usage patterns to optimize tier selection</Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
