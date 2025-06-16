import { Box, Text, HStack, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { memo } from 'react';

const MotionBox = motion(Box);

interface ModernProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
}

const ModernProgressIndicator = memo(function ModernProgressIndicator({
  current,
  total,
  label = 'Progress',
  showPercentage = true,
  size = 'md',
  colorScheme = 'blue'
}: ModernProgressIndicatorProps) {
  const textColor = useColorModeValue('gray.800', 'white');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  
  const percentage = Math.round((current / total) * 100);
  
  const sizeProps = {
    sm: { height: '6px', fontSize: 'sm' },
    md: { height: '8px', fontSize: 'md' },
    lg: { height: '12px', fontSize: 'lg' }
  };

  return (
    <Box w="full">
      <HStack justify="space-between" mb={2}>
        <Text 
          fontSize={sizeProps[size].fontSize} 
          fontWeight="semibold" 
          color={textColor}
        >
          {label}
        </Text>
        <HStack spacing={2}>
          <Text 
            fontSize="sm" 
            color={subtextColor}
          >
            {current} of {total}
          </Text>
          {showPercentage && (
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              color={textColor}
            >
              {percentage}%
            </Text>
          )}
        </HStack>
      </HStack>
      
      <Box position="relative">
        {/* Background track */}
        <Box
          w="full"
          h={sizeProps[size].height}
          bg={bgColor}
          borderRadius="full"
          overflow="hidden"
        />
        
        {/* Animated progress bar */}
        <MotionBox
          position="absolute"
          top={0}
          left={0}
          h={sizeProps[size].height}
          bg={`linear-gradient(90deg, 
            var(--chakra-colors-${colorScheme}-400), 
            var(--chakra-colors-${colorScheme}-500)
          )`}
          borderRadius="full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
          style={{
            boxShadow: `0 0 10px var(--chakra-colors-${colorScheme}-300)`
          }}
        />
        
        {/* Shimmer effect */}
        {percentage > 0 && (
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            w="30px"
            h={sizeProps[size].height}
            bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
            borderRadius="full"
            initial={{ x: -30 }}
            animate={{ x: `calc(${percentage}% + 30px)` }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        )}
      </Box>
      
      {/* Milestone indicators */}
      {total <= 10 && (
        <HStack 
          justify="space-between" 
          mt={1} 
          px={1}
          position="relative"
        >
          {Array.from({ length: total }, (_, i) => (
            <MotionBox
              key={i}
              w="8px"
              h="8px"
              borderRadius="full"
              bg={i < current ? `${colorScheme}.500` : bgColor}
              border="2px solid"
              borderColor={i < current ? `${colorScheme}.500` : 'gray.300'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: i * 0.1,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </HStack>
      )}
    </Box>
  );
});

export default ModernProgressIndicator;
