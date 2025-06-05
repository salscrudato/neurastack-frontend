/**
 * Memory Verification Component
 * 
 * Displays memory system status, session info, and allows testing
 * of the new API functionality to verify everything is working.
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
  Spinner,
  Code,
  useToast,
  Switch,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup
} from '@chakra-ui/react';
import { useChatStore } from '../store/useChatStore';
import { useMemoryMetrics, useHealthCheck } from '../hooks/useNeuraStackAI';
import { neuraStackClient } from '../lib/neurastack-client';
import { useAuthStore } from '../store/useAuthStore';

export const MemoryVerification: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const toast = useToast();

  // Chat store state
  const {
    sessionId,
    initializeSession,
    messages
  } = useChatStore();

  // Since useNewAPI is removed, we'll always use the new API
  const useNewAPI = true;
  const toggleAPIMode = () => {
    // No-op since we always use new API
  };

  // Auth state
  const { user } = useAuthStore();

  // Memory metrics
  const { 
    metrics, 
    loading: metricsLoading, 
    error: metricsError, 
    refresh: refreshMetrics 
  } = useMemoryMetrics(user?.uid);

  // Health check
  const { 
    status, 
    loading: healthLoading, 
    error: healthError, 
    checkHealth 
  } = useHealthCheck();

  // Auto-refresh metrics when component mounts
  useEffect(() => {
    if (user?.uid && useNewAPI) {
      refreshMetrics();
    }
  }, [user?.uid, useNewAPI, refreshMetrics]);

  // Auto-check health on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleTestMemoryAPI = async () => {
    setIsTestLoading(true);
    setTestResult(null);

    try {
      // Configure client with current session
      neuraStackClient.configure({
        sessionId,
        userId: user?.uid || '',
        useEnsemble: true
      });

      // Test query
      const response = await neuraStackClient.queryAI(
        'This is a test message to verify memory functionality. Please remember this test was conducted at ' + new Date().toLocaleTimeString(),
        {
          useEnsemble: true,
          maxTokens: 500,
          temperature: 0.7
        }
      );

      setTestResult(response);

      toast({
        title: 'Memory API Test Successful',
        description: `Response received with ${response.tokenCount} tokens`,
        status: 'success',
        duration: 5000
      });

      // Refresh metrics after test
      if (user?.uid) {
        setTimeout(() => refreshMetrics(), 1000);
      }

    } catch (error) {
      console.error('Memory API test failed:', error);
      toast({
        title: 'Memory API Test Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  const getMemoryStatusColor = () => {
    if (metricsError) return 'red';
    if (!metrics) return 'gray';
    if (metrics.totalMemories > 0) return 'green';
    return 'yellow';
  };

  const getAPIStatusColor = () => {
    if (healthError) return 'red';
    if (!status) return 'gray';
    if (status.status === 'healthy') return 'green';
    return 'yellow';
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          🧠 Memory System Verification
        </Heading>

        {/* API Mode Toggle */}
        <Card>
          <CardHeader>
            <Heading size="md">API Configuration</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Use New Memory-Aware API
                  </FormLabel>
                  <Switch
                    isChecked={useNewAPI}
                    onChange={toggleAPIMode}
                    colorScheme="blue"
                  />
                </FormControl>
                <Badge colorScheme={useNewAPI ? 'green' : 'orange'}>
                  {useNewAPI ? 'NEW API' : 'LEGACY API'}
                </Badge>
              </HStack>

              <HStack spacing={4}>
                <Text fontSize="sm" color="gray.600">
                  <strong>Session ID:</strong> {sessionId.slice(0, 8)}...
                </Text>
                <Button size="sm" onClick={initializeSession}>
                  New Session
                </Button>
              </HStack>

              {user && (
                <Text fontSize="sm" color="gray.600">
                  <strong>User ID:</strong> {user.uid.slice(0, 8)}...
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <Heading size="md">System Status</Heading>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatLabel>API Health</StatLabel>
                <StatNumber>
                  <HStack>
                    <Badge colorScheme={getAPIStatusColor()}>
                      {healthLoading ? 'Checking...' : status?.status || 'Unknown'}
                    </Badge>
                    {healthLoading && <Spinner size="sm" />}
                  </HStack>
                </StatNumber>
                <StatHelpText>
                  {status?.message || 'Health check completed'}
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Memory System</StatLabel>
                <StatNumber>
                  <HStack>
                    <Badge colorScheme={getMemoryStatusColor()}>
                      {metricsLoading ? 'Loading...' : 
                       metrics ? `${metrics.totalMemories} memories` : 'No data'}
                    </Badge>
                    {metricsLoading && <Spinner size="sm" />}
                  </HStack>
                </StatNumber>
                <StatHelpText>
                  {metrics && (
                    <>
                      <StatArrow type="increase" />
                      {metrics.totalTokensSaved} tokens saved
                    </>
                  )}
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Chat Messages</StatLabel>
                <StatNumber>{messages.length}</StatNumber>
                <StatHelpText>
                  {messages.filter(m => m.metadata?.memoryContext).length} with memory
                </StatHelpText>
              </Stat>
            </StatGroup>

            <HStack mt={4} spacing={4}>
              <Button 
                size="sm" 
                onClick={checkHealth}
                isLoading={healthLoading}
              >
                Check Health
              </Button>
              {user?.uid && useNewAPI && (
                <Button 
                  size="sm" 
                  onClick={refreshMetrics}
                  isLoading={metricsLoading}
                >
                  Refresh Metrics
                </Button>
              )}
            </HStack>
          </CardBody>
        </Card>

        {/* Memory Metrics Detail */}
        {useNewAPI && user?.uid && metrics && (
          <Card>
            <CardHeader>
              <Heading size="md">Memory Metrics Detail</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={6} wrap="wrap">
                  <Stat size="sm">
                    <StatLabel>Avg Importance</StatLabel>
                    <StatNumber>{(metrics.averageImportance * 100).toFixed(1)}%</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel>Compression Ratio</StatLabel>
                    <StatNumber>{(metrics.averageCompressionRatio * 100).toFixed(1)}%</StatNumber>
                  </Stat>
                </HStack>

                <Box>
                  <Text fontWeight="bold" mb={2}>Memory Distribution:</Text>
                  <HStack spacing={2} wrap="wrap">
                    {Object.entries(metrics.memoryByType).map(([type, count]) => (
                      <Badge key={type} variant="outline">
                        {type}: {count}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>Retention Stats:</Text>
                  <HStack spacing={4}>
                    <Badge colorScheme="green">Active: {metrics.retentionStats.active}</Badge>
                    <Badge colorScheme="yellow">Archived: {metrics.retentionStats.archived}</Badge>
                    <Badge colorScheme="red">Expired: {metrics.retentionStats.expired}</Badge>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Test Memory API */}
        <Card>
          <CardHeader>
            <Heading size="md">Test Memory API</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Send a test message to verify the memory system is working correctly.
              </Text>

              <Button
                onClick={handleTestMemoryAPI}
                isLoading={isTestLoading}
                loadingText="Testing..."
                colorScheme="blue"
                isDisabled={!useNewAPI}
              >
                Test Memory API
              </Button>

              {!useNewAPI && (
                <Alert status="warning">
                  <AlertIcon />
                  <AlertTitle>New API Required</AlertTitle>
                  <AlertDescription>
                    Enable the new memory-aware API above to test memory functionality.
                  </AlertDescription>
                </Alert>
              )}

              {testResult && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Test Result:</Text>
                  <VStack spacing={2} align="stretch">
                    <HStack spacing={4} wrap="wrap">
                      <Badge colorScheme="green">✓ Response received</Badge>
                      <Badge colorScheme="blue">{testResult.tokenCount} tokens</Badge>
                      {testResult.memoryTokensSaved && (
                        <Badge colorScheme="purple">
                          {testResult.memoryTokensSaved} tokens saved
                        </Badge>
                      )}
                      <Badge colorScheme={testResult.ensembleMode ? 'orange' : 'gray'}>
                        {testResult.ensembleMode ? 'Ensemble' : 'Single Model'}
                      </Badge>
                    </HStack>

                    {testResult.memoryContext && (
                      <Box>
                        <Text fontSize="sm" fontWeight="bold">Memory Context:</Text>
                        <Code p={2} fontSize="xs" whiteSpace="pre-wrap">
                          {testResult.memoryContext}
                        </Code>
                      </Box>
                    )}

                    <Box>
                      <Text fontSize="sm" fontWeight="bold">Response:</Text>
                      <Text fontSize="sm" p={2} bg="gray.50" borderRadius="md">
                        {testResult.answer}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Errors */}
        {(healthError || metricsError) && (
          <Alert status="error">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              {healthError && <Text>Health Check Error: {healthError}</Text>}
              {metricsError && <Text>Memory Metrics Error: {metricsError}</Text>}
            </VStack>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};
