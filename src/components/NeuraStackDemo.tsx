/**
 * NeuraStack API Demo Component
 * 
 * Demonstrates the new NeuraStack API integration with enhanced features
 * including memory system, session tracking, and improved error handling.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  Badge,
  Alert,
  AlertIcon,
  Spinner,

  Divider,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Switch,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { useNeuraStackAI, useMemoryMetrics, useNeuraStackConfig } from '../hooks/useNeuraStackAI';
import { neuraStackClient } from '../lib/neurastack-client';

export const NeuraStackDemo: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [useEnsemble, setUseEnsemble] = useState(true);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [temperature, setTemperature] = useState(0.7);
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState('');

  const toast = useToast();
  const { updateConfig } = useNeuraStackConfig();
  
  // Main AI query hook
  const { queryAI, loading, error, response, clearError, cancel } = useNeuraStackAI();
  
  // Memory metrics hook
  const { 
    metrics, 
    loading: metricsLoading, 
    error: metricsError, 
    refresh: refreshMetrics 
  } = useMemoryMetrics(userId);

  // Initialize session ID on mount
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  // Update client configuration when settings change
  useEffect(() => {
    updateConfig({
      sessionId: sessionId || undefined,
      userId: userId || undefined,
      useEnsemble
    });
  }, [sessionId, userId, useEnsemble, updateConfig]);

  const handleQuery = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        status: 'error',
        duration: 3000
      });
      return;
    }

    clearError();

    try {
      await queryAI(prompt, {
        useEnsemble,
        models: ['google:gemini-1.5-flash', 'google:gemini-1.5-flash', 'xai:grok-3-mini', 'xai:grok-3-mini'],
        maxTokens: maxTokens > 0 ? maxTokens : undefined,
        temperature: temperature >= 0 && temperature <= 1 ? temperature : undefined
      });

      toast({
        title: 'Success',
        description: 'Query completed successfully',
        status: 'success',
        duration: 3000
      });

      // Refresh memory metrics if user ID is set
      if (userId) {
        refreshMetrics();
      }

    } catch (err) {
      console.error('Query failed:', err);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const health = await neuraStackClient.healthCheck();
      toast({
        title: 'Health Check',
        description: `Status: ${health.status}`,
        status: health.status === 'healthy' ? 'success' : 'warning',
        duration: 3000
      });
    } catch (err) {
      toast({
        title: 'Health Check Failed',
        description: 'Unable to reach NeuraStack API',
        status: 'error',
        duration: 3000
      });
    }
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          NeuraStack API Demo
        </Heading>

        {/* Configuration Section */}
        <Card>
          <CardHeader>
            <Heading size="md">Configuration</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Session ID</FormLabel>
                  <Input
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="Auto-generated session ID"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>User ID (Optional)</FormLabel>
                  <Input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID for memory tracking"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={6}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Use Ensemble Mode</FormLabel>
                  <Switch
                    isChecked={useEnsemble}
                    onChange={(e) => setUseEnsemble(e.target.checked)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Max Tokens</FormLabel>
                  <NumberInput
                    value={maxTokens}
                    onChange={(_, value) => setMaxTokens(value)}
                    min={1}
                    max={4000}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Temperature: {temperature}</FormLabel>
                  <Slider
                    value={temperature}
                    onChange={(value) => setTemperature(value)}
                    min={0}
                    max={1}
                    step={0.1}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Query Section */}
        <Card>
          <CardHeader>
            <Heading size="md">AI Query</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                rows={4}
                isDisabled={loading}
              />

              <HStack spacing={4}>
                <Button
                  onClick={handleQuery}
                  isLoading={loading}
                  loadingText="Querying..."
                  colorScheme="blue"
                  isDisabled={!prompt.trim()}
                >
                  Send Query
                </Button>
                
                {loading && (
                  <Button onClick={cancel} variant="outline">
                    Cancel
                  </Button>
                )}

                <Button onClick={handleHealthCheck} variant="outline">
                  Health Check
                </Button>
              </HStack>

              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Response Section */}
        {response && (
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Response</Heading>
                <HStack spacing={2}>
                  <Badge colorScheme={response.ensembleMode ? 'purple' : 'blue'}>
                    {response.ensembleMode ? 'Ensemble' : 'Single Model'}
                  </Badge>
                  <Badge colorScheme="green">
                    {response.tokenCount} tokens
                  </Badge>
                  <Badge colorScheme="orange">
                    {response.executionTime}
                  </Badge>
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text whiteSpace="pre-wrap">{response.answer}</Text>

                {response.memoryContext && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold" mb={2}>Memory Context:</Text>
                      <Text fontSize="sm" color="gray.600">
                        {response.memoryContext}
                      </Text>
                    </Box>
                  </>
                )}

                {response.memoryTokensSaved && (
                  <Text fontSize="sm" color="green.600">
                    💾 Saved {response.memoryTokensSaved} tokens through memory compression
                  </Text>
                )}

                {response.ensembleMetadata && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold" mb={2}>Ensemble Analysis:</Text>
                      <VStack spacing={2} align="stretch">
                        <Text fontSize="sm">
                          <strong>Evidence Analyst:</strong> {response.ensembleMetadata.evidenceAnalyst}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Innovator:</strong> {response.ensembleMetadata.innovator}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Risk Reviewer:</strong> {response.ensembleMetadata.riskReviewer}
                        </Text>
                      </VStack>
                    </Box>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Memory Metrics Section */}
        {userId && (
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Memory Metrics</Heading>
                <Button
                  onClick={refreshMetrics}
                  isLoading={metricsLoading}
                  size="sm"
                  variant="outline"
                >
                  Refresh
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {metricsError ? (
                <Alert status="error">
                  <AlertIcon />
                  {metricsError}
                </Alert>
              ) : metricsLoading ? (
                <HStack>
                  <Spinner size="sm" />
                  <Text>Loading memory metrics...</Text>
                </HStack>
              ) : metrics ? (
                <VStack spacing={4} align="stretch">
                  <HStack spacing={6}>
                    <Badge colorScheme="blue" p={2}>
                      {metrics.totalMemories} Total Memories
                    </Badge>
                    <Badge colorScheme="green" p={2}>
                      {metrics.totalTokensSaved} Tokens Saved
                    </Badge>
                    <Badge colorScheme="purple" p={2}>
                      {(metrics.averageImportance * 100).toFixed(1)}% Avg Importance
                    </Badge>
                  </HStack>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Memory Distribution:</Text>
                    <HStack spacing={4} wrap="wrap">
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
              ) : (
                <Text color="gray.500">No memory metrics available</Text>
              )}
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};
