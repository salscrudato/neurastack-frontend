/**
 * Modern Floating Action Button
 * 
 * Innovative FAB component with smooth animations and modern design
 */

import { Box, IconButton, Tooltip, VStack } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactElement } from 'react';
import { PiPlusBold, PiXBold } from 'react-icons/pi';

// ============================================================================
// Types
// ============================================================================

export interface FABAction {
  icon: ReactElement;
  label: string;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}

export interface FloatingActionButtonProps {
  actions?: FABAction[];
  mainIcon?: ReactElement;
  mainAction?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  disabled?: boolean;
}

// ============================================================================
// Motion Components
// ============================================================================

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

// ============================================================================
// Component
// ============================================================================

export const FloatingActionButton = ({
  actions = [],
  mainIcon = <PiPlusBold />,
  mainAction,
  position = 'bottom-right',
  size = 'md',
  color = '#4F9CF9',
  disabled = false
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1000,
    };

    const offset = size === 'lg' ? '24px' : size === 'md' ? '20px' : '16px';

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: offset, right: offset };
      case 'bottom-left':
        return { ...baseStyles, bottom: offset, left: offset };
      case 'top-right':
        return { ...baseStyles, top: offset, right: offset };
      case 'top-left':
        return { ...baseStyles, top: offset, left: offset };
      default:
        return { ...baseStyles, bottom: offset, right: offset };
    }
  };

  // Get button size
  const getButtonSize = () => {
    switch (size) {
      case 'lg':
        return { w: '64px', h: '64px' };
      case 'md':
        return { w: '56px', h: '56px' };
      case 'sm':
        return { w: '48px', h: '48px' };
      default:
        return { w: '56px', h: '56px' };
    }
  };

  const handleMainClick = () => {
    if (actions.length > 0) {
      setIsOpen(!isOpen);
    } else if (mainAction) {
      mainAction();
    }
  };

  const handleActionClick = (action: FABAction) => {
    action.onClick();
    setIsOpen(false);
  };

  const buttonSize = getButtonSize();
  const positionStyles = getPositionStyles();

  return (
    <MotionBox {...positionStyles}>
      <VStack spacing={3} align="center">
        {/* Action Buttons */}
        <AnimatePresence>
          {isOpen && actions.map((action, index) => (
            <MotionBox
              key={index}
              initial={{ 
                opacity: 0, 
                scale: 0.3, 
                y: position.includes('bottom') ? 20 : -20 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.3, 
                y: position.includes('bottom') ? 20 : -20 
              }}
              transition={{ 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
            >
              <Tooltip 
                label={action.label} 
                placement={position.includes('right') ? 'left' : 'right'}
                hasArrow
              >
                <MotionIconButton
                  icon={action.icon}
                  aria-label={action.label}
                  onClick={() => handleActionClick(action)}
                  isDisabled={action.disabled}
                  {...buttonSize}
                  borderRadius="full"
                  bg={action.color || 'white'}
                  color={action.color ? 'white' : color}
                  border="1px solid"
                  borderColor="rgba(226, 232, 240, 0.8)"
                  boxShadow="0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)"
                  backdropFilter="blur(20px)"
                  WebkitBackdropFilter="blur(20px)"
                  _hover={{
                    transform: 'scale(1.1)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2), 0 6px 16px rgba(0, 0, 0, 0.15)',
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                />
              </Tooltip>
            </MotionBox>
          ))}
        </AnimatePresence>

        {/* Main Button */}
        <MotionBox position="relative">
          <MotionIconButton
            icon={isOpen && actions.length > 0 ? <PiXBold /> : mainIcon}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={handleMainClick}
            isDisabled={disabled}
            {...buttonSize}
            borderRadius="full"
            bg={`linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`}
            color="white"
            boxShadow={`0 8px 25px ${color}40, 0 4px 12px ${color}20`}
            _hover={{
              transform: 'scale(1.1)',
              boxShadow: `0 12px 35px ${color}50, 0 6px 16px ${color}30`,
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          />

          {/* Ripple Effect */}
          <MotionBox
            position="absolute"
            top="50%"
            left="50%"
            w="100%"
            h="100%"
            borderRadius="full"
            bg={`${color}30`}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ 
              scale: [1, 1.5, 1], 
              opacity: [0.6, 0, 0.6] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            style={{ 
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
        </MotionBox>
      </VStack>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.1)"
            backdropFilter="blur(2px)"
            zIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </MotionBox>
  );
};

// ============================================================================
// Preset FAB Configurations
// ============================================================================

export const ChatFAB = ({ onNewChat, onHistory, onSettings }: {
  onNewChat?: () => void;
  onHistory?: () => void;
  onSettings?: () => void;
}) => {
  const actions: FABAction[] = [
    ...(onNewChat ? [{
      icon: <PiPlusBold />,
      label: 'New Chat',
      onClick: onNewChat,
      color: '#10B981'
    }] : []),
    ...(onHistory ? [{
      icon: <PiPlusBold />, // Replace with history icon
      label: 'Chat History',
      onClick: onHistory,
      color: '#8B5CF6'
    }] : []),
    ...(onSettings ? [{
      icon: <PiPlusBold />, // Replace with settings icon
      label: 'Settings',
      onClick: onSettings,
      color: '#F59E0B'
    }] : []),
  ];

  return (
    <FloatingActionButton
      actions={actions}
      position="bottom-right"
      size="md"
    />
  );
};
