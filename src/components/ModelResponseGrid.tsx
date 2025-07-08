/**
 * Model Response Grid Component
 * 
 * Displays a grid of clickable model badges/cards that open individual
 * model responses in modals. Features responsive design and accessibility.
 */

import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    SimpleGrid,
    Text,
    Tooltip,
    useBreakpointValue,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { memo, useMemo } from 'react';
import {
    PiCheckCircleBold,
    PiClockBold,
    PiWarningBold,
    PiXCircleBold
} from 'react-icons/pi';
import type { ModelResponseData } from '../hooks/useModelResponses';

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
  const isFailed = model.status === 'failed';
  const isSuccess = model.status === 'success';

  // Enhanced modern glass design with improved gradients
  const cardBg = 'rgba(255, 255, 255, 0.9)';
  const cardHoverBg = 'rgba(255, 255, 255, 0.95)';
  const borderColor = 'rgba(226, 232, 240, 0.6)';
  const textColor = '#1E293B';
  const shadowColor = 'rgba(0, 0, 0, 0.04)';
  const hoverShadowColor = 'rgba(79, 156, 249, 0.2)';
  const glassBlur = 'blur(12px)';

  // Status colors and icons
  const statusColor = isFailed ? 'red' : isSuccess ? 'green' : 'yellow';
  const StatusIcon = isFailed ? PiXCircleBold : isSuccess ? PiCheckCircleBold : PiClockBold;

  return (
    <Tooltip
      label={
        isFailed
          ? `Failed: ${model.errorReason || 'Unknown error'}`
          : `Click to view ${model.provider?.toUpperCase() || 'AI MODEL'} response`
      }
      placement="top"
      hasArrow
    >
      <Button
        onClick={onClick}
        variant="outline"
        size={compact ? "sm" : "md"}
        h={compact ? "auto" : "56px"}
        w="100%"
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        boxShadow={`0 2px 8px ${shadowColor}, 0 8px 24px rgba(0, 0, 0, 0.02)`}
        borderRadius="16px"
        sx={{
          backdropFilter: glassBlur,
          WebkitBackdropFilter: glassBlur,
        }}
        _hover={{
          bg: cardHoverBg,
          transform: "translateY(-2px)",
          boxShadow: `0 4px 16px ${hoverShadowColor}, 0 8px 32px rgba(79, 156, 249, 0.08)`,
          borderColor: "#4F9CF9"
        }}
        _active={{
          transform: "translateY(-1px)",
          boxShadow: `0 2px 6px ${hoverShadowColor}`
        }}
        _focus={{
          outline: "none",
          boxShadow: "none"
        }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        isDisabled={isFailed}
        cursor={isFailed ? "not-allowed" : "pointer"}
        p={compact ? 2 : 3}
      >
        <VStack spacing={compact ? 1.5 : 2} w="100%" align="stretch">
          <HStack justify="space-between" w="100%" align="center">
            <VStack spacing={0.5} align="start" flex="1">
              <Text
                fontSize={compact ? "xs" : "sm"}
                fontWeight="600"
                color={textColor}
                noOfLines={1}
                letterSpacing="-0.025em"
              >
                {model.provider?.toUpperCase() || 'AI'}
              </Text>

              {/* Clean Confidence Display */}
              {model.confidence && (
                <Text
                  fontSize={{ base: "xs", md: "2xs" }}
                  fontWeight="700"
                  color={
                    model.confidence.score > 0.8
                      ? "green.600"
                      : model.confidence.score > 0.6
                      ? "yellow.600"
                      : "red.600"
                  }
                  letterSpacing="0.025em"
                >
                  {Math.round(model.confidence.score * 100)}% confidence
                </Text>
              )}
            </VStack>

            <Icon
              as={StatusIcon}
              color={`${statusColor}.500`}
              boxSize={compact ? 3 : 4}
            />
          </HStack>

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

export const ModelResponseGrid = memo(function ModelResponseGrid({
  models,
  onModelClick,
  compact = false,
  maxVisible
}: ModelResponseGridProps) {
  // Always call hooks at the top level
  const emptyStateColor = useColorModeValue('gray.500', 'gray.400');
  const summaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const summaryBorderColor = useColorModeValue('gray.200', 'gray.600');

  // Enhanced mobile-first responsive grid columns with optimal spacing
  const columns = useBreakpointValue({
    base: compact ? 1 : 1,        // Mobile: single column for better readability
    sm: compact ? 2 : 2,          // Small: two columns for compact view
    md: compact ? 2 : 3,          // Medium: 2-3 columns based on compact mode
    lg: compact ? 3 : 3,          // Large: 3 columns
    xl: compact ? 3 : 4           // XL: up to 4 columns for non-compact
  });

  // Memoize expensive sorting operation
  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => {
      // Successful models first
      if (a.status === 'success' && b.status !== 'success') return -1;
      if (b.status === 'success' && a.status !== 'success') return 1;

      // Alphabetical by provider then model
      const aProvider = a.provider || '';
      const bProvider = b.provider || '';
      if (aProvider !== bProvider) return aProvider.localeCompare(bProvider);

      return a.model.localeCompare(b.model);
    });
  }, [models]);

  // Memoize visible models calculation
  const { visibleModels, hasMore } = useMemo(() => {
    const visible = maxVisible ? sortedModels.slice(0, maxVisible) : sortedModels;
    const more = maxVisible && sortedModels.length > maxVisible;
    return { visibleModels: visible, hasMore: more };
  }, [sortedModels, maxVisible]);

  if (models.length === 0) {
    return (
      <Box
        p={4}
        textAlign="center"
        color={emptyStateColor}
        fontSize="sm"
      >
        No individual model responses available
      </Box>
    );
  }

  return (
    <VStack spacing={4} w="100%">
      {/* Enhanced Mobile-First Grid with Fluid Spacing */}
      <SimpleGrid
        columns={columns}
        spacing={{
          base: compact ? 2 : 3,
          sm: compact ? 2 : 3,
          md: compact ? 3 : 4,
          lg: compact ? 3 : 4
        }}
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
          color={summaryTextColor}
          pt={2}
          borderTop="1px solid"
          borderColor={summaryBorderColor}
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
});
