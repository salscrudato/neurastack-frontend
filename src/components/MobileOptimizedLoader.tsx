import { Box, Flex, Text, useColorModeValue, Spinner } from '@chakra-ui/react';
import { memo } from 'react';

interface MobileOptimizedLoaderProps {
  retryCount?: number;
  message?: string;
}

export const MobileOptimizedLoader = memo<MobileOptimizedLoaderProps>(({
  retryCount = 0,
  message = "Thinking..."
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const retryTextColor = useColorModeValue('orange.500', 'orange.300');

  return (
    <Flex
      direction="column"
      align="flex-start"
      gap={{ base: 1, md: 2 }}
      w="100%"
      px={{ base: 1, md: 0 }}
    >

      {/* Loading Bubble */}
      <Box
        bg={bgColor}
        px={{ base: 3, md: 4 }}
        py={{ base: 2.5, md: 3 }}
        borderRadius="2xl"
        maxW={{ base: "90%", md: "80%" }}
        boxShadow="sm"
        border="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.600")}
      >
        <Flex align="center" gap={3}>
          <Spinner
            size={{ base: "sm", md: "md" }}
            color="blue.500"
            thickness="2px"
          />
          <Box>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              color={textColor}
              fontWeight="400"
              lineHeight="1.6"
            >
              {message}
            </Text>
            {retryCount > 0 && (
              <Text
                fontSize={{ base: "2xs", md: "xs" }}
                color={retryTextColor}
                mt={0.5}
                fontWeight="500"
              >
                Retrying... (attempt {retryCount + 1}/4)
              </Text>
            )}
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
});

MobileOptimizedLoader.displayName = 'MobileOptimizedLoader';
