import { Box } from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';

interface InnovativeSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Innovative AI Ensemble Spinner
 * Represents multiple AI models working together in a neural network formation
 * Clean, modern, and performance-optimized
 */
export const InnovativeSpinner = memo(({ size = 'md' }: InnovativeSpinnerProps) => {
  const [activeNode, setActiveNode] = useState(0);
  const [connectionPhase, setConnectionPhase] = useState(0);
  const [neuralPulse, setNeuralPulse] = useState(0);
  
  const sizeConfig = {
    sm: { container: 50, node: 6, core: 3 },
    md: { container: 70, node: 8, core: 4 },
    lg: { container: 90, node: 10, core: 5 },
    xl: { container: 110, node: 12, core: 6 }
  };
  
  const config = sizeConfig[size];

  useEffect(() => {
    const nodeInterval = setInterval(() => setActiveNode(n => (n + 1) % 4), 800);
    const connectionInterval = setInterval(() => setConnectionPhase(p => (p + 1) % 6), 300);
    const pulseInterval = setInterval(() => setNeuralPulse(p => (p + 1) % 3), 1200);
    
    return () => {
      clearInterval(nodeInterval);
      clearInterval(connectionInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  // AI model nodes positioned in a clean formation
  const nodes = [
    { x: 0.25, y: 0.25, color: '#6EE7B7', name: 'GPT' },
    { x: 0.75, y: 0.25, color: '#C4B5FD', name: 'Claude' },
    { x: 0.25, y: 0.75, color: '#FCD34D', name: 'Gemini' },
    { x: 0.75, y: 0.75, color: '#93C5FD', name: 'Synthesis' }
  ];

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="status"
      aria-label="AI models processing your request"
      aria-live="polite"
    >
      {/* Neural network connections */}
      <svg
        width={config.container}
        height={config.container}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          opacity: 0.4,
          filter: 'drop-shadow(0 0 2px rgba(79, 156, 249, 0.3))'
        }}
      >
        {/* Cross connections between nodes */}
        {nodes.map((node, i) => 
          nodes.slice(i + 1).map((targetNode, j) => {
            const isActive = connectionPhase === ((i + j) % 6);
            return (
              <line
                key={`${i}-${j}`}
                x1={node.x * config.container}
                y1={node.y * config.container}
                x2={targetNode.x * config.container}
                y2={targetNode.y * config.container}
                stroke={isActive ? '#4F9CF9' : 'rgba(79, 156, 249, 0.2)'}
                strokeWidth={isActive ? 2 : 1}
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  strokeDasharray: isActive ? 'none' : '2,2',
                  filter: isActive ? 'drop-shadow(0 0 4px rgba(79, 156, 249, 0.6))' : 'none'
                }}
              />
            );
          })
        )}
      </svg>

      {/* AI model nodes */}
      {nodes.map((node, i) => {
        const isActive = activeNode === i;
        return (
          <Box
            key={i}
            position="absolute"
            left={`${node.x * config.container - config.node / 2}px`}
            top={`${node.y * config.container - config.node / 2}px`}
            w={`${config.node}px`}
            h={`${config.node}px`}
            borderRadius="50%"
            bg={isActive ? node.color : `${node.color}60`}
            border="2px solid"
            borderColor={isActive ? node.color : 'transparent'}
            transform={isActive ? 'scale(1.4)' : 'scale(1)'}
            transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            boxShadow={isActive ? `0 0 16px ${node.color}80` : 'none'}
            sx={{
              '&::before': isActive ? {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${node.color}, transparent)`,
                zIndex: -1,
                animation: 'rotate 2s linear infinite'
              } : {},
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
        );
      })}

      {/* Central neural core */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w={`${config.core}px`}
        h={`${config.core}px`}
        borderRadius="50%"
        bg="#4F9CF9"
        opacity={neuralPulse === 0 ? 1 : 0.6}
        animation="neuralCore 1.2s ease-in-out infinite"
        sx={{
          '@keyframes neuralCore': {
            '0%, 100%': { 
              transform: 'translate(-50%, -50%) scale(1)',
              opacity: 0.8,
              boxShadow: '0 0 8px rgba(79, 156, 249, 0.4)'
            },
            '50%': { 
              transform: 'translate(-50%, -50%) scale(1.8)',
              opacity: 1,
              boxShadow: '0 0 20px rgba(79, 156, 249, 0.8)'
            }
          }
        }}
      />

      {/* Outer energy ring */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w={`${config.container * 0.9}px`}
        h={`${config.container * 0.9}px`}
        borderRadius="50%"
        border="1px solid"
        borderColor="rgba(79, 156, 249, 0.15)"
        animation="energyRing 3s ease-in-out infinite"
        sx={{
          '@keyframes energyRing': {
            '0%, 100%': { 
              transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
              borderColor: 'rgba(79, 156, 249, 0.15)',
              opacity: 0.6
            },
            '50%': { 
              transform: 'translate(-50%, -50%) scale(1.05) rotate(180deg)',
              borderColor: 'rgba(79, 156, 249, 0.3)',
              opacity: 1
            }
          }
        }}
      />
    </Box>
  );
});

InnovativeSpinner.displayName = 'InnovativeSpinner';

export default InnovativeSpinner;
