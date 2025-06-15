/**
 * System Health Dashboard Component
 * 
 * Displays comprehensive system health information including
 * component status, metrics, and real-time monitoring.
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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Switch,
  FormControl,
  FormLabel,
  Spinner,
  useColorModeValue,
  Tooltip,
  Icon
} from '@chakra-ui/react';
import {
  PiCheckCircleBold,
  PiWarningCircleBold,
  PiXCircleBold,
  PiArrowClockwiseBold,

} from 'react-icons/pi';
import { useSystemHealth, useSystemMetrics } from '../hooks/useEnhancedMonitoring';
import type { SystemHealth, VendorHealth, EnsembleHealth } from '../lib/types';

// ============================================================================
// Component Props
// ============================================================================

interface SystemHealthDashboardProps {
  /** Whether to show detailed metrics */
  showMetrics?: boolean;
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;
  /** Compact view for smaller spaces */
  compact?: boolean;
}

// ============================================================================
// Helper Components
// ============================================================================

function HealthStatusBadge({ status }: { status: 'healthy' | 'degraded' | 'unhealthy' }) {
  const colorScheme = status === 'healthy' ? 'green' : status === 'degraded' ? 'yellow' : 'red';
  const icon = status === 'healthy' ? PiCheckCircleBold : status === 'degraded' ? PiWarningCircleBold : PiXCircleBold;

  return (
    <Badge colorScheme={colorScheme} variant="subtle" display="flex" alignItems="center" gap={1}>
      <Icon as={icon} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function SystemHealthCard({ health }: { health: SystemHealth }) {
  return (
    <Card>
      <CardHeader pb={2}>
        <HStack justify="space-between">
          <Text fontWeight="semibold">System Health</Text>
          <HealthStatusBadge status={health.status} />
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>Memory Usage</Text>
            <Progress 
              value={health.memory.percentage} 
              colorScheme={health.memory.percentage > 80 ? 'red' : health.memory.percentage > 60 ? 'yellow' : 'green'}
              size="sm"
              borderRadius="md"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {(health.memory.used / 1024 / 1024 / 1024).toFixed(1)}GB / {(health.memory.total / 1024 / 1024 / 1024).toFixed(1)}GB
            </Text>
          </Box>
          
          <SimpleGrid columns={2} spacing={3}>
            <Stat size="sm">
              <StatLabel fontSize="xs">CPU Usage</StatLabel>
              <StatNumber fontSize="md">{health.cpu.usage.toFixed(1)}%</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel fontSize="xs">Uptime</StatLabel>
              <StatNumber fontSize="md">{Math.floor(health.uptime / 3600)}h</StatNumber>
            </Stat>
          </SimpleGrid>
        </VStack>
      </CardBody>
    </Card>
  );
}

function VendorHealthCard({ vendors }: { vendors: VendorHealth }) {
  return (
    <Card>
      <CardHeader pb={2}>
        <Text fontWeight="semibold">AI Vendors</Text>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          {Object.entries(vendors).map(([vendor, health]) => (
            <HStack key={vendor} justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium" textTransform="capitalize">
                  {vendor === 'openai' ? 'OpenAI' : vendor === 'gemini' ? 'Google Gemini' : 'Anthropic Claude'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {health.responseTime}ms avg • {health.errorRate.toFixed(1)}% errors
                </Text>
              </VStack>
              <HealthStatusBadge status={health.status} />
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}

function EnsembleHealthCard({ ensemble }: { ensemble: EnsembleHealth }) {
  return (
    <Card>
      <CardHeader pb={2}>
        <HStack justify="space-between">
          <Text fontWeight="semibold">Ensemble Performance</Text>
          <HealthStatusBadge status={ensemble.status} />
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <SimpleGrid columns={2} spacing={3}>
          <Stat size="sm">
            <StatLabel fontSize="xs">Avg Response</StatLabel>
            <StatNumber fontSize="md">{ensemble.averageResponseTime}ms</StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel fontSize="xs">Success Rate</StatLabel>
            <StatNumber fontSize="md">{(ensemble.successRate * 100).toFixed(1)}%</StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel fontSize="xs">Active Connections</StatLabel>
            <StatNumber fontSize="md">{ensemble.activeConnections}</StatNumber>
          </Stat>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SystemHealthDashboard({
  showMetrics = true,
  refreshInterval = 30000,
  compact = false
}: SystemHealthDashboardProps) {
  const {
    health,
    loading: healthLoading,
    error: healthError,
    refresh: refreshHealth,
    clearError: clearHealthError,
    autoRefresh: healthAutoRefresh,
    toggleAutoRefresh: toggleHealthAutoRefresh
  } = useSystemHealth(refreshInterval);

  const {
    metrics,
    loading: metricsLoading,
    refresh: refreshMetrics
  } = useSystemMetrics(refreshInterval * 2); // Metrics refresh less frequently

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleRefresh = async () => {
    await Promise.all([refreshHealth(), showMetrics && refreshMetrics()].filter(Boolean));
  };

  if (healthError) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Health Check Failed</AlertTitle>
          <AlertDescription>{healthError}</AlertDescription>
        </Box>
        <Button size="sm" ml="auto" onClick={clearHealthError}>
          Retry
        </Button>
      </Alert>
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
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold">System Health Dashboard</Text>
            {health && (
              <Text fontSize="sm" color="gray.500">
                Last updated: {new Date(health.timestamp).toLocaleTimeString()}
              </Text>
            )}
          </VStack>
          
          <HStack spacing={3}>
            <FormControl display="flex" alignItems="center" size="sm">
              <FormLabel htmlFor="auto-refresh" mb={0} fontSize="sm">
                Auto-refresh
              </FormLabel>
              <Switch
                id="auto-refresh"
                isChecked={healthAutoRefresh}
                onChange={toggleHealthAutoRefresh}
                size="sm"
              />
            </FormControl>
            
            <Tooltip label="Refresh now">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                isLoading={healthLoading || (showMetrics && metricsLoading)}
                leftIcon={<Icon as={PiArrowClockwiseBold} />}
              >
                Refresh
              </Button>
            </Tooltip>
          </HStack>
        </HStack>

        {/* Loading State */}
        {healthLoading && !health && (
          <HStack justify="center" py={8}>
            <Spinner size="lg" />
            <Text>Loading system health...</Text>
          </HStack>
        )}

        {/* Health Cards */}
        {health && (
          <SimpleGrid columns={{ base: 1, md: compact ? 2 : 3 }} spacing={4}>
            <SystemHealthCard health={health.components.system} />
            <VendorHealthCard vendors={health.components.vendors} />
            <EnsembleHealthCard ensemble={health.components.ensemble} />
          </SimpleGrid>
        )}

        {/* Metrics Section */}
        {showMetrics && metrics && (
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Performance Metrics</Text>
                <Badge colorScheme="blue" variant="subtle">
                  {metrics.tier.toUpperCase()} Tier
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat size="sm">
                  <StatLabel>Total Requests</StatLabel>
                  <StatNumber>{metrics.system.requests.total.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {metrics.system.requests.rate.toFixed(1)}/min
                  </StatHelpText>
                </Stat>
                
                <Stat size="sm">
                  <StatLabel>Success Rate</StatLabel>
                  <StatNumber>
                    {((metrics.system.requests.successful / metrics.system.requests.total) * 100).toFixed(1)}%
                  </StatNumber>
                </Stat>
                
                <Stat size="sm">
                  <StatLabel>Avg Response</StatLabel>
                  <StatNumber>{metrics.system.performance.averageResponseTime}ms</StatNumber>
                </Stat>
                
                <Stat size="sm">
                  <StatLabel>Est. Cost/Request</StatLabel>
                  <StatNumber fontSize="sm">{metrics.costEstimate}</StatNumber>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
}
