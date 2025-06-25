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

  // Enhanced modern color values with subtle gradients
  const cardBg = 'linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%)';
  const cardHoverBg = 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)';
  const borderColor = '#E2E8F0';
  const textColor = '#1E293B';
  const shadowColor = 'rgba(0, 0, 0, 0.04)';
  const hoverShadowColor = 'rgba(79, 156, 249, 0.15)';

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
        boxShadow={`0 1px 4px ${shadowColor}`}
        _hover={{
          bg: cardHoverBg,
          transform: "translateY(-2px)",
          boxShadow: `0 4px 12px ${hoverShadowColor}`,
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
        borderRadius="lg"
      >
        <VStack spacing={compact ? 1.5 : 2} w="100%" align="stretch">
          <HStack justify="space-between" w="100%" align="center">
            <Text
              fontSize={compact ? "xs" : "sm"}
              fontWeight="600"
              color={textColor}
              noOfLines={1}
              textAlign="left"
              letterSpacing="-0.025em"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flex="1"
            >
              {model.provider?.toUpperCase() || 'AI'}
            </Text>

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

export function ModelResponseGrid({
  models,
  onModelClick,
  compact = false,
  maxVisible
}: ModelResponseGridProps) {
  // Enhanced responsive grid columns with better spacing
  const columns = useBreakpointValue({
    base: compact ? 1 : 1,
    sm: compact ? 2 : 2,
    md: compact ? 3 : 3,
    lg: compact ? 3 : 3
  });

  // Filter and sort models
  const sortedModels = [...models].sort((a, b) => {
    // Successful models first
    if (a.status === 'success' && b.status !== 'success') return -1;
    if (b.status === 'success' && a.status !== 'success') return 1;

    // Alphabetical by provider then model
    const aProvider = a.provider || '';
    const bProvider = b.provider || '';
    if (aProvider !== bProvider) return aProvider.localeCompare(bProvider);

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
    <VStack spacing={4} w="100%">
      {/* Enhanced Grid with better spacing */}
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
