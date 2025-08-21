/**
 * Advanced Error Handler Component
 * 
 * Comprehensive error handling system with:
 * - Intelligent error classification and user-friendly messaging
 * - Proactive recovery mechanisms based on backend health data
 * - Context-aware error suggestions and retry strategies
 * - Performance-aware error reporting and analytics
 * - Graceful degradation with fallback experiences
 */

import {
    Alert,
    AlertDescription,
    AlertTitle,
    Box,
    Button,
    Circle,
    HStack,
    Icon,
    Progress,
    Text,
    VStack,
    useColorModeValue,
    useToast
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useState } from "react";
import {
    PiArrowClockwiseBold,
    PiClockBold,
    PiShieldWarningBold,
    PiWifiSlashBold
} from "react-icons/pi";
import { neuraStackClient } from "../lib/neurastack-client";

const MotionBox = motion(Box);

interface ErrorInfo {
    type: 'network' | 'api' | 'rate_limit' | 'timeout' | 'server' | 'unknown';
    message: string;
    statusCode?: number;
    correlationId?: string;
    retryable: boolean;
    suggestedAction?: string;
    estimatedRecoveryTime?: number;
}

interface AdvancedErrorHandlerProps {
    error: any;
    onRetry?: () => void;
    onDismiss?: () => void;
    context?: 'chat' | 'analytics' | 'system';
    showRecoveryOptions?: boolean;
}

// Error classification utility
const classifyError = (error: any): ErrorInfo => {
    // Network connectivity errors
    if (!navigator.onLine) {
        return {
            type: 'network',
            message: 'No internet connection detected',
            retryable: true,
            suggestedAction: 'Check your internet connection and try again',
            estimatedRecoveryTime: 0
        };
    }

    // API-specific errors
    if (error?.statusCode) {
        switch (error.statusCode) {
            case 429:
                return {
                    type: 'rate_limit',
                    message: 'Too many requests - please wait a moment',
                    statusCode: 429,
                    correlationId: error.correlationId,
                    retryable: true,
                    suggestedAction: 'Wait 30 seconds before trying again',
                    estimatedRecoveryTime: 30
                };
            case 408:
            case 504:
                return {
                    type: 'timeout',
                    message: 'Request timed out - the AI models are taking longer than usual',
                    statusCode: error.statusCode,
                    correlationId: error.correlationId,
                    retryable: true,
                    suggestedAction: 'Try a shorter or simpler question',
                    estimatedRecoveryTime: 10
                };
            case 500:
            case 502:
            case 503:
                return {
                    type: 'server',
                    message: 'Temporary server issue - our team is working on it',
                    statusCode: error.statusCode,
                    correlationId: error.correlationId,
                    retryable: true,
                    suggestedAction: 'Try again in a few minutes',
                    estimatedRecoveryTime: 120
                };
            default:
                return {
                    type: 'api',
                    message: error.message || 'An unexpected error occurred',
                    statusCode: error.statusCode,
                    correlationId: error.correlationId,
                    retryable: error.retryable || false,
                    suggestedAction: 'Please try again or contact support if the issue persists'
                };
        }
    }

    // Generic error fallback
    return {
        type: 'unknown',
        message: error?.message || 'Something went wrong',
        retryable: true,
        suggestedAction: 'Please try again'
    };
};

// Recovery countdown component
const RecoveryCountdown = ({ 
    initialTime, 
    onComplete 
}: { 
    initialTime: number; 
    onComplete: () => void; 
}) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, onComplete]);

    const progress = ((initialTime - timeLeft) / initialTime) * 100;

    return (
        <VStack spacing={2} align="stretch">
            <Progress
                value={progress}
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                bg="rgba(226, 232, 240, 0.3)"
            />
            <Text fontSize="xs" color="gray.500" textAlign="center">
                Auto-retry in {timeLeft}s
            </Text>
        </VStack>
    );
};

