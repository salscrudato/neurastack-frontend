/**
 * Tier Management Component
 * 
 * Displays current tier information, available tiers, cost comparisons,
 * and tier selection interface for the NeuraStack API.
 */

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,

  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,

  Icon,
  useColorModeValue,
  Divider,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import {
  PiCheckBold,

  PiCrownBold,

  PiShieldCheckBold,
  PiArrowUpBold
} from 'react-icons/pi';
import { useTierManagement } from '../hooks/useEnhancedMonitoring';
import type { TierDetails, NeuraStackTier } from '../lib/types';

// ============================================================================
// Component Props
// ============================================================================

interface TierManagementProps {
  /** Whether to show detailed comparison */
  showComparison?: boolean;
  /** Compact view for smaller spaces */
  compact?: boolean;
  /** Callback when tier selection changes */
  onTierChange?: (tier: NeuraStackTier) => void;
}

// ============================================================================
// Helper Components
// ============================================================================

function TierBadge({ tier, isCurrent }: { tier: NeuraStackTier; isCurrent?: boolean }) {
  const colorScheme = tier === 'premium' ? 'purple' : 'blue';
  const icon = tier === 'premium' ? PiCrownBold : PiShieldCheckBold;

  return (
    <Badge 
      colorScheme={colorScheme} 
      variant={isCurrent ? 'solid' : 'subtle'}
      display="flex" 
      alignItems="center" 
      gap={1}
      px={3}
      py={1}
      borderRadius="full"
    >
      <Icon as={icon} />
      {tier === 'premium' ? 'Premium' : 'Free'}
      {isCurrent && ' (Current)'}
    </Badge>
  );
}

function TierCard({ 
  tier, 
  details, 
  isCurrent, 
  onSelect, 
  compact 
}: { 
  tier: NeuraStackTier; 
  details: TierDetails; 
  isCurrent: boolean;
  onSelect?: () => void;
  compact?: boolean;
}) {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const highlightBorder = tier === 'premium' ? 'purple.300' : 'blue.300';

  return (
    <Card
      border="2px solid"
      borderColor={isCurrent ? highlightBorder : borderColor}
      position="relative"
      _hover={{ borderColor: highlightBorder }}
      transition="all 0.2s"
    >
      {tier === 'premium' && (
        <Box
          position="absolute"
          top={-2}
          right={4}
          bg="purple.500"
          color="white"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
        >
          RECOMMENDED
        </Box>
      )}
      
      <CardHeader pb={2}>
        <VStack align="start" spacing={2}>
          <TierBadge tier={tier} isCurrent={isCurrent} />
          <Text fontSize="lg" fontWeight="bold">{details.name}</Text>
          <Text fontSize="sm" color="gray.600">{details.description}</Text>
        </VStack>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Pricing */}
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color={tier === 'premium' ? 'purple.500' : 'blue.500'}>
              {details.estimatedCostPerRequest}
            </Text>
            <Text fontSize="sm" color="gray.500">per request</Text>
          </Box>

          {/* Key Stats */}
          {!compact && (
            <SimpleGrid columns={2} spacing={3}>
              <Stat size="sm">
                <StatLabel fontSize="xs">Response Time</StatLabel>
                <StatNumber fontSize="sm">{details.responseTime}</StatNumber>
              </Stat>
              <Stat size="sm">
                <StatLabel fontSize="xs">Quality</StatLabel>
                <StatNumber fontSize="sm">{details.quality}</StatNumber>
              </Stat>
            </SimpleGrid>
          )}

          {/* Limits */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Limits</Text>
            <VStack spacing={1} align="stretch">
              <HStack justify="space-between" fontSize="xs">
                <Text>Requests/hour:</Text>
                <Text fontWeight="medium">{details.limits.requestsPerHour}</Text>
              </HStack>
              <HStack justify="space-between" fontSize="xs">
                <Text>Requests/day:</Text>
                <Text fontWeight="medium">{details.limits.requestsPerDay}</Text>
              </HStack>
              <HStack justify="space-between" fontSize="xs">
                <Text>Max prompt:</Text>
                <Text fontWeight="medium">{details.limits.maxPromptLength} chars</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Features */}
          {!compact && details.limits?.features && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2}>Features</Text>
              <List spacing={1}>
                {details.limits.features.map((feature, index) => (
                  <ListItem key={index} fontSize="xs" display="flex" alignItems="center">
                    <ListIcon as={PiCheckBold} color="green.500" />
                    {feature}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Action Button */}
          {onSelect && (
            <Button
              colorScheme={tier === 'premium' ? 'purple' : 'blue'}
              variant={isCurrent ? 'outline' : 'solid'}
              onClick={onSelect}
              isDisabled={isCurrent}
              leftIcon={isCurrent ? <Icon as={PiCheckBold} /> : <Icon as={PiArrowUpBold} />}
            >
              {isCurrent ? 'Current Tier' : `Switch to ${tier === 'premium' ? 'Premium' : 'Free'}`}
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TierManagement({
  showComparison = true,
  compact = false,
  onTierChange
}: TierManagementProps) {
  const {
    tierInfo,
    loading,
    error,
    clearError,
    currentTier,
    availableTiers,
    costComparison
  } = useTierManagement();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Failed to Load Tier Information</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
        <Button size="sm" ml="auto" onClick={clearError}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (loading || !tierInfo || !availableTiers) {
    return (
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={6}
        textAlign="center"
      >
        <Text>Loading tier information...</Text>
      </Box>
    );
  }

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
        <VStack align="start" spacing={1}>
          <Text fontSize="lg" fontWeight="bold">Tier Management</Text>
          <Text fontSize="sm" color="gray.500">
            Choose the tier that best fits your needs and budget
          </Text>
        </VStack>

        {/* Current Tier Status */}
        <Card bg={useColorModeValue('blue.50', 'blue.900')} border="1px solid" borderColor="blue.200">
          <CardBody>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.600">Current Tier</Text>
                <TierBadge tier={currentTier!} isCurrent />
              </VStack>
              <VStack align="end" spacing={1}>
                <Text fontSize="sm" color="gray.600">Estimated Cost</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {tierInfo.data.configuration.estimatedCostPerRequest}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Tier Cards */}
        <SimpleGrid columns={{ base: 1, md: compact ? 1 : 2 }} spacing={6}>
          {Object.entries(availableTiers).map(([tierKey, details]) => (
            <TierCard
              key={tierKey}
              tier={tierKey as NeuraStackTier}
              details={details}
              isCurrent={tierKey === currentTier}
              onSelect={onTierChange ? () => onTierChange(tierKey as NeuraStackTier) : undefined}
              compact={compact}
            />
          ))}
        </SimpleGrid>

        {/* Cost Comparison */}
        {showComparison && costComparison && (
          <>
            <Divider />
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={4}>Cost Comparison</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {Object.entries(costComparison).map(([tierKey, comparison]) => (
                  <Card key={tierKey} variant="outline">
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <TierBadge tier={tierKey as NeuraStackTier} />
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Text fontSize="sm">Cost Savings:</Text>
                            <Text fontSize="sm" fontWeight="bold" color="green.500">
                              {comparison.costSavings}
                            </Text>
                          </HStack>
                          <HStack>
                            <Text fontSize="sm">Quality Ratio:</Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {comparison.qualityRatio}
                            </Text>
                          </HStack>
                          <HStack>
                            <Text fontSize="sm">Speed Ratio:</Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {comparison.speedRatio}
                            </Text>
                          </HStack>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
}
