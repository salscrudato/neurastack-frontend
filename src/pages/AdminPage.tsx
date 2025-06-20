/**
 * Admin Page Component
 * 
 * Main page for accessing NeuraStack API administration features
 * including system monitoring, tier management, and cost analysis.
 */

import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Container,
    Heading,
    HStack,
    Icon,
    SimpleGrid,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
    PiArrowLeftBold,
    PiGearBold,
    PiLightningBold,
    PiShieldCheckBold
} from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { AdminDashboard } from '../components/AdminDashboard';
import { ADMIN_EMAIL, hasAdminAccess } from '../config/admin';
import { useSystemHealth } from '../hooks/useEnhancedMonitoring';
import { useAuthStore } from '../store/useAuthStore';

// ============================================================================
// Component Props
// ============================================================================

interface AdminPageProps {
  /** Whether to require authentication */
  requireAuth?: boolean;
}

// ============================================================================
// Access Control Component
// ============================================================================

function AccessControl({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use centralized admin access check
    setHasAccess(hasAdminAccess(user));
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <Container maxW="md" py={20}>
        <VStack spacing={4}>
          <Text>Checking access permissions...</Text>
        </VStack>
      </Container>
    );
  }

  if (!hasAccess) {
    const isSignedIn = user && !user.isAnonymous;

    return (
      <Container maxW="md" py={20}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              {!isSignedIn
                ? 'Admin access requires authentication. Please sign in to continue.'
                : 'Admin access is restricted to authorized users only.'
              }
            </AlertDescription>
          </Box>
        </Alert>

        {isSignedIn && (
          <Box mt={4} p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              Current user: {user.email || 'No email available'}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Admin access is restricted to: {ADMIN_EMAIL}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Contact the administrator if you believe you should have access.
            </Text>
          </Box>
        )}
      </Container>
    );
  }

  return <>{children}</>;
}

// ============================================================================
// Quick Status Component
// ============================================================================

function QuickStatus() {
  const { health, loading, error } = useSystemHealth();
  
  if (loading) {
    return (
      <Badge colorScheme="gray" variant="subtle">
        Checking...
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge colorScheme="red" variant="subtle">
        Error
      </Badge>
    );
  }

  const colorScheme = health?.status === 'healthy' ? 'green' : 
                     health?.status === 'degraded' ? 'yellow' : 'red';

  return (
    <Badge colorScheme={colorScheme} variant="subtle" display="flex" alignItems="center" gap={1}>
      <Icon as={PiShieldCheckBold} />
      {health?.status || 'Unknown'}
    </Badge>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AdminPage({ requireAuth = true }: AdminPageProps) {
  const navigate = useNavigate();
  const [showDashboard, setShowDashboard] = useState(false);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleSettingsChange = (settings: any) => {
    console.log('Settings changed:', settings);
    // In a real implementation, you would save settings to backend
  };

  // Auto-show dashboard after a brief intro
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDashboard(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const content = (
    <Box
      bg={bgColor}
      w="100%"
      minH="100%"
      // Enhanced mobile scrolling support
      sx={{
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        // Mobile viewport support
        '@media (max-width: 768px)': {
          minHeight: ['100vh', '100dvh'],
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        },
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available',
        }
      }}
    >
      {!showDashboard ? (
        // Introduction Screen
        <Container maxW="2xl" py={20}>
          <VStack spacing={8} align="center" textAlign="center">
            <Icon as={PiGearBold} boxSize={16} color="blue.500" />
            
            <VStack spacing={4}>
              <Heading size="xl">NeuraStack Admin Console</Heading>
              <Text color="gray.600" fontSize="lg" maxW="md">
                Monitor system health, manage API tiers, and analyze costs for your NeuraStack deployment.
              </Text>
            </VStack>

            <Card bg={cardBg} maxW="md" w="full">
              <CardBody>
                <VStack spacing={4}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" fontWeight="semibold">System Status</Text>
                    <QuickStatus />
                  </HStack>
                  
                  <SimpleGrid columns={3} spacing={4} w="full" fontSize="sm">
                    <VStack>
                      <Text fontWeight="medium">Health</Text>
                      <Icon as={PiShieldCheckBold} color="green.500" />
                    </VStack>
                    <VStack>
                      <Text fontWeight="medium">Metrics</Text>
                      <Icon as={PiLightningBold} color="blue.500" />
                    </VStack>
                    <VStack>
                      <Text fontWeight="medium">Costs</Text>
                      <Icon as={PiGearBold} color="purple.500" />
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            <VStack spacing={3}>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => setShowDashboard(true)}
                leftIcon={<Icon as={PiLightningBold} />}
              >
                Open Dashboard
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                leftIcon={<Icon as={PiArrowLeftBold} />}
              >
                Back to Chat
              </Button>
            </VStack>
          </VStack>
        </Container>
      ) : (
        // Main Dashboard
        <Box>
          <AdminDashboard
            defaultTab={0}
            fullFeatures={true}
            onSettingsChange={handleSettingsChange}
          />
          
          {/* Back to Chat Button */}
          <Box position="fixed" bottom={6} right={6}>
            <Button
              colorScheme="blue"
              variant="solid"
              onClick={() => navigate('/')}
              leftIcon={<Icon as={PiArrowLeftBold} />}
              shadow="lg"
            >
              Back to Chat
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  return requireAuth ? (
    <AccessControl>{content}</AccessControl>
  ) : (
    content
  );
}

export default AdminPage;
