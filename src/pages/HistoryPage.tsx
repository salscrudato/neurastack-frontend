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
    VStack,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { PiChatBold, PiChatCircleBold, PiClockBold, PiTrashBold } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { useHistoryStore } from '../store/useHistoryStore';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { sessions, deleteSession, loadSession } = useHistoryStore();
  const { clearMessages } = useChatStore();

  const bgColor = '#FAFBFC';
  const cardBg = '#FFFFFF';
  const borderColor = '#E2E8F0';
  const textColor = '#1E293B';
  const mutedColor = '#64748B';

  const handleDeleteSession = async () => {
    if (deleteId) {
      try {
        await deleteSession(deleteId);
        console.log('Session deleted successfully');
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
    setDeleteId(null);
    onClose();
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      clearMessages();
      await loadSession(sessionId);
      navigate('/chat');
      console.log('Session loaded successfully');
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const getMessageCount = (messageCount: number) => `${messageCount} message${messageCount !== 1 ? 's' : ''}`;

  return (
    <Box
      w="100%"
      minH="100vh"
      bg={bgColor}
      sx={{
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        // Add top padding to account for fixed header
        paddingTop: {
          base: 'calc(env(safe-area-inset-top, 0px) + 56px + 16px)',
          md: 'calc(60px + 24px)'
        },
        '@media (max-width: 768px)': {
          minHeight: '100vh',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          paddingX: '16px'
        },
        '@media (min-width: 769px)': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingBottom: '24px',
          paddingX: '16px'
        },
        '@supports (-webkit-touch-callout: none)': {
          minHeight: '-webkit-fill-available'
        }
      }}
    >
      <Flex direction="column" w="100%" maxW={{ base: "100%", md: "800px", lg: "900px", xl: "1000px" }} px={{ base: 0, md: 8, lg: 12, xl: 16 }}>
        <VStack spacing={4} align="stretch" mb={6}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="700" color={textColor} lineHeight="1.2">Chat History</Text>
              <Text fontSize={{ base: "md", md: "lg" }} color={mutedColor} fontWeight="400">Your saved conversations</Text>
            </VStack>
            <Button leftIcon={<PiChatBold />} colorScheme="blue" size={{ base: "md", md: "lg" }} onClick={() => navigate('/chat')} borderRadius="xl" fontWeight="600">New Chat</Button>
          </HStack>
          <Divider borderColor={borderColor} />
        </VStack>
        <Box flex="1" w="100%">
          {sessions.length === 0 ? (
            <Flex direction="column" align="center" justify="center" h="60%" textAlign="center">
              <PiChatCircleBold size={48} color={mutedColor} />
              <Text fontSize="xl" fontWeight="600" color={textColor} mt={4} mb={2}>No saved conversations</Text>
              <Text fontSize="md" color={mutedColor} mb={6}>Start a new chat and save it to see it here</Text>
              <Button leftIcon={<PiChatBold />} colorScheme="blue" size="lg" onClick={() => navigate('/chat')} borderRadius="xl">Start Chatting</Button>
            </Flex>
          ) : (
            <VStack spacing={4} align="stretch">
              {sessions.map((session) => (
                <Card key={session.id} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="lg" boxShadow="0 1px 2px rgba(0, 0, 0, 0.04)" _hover={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", transform: "translateY(-1px)", borderColor: "#CBD5E1" }} transition="all 150ms ease" cursor="pointer" onClick={() => handleLoadSession(session.id)}>
                  <CardBody p={4}>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={2} flex="1" mr={3}>
                        <Text fontSize="md" fontWeight="600" color={textColor} lineHeight="1.4" noOfLines={2}>{session.title}</Text>
                        <HStack spacing={3} flexWrap="wrap">
                          <HStack spacing={1}>
                            <PiClockBold size={12} color={mutedColor} />
                            <Text fontSize="xs" color={mutedColor} fontWeight="500">{formatDate(session.updatedAt)}</Text>
                          </HStack>
                          <Badge colorScheme="blue" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="xs">{getMessageCount(session.messageCount)}</Badge>
                        </HStack>
                      </VStack>
                      <Tooltip label="Delete session" hasArrow>
                        <IconButton aria-label="Delete session" icon={<PiTrashBold />} size="sm" variant="ghost" colorScheme="red" borderRadius="md" onClick={(e) => { e.stopPropagation(); setDeleteId(session.id); onOpen(); }} _hover={{ bg: "red.50", color: "red.600" }} />
                      </Tooltip>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </Box>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader>Delete Session</ModalHeader>
          <ModalCloseButton />
          <ModalBody><Text>Are you sure you want to delete this chat session? This action cannot be undone.</Text></ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDeleteSession}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}