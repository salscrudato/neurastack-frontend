import {
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Flex,
    Grid,
    GridItem,
    HStack,
    Icon,
    Progress,
    Spinner,
    Text,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { PiCheckBold, PiCrownBold, PiLightningBold, PiShieldCheckBold, PiStarBold } from 'react-icons/pi';
import { neuraStackClient } from '../lib/neurastack-client';
import type { TierConfigResponse, UserTierInfoResponse } from '../lib/types';
import { useAuthStore } from '../store/useAuthStore';

// Import subscription service

export default function SubscriptionPage() {
    const [userTierInfo, setUserTierInfo] = useState<UserTierInfoResponse | null>(null);
    const [tierConfig, setTierConfig] = useState<TierConfigResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isDowngrading, setIsDowngrading] = useState(false);
    const user = useAuthStore((s) => s.user);
    const toast = useToast();

    const bgColor = '#FAFBFC';
    const cardBg = '#FFFFFF';
    const borderColor = '#E2E8F0';
    const textColor = '#1E293B';
    const mutedColor = '#64748B';
    const primaryColor = '#4F9CF9';

    useEffect(() => {
        loadSubscriptionData();
    }, [user]);

    const loadSubscriptionData = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            const [tierInfo, config] = await Promise.all([
                neuraStackClient.getUserTierInfo(user.uid),
                neuraStackClient.getTierConfigurations()
            ]);
            setUserTierInfo(tierInfo);
            setTierConfig(config);
        } catch (error) {
            console.error('Failed to load subscription data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load subscription information',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgrade = async () => {
        if (!user) return;
        
        setIsUpgrading(true);
        try {
            await neuraStackClient.upgradeTier({
                userId: user.uid,
                durationDays: 30,
                reason: 'User manual upgrade'
            });
            
            toast({
                title: 'Upgraded Successfully!',
                description: 'You now have access to premium features',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            
            await loadSubscriptionData();
        } catch (error) {
            console.error('Failed to upgrade:', error);
            toast({
                title: 'Upgrade Failed',
                description: 'Unable to upgrade your subscription. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleDowngrade = async () => {
        if (!user) return;
        
        setIsDowngrading(true);
        try {
            await neuraStackClient.downgradeTier({
                userId: user.uid,
                reason: 'User manual downgrade'
            });
            
            toast({
                title: 'Downgraded Successfully',
                description: 'You have been moved to the free tier',
                status: 'info',
                duration: 5000,
                isClosable: true,
            });
            
            await loadSubscriptionData();
        } catch (error) {
            console.error('Failed to downgrade:', error);
            toast({
                title: 'Downgrade Failed',
                description: 'Unable to downgrade your subscription. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsDowngrading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Unknown';
        }
    };

    const getUsagePercentage = (current: number, max: number) => {
        return Math.min((current / max) * 100, 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'red';
        if (percentage >= 70) return 'orange';
        return 'blue';
    };

    if (isLoading) {
        return (
            <Box
                w="100%"
                minH="100vh"
                bg={bgColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                    paddingTop: {
                        base: 'calc(env(safe-area-inset-top, 0px) + 56px + 16px)',
                        md: 'calc(60px + 24px)'
                    }
                }}
            >
                <VStack spacing={4}>
                    <Spinner size="xl" color={primaryColor} />
                    <Text color={mutedColor}>Loading subscription information...</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box
            w="100%"
            h="100vh"
            bg={bgColor}
            overflow="auto"
            pt={{ base: "calc(56px + 16px)", md: "calc(60px + 24px)" }}
            pb={{ base: "calc(env(safe-area-inset-bottom, 0px) + 16px)", md: "24px" }}
            px={{ base: 4, md: 4 }}
        >
            <Flex direction="column" w="100%" maxW="800px" mx="auto">
                {/* Header */}
                <VStack spacing={4} align="stretch" mb={6}>
                    <VStack align="start" spacing={1}>
                        <HStack>
                            <Icon as={PiCrownBold} w={8} h={8} color={primaryColor} />
                            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="700" color={textColor} lineHeight="1.2">
                                Subscription
                            </Text>
                        </HStack>
                        <Text fontSize={{ base: "md", md: "lg" }} color={mutedColor} fontWeight="400">
                            Manage your NeuraStack subscription and usage
                        </Text>
                    </VStack>
                    <Divider borderColor={borderColor} />
                </VStack>

                {/* Current Plan Status */}
                {userTierInfo && userTierInfo.data && (
                    <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" mb={6} overflow="hidden">
                        <CardHeader pb={2}>
                            <HStack justify="space-between" align="center">
                                <HStack>
                                    <Icon
                                        as={userTierInfo.data.tier === 'premium' ? PiStarBold : PiShieldCheckBold}
                                        w={6} h={6}
                                        color={userTierInfo.data.tier === 'premium' ? 'gold' : primaryColor}
                                    />
                                    <Text fontSize="xl" fontWeight="600" color={textColor}>
                                        Current Plan: {userTierInfo.data.config.name}
                                    </Text>
                                </HStack>
                                <Badge
                                    colorScheme={userTierInfo.data.tier === 'premium' ? 'yellow' : 'blue'}
                                    variant="subtle"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    textTransform="capitalize"
                                >
                                    {userTierInfo.data.tier}
                                </Badge>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                            <VStack spacing={4} align="stretch">
                                {userTierInfo.data.userData && (
                                    <Text color={mutedColor}>
                                        Started: {formatDate(userTierInfo.data.userData.tierStartDate)}
                                        {userTierInfo.data.userData.tierEndDate && (
                                            <> • Expires: {formatDate(userTierInfo.data.userData.tierEndDate)}</>
                                        )}
                                    </Text>
                                )}

                                {/* Usage Statistics - only show if userData exists */}
                                {userTierInfo.data.userData && (
                                    <VStack spacing={3} align="stretch">
                                        <Text fontSize="md" fontWeight="600" color={textColor}>Usage Today</Text>

                                        <Box>
                                            <HStack justify="space-between" mb={1}>
                                                <Text fontSize="sm" color={mutedColor}>Requests</Text>
                                                <Text fontSize="sm" color={textColor}>
                                                    {userTierInfo.data.userData.usage.requestsToday} / {userTierInfo.data.config.maxRequestsPerDay}
                                                </Text>
                                            </HStack>
                                            <Progress
                                                value={getUsagePercentage(userTierInfo.data.userData.usage.requestsToday, userTierInfo.data.config.maxRequestsPerDay)}
                                                colorScheme={getUsageColor(getUsagePercentage(userTierInfo.data.userData.usage.requestsToday, userTierInfo.data.config.maxRequestsPerDay))}
                                                size="sm"
                                                borderRadius="full"
                                            />
                                        </Box>

                                        <Box>
                                            <HStack justify="space-between" mb={1}>
                                                <Text fontSize="sm" color={mutedColor}>Hourly Requests</Text>
                                                <Text fontSize="sm" color={textColor}>
                                                    {userTierInfo.data.userData.usage.requestsThisHour} / {userTierInfo.data.config.maxRequestsPerHour}
                                                </Text>
                                            </HStack>
                                            <Progress
                                                value={getUsagePercentage(userTierInfo.data.userData.usage.requestsThisHour, userTierInfo.data.config.maxRequestsPerHour)}
                                                colorScheme={getUsageColor(getUsagePercentage(userTierInfo.data.userData.usage.requestsThisHour, userTierInfo.data.config.maxRequestsPerHour))}
                                                size="sm"
                                                borderRadius="full"
                                            />
                                        </Box>
                                    </VStack>
                                )}

                                {/* Show plan limits when userData is not available */}
                                {!userTierInfo.data.userData && (
                                    <VStack spacing={3} align="stretch">
                                        <Text fontSize="md" fontWeight="600" color={textColor}>Plan Limits</Text>
                                        <VStack spacing={2} align="start">
                                            <Text fontSize="sm" color={mutedColor}>
                                                • {userTierInfo.data.config.maxRequestsPerDay} requests per day
                                            </Text>
                                            <Text fontSize="sm" color={mutedColor}>
                                                • {userTierInfo.data.config.maxRequestsPerHour} requests per hour
                                            </Text>
                                            <Text fontSize="sm" color={mutedColor}>
                                                • Up to {userTierInfo.data.config.maxPromptLength.toLocaleString()} characters per prompt
                                            </Text>
                                        </VStack>
                                    </VStack>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                )}



                {/* Plan Comparison */}
                {tierConfig && (
                    <VStack spacing={6} align="stretch">
                        <Text fontSize="xl" fontWeight="600" color={textColor}>Available Plans</Text>

                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                            {/* Free Tier */}
                            <GridItem>
                                <Card
                                    bg={cardBg}
                                    border="2px solid"
                                    borderColor={userTierInfo?.data.tier === 'free' ? primaryColor : borderColor}
                                    borderRadius="xl"
                                    h="100%"
                                    position="relative"
                                    overflow="hidden"
                                >
                                    {userTierInfo?.data.tier === 'free' && (
                                        <Box
                                            position="absolute"
                                            top={0}
                                            right={0}
                                            bg={primaryColor}
                                            color="white"
                                            px={3}
                                            py={1}
                                            fontSize="xs"
                                            fontWeight="600"
                                            borderBottomLeftRadius="md"
                                        >
                                            CURRENT
                                        </Box>
                                    )}
                                    <CardHeader>
                                        <VStack align="start" spacing={2}>
                                            <HStack>
                                                <Icon as={PiShieldCheckBold} w={6} h={6} color={primaryColor} />
                                                <Text fontSize="xl" fontWeight="600" color={textColor}>
                                                    {tierConfig.data.free.name}
                                                </Text>
                                            </HStack>
                                            <HStack align="baseline">
                                                <Text fontSize="3xl" fontWeight="700" color={textColor}>
                                                    ${tierConfig.data.free.costPerMonth}
                                                </Text>
                                                <Text color={mutedColor}>/month</Text>
                                            </HStack>
                                        </VStack>
                                    </CardHeader>
                                    <CardBody pt={0}>
                                        <VStack spacing={3} align="stretch">
                                            <VStack spacing={2} align="start">
                                                <HStack>
                                                    <Icon as={PiCheckBold} w={4} h={4} color="green.500" />
                                                    <Text fontSize="sm" color={textColor}>
                                                        {tierConfig.data.free.maxRequestsPerDay} requests/day
                                                    </Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={PiCheckBold} w={4} h={4} color="green.500" />
                                                    <Text fontSize="sm" color={textColor}>
                                                        {tierConfig.data.free.maxRequestsPerHour} requests/hour
                                                    </Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={PiCheckBold} w={4} h={4} color="green.500" />
                                                    <Text fontSize="sm" color={textColor}>
                                                        Up to {tierConfig.data.free.maxPromptLength.toLocaleString()} characters
                                                    </Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={PiCheckBold} w={4} h={4} color="green.500" />
                                                    <Text fontSize="sm" color={textColor}>
                                                        {tierConfig.data.free.features.join(', ')}
                                                    </Text>
                                                </HStack>
                                            </VStack>

                                            {userTierInfo?.data.tier === 'premium' && (
                                                <Button
                                                    variant="outline"
                                                    colorScheme="gray"
                                                    size="md"
                                                    borderRadius="xl"
                                                    isLoading={isDowngrading}
                                                    loadingText="Downgrading..."
                                                    onClick={handleDowngrade}
                                                    mt={4}
                                                >
                                                    Downgrade to Free
                                                </Button>
                                            )}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </GridItem>

                            {/* Premium Tier */}
                            <GridItem>
                                <Card
                                    bg={cardBg}
                                    border="2px solid"
                                    borderColor={userTierInfo?.data.tier === 'premium' ? 'gold' : borderColor}
                                    borderRadius="xl"
                                    h="100%"
                                    position="relative"
                                    overflow="hidden"
                                    boxShadow={userTierInfo?.data.tier === 'premium' ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none'}
                                >
                                    {userTierInfo?.data.tier === 'premium' ? (
                                        <Box
                                            position="absolute"
                                            top={0}
                                            right={0}
                                            bg="gold"
                                            color="black"
                                            px={3}
                                            py={1}
                                            fontSize="xs"
                                            fontWeight="600"
                                            borderBottomLeftRadius="md"
                                        >
                                            CURRENT
                                        </Box>
                                    ) : (
                                        <Box
                                            position="absolute"
                                            top={0}
                                            right={0}
                                            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                            color="white"
                                            px={3}
                                            py={1}
                                            fontSize="xs"
                                            fontWeight="600"
                                            borderBottomLeftRadius="md"
                                        >
                                            POPULAR
                                        </Box>
                                    )}
                                    <CardHeader>
                                        <VStack align="start" spacing={2}>
                                            <HStack>
                                                <Icon as={PiStarBold} w={6} h={6} color="gold" />
                                                <Text fontSize="xl" fontWeight="600" color={textColor}>
                                                    {tierConfig.data.premium.name}
                                                </Text>
                                            </HStack>
                                            <HStack align="baseline">
                                                <Text fontSize="3xl" fontWeight="700" color={textColor}>
                                                    ${tierConfig.data.premium.costPerMonth}
                                                </Text>
                                                <Text color={mutedColor}>/month</Text>
                                            </HStack>
                                        </VStack>
                                    </CardHeader>
                                    <CardBody pt={0}>
                                        <VStack spacing={3} align="stretch">
                                            <VStack spacing={2} align="start">
                                                <HStack>
                                                    <Icon as={PiLightningBold} w={4} h={4} color="gold" />
                                                    <Text fontSize="sm" color={textColor}>
                                                        {tierConfig.data.premium.maxRequestsPerDay} requests/day
                                                    </Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={PiLightningBold} w={4} h={4} color="gold" />
                                                    <Text fontSize="sm" color={textColor}>
                                                        {tierConfig.data.premium.maxRequestsPerHour} requests/hour
                                                    </Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={PiLightningBold} w={4} h={4} color="gold" />
                                                    <Text fontSize="sm" color={textColor}>
                                                        Up to {tierConfig.data.premium.maxPromptLength.toLocaleString()} characters
                                                    </Text>
                                                </HStack>
                                                <HStack>
                                                    <Icon as={PiLightningBold} w={4} h={4} color="gold" />
                                                    <Text fontSize="sm" color={textColor}>
                                                        {tierConfig.data.premium.features.join(', ')}
                                                    </Text>
                                                </HStack>
                                            </VStack>

                                            {userTierInfo?.data.tier === 'free' && (
                                                <Button
                                                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                    color="white"
                                                    size="md"
                                                    borderRadius="xl"
                                                    isLoading={isUpgrading}
                                                    loadingText="Upgrading..."
                                                    onClick={handleUpgrade}
                                                    mt={4}
                                                    _hover={{
                                                        bg: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                                                        transform: "translateY(-1px)"
                                                    }}
                                                    _active={{
                                                        transform: "translateY(0)"
                                                    }}
                                                >
                                                    Upgrade to Premium
                                                </Button>
                                            )}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </Grid>
                    </VStack>
                )}
            </Flex>
        </Box>
    );
}
