import {
  Flex, IconButton, Box, Text,
  useColorModeValue
} from '@chakra-ui/react';
import { PiArrowLeftLight } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  showBack?: boolean;
  title?: string;
  rightActions?: ReactNode;
}

export function AppShell({ children, showBack = false, title, rightActions }: AppShellProps) {
  const navigate = useNavigate();
  const bodyBg = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', '#2c2c2e');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const gray = useColorModeValue('gray.600', 'gray.300');

  return (
    <Flex direction="column" h="100%" bg={bodyBg}>
      {showBack && (
        // Custom header with back button for sub-pages
        <Flex
          as="header"
          px={{ base: 3, md: 2 }}
          py={{ base: 2, md: 1 }}
          gap={{ base: 2, md: 2 }}
          align="center"
          bg={headerBg}
          borderBottom="1px solid"
          borderColor={borderColor}
          boxShadow={useColorModeValue('sm', 'none')}
          minH={{ base: "56px", md: "auto" }}
        >
          <IconButton
            aria-label="Back"
            icon={<PiArrowLeftLight size={20} />}
            variant="ghost"
            onClick={() => navigate(-1)}
            color={useColorModeValue('gray.500', 'white')}
            _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.100') }}
            size={{ base: "md", md: "md" }}
            minW={{ base: "40px", md: "auto" }}
            minH={{ base: "40px", md: "auto" }}
          />

          {title && (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center" minW={0}>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="semibold"
                color={gray}
                noOfLines={1}
              >
                {title}
              </Text>
            </Box>
          )}

          {rightActions}
        </Flex>
      )}

      {/* Body */}
      <Box
        flex="1"
        overflow={{ base: "auto", md: "hidden" }}
        position="relative"
        style={{ WebkitOverflowScrolling: 'touch' }}
        data-testid="app-shell-body"
        className="mobile-scroll-container"
      >
        {children}
      </Box>
    </Flex>
  );
}
