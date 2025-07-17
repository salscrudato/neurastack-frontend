/**
 * Enhanced Navigation Menu Component
 * 
 * A modern, reusable navigation menu with improved animations,
 * better accessibility, and consistent styling.
 */

import {
    Avatar,
    Box,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    HStack,
    Icon,
    Text,
    VStack
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

const MotionBox = motion(Box);

interface NavigationItem {
  label: string;
  path: string;
  icon: IconType;
  disabled?: boolean;
}

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavigationItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  user?: {
    photoURL?: string;
    displayName?: string;
    email?: string;
    isAnonymous?: boolean;
  } | null;
  brandLogo: ReactNode;
  onSignOut?: () => void;
}

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

export function NavigationMenu({
  isOpen,
  onClose,
  items,
  currentPath,
  onNavigate,
  user,
  brandLogo,
  onSignOut
}: NavigationMenuProps) {
  const handleNavigationClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    if (user.isAnonymous) return 'Guest User';
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      placement="left" 
      onClose={onClose} 
      size="xs"
      closeOnOverlayClick={true}
      closeOnEsc={true}
    >
      <DrawerOverlay
        bg="rgba(15, 23, 42, 0.4)"
        backdropFilter="blur(16px)"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        sx={{
          zIndex: 'var(--z-drawer-overlay)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      />
      <DrawerContent
        bg="var(--color-surface-glass-strong)"
        backdropFilter="blur(32px)"
        borderRight="none"
        boxShadow="var(--shadow-2xl), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
        maxW="320px"
        borderRadius="0 var(--radius-3xl) var(--radius-3xl) 0"
        sx={{
          zIndex: 'var(--z-drawer-content)',
          WebkitBackdropFilter: 'blur(32px)'
        }}
      >
        <DrawerCloseButton
          color="var(--color-text-muted)"
          bg="var(--color-surface-glass)"
          borderRadius="var(--radius-lg)"
          backdropFilter="blur(12px)"
          border="1px solid rgba(255, 255, 255, 0.2)"
          size="md"
          minW="40px"
          minH="40px"
          top={4}
          right={4}
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            color: "var(--color-text-primary)",
            bg: "var(--color-surface-primary)",
            transform: "scale(1.05)",
            boxShadow: "var(--shadow-button-hover)"
          }}
          _active={{ transform: "scale(0.95)" }}
          _focus={{
            outline: "none",
            boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.3)"
          }}
          sx={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        />
        
        <DrawerHeader
          borderBottomWidth="1px"
          borderColor="rgba(255, 255, 255, 0.2)"
          pb={4}
          pt={6}
          px={6}
          bg="rgba(255, 255, 255, 0.05)"
          backdropFilter="blur(20px)"
          sx={{ WebkitBackdropFilter: 'blur(20px)' }}
        >
          <VStack spacing={4} align="start">
            {brandLogo}
            {user && (
              <HStack spacing={3} w="full">
                {user.photoURL ? (
                  <Avatar
                    size="sm"
                    src={user.photoURL}
                    name={getUserDisplayName()}
                    w="32px"
                    h="32px"
                    borderRadius="var(--radius-lg)"
                    border="2px solid rgba(255, 255, 255, 0.8)"
                    boxShadow="var(--shadow-card)"
                  />
                ) : (
                  <Box
                    w="32px"
                    h="32px"
                    borderRadius="var(--radius-lg)"
                    bg="var(--gradient-primary)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="var(--shadow-card)"
                  >
                    <Text color="white" fontSize="sm" fontWeight="600">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </Text>
                  </Box>
                )}
                <VStack spacing={0} align="start" flex={1}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="var(--color-text-primary)"
                    lineHeight="1.2"
                  >
                    {getUserDisplayName()}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="var(--color-text-muted)"
                    lineHeight="1.2"
                  >
                    {user.isAnonymous ? 'Guest Session' : user.email}
                  </Text>
                </VStack>
              </HStack>
            )}
          </VStack>
        </DrawerHeader>

        <DrawerBody px={4} py={6}>
          <VStack spacing={2} align="stretch">
            {items.map((item, index) => {
              const isActive = currentPath === item.path;
              const isDisabled = item.disabled;

              return (
                <MotionBox
                  key={item.path}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  <Box
                    as="button"
                    role="button"
                    tabIndex={isDisabled ? -1 : 0}
                    onClick={isDisabled ? undefined : () => handleNavigationClick(item.path)}
                    w="100%"
                    p={4}
                    borderRadius="var(--radius-2xl)"
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    bg={isActive ? "rgba(79, 156, 249, 0.1)" : "rgba(255, 255, 255, 0.6)"}
                    border={isActive ? "1px solid rgba(79, 156, 249, 0.3)" : "1px solid rgba(255, 255, 255, 0.3)"}
                    opacity={isDisabled ? 0.5 : 1}
                    cursor={isDisabled ? "not-allowed" : "pointer"}
                    backdropFilter="blur(12px)"
                    _hover={!isDisabled ? {
                      bg: isActive ? "rgba(79, 156, 249, 0.15)" : "rgba(255, 255, 255, 0.8)",
                      transform: "translateY(-1px)",
                      boxShadow: "var(--shadow-card-hover)"
                    } : undefined}
                    _active={!isDisabled ? {
                      transform: "translateY(0) scale(0.98)"
                    } : undefined}
                    _focus={{
                      outline: "none",
                      boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.3)"
                    }}
                    sx={{
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                      WebkitBackdropFilter: 'blur(12px)'
                    }}
                  >
                    <HStack spacing={3} align="center">
                      <Box
                        w="40px"
                        h="40px"
                        borderRadius="var(--radius-xl)"
                        bg={isActive ? "rgba(79, 156, 249, 0.15)" : "rgba(100, 116, 139, 0.08)"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="all 0.2s ease"
                      >
                        <Icon
                          as={item.icon}
                          w={5}
                          h={5}
                          color={isDisabled ? "var(--color-text-muted)" : (isActive ? "var(--color-brand-primary)" : "var(--color-text-secondary)")}
                          transition="all 0.2s ease"
                        />
                      </Box>
                      <VStack spacing={0} align="start" flex={1}>
                        <Text
                          fontSize="md"
                          fontWeight={isActive ? "600" : "500"}
                          color={isDisabled ? "var(--color-text-muted)" : (isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)")}
                          textAlign="left"
                          lineHeight="1.3"
                        >
                          {item.label}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </MotionBox>
              );
            })}
            
            {user && !user.isAnonymous && onSignOut && (
              <MotionBox
                custom={items.length}
                initial="hidden"
                animate="visible"
                variants={menuItemVariants}
                mt={4}
              >
                <Box
                  as="button"
                  onClick={onSignOut}
                  w="100%"
                  p={4}
                  borderRadius="var(--radius-2xl)"
                  bg="rgba(239, 68, 68, 0.08)"
                  border="1px solid rgba(239, 68, 68, 0.2)"
                  color="var(--color-text-error)"
                  fontSize="md"
                  fontWeight="500"
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    bg: "rgba(239, 68, 68, 0.12)",
                    transform: "translateY(-1px)"
                  }}
                  _active={{ transform: "translateY(0) scale(0.98)" }}
                  _focus={{
                    outline: "none",
                    boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.3)"
                  }}
                  sx={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  Sign Out
                </Box>
              </MotionBox>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
