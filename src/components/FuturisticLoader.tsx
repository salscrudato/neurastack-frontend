/**
 * Futuristic Loading Animation Component
 * 
 * Ultra-modern, sleek, and innovative loading animation with liquid glass aesthetics,
 * neural network patterns, and quantum field effects.
 */

import { Box, Text, VStack } from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';

interface FuturisticLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  variant?: 'neural' | 'quantum' | 'hologram' | 'matrix';
}

const FuturisticLoader = memo(function FuturisticLoader({
  size = 'md',
  message,
  variant = 'neural'
}: FuturisticLoaderProps) {
  const [phase, setPhase] = useState(0);
  const [energy, setEnergy] = useState(0);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase(prev => (prev + 1) % 360);
    }, 50);

    const energyInterval = setInterval(() => {
      setEnergy(prev => (prev + 1) % 100);
    }, 100);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(energyInterval);
    };
  }, []);

  const sizeMap = {
    sm: { container: '60px', core: '8px', orbit: '20px' },
    md: { container: '80px', core: '12px', orbit: '28px' },
    lg: { container: '100px', core: '16px', orbit: '36px' },
    xl: { container: '120px', core: '20px', orbit: '44px' }
  };

  const { container, core, orbit } = sizeMap[size];

  if (variant === 'neural') {
    return (
      <VStack spacing={4} align="center">
        <Box
          position="relative"
          w={container}
          h={container}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Quantum Field Background */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="100%"
            h="100%"
            bg={`conic-gradient(from ${phase * 2}deg,
              rgba(79, 156, 249, 0.1) 0deg,
              rgba(139, 92, 246, 0.2) 72deg,
              rgba(99, 102, 241, 0.15) 144deg,
              rgba(59, 130, 246, 0.1) 216deg,
              rgba(37, 99, 235, 0.08) 288deg,
              rgba(79, 156, 249, 0.1) 360deg
            )`}
            borderRadius="50%"
            filter="blur(16px)"
            animation="quantumField 4s ease-in-out infinite"
            sx={{
              '@keyframes quantumField': {
                '0%, 100%': { 
                  transform: 'translate(-50%, -50%) rotate(0deg) scale(0.8)',
                  opacity: 0.3,
                  filter: 'blur(16px) saturate(0.8)'
                },
                '50%': { 
                  transform: 'translate(-50%, -50%) rotate(180deg) scale(1.2)',
                  opacity: 0.7,
                  filter: 'blur(20px) saturate(1.3)'
                }
              }
            }}
          />

          {/* Neural Network Nodes */}
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const angle = (index * 60) + (phase * 1.5);
            const radius = parseInt(orbit);
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const isActive = Math.floor(energy / 16.67) === index;
            
            return (
              <Box
                key={index}
                position="absolute"
                top="50%"
                left="50%"
                transform={`translate(-50%, -50%) translate(${x}px, ${y}px)`}
                w={isActive ? '8px' : '6px'}
                h={isActive ? '8px' : '6px'}
                bg={isActive 
                  ? `radial-gradient(circle, 
                      rgba(255, 255, 255, 1) 0%, 
                      rgba(79, 156, 249, 1) 20%, 
                      rgba(139, 92, 246, 0.8) 60%, 
                      rgba(99, 102, 241, 0.4) 100%)`
                  : `radial-gradient(circle, 
                      rgba(255, 255, 255, 0.6) 0%, 
                      rgba(79, 156, 249, 0.4) 40%, 
                      rgba(139, 92, 246, 0.2) 100%)`
                }
                borderRadius="50%"
                boxShadow={isActive 
                  ? `0 0 20px rgba(79, 156, 249, 0.8), 
                     0 0 40px rgba(139, 92, 246, 0.4),
                     inset 0 0 4px rgba(255, 255, 255, 0.8)`
                  : `0 0 8px rgba(79, 156, 249, 0.3)`
                }
                animation={isActive 
                  ? "neuralActivation 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)" 
                  : "neuralIdle 3s ease-in-out infinite"
                }
                sx={{
                  '@keyframes neuralActivation': {
                    '0%': { 
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(0.8)`,
                      filter: 'brightness(1)'
                    },
                    '50%': { 
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(2)`,
                      filter: 'brightness(1.5)'
                    },
                    '100%': { 
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.2)`,
                      filter: 'brightness(1.2)'
                    }
                  },
                  '@keyframes neuralIdle': {
                    '0%, 100%': { 
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`,
                      filter: 'brightness(0.8)'
                    },
                    '50%': { 
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.1)`,
                      filter: 'brightness(1)'
                    }
                  }
                }}
              />
            );
          })}

          {/* Neural Connections */}
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const nextIndex = (index + 1) % 6;
            const angle1 = (index * 60) + (phase * 1.5);
            const angle2 = (nextIndex * 60) + (phase * 1.5);
            const radius = parseInt(orbit);
            
            const x1 = Math.cos((angle1 * Math.PI) / 180) * radius;
            const y1 = Math.sin((angle1 * Math.PI) / 180) * radius;
            const x2 = Math.cos((angle2 * Math.PI) / 180) * radius;
            const y2 = Math.sin((angle2 * Math.PI) / 180) * radius;
            
            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            
            const isActive = Math.floor(energy / 16.67) === index || Math.floor(energy / 16.67) === nextIndex;
            
            return (
              <Box
                key={`connection-${index}`}
                position="absolute"
                top="50%"
                left="50%"
                transform={`translate(-50%, -50%) translate(${x1}px, ${y1}px) rotate(${angle}deg)`}
                w={`${length}px`}
                h="1px"
                bg={isActive 
                  ? `linear-gradient(90deg,
                      rgba(79, 156, 249, 0.8) 0%,
                      rgba(139, 92, 246, 1) 50%,
                      rgba(99, 102, 241, 0.8) 100%)`
                  : `linear-gradient(90deg,
                      rgba(79, 156, 249, 0.2) 0%,
                      rgba(139, 92, 246, 0.3) 50%,
                      rgba(99, 102, 241, 0.2) 100%)`
                }
                transformOrigin="left center"
                animation={isActive ? "connectionPulse 0.8s ease-out" : "none"}
                sx={{
                  '@keyframes connectionPulse': {
                    '0%': { 
                      opacity: 0.3,
                      transform: `translate(-50%, -50%) translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(0.5)`,
                      filter: 'blur(1px)'
                    },
                    '50%': { 
                      opacity: 1,
                      transform: `translate(-50%, -50%) translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(1.2)`,
                      filter: 'blur(0px)'
                    },
                    '100%': { 
                      opacity: 0.6,
                      transform: `translate(-50%, -50%) translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(1)`,
                      filter: 'blur(0.5px)'
                    }
                  }
                }}
              />
            );
          })}

          {/* Central Core */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w={core}
            h={core}
            bg={`radial-gradient(circle, 
              rgba(255, 255, 255, 1) 0%, 
              rgba(79, 156, 249, 0.9) 30%, 
              rgba(139, 92, 246, 0.7) 70%, 
              rgba(99, 102, 241, 0.3) 100%)`}
            borderRadius="50%"
            boxShadow={`0 0 ${parseInt(core) * 2}px rgba(79, 156, 249, 0.8),
                       0 0 ${parseInt(core) * 3}px rgba(139, 92, 246, 0.4),
                       inset 0 0 4px rgba(255, 255, 255, 0.9)`}
            animation="coreBreath 2s ease-in-out infinite"
            sx={{
              '@keyframes coreBreath': {
                '0%, 100%': { 
                  transform: 'translate(-50%, -50%) scale(1)',
                  filter: 'brightness(1) saturate(1)'
                },
                '50%': { 
                  transform: 'translate(-50%, -50%) scale(1.3)',
                  filter: 'brightness(1.4) saturate(1.3)'
                }
              }
            }}
          />
        </Box>

        {message && (
          <Text
            fontSize="sm"
            color="gray.600"
            textAlign="center"
            fontWeight="500"
            letterSpacing="0.5px"
            opacity={0.9}
            animation="messageGlow 2s ease-in-out infinite"
            sx={{
              '@keyframes messageGlow': {
                '0%, 100%': { opacity: 0.6 },
                '50%': { opacity: 1 }
              }
            }}
          >
            {message}
          </Text>
        )}
      </VStack>
    );
  }

  // Add other variants here (quantum, hologram, matrix)
  return null;
});

export default FuturisticLoader;
