/**
 * Admin Dashboard Component
 * 
 * Comprehensive dashboard for monitoring NeuraStack API health,
 * performance metrics, tier management, and cost analysis.
 */

import {
  Box,
  VStack,
  HStack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Badge,
  useColorModeValue,
  Container,
  Heading,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,

  Divider
} from '@chakra-ui/react';
import {
  PiChartLineBold,
  PiShieldCheckBold,
  PiCurrencyDollarBold,
  PiGearBold,
  PiLightningBold,
  PiTrendUpBold
} from 'react-icons/pi';
import { useState } from 'react';
import { SystemHealthDashboard } from './SystemHealthDashboard';
import { TierManagement } from './TierManagement';
import { CostEstimator } from './CostEstimator';
import { useSystemHealth, useSystemMetrics, useTierManagement } from '../hooks/useEnhancedMonitoring';
import type { NeuraStackTier } from '../lib/types';

// ============================================================================
// Component Props
// ============================================================================

interface AdminDashboardProps {
  /** Default active tab */
  defaultTab?: number;
  /** Whether to show all features or limited view */
  fullFeatures?: boolean;
  /** Callback when settings change */
  onSettingsChange?: (settings: any) => void;
}

// ============================================================================
// Overview Stats Component
// ============================================================================

function OverviewStats() {
  const { health } = useSystemHealth();
  const { metrics } = useSystemMetrics();
  const { currentTier, tierInfo } = useTierManagement();

  const statBg = useColorModeValue('white', 'gray.700');
  const statBorder = useColorModeValue('gray.200', 'gray.600');

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
      <Card bg={statBg} border="1px solid" borderColor={statBorder}>
        <CardBody>
          <Stat>
            <StatLabel fontSize="sm" display="flex" alignItems="center" gap={2}>
              <Icon as={PiShieldCheckBold} color="green.500" />
              System Status
            </StatLabel>
            <StatNumber fontSize="lg">
              <Badge 
                colorScheme={health?.status === 'healthy' ? 'green' : health?.status === 'degraded' ? 'yellow' : 'red'}
                variant="subtle"
              >
                {health?.status || 'Loading...'}
              </Badge>
            </StatNumber>
          </Stat>
        </CardBody>
      </Card>

      <Card bg={statBg} border="1px solid" borderColor={statBorder}>
        <CardBody>
          <Stat>
            <StatLabel fontSize="sm" display="flex" alignItems="center" gap={2}>
              <Icon as={PiLightningBold} color="blue.500" />
              Current Tier
            </StatLabel>
            <StatNumber fontSize="lg">
              <Badge 
                colorScheme={currentTier === 'premium' ? 'purple' : 'blue'}
                variant="subtle"
                textTransform="capitalize"
              >
                {currentTier || 'Loading...'}
              </Badge>
            </StatNumber>
            <StatHelpText fontSize="xs">
              {tierInfo?.data?.configuration?.estimatedCostPerRequest || 'N/A'} per request
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card bg={statBg} border="1px solid" borderColor={statBorder}>
        <CardBody>
          <Stat>
            <StatLabel fontSize="sm" display="flex" alignItems="center" gap={2}>
              <Icon as={PiTrendUpBold} color="purple.500" />
              Requests Today
            </StatLabel>
            <StatNumber fontSize="lg">
              {metrics?.system?.requests?.total?.toLocaleString() || '0'}
            </StatNumber>
            <StatHelpText fontSize="xs">
              {metrics?.system?.requests?.rate?.toFixed(1) || '0'}/min rate
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card bg={statBg} border="1px solid" borderColor={statBorder}>
        <CardBody>
          <Stat>
            <StatLabel fontSize="sm" display="flex" alignItems="center" gap={2}>
              <Icon as={PiChartLineBold} color="orange.500" />
              Avg Response
            </StatLabel>
            <StatNumber fontSize="lg">
              {metrics?.system?.performance?.averageResponseTime || '0'}ms
            </StatNumber>
            <StatHelpText fontSize="xs">
              {((metrics?.system?.requests?.successful || 0) / (metrics?.system?.requests?.total || 1) * 100).toFixed(1)}% success
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AdminDashboard({
  defaultTab = 0,
  fullFeatures = true,
  onSettingsChange
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [refreshKey, setRefreshKey] = useState(0);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleTierChange = (tier: NeuraStackTier) => {
    // In a real implementation, this would make an API call to change the tier
    console.log('Tier change requested:', tier);
    if (onSettingsChange) {
      onSettingsChange({ tier });
    }
  };

  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" align="center" mb={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" display="flex" alignItems="center" gap={3}>
                  <Icon as={PiGearBold} color="blue.500" />
                  NeuraStack Admin Dashboard
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Monitor system health, manage tiers, and analyze costs
                </Text>
              </VStack>
              
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={handleRefreshAll}
                leftIcon={<Icon as={PiLightningBold} />}
              >
                Refresh All
              </Button>
            </HStack>

            {/* Overview Stats */}
            <OverviewStats key={refreshKey} />
          </Box>

          <Divider />

          {/* Main Content Tabs */}
          <Tabs 
            index={activeTab} 
            onChange={setActiveTab}
            variant="enclosed"
            colorScheme="blue"
          >
            <TabList>
              <Tab>
                <Icon as={PiShieldCheckBold} mr={2} />
                System Health
              </Tab>
              <Tab>
                <Icon as={PiCurrencyDollarBold} mr={2} />
                Tier Management
              </Tab>
              <Tab>
                <Icon as={PiChartLineBold} mr={2} />
                Cost Estimator
              </Tab>
            </TabList>

            <TabPanels>
              {/* System Health Tab */}
              <TabPanel px={0}>
                <SystemHealthDashboard 
                  key={`health-${refreshKey}`}
                  showMetrics={fullFeatures}
                  refreshInterval={30000}
                />
              </TabPanel>

              {/* Tier Management Tab */}
              <TabPanel px={0}>
                <TierManagement
                  key={`tier-${refreshKey}`}
                  showComparison={fullFeatures}
                  onTierChange={handleTierChange}
                />
              </TabPanel>

              {/* Cost Estimator Tab */}
              <TabPanel px={0}>
                <CostEstimator
                  key={`cost-${refreshKey}`}
                  showComparison={fullFeatures}
                  onEstimationComplete={(estimation) => {
                    console.log('Cost estimation completed:', estimation);
                  }}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Footer Info */}
          <Card bg={cardBg} variant="outline">
            <CardBody>
              <VStack spacing={3} align="start">
                <Text fontSize="sm" fontWeight="semibold">About NeuraStack API</Text>
                <Text fontSize="xs" color="gray.600" lineHeight="1.5">
                  NeuraStack provides cost-optimized AI ensemble responses with two tiers: 
                  Free tier offers 90-95% cost savings with 85-90% quality retention, 
                  while Premium tier provides maximum quality and performance. 
                  The system features automatic failover, memory context, and real-time monitoring.
                </Text>
                <HStack spacing={4} fontSize="xs" color="gray.500">
                  <Text>API Version: v3.0.0</Text>
                  <Text>•</Text>
                  <Text>Enhanced Production Features</Text>
                  <Text>•</Text>
                  <Text>Memory-Aware Responses</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
