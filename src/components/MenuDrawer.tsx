

import React from "react";
import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  Button,
  Text,
  Divider,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

const MenuDrawer: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        icon={<HamburgerIcon />}
        aria-label="Open menu"
        onClick={onOpen}
        variant="ghost"
      />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={3}>
              <Button
                as={RouterLink}
                to="/chat"
                variant="ghost"
                justifyContent="flex-start"
                onClick={onClose}
              >
                Chat
              </Button>
              <Button
                as={RouterLink}
                to="/news"
                variant="ghost"
                justifyContent="flex-start"
                onClick={onClose}
              >
                News
              </Button>
              <Divider />
              <Text fontWeight="bold" mt={2}>
                Apps
              </Text>
              <Box pl={4}>
                <Button
                  as={RouterLink}
                  to="/apps/neuratask"
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onClose}
                  size="sm"
                >
                  NeuraTask
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MenuDrawer;