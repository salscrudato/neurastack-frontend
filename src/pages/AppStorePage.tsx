import {
  Box, Text, VStack, Grid, GridItem,
  useColorModeValue, Icon, Badge
} from '@chakra-ui/react';
import { PiCheckSquareOffsetBold, PiNewspaperLight, PiAirplaneBold, PiBookmarksBold, PiHeartBold } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';

export default function AppStorePage() {
  const navigate = useNavigate();

  // Modern black and white color scheme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.800', 'gray.200');
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // App data
  const apps = [
    {
      id: 'neurafit',
      name: 'neurafit',
      description: 'AI-powered fitness tracking',
      icon: PiHeartBold,
      route: '/apps/neurafit',
      available: true,
    },
    {
      id: 'neuratask',
      name: 'neuratask',
      description: 'AI-powered task management',
      icon: PiCheckSquareOffsetBold,
      route: '/apps/neuratask',
      available: false,
    },
    {
      id: 'neuraplanner',
      name: 'neuraplanner',
      description: 'AI-powered trip planning',
      icon: PiAirplaneBold,
      route: '/apps/neuraplanner',
      available: false,
    },
    {
      id: 'neuraprompts',
      name: 'neuraprompts',
      description: 'Reusable prompt library',
      icon: PiBookmarksBold,
      route: '/apps/neuraprompts',
      available: false,
    },
    {
      id: 'neuranews',
      name: 'neuranews',
      description: 'Intelligent news aggregation',
      icon: PiNewspaperLight,
      route: '/apps/neuranews',
      available: false,
    },
  ];

  const AppCard = ({ app }: { app: typeof apps[0] }) => (
    <Box
      as="button"
      w="full"
      p={6}
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      borderRadius="xl"
      cursor={app.available ? "pointer" : "not-allowed"}
      opacity={app.available ? 1 : 0.6}
      transition="all 0.2s ease"
      _hover={app.available ? {
        bg: hoverBg,
        transform: 'translateY(-2px)',
        boxShadow: useColorModeValue('lg', 'dark-lg'),
        borderColor: useColorModeValue('gray.300', 'gray.600')
      } : {}}
      onClick={app.available ? () => navigate(app.route) : undefined}
      position="relative"
    >
      <VStack spacing={4} align="center">
        <Box
          p={4}
          borderRadius="full"
          bg={useColorModeValue('gray.100', 'gray.700')}
        >
          <Icon
            as={app.icon}
            boxSize={8}
            color={iconColor}
          />
        </Box>

        <VStack spacing={1} align="center">
          <Text
            fontSize="lg"
            fontWeight="600"
            color={textColor}
            letterSpacing="0.5px"
          >
            {app.name}
          </Text>
          <Text
            fontSize="sm"
            color={subtextColor}
            textAlign="center"
          >
            {app.description}
          </Text>
        </VStack>

        {!app.available && (
          <Badge
            colorScheme="gray"
            variant="subtle"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="md"
          >
            Coming Soon
          </Badge>
        )}
      </VStack>
    </Box>
  );

  return (
    <AppShell>
      <Box h="100%" bg={bgColor} pos="relative">
        <Box
          maxW="6xl"
          mx="auto"
          px={{ base: 4, md: 6, lg: 8 }}
          py={{ base: 6, md: 8 }}
        >
          {/* Header Section */}
          <VStack spacing={6} align="center" mb={8}>
            <Text
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="700"
              color={textColor}
              textAlign="center"
              letterSpacing="tight"
            >
              Choose an App
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color={subtextColor}
              textAlign="center"
              maxW="2xl"
            >
              Explore our collection of AI-powered applications designed to enhance your productivity
            </Text>
          </VStack>

          {/* Apps Grid */}
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)"
            }}
            gap={6}
            w="full"
          >
            {apps.map((app) => (
              <GridItem key={app.id}>
                <AppCard app={app} />
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Box>
    </AppShell>
  );
}