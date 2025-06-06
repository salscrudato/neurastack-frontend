/**
 * Cache Manager UI Component
 * 
 * Provides UI controls for cache management, version monitoring,
 * and ensuring fresh code/data is always loaded.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Progress,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Tooltip,
  IconButton
} from '@chakra-ui/react';
import { FiRefreshCw, FiTrash2, FiInfo } from 'react-icons/fi';
import { cacheManager, clearAllCaches } from '../lib/cacheManager';

export const CacheManager: React.FC = () => {
  const [stats, setStats] = useState(cacheManager.getStats());
  const [isClearing, setIsClearing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [versionChangeDetected, setVersionChangeDetected] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Refresh stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats());
      setLastUpdate(Date.now());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Listen for version changes
  useEffect(() => {
    const handleVersionChange = () => {
      setVersionChangeDetected(true);
      toast({
        title: 'New Version Available',
        description: 'A new version of the app is available. Consider refreshing to get the latest features.',
        status: 'info',
        duration: 10000,
        isClosable: true
      });
    };

    const handleCacheCleared = (event: CustomEvent) => {
      const { count, reason } = event.detail;
      toast({
        title: 'Cache Cleared',
        description: `${count} entries removed${reason ? ` (${reason})` : ''}`,
        status: 'success',
        duration: 3000
      });
      setStats(cacheManager.getStats());
    };

    window.addEventListener('neurastack-version-change', handleVersionChange as EventListener);
    window.addEventListener('neurastack-cache-cleared', handleCacheCleared as EventListener);

    return () => {
      window.removeEventListener('neurastack-version-change', handleVersionChange as EventListener);
      window.removeEventListener('neurastack-cache-cleared', handleCacheCleared as EventListener);
    };
  }, [toast]);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearAllCaches();
      setStats(cacheManager.getStats());
      setVersionChangeDetected(false);
      toast({
        title: 'Cache Cleared',
        description: 'All caches have been cleared successfully',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear cache',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleForceRefresh = () => {
    cacheManager.forceRefresh();
  };

  const formatAge = (age: number): string => {
    const seconds = Math.floor(age / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getCacheHealthColor = (): string => {
    const utilization = stats.size / stats.maxSize;
    if (utilization > 0.8) return 'red';
    if (utilization > 0.6) return 'yellow';
    return 'green';
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="lg">🗄️ Cache Management</Heading>
          <HStack spacing={2}>
            <Tooltip label="View cache details">
              <IconButton
                aria-label="Cache details"
                icon={<FiInfo />}
                size="sm"
                onClick={onOpen}
              />
            </Tooltip>
            <Tooltip label="Refresh stats">
              <IconButton
                aria-label="Refresh"
                icon={<FiRefreshCw />}
                size="sm"
                onClick={() => setStats(cacheManager.getStats())}
              />
            </Tooltip>
          </HStack>
        </HStack>

        {/* Version Change Alert */}
        {versionChangeDetected && (
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>New Version Detected!</AlertTitle>
            <AlertDescription>
              A new version is available. Consider refreshing to get the latest updates.
            </AlertDescription>
            <Button ml="auto" size="sm" onClick={handleForceRefresh}>
              Refresh Now
            </Button>
          </Alert>
        )}

        {/* Cache Statistics */}
        <Card>
          <CardHeader>
            <Heading size="md">Cache Statistics</Heading>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatLabel>Cache Size</StatLabel>
                <StatNumber>
                  <HStack>
                    <Text>{stats.size}</Text>
                    <Badge colorScheme={getCacheHealthColor()}>
                      {Math.round((stats.size / stats.maxSize) * 100)}%
                    </Badge>
                  </HStack>
                </StatNumber>
                <StatHelpText>of {stats.maxSize} max entries</StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>App Version</StatLabel>
                <StatNumber fontSize="md">
                  <Code>{stats.version.slice(0, 12)}...</Code>
                </StatNumber>
                <StatHelpText>
                  Build: {new Date(parseInt(stats.versionInfo.buildTime)).toLocaleDateString()}
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Last Updated</StatLabel>
                <StatNumber fontSize="md">
                  {formatAge(Date.now() - lastUpdate)} ago
                </StatNumber>
                <StatHelpText>Auto-refresh every 5s</StatHelpText>
              </Stat>
            </StatGroup>

            <Progress 
              value={(stats.size / stats.maxSize) * 100} 
              colorScheme={getCacheHealthColor()}
              mt={4}
              size="sm"
            />
          </CardBody>
        </Card>

        {/* Cache Actions */}
        <Card>
          <CardHeader>
            <Heading size="md">Cache Actions</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Use these actions to manage cache and ensure you're always running the latest code.
              </Text>

              <HStack spacing={4} wrap="wrap">
                <Button
                  leftIcon={<FiTrash2 />}
                  onClick={handleClearCache}
                  isLoading={isClearing}
                  loadingText="Clearing..."
                  colorScheme="orange"
                  size="sm"
                >
                  Clear Cache
                </Button>

                <Button
                  leftIcon={<FiRefreshCw />}
                  onClick={handleForceRefresh}
                  colorScheme="blue"
                  size="sm"
                >
                  Force Refresh
                </Button>

                <Button
                  onClick={() => cacheManager.invalidateByTags(['api'])}
                  variant="outline"
                  size="sm"
                >
                  Clear API Cache
                </Button>

                <Button
                  onClick={() => cacheManager.cleanup()}
                  variant="outline"
                  size="sm"
                >
                  Cleanup Expired
                </Button>
              </HStack>

              <Alert status="info" size="sm">
                <AlertIcon />
                <Text fontSize="sm">
                  <strong>Force Refresh</strong> clears all caches and reloads the page to ensure you get the latest code and data.
                </Text>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Version Information */}
        <Card>
          <CardHeader>
            <Heading size="md">Version Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="bold">Build Time:</Text>
                <Text>{new Date(parseInt(stats.versionInfo.buildTime)).toLocaleString()}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="bold">Git Hash:</Text>
                <Code>{stats.versionInfo.gitHash}</Code>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="bold">API Version:</Text>
                <Badge colorScheme="blue">{stats.versionInfo.apiVersion}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="bold">Cache Version:</Text>
                <Code fontSize="xs">{stats.version}</Code>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Cache Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cache Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>Current cache entries:</Text>
              
              {stats.entries.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={4}>
                  No cache entries found
                </Text>
              ) : (
                <Box maxH="400px" overflowY="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Key</Th>
                        <Th>Age</Th>
                        <Th>Version</Th>
                        <Th>Tags</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {stats.entries.map((entry, index) => (
                        <Tr key={index}>
                          <Td>
                            <Code fontSize="xs">{entry.key.slice(0, 30)}...</Code>
                          </Td>
                          <Td>{formatAge(entry.age)}</Td>
                          <Td>
                            <Badge 
                              colorScheme={entry.version === stats.version ? 'green' : 'red'}
                              fontSize="xs"
                            >
                              {entry.version.slice(0, 8)}...
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              {entry.tags.map(tag => (
                                <Badge key={tag} size="xs" variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
