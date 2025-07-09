/**
 * Modern Notification System
 * 
 * Innovative notification component with smooth animations and modern design
 */

import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PiCheckBold, PiInfoBold, PiWarningBold, PiXBold } from 'react-icons/pi';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// Motion Components
// ============================================================================

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// ============================================================================
// Notification Component
// ============================================================================

export const ModernNotification = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [duration, id, onClose]);

  // Get notification styling based on type
  const getNotificationStyle = () => {
    const baseStyle = {
      bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
      border: '1px solid',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          borderColor: 'rgba(16, 185, 129, 0.3)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)',
        };
      case 'error':
        return {
          ...baseStyle,
          borderColor: 'rgba(239, 68, 68, 0.3)',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)',
        };
      case 'warning':
        return {
          ...baseStyle,
          borderColor: 'rgba(245, 158, 11, 0.3)',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)',
        };
      case 'info':
      default:
        return {
          ...baseStyle,
          borderColor: 'rgba(79, 156, 249, 0.3)',
          boxShadow: '0 8px 32px rgba(79, 156, 249, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)',
        };
    }
  };

  // Get icon and color based on type
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: PiCheckBold, color: '#10B981' };
      case 'error':
        return { icon: PiXBold, color: '#EF4444' };
      case 'warning':
        return { icon: PiWarningBold, color: '#F59E0B' };
      case 'info':
      default:
        return { icon: PiInfoBold, color: '#4F9CF9' };
    }
  };

  const { icon: Icon, color } = getIconAndColor();
  const notificationStyle = getNotificationStyle();

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionBox
          initial={{ opacity: 0, x: 400, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 25
          }}
          position="relative"
          w="400px"
          maxW="90vw"
          borderRadius="16px"
          overflow="hidden"
          {...notificationStyle}
        >
          {/* Progress bar */}
          {duration > 0 && (
            <MotionBox
              position="absolute"
              top={0}
              left={0}
              h="3px"
              bg={color}
              borderRadius="full"
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          )}

          <Flex p={4} align="flex-start" gap={3}>
            {/* Icon */}
            <Flex
              align="center"
              justify="center"
              w="40px"
              h="40px"
              borderRadius="12px"
              bg={`${color}15`}
              flexShrink={0}
            >
              <Icon size={20} color={color} />
            </Flex>

            {/* Content */}
            <Box flex={1} minW={0}>
              <Text
                fontSize="sm"
                fontWeight="600"
                color="#1E293B"
                mb={message ? 1 : 0}
                lineHeight="1.4"
              >
                {title}
              </Text>
              {message && (
                <Text
                  fontSize="sm"
                  color="#64748B"
                  lineHeight="1.4"
                >
                  {message}
                </Text>
              )}
              {action && (
                <Box mt={2}>
                  <Text
                    as="button"
                    fontSize="sm"
                    fontWeight="600"
                    color={color}
                    cursor="pointer"
                    onClick={action.onClick}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {action.label}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Close button */}
            <IconButton
              icon={<PiXBold />}
              aria-label="Close notification"
              size="sm"
              variant="ghost"
              onClick={handleClose}
              color="#64748B"
              _hover={{
                bg: 'rgba(100, 116, 139, 0.1)',
                color: '#1E293B'
              }}
              _active={{
                bg: 'rgba(100, 116, 139, 0.15)'
              }}
            />
          </Flex>
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// Notification Container
// ============================================================================

interface NotificationContainerProps {
  notifications: NotificationProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NotificationContainer = ({ 
  notifications, 
  position = 'top-right' 
}: NotificationContainerProps) => {
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      p: 4,
      pointerEvents: 'none' as const,
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 0, right: 0 };
      case 'top-left':
        return { ...baseStyles, top: 0, left: 0 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 0, right: 0 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 0, left: 0 };
      default:
        return { ...baseStyles, top: 0, right: 0 };
    }
  };

  return (
    <Box {...getPositionStyles()}>
      <MotionFlex
        direction="column"
        gap={3}
        align={position.includes('right') ? 'flex-end' : 'flex-start'}
      >
        <AnimatePresence>
          {notifications.map((notification) => (
            <Box key={notification.id} style={{ pointerEvents: 'auto' }}>
              <ModernNotification {...notification} />
            </Box>
          ))}
        </AnimatePresence>
      </MotionFlex>
    </Box>
  );
};

// ============================================================================
// Hook for managing notifications
// ============================================================================

export const useModernNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: removeNotification,
    };
    
    setNotifications((prev) => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};
