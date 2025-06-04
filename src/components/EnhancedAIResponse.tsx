import { memo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Collapse,
  IconButton,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { PiCaretDownBold, PiCaretUpBold, PiClockBold, PiWarningBold } from 'react-icons/pi';
import { AIResponseFormatter } from './AIResponseFormatter';

interface AIResponseData {
  answer: string;
  modelsUsed?: Record<string, boolean>;
  fallbackReasons?: Record<string, string>;
  executionTime?: string;
  ensembleMode?: boolean;
  ensembleMetadata?: {
    scientificAnalyst?: string;
    creativeAdvisor?: string;
    devilsAdvocate?: string;
    executionTime?: number;
  };
}

interface EnhancedAIResponseProps {
  data: AIResponseData;
  fontSize?: {
    content: any;
    heading: any;
    code: any;
    small: any;
  };
}

const defaultFontSizes = {
  content: { base: "14px", md: "15px" },
  heading: { base: "16px", md: "18px" },
  code: { base: "12px", md: "13px" },
  small: { base: "12px", md: "13px" },
};

export const EnhancedAIResponse = memo(({
  data,
  fontSize = defaultFontSizes
}: EnhancedAIResponseProps) => {
  const { isOpen: showMetadata, onToggle: toggleMetadata } = useDisclosure();

  const getModelDisplayName = (modelKey: string): string => {
    const modelMap: Record<string, string> = {
      'openai:gpt-4': 'GPT-4',
      'google:gemini-1.5-flash': 'Gemini 1.5 Flash',
      'xai:grok-3-mini': 'Grok 3 Mini',
    };
    return modelMap[modelKey] || modelKey;
  };

  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      scientificAnalyst: 'Scientific Analyst',
      creativeAdvisor: 'Creative Advisor',
      devilsAdvocate: "Devil's Advocate",
    };
    return roleMap[role] || role;
  };

  const getModelStatus = (_modelKey: string, isUsed: boolean, fallbackReason?: string) => {
    if (fallbackReason) {
      return { status: 'failed', color: 'red', label: 'Failed' };
    }
    if (isUsed) {
      return { status: 'success', color: 'green', label: 'Used' };
    }
    return { status: 'unused', color: 'gray', label: 'Not Used' };
  };

  return (
    <VStack
      spacing={{ base: 3, md: 4 }}
      align="stretch"
      w="100%"
      className="ai-response-container"
    >
      {/* Main AI Response */}
      <Box className="ai-response-content">
        <AIResponseFormatter
          content={data.answer}
          fontSize={fontSize}
        />
      </Box>

      {/* Response Metadata - Collapsible */}
      {(data.ensembleMode || data.executionTime || data.modelsUsed) && (
        <Box>
          <Divider mb={3} borderColor="#E2E8F0" />
          
          {/* Metadata Toggle */}
          <HStack justify="space-between" align="center" mb={3}>
            <HStack spacing={2}>
              <Text fontSize={fontSize.small} color="#64748B" fontWeight="500">
                Response Details
              </Text>
              {data.ensembleMode && (
                <Badge colorScheme="blue" size="sm" borderRadius="full">
                  Ensemble Mode
                </Badge>
              )}
            </HStack>
            
            <IconButton
              aria-label={showMetadata ? "Hide details" : "Show details"}
              icon={showMetadata ? <PiCaretUpBold /> : <PiCaretDownBold />}
              size="sm"
              variant="ghost"
              onClick={toggleMetadata}
              color="#64748B"
              _hover={{ bg: "#F8FAFC", color: "#475569" }}
            />
          </HStack>

          <Collapse in={showMetadata} animateOpacity>
            <VStack
              spacing={{ base: 2, md: 3 }}
              align="stretch"
              className="ai-response-metadata"
            >

              {/* Execution Time */}
              {data.executionTime && (
                <HStack spacing={2} fontSize={fontSize.small}>
                  <PiClockBold color="#64748B" />
                  <Text color="#64748B" fontSize={{ base: "xs", md: "sm" }}>
                    Execution Time: <Text as="span" fontWeight="500" color="#475569">{data.executionTime}</Text>
                  </Text>
                </HStack>
              )}

              {/* Models Used */}
              {data.modelsUsed && (
                <Box>
                  <Text fontSize={fontSize.small} fontWeight="500" color="#475569" mb={2}>
                    Models Status:
                  </Text>
                  <VStack spacing={1} align="stretch">
                    {Object.entries(data.modelsUsed).map(([modelKey, isUsed]) => {
                      const fallbackReason = data.fallbackReasons?.[modelKey];
                      const { status, color, label } = getModelStatus(modelKey, isUsed, fallbackReason);
                      
                      return (
                        <HStack key={modelKey} justify="space-between" align="center">
                          <Text fontSize={fontSize.small} color="#64748B">
                            {getModelDisplayName(modelKey)}
                          </Text>
                          <HStack spacing={2}>
                            <Badge 
                              colorScheme={color} 
                              size="sm" 
                              borderRadius="full"
                              variant={status === 'failed' ? 'solid' : 'subtle'}
                            >
                              {label}
                            </Badge>
                            {fallbackReason && (
                              <Tooltip 
                                label={fallbackReason} 
                                hasArrow 
                                placement="top"
                                bg="#1E293B"
                                color="white"
                                fontSize="xs"
                              >
                                <Box>
                                  <PiWarningBold color="#EF4444" size={14} />
                                </Box>
                              </Tooltip>
                            )}
                          </HStack>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Box>
              )}

              {/* Ensemble Responses */}
              {data.ensembleMetadata && (
                <Box>
                  <Text fontSize={fontSize.small} fontWeight="500" color="#475569" mb={2}>
                    Individual AI Perspectives:
                  </Text>
                  
                  <Accordion allowToggle size="sm" className="ai-response-accordion">
                    {Object.entries(data.ensembleMetadata).map(([role, content]) => {
                      if (role === 'executionTime' || !content || content === '[Failed]') return null;

                      return (
                        <AccordionItem
                          key={role}
                          border="1px solid #E2E8F0"
                          borderRadius="lg"
                          mb={2}
                        >
                          <AccordionButton
                            py={{ base: 2, md: 3 }}
                            px={{ base: 3, md: 4 }}
                            _hover={{ bg: "#F8FAFC" }}
                            borderRadius="lg"
                          >
                            <Box flex="1" textAlign="left">
                              <HStack spacing={2} flexWrap="wrap">
                                <Text
                                  fontSize={{ base: "xs", md: fontSize.small }}
                                  fontWeight="500"
                                  color="#475569"
                                >
                                  {getRoleDisplayName(role)}
                                </Text>
                                <Badge
                                  colorScheme="blue"
                                  size="sm"
                                  borderRadius="full"
                                  className="ai-response-badge"
                                  fontSize={{ base: "2xs", md: "xs" }}
                                >
                                  AI Role
                                </Badge>
                              </HStack>
                            </Box>
                            <AccordionIcon color="#64748B" />
                          </AccordionButton>

                          <AccordionPanel px={{ base: 3, md: 4 }} pb={{ base: 3, md: 4 }}>
                            <Box
                              bg="#F8FAFC"
                              p={{ base: 2, md: 3 }}
                              borderRadius="md"
                              border="1px solid #E2E8F0"
                              className="ai-response-text"
                            >
                              <AIResponseFormatter
                                content={content as string}
                                fontSize={{
                                  ...fontSize,
                                  content: { base: "12px", md: "13px" } as any,
                                  heading: { base: "14px", md: "15px" } as any,
                                  code: { base: "11px", md: "12px" } as any,
                                  small: { base: "11px", md: "12px" } as any,
                                }}
                              />
                            </Box>
                          </AccordionPanel>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </Box>
              )}
            </VStack>
          </Collapse>
        </Box>
      )}
    </VStack>
  );
});

EnhancedAIResponse.displayName = 'EnhancedAIResponse';
