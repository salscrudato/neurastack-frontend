import { Box, type BoxProps } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React from 'react';
import { useOptimizedDevice } from '../../../hooks/core/useOptimizedDevice';

// ============================================================================
// Types
// ============================================================================

export interface LoadingSpinnerProps extends Omit<BoxProps, 'variant'> {
  /** Spinner variant */
  variant?: 'dots' | 'pulse' | 'wave' | 'gradient' | 'minimal';
  
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Custom color */
  color?: string;
  
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';
  
  /** Show text label */
  label?: string;
}

// ============================================================================
// Animations
// ============================================================================

const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
`;

const waveAnimation = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const breatheAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
`;

// ============================================================================
// Styles
// ============================================================================

const getSizeStyles = (size: LoadingSpinnerProps['size']) => {
  switch (size) {
    case 'sm':
      return { width: '16px', height: '16px', fontSize: 'xs' };
    case 'md':
      return { width: '24px', height: '24px', fontSize: 'sm' };
    case 'lg':
      return { width: '32px', height: '32px', fontSize: 'md' };
    case 'xl':
      return { width: '48px', height: '48px', fontSize: 'lg' };
    default:
      return { width: '24px', height: '24px', fontSize: 'sm' };
  }
};

const getSpeedStyles = (speed: LoadingSpinnerProps['speed']) => {
  switch (speed) {
    case 'slow':
      return '2s';
    case 'normal':
      return '1.5s';
    case 'fast':
      return '1s';
    default:
      return '1.5s';
  }
};

// ============================================================================
// Spinner Variants
// ============================================================================

const DotsSpinner: React.FC<{ size: string; speed: string; color: string }> = ({ size, speed, color }) => (
  <Box display="flex" alignItems="center" gap={1}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        width={size}
        height={size}
        borderRadius="full"
        bg={color}
        animation={`${pulseAnimation} ${speed} infinite ease-in-out`}
        sx={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </Box>
);

const PulseSpinner: React.FC<{ size: string; speed: string; color: string }> = ({ size, speed, color }) => (
  <Box
    width={size}
    height={size}
    borderRadius="full"
    bg={color}
    animation={`${breatheAnimation} ${speed} infinite ease-in-out`}
  />
);

const WaveSpinner: React.FC<{ size: string; speed: string; color: string }> = ({ size, speed, color }) => (
  <Box display="flex" alignItems="center" gap={1}>
    {[0, 1, 2, 3, 4].map((i) => (
      <Box
        key={i}
        width="3px"
        height={size}
        bg={color}
        borderRadius="full"
        animation={`${waveAnimation} ${speed} infinite ease-in-out`}
        sx={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </Box>
);

const GradientSpinner: React.FC<{ size: string; speed: string }> = ({ size, speed }) => (
  <Box
    width={size}
    height={size}
    borderRadius="full"
    background="linear-gradient(45deg, #4F9CF9, #8B5CF6, #06B6D4, #10B981)"
    backgroundSize="300% 300%"
    animation={`${gradientAnimation} ${speed} infinite ease-in-out`}
  />
);

const MinimalSpinner: React.FC<{ size: string; speed: string; color: string }> = ({ size, speed, color }) => (
  <Box
    width={size}
    height={size}
    border="2px solid transparent"
    borderTop={`2px solid ${color}`}
    borderRadius="full"
    animation={`${spinAnimation} ${speed} linear infinite`}
  />
);

// ============================================================================
// Component
// ============================================================================

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'gradient',
  size = 'md',
  color = '#4F9CF9',
  speed = 'normal',
  label,
  ...props
}) => {
  const { config } = useOptimizedDevice();
  
  // Disable animations if user prefers reduced motion
  if (config.shouldReduceAnimations) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        {...props}
      >
        <Box
          width={getSizeStyles(size).width}
          height={getSizeStyles(size).height}
          borderRadius="full"
          bg={color}
          opacity={0.6}
        />
        {label && (
          <Box
            fontSize={getSizeStyles(size).fontSize}
            color="gray.600"
            fontWeight="500"
          >
            {label}
          </Box>
        )}
      </Box>
    );
  }

  const sizeStyles = getSizeStyles(size);
  const animationSpeed = getSpeedStyles(speed);

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner size={sizeStyles.width} speed={animationSpeed} color={color} />;
      case 'pulse':
        return <PulseSpinner size={sizeStyles.width} speed={animationSpeed} color={color} />;
      case 'wave':
        return <WaveSpinner size={sizeStyles.width} speed={animationSpeed} color={color} />;
      case 'gradient':
        return <GradientSpinner size={sizeStyles.width} speed={animationSpeed} />;
      case 'minimal':
        return <MinimalSpinner size={sizeStyles.width} speed={animationSpeed} color={color} />;
      default:
        return <GradientSpinner size={sizeStyles.width} speed={animationSpeed} />;
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      {...props}
    >
      {renderSpinner()}
      {label && (
        <Box
          fontSize={sizeStyles.fontSize}
          color="gray.600"
          fontWeight="500"
          textAlign="center"
        >
          {label}
        </Box>
      )}
    </Box>
  );
};

export default LoadingSpinner;
