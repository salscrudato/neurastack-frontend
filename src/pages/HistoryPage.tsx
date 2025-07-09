/**
 * History Page Component
 * 
 * Displays saved chat sessions with modern, clean UI/UX design.
 * Allows users to view, edit titles, and load previous conversations.
 */

import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    Divider,
    Flex,
    HStack,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Tooltip,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { PiChatBold, PiChatCircleBold, PiClockBold, PiTrashBold } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../store/useHistoryStore';
import { useChatStore } from '../stores/useChatStore';

export default function HistoryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Store hooks
  const { sessions, deleteSession, loadSession } = useHistoryStore();
  const { clearMessages } = useChatStore();

  // Modern monochromatic color scheme
  const bgColor = '#FFFFFF';
  const cardBg = '#FFFFFF';
  const borderColor = '#E5E5E5';
  const textColor = '#171717';
  const mutedColor = '#525252';



  const handleDeleteSession = async () => {
    if (deleteId) {
      try {
        await deleteSession(deleteId);
        toast({
          title: 'Session deleted',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Failed to delete session',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
    setDeleteId(null);
    onClose();
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      // Clear current chat
      clearMessages();
      
      // Load the selected session
      await loadSession(sessionId);
      
      // Navigate to chat page
      navigate('/chat');
      
      toast({
        title: 'Session loaded',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to load session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const getMessageCount = (messageCount: number) => {
    return `${messageCount} message${messageCount !== 1 ? 's' : ''}`;
  };

  return (
    <Box
      w="100%"
      minH="100%"
      bg={bgColor}
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
          padding: '16px', // 4 * 4px
        },
        // Desktop centered layout
        '@media (min-width: 769px)': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingY: '24px', // 6 * 4px
          paddingX: '16px', // 4 * 4px
        },
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available',
        }
      }}
    >
      {/* Enhanced mobile-optimized container */}
      <Flex
        direction="column"
        w="100%"
        maxW={{
          base: "100%",
          md: "800px",   // Match ChatPage width
          lg: "900px",   // Match ChatPage width
          xl: "1000px"   // Match ChatPage width
        }}
        px={{
          base: "clamp(1rem, 4vw, 1.5rem)",      // Enhanced mobile padding with fluid scaling
          md: 8,        // Match ChatPage padding
          lg: 12,       // Match ChatPage padding
          xl: 16        // Match ChatPage padding
        }}
        className="mobile-scroll-container"
        sx={{
          // Enhanced mobile performance
          '@media (max-width: 768px)': {
            paddingTop: 'clamp(1rem, 3vw, 1.5rem)',
            paddingBottom: 'clamp(2rem, 5vw, 3rem)',
            // Performance optimizations
            willChange: 'scroll-position',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            // Enhanced touch handling
            touchAction: 'pan-y',
            WebkitTapHighlightColor: 'transparent',
          }
        }}
      >
      {/* Header */}
      <VStack spacing={4} align="stretch" mb={6}>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="700"
              color={textColor}
              lineHeight="1.2"
            >
              Chat History
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color={mutedColor}
              fontWeight="400"
            >
              Your saved conversations
            </Text>
          </VStack>
          
          <Button
            leftIcon={<PiChatBold />}
            colorScheme="blue"
            size={{ base: "md", md: "lg" }}
            onClick={() => navigate('/chat')}
            borderRadius="xl"
            fontWeight="600"
          >
            New Chat
          </Button>
        </HStack>
        
        <Divider borderColor={borderColor} />
      </VStack>

      {/* Sessions List */}
      <Box flex="1" w="100%">
        {sessions.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="60%"
            textAlign="center"
          >
            <PiChatCircleBold size={48} color={mutedColor} />
            <Text
              fontSize="xl"
              fontWeight="600"
              color={textColor}
              mt={4}
              mb={2}
            >
              No saved conversations
            </Text>
            <Text
              fontSize="md"
              color={mutedColor}
              mb={6}
            >
              Start a new chat and save it to see it here
            </Text>
            <Button
              leftIcon={<PiChatBold />}
              colorScheme="blue"
              size="lg"
              onClick={() => navigate('/chat')}
              borderRadius="xl"
            >
              Start Chatting
            </Button>
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {sessions.map((session) => (
              <Card
                key={session.id}
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius={{ base: "xl", md: "lg" }}
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.06)"
                _hover={{
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                  transform: "translateY(-2px)",
                  borderColor: "blue.200"
                }}
                _active={{
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)"
                }}
                transition="all 200ms cubic-bezier(0.4, 0, 0.2, 1)"
                cursor="pointer"
                onClick={() => handleLoadSession(session.id)}
                className="mobile-touch-target"
                sx={{
                  // Enhanced mobile touch handling
                  '@media (max-width: 768px)': {
                    minHeight: '84px',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    '&:active': {
                      transform: 'scale(0.98)',
                    }
                  }
                }}
              >
                <CardBody p={4}>
                  <Flex justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex="1" mr={3}>
                      {/* Title */}
                      <Text
                        fontSize="md"
                        fontWeight="600"
                        color={textColor}
                        lineHeight="1.4"
                        noOfLines={2}
                      >
                        {session.title}
                      </Text>

                      {/* Metadata */}
                      <HStack spacing={3} flexWrap="wrap">
                        <HStack spacing={1}>
                          <PiClockBold size={12} color={mutedColor} />
                          <Text fontSize="xs" color={mutedColor} fontWeight="500">
                            {formatDate(session.updatedAt)}
                          </Text>
                        </HStack>

                        <Badge
                          colorScheme="blue"
                          variant="subtle"
                          borderRadius="md"
                          px={2}
                          py={0.5}
                          fontSize="xs"
                        >
                          {getMessageCount(session.messageCount)}
                        </Badge>
                      </HStack>
                    </VStack>

                    {/* Actions */}
                    <Tooltip label="Delete session" hasArrow>
                      <IconButton
                        aria-label="Delete session"
                        icon={<PiTrashBold />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        borderRadius="md"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(session.id);
                          onOpen();
                        }}
                        _hover={{
                          bg: "red.50",
                          color: "red.600"
                        }}
                      />
                    </Tooltip>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </Box>
      </Flex>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader>Delete Session</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete this chat session? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteSession}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
