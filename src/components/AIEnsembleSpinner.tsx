import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';

interface AIEnsembleSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showModels?: boolean;
}

/**
 * Innovative AI Ensemble Loading Spinner
 * Depicts multiple AI models working together in a neural network formation
 */
export const AIEnsembleSpinner = memo(({ 
  size = 'md', 
  message = 'AI models ensembling...', 
  showModels = true 
}: AIEnsembleSpinnerProps) => {
  const [activeModel, setActiveModel] = useState(0);
  const [connectionPhase, setConnectionPhase] = useState(0);
  const [neuralActivity, setNeuralActivity] = useState(0);

  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Size configurations
  const sizeConfig = {
    sm: { container: 60, node: 8, text: 'xs' },
    md: { container: 80, node: 10, text: 'sm' },
    lg: { container: 100, node: 12, text: 'md' },
    xl: { container: 120, node: 14, text: 'lg' }
  };

  const config = sizeConfig[size];

  // AI Models configuration with muted colors
  const aiModels = [
    { name: 'GPT-4o', color: '#6EE7B7', position: { x: 0.2, y: 0.3 } },
    { name: 'Claude', color: '#C4B5FD', position: { x: 0.8, y: 0.3 } },
    { name: 'Gemini', color: '#FCD34D', position: { x: 0.5, y: 0.1 } },
    { name: 'Synthesis', color: '#93C5FD', position: { x: 0.5, y: 0.7 } }
  ];

  useEffect(() => {
    // Model activation cycle
    const modelInterval = setInterval(() => {
      setActiveModel(prev => (prev + 1) % aiModels.length);
    }, 800);

    // Connection animation cycle
    const connectionInterval = setInterval(() => {
      setConnectionPhase(prev => (prev + 1) % 4);
    }, 600);

    // Neural activity pulse
    const neuralInterval = setInterval(() => {
      setNeuralActivity(prev => (prev + 1) % 8);
    }, 200);

    return () => {
      clearInterval(modelInterval);
      clearInterval(connectionInterval);
      clearInterval(neuralInterval);
    };
  }, [aiModels.length]);

  return (
    <Flex direction="column" align="center" gap={4}>
      {/* Neural Network Visualization */}
      <Box
        position="relative"
        width={`${config.container}px`}
        height={`${config.container}px`}
      >
        {/* Background Neural Grid */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          background={`
            radial-gradient(circle at 20% 30%, #CBD5E1 1px, transparent 1px),
            radial-gradient(circle at 80% 30%, #CBD5E1 1px, transparent 1px),
            radial-gradient(circle at 50% 10%, #CBD5E1 1px, transparent 1px),
            radial-gradient(circle at 50% 70%, #CBD5E1 1px, transparent 1px)
          `}
          backgroundSize="100% 100%"
          animation="neuralGrid 3s ease-in-out infinite"
          sx={{
            '@keyframes neuralGrid': {
              '0%, 100%': { opacity: 0.1 },
              '50%': { opacity: 0.3 }
            }
          }}
        />

        {/* Connection Lines */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {aiModels.map((model, index) => {
            const nextModel = aiModels[(index + 1) % aiModels.length];
            const isActive = connectionPhase === index;
            
            return (
              <line
                key={`connection-${index}`}
                x1={`${model.position.x * 100}%`}
                y1={`${model.position.y * 100}%`}
                x2={`${nextModel.position.x * 100}%`}
                y2={`${nextModel.position.y * 100}%`}
                stroke={isActive ? model.color : 'rgba(203, 213, 225, 0.4)'}
                strokeWidth={isActive ? "1.5" : "1"}
                opacity={isActive ? 0.8 : 0.3}
                style={{
                  transition: 'all 0.3s ease',
                  filter: isActive ? `drop-shadow(0 0 4px ${model.color})` : 'none'
                }}
              />
            );
          })}
          
          {/* Central convergence lines */}
          {aiModels.slice(0, 3).map((model, index) => (
            <line
              key={`convergence-${index}`}
              x1={`${model.position.x * 100}%`}
              y1={`${model.position.y * 100}%`}
              x2="50%"
              y2="70%"
              stroke={activeModel === index ? model.color : 'rgba(203, 213, 225, 0.3)'}
              strokeWidth={activeModel === index ? "1.5" : "1"}
              opacity={activeModel === index ? 0.7 : 0.2}
              style={{
                transition: 'all 0.4s ease',
                filter: activeModel === index ? `drop-shadow(0 0 3px ${model.color})` : 'none'
              }}
            />
          ))}
        </svg>

        {/* AI Model Nodes */}
        {aiModels.map((model, index) => {
          const isActive = activeModel === index;
          const isPulsing = neuralActivity % 4 === index;
          
          return (
            <Box
              key={model.name}
              position="absolute"
              left={`${model.position.x * 100}%`}
              top={`${model.position.y * 100}%`}
              transform="translate(-50%, -50%)"
              width={`${config.node + (isActive ? 4 : 0)}px`}
              height={`${config.node + (isActive ? 4 : 0)}px`}
              borderRadius="full"
              bg={model.color}
              boxShadow={isActive ? 
                `0 0 20px ${model.color}, 0 0 40px ${model.color}40` : 
                `0 0 8px ${model.color}60`
              }
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              animation={isPulsing ? 'modelPulse 0.6s ease-out' : 'none'}
              sx={{
                '@keyframes modelPulse': {
                  '0%': { transform: 'translate(-50%, -50%) scale(1)' },
                  '50%': { transform: 'translate(-50%, -50%) scale(1.3)' },
                  '100%': { transform: 'translate(-50%, -50%) scale(1)' }
                }
              }}
            >
              {/* Inner glow */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width="60%"
                height="60%"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.8)"
                animation="innerGlow 2s ease-in-out infinite"
                sx={{
                  '@keyframes innerGlow': {
                    '0%, 100%': { opacity: 0.6, transform: 'translate(-50%, -50%) scale(0.8)' },
                    '50%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
                  }
                }}
              />
              
              {/* Model label */}
              {showModels && isActive && (
                <Text
                  position="absolute"
                  top="-24px"
                  left="50%"
                  transform="translateX(-50%)"
                  fontSize="2xs"
                  fontWeight="600"
                  color={model.color}
                  whiteSpace="nowrap"
                  textShadow={`0 0 8px ${model.color}`}
                  animation="fadeInOut 0.8s ease-in-out"
                  sx={{
                    '@keyframes fadeInOut': {
                      '0%': { opacity: 0, transform: 'translateX(-50%) translateY(4px)' },
                      '50%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
                      '100%': { opacity: 0, transform: 'translateX(-50%) translateY(-4px)' }
                    }
                  }}
                >
                  {model.name}
                </Text>
              )}
            </Box>
          );
        })}

        {/* Central Processing Indicator */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="4px"
          height="4px"
          borderRadius="full"
          bg="#94A3B8"
          animation="centralPulse 2s ease-in-out infinite"
          sx={{
            '@keyframes centralPulse': {
              '0%, 100%': {
                transform: 'translate(-50%, -50%) scale(1)',
                boxShadow: '0 0 0 0 rgba(148, 163, 184, 0.5)'
              },
              '50%': {
                transform: 'translate(-50%, -50%) scale(1.3)',
                boxShadow: '0 0 0 6px rgba(148, 163, 184, 0)'
              }
            }
          }}
        />
      </Box>

      {/* Status Message */}
      {message && (
        <Text
          fontSize={config.text}
          color={textColor}
          textAlign="center"
          fontWeight="500"
          letterSpacing="0.3px"
          opacity={0.8}
          fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
          animation="messageGlow 3s ease-in-out infinite"
          sx={{
            '@keyframes messageGlow': {
              '0%, 100%': { opacity: 0.8 },
              '50%': { opacity: 1 }
            }
          }}
        >
          {message}
        </Text>
      )}
    </Flex>
  );
});

AIEnsembleSpinner.displayName = 'AIEnsembleSpinner';

export default AIEnsembleSpinner;
