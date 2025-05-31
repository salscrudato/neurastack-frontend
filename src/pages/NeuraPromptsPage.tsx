import {
  Box,
  Flex,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useColorModeValue,
  useDisclosure,
  HStack,
  VStack,
  Badge,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import {
  PiBookmarksBold,
  PiGlobeBold,
  PiTrendUpBold,
  PiPlusBold,
  PiChartBarBold,
} from 'react-icons/pi';
import { useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useAuthStore } from '../store/useAuthStore';
import { usePersonalPrompts, useCommunityPrompts, useTrendingPrompts, usePromptStats } from '../hooks/usePrompts';
import PromptList from '../components/NeuraPrompts/PromptList';
import PromptFormModal from '../components/NeuraPrompts/PromptFormModal';
import TagSelector from '../components/NeuraPrompts/TagSelector';

export default function NeuraPromptsPage() {
  const { user } = useAuthStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();

  // Data hooks
  const { prompts: personalPrompts, loading: personalLoading, error: personalError, refetch: refetchPersonal } = usePersonalPrompts();
  const { prompts: communityPrompts, loading: communityLoading, error: communityError, refetch: refetchCommunity } = useCommunityPrompts();
  const { prompts: trendingPrompts, loading: trendingLoading, error: trendingError } = useTrendingPrompts();
  const { stats, loading: statsLoading } = usePromptStats();

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');

  // Filter prompts by selected tags
  const filterPromptsByTags = (prompts: any[]) => {
    if (selectedTags.length === 0) return prompts;
    return prompts.filter(prompt =>
      selectedTags.some(tag => prompt.tags.includes(tag))
    );
  };

  const filteredPersonalPrompts = filterPromptsByTags(personalPrompts);
  const filteredCommunityPrompts = filterPromptsByTags(communityPrompts);

  const handlePromptSaved = () => {
    refetchPersonal();
    onFormClose();
  };

  const handlePromptShared = () => {
    refetchPersonal();
    refetchCommunity();
  };

  if (!user) {
    return (
      <AppShell>
        <Flex h="100%" align="center" justify="center" bg={bgColor}>
          <Alert
            status="info"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="xl"
            maxW="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Sign in Required
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              Please sign in to access your prompt library and share prompts with the community.
            </AlertDescription>
          </Alert>
        </Flex>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Box h="100%" bg={bgColor}>
        <Box maxW="6xl" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
          {/* Header */}
          <Flex justify="space-between" align="center" mb={6}>
            <VStack align="start" spacing={1}>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={textColor}>
                NeuraPrompts
              </Text>
              <Text fontSize="md" color={subtextColor}>
                Save, organize, and share your best AI prompts
              </Text>
            </VStack>

            <Button
              leftIcon={<PiPlusBold />}
              colorScheme="blue"
              onClick={onFormOpen}
              size={{ base: "sm", md: "md" }}
            >
              New Prompt
            </Button>
          </Flex>

          {/* Stats Cards */}
          {!statsLoading && (
            <HStack spacing={4} mb={6} overflowX="auto" pb={2}>
              <Box
                bg={cardBg}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                minW="150px"
              >
                <HStack spacing={2}>
                  <Icon as={PiBookmarksBold} color="blue.500" boxSize={5} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {stats.totalPersonal}
                    </Text>
                    <Text fontSize="sm" color={subtextColor}>
                      Personal
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box
                bg={cardBg}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                minW="150px"
              >
                <HStack spacing={2}>
                  <Icon as={PiGlobeBold} color="green.500" boxSize={5} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {stats.totalShared}
                    </Text>
                    <Text fontSize="sm" color={subtextColor}>
                      Shared
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Box
                bg={cardBg}
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                minW="150px"
              >
                <HStack spacing={2}>
                  <Icon as={PiChartBarBold} color="purple.500" boxSize={5} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {stats.totalUses}
                    </Text>
                    <Text fontSize="sm" color={subtextColor}>
                      Total Uses
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </HStack>
          )}

          {/* Tag Filter */}
          <Box mb={6}>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              placeholder="Filter by tags..."
            />
          </Box>

          {/* Main Content Tabs */}
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={PiBookmarksBold} boxSize={4} />
                  <Text>My Prompts</Text>
                  <Badge colorScheme="blue" variant="subtle">
                    {filteredPersonalPrompts.length}
                  </Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={PiGlobeBold} boxSize={4} />
                  <Text>Community</Text>
                  <Badge colorScheme="green" variant="subtle">
                    {filteredCommunityPrompts.length}
                  </Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={PiTrendUpBold} boxSize={4} />
                  <Text>Trending</Text>
                  <Badge colorScheme="orange" variant="subtle">
                    {trendingPrompts.length}
                  </Badge>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Personal Prompts */}
              <TabPanel px={0}>
                {personalLoading ? (
                  <Flex justify="center" py={8}>
                    <Spinner size="lg" color="blue.500" />
                  </Flex>
                ) : personalError ? (
                  <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <AlertTitle>Error loading prompts</AlertTitle>
                    <AlertDescription>{personalError}</AlertDescription>
                  </Alert>
                ) : (
                  <PromptList
                    prompts={filteredPersonalPrompts}
                    type="personal"
                    onPromptUpdated={refetchPersonal}
                    onPromptShared={handlePromptShared}
                  />
                )}
              </TabPanel>

              {/* Community Prompts */}
              <TabPanel px={0}>
                {communityLoading ? (
                  <Flex justify="center" py={8}>
                    <Spinner size="lg" color="green.500" />
                  </Flex>
                ) : communityError ? (
                  <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <AlertTitle>Error loading community prompts</AlertTitle>
                    <AlertDescription>{communityError}</AlertDescription>
                  </Alert>
                ) : (
                  <PromptList
                    prompts={filteredCommunityPrompts}
                    type="community"
                    onPromptUpdated={refetchCommunity}
                  />
                )}
              </TabPanel>

              {/* Trending Prompts */}
              <TabPanel px={0}>
                {trendingLoading ? (
                  <Flex justify="center" py={8}>
                    <Spinner size="lg" color="orange.500" />
                  </Flex>
                ) : trendingError ? (
                  <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <AlertTitle>Error loading trending prompts</AlertTitle>
                    <AlertDescription>{trendingError}</AlertDescription>
                  </Alert>
                ) : (
                  <PromptList
                    prompts={trendingPrompts}
                    type="trending"
                    onPromptUpdated={refetchCommunity}
                  />
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Create/Edit Prompt Modal */}
        <PromptFormModal
          isOpen={isFormOpen}
          onClose={onFormClose}
          onSave={handlePromptSaved}
        />
      </Box>
    </AppShell>
  );
}
