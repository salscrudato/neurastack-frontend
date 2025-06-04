/**
 * Model Response Grid Component
 * 
 * Displays a grid of clickable model badges/cards that open individual
 * model responses in modals. Features responsive design and accessibility.
 */

import {
  Box,
  SimpleGrid,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Tooltip,
  useColorModeValue,
  Icon,
  Flex,
  useBreakpointValue
} from '@chakra-ui/react';
import {
  PiCheckCircleBold,
  PiXCircleBold,
  PiClockBold,
  PiWarningBold
} from 'react-icons/pi';
import type { ModelResponseData } from '../hooks/useModelResponses';
import { getModelDisplayInfo, formatModelName } from '../hooks/useModelResponses';

// ============================================================================
// Component Props
// ============================================================================

interface ModelResponseGridProps {
  /** Available model responses */
  models: ModelResponseData[];
  
  /** Handler for when a model is clicked */
  onModelClick: (model: ModelResponseData) => void;
  
  /** Whether to show compact view */
  compact?: boolean;
  
  /** Maximum number of models to show (with "show more" functionality) */
  maxVisible?: number;
}

interface ModelCardProps {
  model: ModelResponseData;
  onClick: () => void;
  compact?: boolean;
}

// ============================================================================
// Model Card Component
// ============================================================================

function ModelCard({ model, onClick, compact = false }: ModelCardProps) {
  const displayInfo = getModelDisplayInfo(model.model);
  const isEnsembleRole = model.model.startsWith('ensemble:');
  const isFailed = model.status === 'failed';
  const isSuccess = model.status === 'success';
  
  // Modern color values - light mode only
  const cardBg = '#FFFFFF';
  const cardHoverBg = '#F8FAFC';
  const borderColor = '#E2E8F0';
  const textColor = '#1E293B';
  const mutedColor = '#64748B';
  
  // Status colors
  const statusColor = isFailed ? 'red' : isSuccess ? 'green' : 'yellow';
  const StatusIcon = isFailed ? PiXCircleBold : isSuccess ? PiCheckCircleBold : PiClockBold;

  return (
    <Tooltip
      label={
        isFailed
          ? `Failed: ${model.errorReason || 'Unknown error'}`
          : isEnsembleRole
          ? ('description' in displayInfo ? displayInfo.description : 'AI ensemble analysis')
          : `Click to view ${formatModelName(model.model)} response`
      }
      placement="top"
      hasArrow
    >
      <Button
        onClick={onClick}
        variant="outline"
        size={compact ? "sm" : "md"}
        h={compact ? "auto" : "80px"}
        w="100%"
        bg={cardBg}
        borderColor={borderColor}
        _hover={{
          bg: cardHoverBg,
          transform: "translateY(-2px)",
          boxShadow: "md"
        }}
        _active={{
          transform: "translateY(0px)"
        }}
        transition="all 0.2s ease"
        isDisabled={isFailed}
        cursor={isFailed ? "not-allowed" : "pointer"}
        p={compact ? 2 : 3}
      >
        <VStack spacing={compact ? 1 : 2} w="100%">
          {/* Header */}
          <HStack justify="space-between" w="100%" spacing={2}>
            <HStack spacing={1} flex="1" minW="0">
              <Text fontSize={compact ? "xs" : "sm"}>
                {displayInfo.icon}
              </Text>
              <Text
                fontSize={compact ? "xs" : "sm"}
                fontWeight="medium"
                color={textColor}
                noOfLines={1}
                textAlign="left"
              >
                {isEnsembleRole ? displayInfo.name : formatModelName(model.model, model.role)}
              </Text>
            </HStack>
            
            <Icon
              as={StatusIcon}
              color={`${statusColor}.500`}
              boxSize={compact ? 3 : 4}
            />
          </HStack>

          {/* Badges and Info */}
          {!compact && (
            <HStack justify="space-between" w="100%" spacing={1}>
              <VStack spacing={1} align="start" flex="1">
                {isEnsembleRole ? (
                  <Badge colorScheme={displayInfo.color} variant="subtle" size="sm">
                    Ensemble
                  </Badge>
                ) : (
                  <Badge colorScheme={displayInfo.color} variant="subtle" size="sm">
                    {'provider' in displayInfo ? displayInfo.provider : 'AI Model'}
                  </Badge>
                )}
                
                {model.role && !isEnsembleRole && (
                  <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                    {model.role}
                  </Text>
                )}
              </VStack>
              
              {/* Metrics */}
              <VStack spacing={0} align="end">
                {model.tokenCount && (
                  <Text fontSize="xs" color={mutedColor}>
                    {model.tokenCount}t
                  </Text>
                )}
                {model.executionTime && (
                  <Text fontSize="xs" color={mutedColor}>
                    {model.executionTime}ms
                  </Text>
                )}
              </VStack>
            </HStack>
          )}

          {/* Error indicator for compact view */}
          {compact && isFailed && (
            <HStack spacing={1} w="100%">
              <Icon as={PiWarningBold} color="red.500" boxSize={3} />
              <Text fontSize="xs" color="red.500" noOfLines={1}>
                Failed
              </Text>
            </HStack>
          )}
        </VStack>
      </Button>
    </Tooltip>
  );
}

