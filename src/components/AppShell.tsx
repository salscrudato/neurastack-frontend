import {
  Flex, IconButton, Box, Text
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
  const bodyBg = '#FAFBFC';
  const headerBg = 'rgba(255, 255, 255, 0.95)';
  const borderColor = '#E2E8F0';
  const gray = '#64748B';

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
          boxShadow="sm"
          minH={{ base: "56px", md: "auto" }}
        >
          <IconButton
            aria-label="Back"
            icon={<PiArrowLeftLight size={20} />}
            variant="ghost"
            onClick={() => navigate(-1)}
            color="#64748B"
            _hover={{ bg: "#F1F5F9" }}
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