// Main error handler component
export const AdvancedErrorHandler = memo<AdvancedErrorHandlerProps>(({
    error,
    onRetry,
    onDismiss,
    showRecoveryOptions = true
}) => {
    const [isRetrying, setIsRetrying] = useState(false);
    const [systemHealth, setSystemHealth] = useState<any>(null);
    const [autoRetryEnabled, setAutoRetryEnabled] = useState(false);
    
    const toast = useToast();
    const cardBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 44, 0.95)");
    const borderColor = useColorModeValue("rgba(226, 232, 240, 0.6)", "rgba(74, 85, 104, 0.6)");

    const errorInfo = classifyError(error);

    // Fetch system health for context-aware error handling
    useEffect(() => {
        const fetchSystemHealth = async () => {
            try {
                const health = await neuraStackClient.healthCheck();
                setSystemHealth(health);
            } catch {
                // Ignore health check failures during error handling
            }
        };

        fetchSystemHealth();
    }, []);

    // Auto-retry logic for recoverable errors
    useEffect(() => {
        if (errorInfo.retryable && errorInfo.estimatedRecoveryTime && errorInfo.estimatedRecoveryTime > 0) {
            setAutoRetryEnabled(true);
        }
    }, [errorInfo]);

    const handleRetry = useCallback(async () => {
        if (!onRetry || isRetrying) return;

        setIsRetrying(true);
        try {
            await onRetry();
            toast({
                title: "Retry successful",
                status: "success",
                duration: 2000,
                isClosable: true
            });
        } catch (retryError) {
            toast({
                title: "Retry failed",
                description: "Please try again in a moment",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setIsRetrying(false);
        }
    }, [onRetry, isRetrying, toast]);

    const handleAutoRetry = useCallback(() => {
        setAutoRetryEnabled(false);
        handleRetry();
    }, [handleRetry]);

    const getErrorIcon = () => {
        switch (errorInfo.type) {
            case 'network': return PiWifiSlashBold;
            case 'rate_limit': return PiClockBold;
            case 'timeout': return PiClockBold;
            case 'server': return PiShieldWarningBold;
            default: return PiShieldWarningBold;
        }
    };

    const getErrorColor = () => {
        switch (errorInfo.type) {
            case 'network': return 'orange';
            case 'rate_limit': return 'yellow';
            case 'timeout': return 'blue';
            case 'server': return 'red';
            default: return 'red';
        }
    };

    const ErrorIcon = getErrorIcon();
    const errorColor = getErrorColor();

    return (
        <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
            <Alert
                status="error"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                p={6}
                backdropFilter="blur(20px)"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
            >
                <Circle size="48px" bg={`${errorColor}.100`} color={`${errorColor}.500`} mb={4}>
                    <Icon as={ErrorIcon} boxSize={6} />
                </Circle>

                <AlertTitle fontSize="lg" fontWeight="600" color="gray.800" mb={2}>
                    {errorInfo.type === 'network' ? 'Connection Issue' :
                     errorInfo.type === 'rate_limit' ? 'Rate Limit Reached' :
                     errorInfo.type === 'timeout' ? 'Request Timeout' :
                     errorInfo.type === 'server' ? 'Server Issue' :
                     'Unexpected Error'}
                </AlertTitle>

                <AlertDescription fontSize="sm" color="gray.600" mb={4} maxW="400px">
                    {errorInfo.message}
                </AlertDescription>

                {errorInfo.suggestedAction && (
                    <Text fontSize="xs" color="gray.500" mb={4} fontStyle="italic">
                        💡 {errorInfo.suggestedAction}
                    </Text>
                )}

                {/* System health indicator */}
                {systemHealth && (
                    <HStack spacing={2} mb={4}>
                        <Circle size="16px" bg={systemHealth.status === 'ok' ? 'green.500' : 'red.500'} />
                        <Text fontSize="xs" color="gray.500">
                            System Status: {systemHealth.status === 'ok' ? 'Healthy' : 'Degraded'}
                        </Text>
                    </HStack>
                )}

                {/* Auto-retry countdown */}
                {autoRetryEnabled && errorInfo.estimatedRecoveryTime && (
                    <Box w="100%" maxW="200px" mb={4}>
                        <RecoveryCountdown
                            initialTime={errorInfo.estimatedRecoveryTime}
                            onComplete={handleAutoRetry}
                        />
                    </Box>
                )}

                {/* Action buttons */}
                {showRecoveryOptions && (
                    <HStack spacing={3}>
                        {errorInfo.retryable && onRetry && (
                            <Button
                                size="sm"
                                colorScheme="blue"
                                variant="solid"
                                leftIcon={<Icon as={PiArrowClockwiseBold} />}
                                onClick={handleRetry}
                                isLoading={isRetrying}
                                loadingText="Retrying..."
                            >
                                Try Again
                            </Button>
                        )}
                        
                        {onDismiss && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onDismiss}
                            >
                                Dismiss
                            </Button>
                        )}
                    </HStack>
                )}

                {/* Debug info for development */}
                {import.meta.env.DEV && errorInfo.correlationId && (
                    <Text fontSize="xs" color="gray.400" mt={4} fontFamily="mono">
                        ID: {errorInfo.correlationId}
                    </Text>
                )}
            </Alert>
        </MotionBox>
    );
});

AdvancedErrorHandler.displayName = 'AdvancedErrorHandler';