// ============================================================================
// Main Grid Component
// ============================================================================

export function ModelResponseGrid({
  models,
  onModelClick,
  compact = false,
  maxVisible
}: ModelResponseGridProps) {
  // Responsive grid columns
  const columns = useBreakpointValue({
    base: compact ? 2 : 1,
    sm: compact ? 3 : 2,
    md: compact ? 4 : 3,
    lg: compact ? 5 : 4
  });

  // Filter and sort models
  const sortedModels = [...models].sort((a, b) => {
    // Successful models first
    if (a.status === 'success' && b.status !== 'success') return -1;
    if (b.status === 'success' && a.status !== 'success') return 1;
    
    // Ensemble roles before regular models
    const aIsEnsemble = a.model.startsWith('ensemble:');
    const bIsEnsemble = b.model.startsWith('ensemble:');
    if (aIsEnsemble && !bIsEnsemble) return -1;
    if (bIsEnsemble && !aIsEnsemble) return 1;
    
    // Alphabetical within same category
    return a.model.localeCompare(b.model);
  });

  const visibleModels = maxVisible ? sortedModels.slice(0, maxVisible) : sortedModels;
  const hasMore = maxVisible && sortedModels.length > maxVisible;

  if (models.length === 0) {
    return (
      <Box
        p={4}
        textAlign="center"
        color={useColorModeValue('gray.500', 'gray.400')}
        fontSize="sm"
      >
        No individual model responses available
      </Box>
    );
  }

  return (
    <VStack spacing={3} w="100%">
      {/* Grid */}
      <SimpleGrid
        columns={columns}
        spacing={compact ? 2 : 3}
        w="100%"
      >
        {visibleModels.map((model) => (
          <ModelCard
            key={model.model}
            model={model}
            onClick={() => onModelClick(model)}
            compact={compact}
          />
        ))}
      </SimpleGrid>

      {/* Show More Button */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // This would need to be handled by parent component
            // For now, just show all models
          }}
        >
          Show {sortedModels.length - visibleModels.length} more models
        </Button>
      )}

      {/* Summary */}
      {!compact && models.length > 1 && (
        <Flex
          justify="space-between"
          w="100%"
          fontSize="xs"
          color={useColorModeValue('gray.500', 'gray.400')}
          pt={2}
          borderTop="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
        >
          <Text>
            {models.filter(m => m.status === 'success').length} successful
          </Text>
          <Text>
            {models.filter(m => m.status === 'failed').length} failed
          </Text>
          <Text>
            {models.length} total
          </Text>
        </Flex>
      )}
    </VStack>
  );
}
