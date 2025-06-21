import {
    Box,
    Flex,
    HStack,
    Skeleton,
    SkeletonText,
    Spinner,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';
import FuturisticLoader from './FuturisticLoader';

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'skeleton' | 'team' | 'futuristic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  lines?: number; // For skeleton variant
}

const LoadingDots = memo(({ size = 'md' }: { size?: string }) => {
  const dotSize = size === 'sm' ? '5px' : size === 'lg' ? '10px' : '7px';
  const glowColor = useColorModeValue('rgba(79, 156, 249, 0.25)', 'rgba(96, 165, 250, 0.4)');
  const [dotPhase, setDotPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotPhase(prev => (prev + 1) % 6);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <Flex align="center" gap={4} position="relative" py={3}>
      {/* Quantum field background */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="120px"
        h="32px"
        bg={`conic-gradient(from ${dotPhase * 60}deg,
          ${glowColor} 0deg,
          rgba(139, 92, 246, 0.3) 120deg,
          rgba(99, 102, 241, 0.25) 240deg,
          ${glowColor} 360deg
        )`}
        borderRadius="full"
        filter="blur(16px)"
        animation="quantumFieldBreathe 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite"
        sx={{
          '@keyframes quantumFieldBreathe': {
            '0%, 100%': {
              opacity: 0.3,
              transform: 'translate(-50%, -50%) scale(0.8) rotate(0deg)',
              filter: 'blur(16px) saturate(0.8)'
            },
            '33%': {
              opacity: 0.7,
              transform: 'translate(-50%, -50%) scale(1.2) rotate(120deg)',
              filter: 'blur(20px) saturate(1.2)'
            },
            '66%': {
              opacity: 0.9,
              transform: 'translate(-50%, -50%) scale(1.4) rotate(240deg)',
              filter: 'blur(24px) saturate(1.4)'
            }
          }
        }}
      />

      {/* Secondary field layer */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="80px"
        h="20px"
        bg="radial-gradient(ellipse, rgba(79, 156, 249, 0.2) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 80%)"
        borderRadius="full"
        filter="blur(8px)"
        animation="secondaryField 3.2s ease-in-out infinite 0.5s"
        sx={{
          '@keyframes secondaryField': {
            '0%, 100%': {
              opacity: 0.4,
              transform: 'translate(-50%, -50%) scale(0.9)',
              filter: 'blur(8px)'
            },
            '50%': {
              opacity: 0.8,
              transform: 'translate(-50%, -50%) scale(1.3)',
              filter: 'blur(12px)'
            }
          }
        }}
      />

      {/* Enhanced animated dots with sophisticated styling */}
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          w={dotSize}
          h={dotSize}
          bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 50%, #6366F1 100%)"
          borderRadius="full"
          position="relative"
          animation={`sophisticatedPulse 2.4s ease-in-out ${i * 0.3}s infinite both`}
          filter="blur(0.5px)"
          sx={{
            '@keyframes sophisticatedPulse': {
              '0%, 70%, 100%': {
                transform: 'scale(0.4) translateY(0px)',
                opacity: 0.5,
                boxShadow: '0 0 0 0 rgba(79, 156, 249, 0.8)',
                filter: 'blur(0.5px)'
              },
              '35%': {
                transform: 'scale(1.2) translateY(-2px)',
                opacity: 1,
                boxShadow: '0 4px 20px 8px rgba(79, 156, 249, 0.4)',
                filter: 'blur(0px)'
              }
            },
            '@keyframes innerShimmer': {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 0.8 }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              w: '60%',
              h: '60%',
              bg: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
              borderRadius: 'full',
              opacity: 0.4,
              animation: `innerShimmer 2.4s ease-in-out ${i * 0.3}s infinite both`,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              w: '120%',
              h: '120%',
              bg: 'radial-gradient(circle, rgba(79, 156, 249, 0.2) 0%, transparent 50%)',
              borderRadius: 'full',
              opacity: 0.6,
              animation: `outerGlow 2.4s ease-in-out ${i * 0.3}s infinite both`,
            }
          }}
        />
      ))}

      {/* Connecting energy lines */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="calc(100% - 16px)"
        h="1px"
        bg="linear-gradient(90deg, transparent 0%, rgba(79, 156, 249, 0.3) 20%, rgba(139, 92, 246, 0.4) 50%, rgba(79, 156, 249, 0.3) 80%, transparent 100%)"
        animation="energyFlow 2.4s ease-in-out infinite"
        sx={{
          '@keyframes energyFlow': {
            '0%, 100%': { opacity: 0.2, transform: 'translate(-50%, -50%) scaleX(0.5)' },
            '50%': { opacity: 0.8, transform: 'translate(-50%, -50%) scaleX(1)' }
          },
          '@keyframes outerGlow': {
            '0%, 70%, 100%': { opacity: 0.2, transform: 'translate(-50%, -50%) scale(0.8)' },
            '35%': { opacity: 0.6, transform: 'translate(-50%, -50%) scale(1.2)' }
          }
        }}
      />
    </Flex>
  );
});

LoadingDots.displayName = 'LoadingDots';

const WaveAnimation = memo(({ size = 'md' }: { size?: string }) => {
  const waveHeight = size === 'sm' ? '1.8px' : size === 'lg' ? '3px' : '2.4px';
  const lineCount = 60; // Increased density for ultra-smooth motion
  const containerHeight = size === 'sm' ? '40px' : size === 'lg' ? '56px' : '48px';

  // Enhanced performance optimization with smoother phase transitions
  const [animationPhase, setAnimationPhase] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(0);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 8); // More phases for smoother transitions
    }, 2500);

    const energyInterval = setInterval(() => {
      setEnergyLevel(prev => (prev + 1) % 6);
    }, 1800);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(energyInterval);
    };
  }, []);

  return (
    <Box
      position="relative"
      w="100%"
      h={containerHeight}
      overflow="hidden"
      borderRadius="3xl" // More rounded for modern look
      bg={`linear-gradient(135deg,
        rgba(79, 156, 249, ${0.03 + animationPhase * 0.008}) 0%,
        rgba(139, 92, 246, ${0.04 + animationPhase * 0.006}) 35%,
        rgba(99, 102, 241, ${0.03 + animationPhase * 0.007}) 70%,
        rgba(59, 130, 246, ${0.02 + animationPhase * 0.005}) 100%
      )`}
      boxShadow="inset 0 2px 6px rgba(79, 156, 249, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `conic-gradient(from ${animationPhase * 45}deg,
          rgba(79, 156, 249, 0.06) 0deg,
          rgba(139, 92, 246, 0.10) 60deg,
          rgba(99, 102, 241, 0.08) 120deg,
          rgba(59, 130, 246, 0.06) 180deg,
          rgba(37, 99, 235, 0.04) 240deg,
          rgba(29, 78, 216, 0.05) 300deg,
          rgba(79, 156, 249, 0.06) 360deg
        )`,
        borderRadius: '3xl',
        opacity: 0.8,
        animation: 'quantumBreathe 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: '1px',
        left: '1px',
        right: '1px',
        bottom: '1px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)',
        borderRadius: '3xl',
        pointerEvents: 'none',
      }}
      sx={{
        '@keyframes quantumBreathe': {
          '0%, 100%': {
            opacity: 0.5,
            transform: 'scale(1) rotate(0deg)',
            filter: 'blur(0px) saturate(1)'
          },
          '20%': {
            opacity: 0.7,
            transform: 'scale(1.01) rotate(45deg)',
            filter: 'blur(0.3px) saturate(1.1)'
          },
          '40%': {
            opacity: 0.9,
            transform: 'scale(1.03) rotate(90deg)',
            filter: 'blur(0.8px) saturate(1.3)'
          },
          '60%': {
            opacity: 1,
            transform: 'scale(1.05) rotate(135deg)',
            filter: 'blur(1.2px) saturate(1.5)'
          },
          '80%': {
            opacity: 0.8,
            transform: 'scale(1.02) rotate(180deg)',
            filter: 'blur(0.6px) saturate(1.2)'
          }
        },
        willChange: 'transform, opacity, filter',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Ultra-smooth quantum wave lines with enhanced fluidity */}
      <Flex align="center" justify="space-between" h="100%" w="100%" px={0.5}>
        {Array.from({ length: lineCount }, (_, i) => {
          const delay = i * 0.04; // Optimized stagger for liquid motion
          const phase = (i / lineCount) * Math.PI * 6; // More complex wave pattern
          const intensity = Math.sin(phase + energyLevel) * 0.4 + 0.6; // Dynamic intensity
          const waveGroup = Math.floor(i / 10); // Group waves for coordinated motion

          return (
            <Box
              key={i}
              w={waveHeight}
              bg={`linear-gradient(180deg,
                rgba(79, 156, 249, ${0.7 + intensity * 0.3}) 0%,
                rgba(59, 130, 246, ${0.85 + intensity * 0.15}) 15%,
                rgba(37, 99, 235, ${0.95 + intensity * 0.05}) 30%,
                rgba(29, 78, 216, 1) 45%,
                rgba(37, 99, 235, ${0.95 + intensity * 0.05}) 55%,
                rgba(59, 130, 246, ${0.85 + intensity * 0.15}) 70%,
                rgba(79, 156, 249, ${0.7 + intensity * 0.3}) 85%,
                rgba(139, 92, 246, ${0.6 + intensity * 0.2}) 100%
              )`}
              borderRadius="full"
              position="relative"
              animation={`fluidWaveMotion${waveGroup} 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s infinite`}
              filter={`blur(${0.2 + Math.sin(phase) * 0.15}px) saturate(${1.1 + intensity * 0.2})`}
              _before={{
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '85%',
                height: '85%',
                background: `radial-gradient(ellipse,
                  rgba(255, 255, 255, ${0.5 + intensity * 0.3}) 0%,
                  rgba(79, 156, 249, ${0.1 + intensity * 0.1}) 40%,
                  transparent 75%
                )`,
                borderRadius: 'full',
                opacity: 0.9,
                animation: `enhancedInnerGlow${waveGroup} 2.8s ease-in-out ${delay}s infinite`,
              }}
              _after={{
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '160%',
                height: '160%',
                background: `conic-gradient(from ${i * 6 + energyLevel * 15}deg,
                  rgba(79, 156, 249, ${0.08 + intensity * 0.04}) 0deg,
                  rgba(139, 92, 246, ${0.15 + intensity * 0.05}) 72deg,
                  rgba(99, 102, 241, ${0.12 + intensity * 0.03}) 144deg,
                  rgba(59, 130, 246, ${0.10 + intensity * 0.04}) 216deg,
                  rgba(37, 99, 235, ${0.08 + intensity * 0.02}) 288deg,
                  rgba(79, 156, 249, ${0.08 + intensity * 0.04}) 360deg
                )`,
                borderRadius: 'full',
                opacity: 0.6,
                animation: `quantumAura${waveGroup} 4.2s linear ${delay * 0.3}s infinite`,
              }}
              sx={{
                [`@keyframes fluidWaveMotion${waveGroup}`]: {
                  '0%': {
                    height: '2px',
                    opacity: 0.2,
                    transform: 'scaleY(0.15) scaleX(0.8) rotateZ(0deg)',
                    boxShadow: `0 0 2px rgba(79, 156, 249, 0.15)`
                  },
                  '12%': {
                    height: '8px',
                    opacity: 0.5,
                    transform: 'scaleY(0.4) scaleX(0.95) rotateZ(0.5deg)',
                    boxShadow: `0 0 4px rgba(79, 156, 249, 0.25)`
                  },
                  '25%': {
                    height: '18px',
                    opacity: 0.75,
                    transform: 'scaleY(0.7) scaleX(1.08) rotateZ(1deg)',
                    boxShadow: `0 0 8px rgba(79, 156, 249, 0.4)`
                  },
                  '40%': {
                    height: '28px',
                    opacity: 0.9,
                    transform: 'scaleY(0.9) scaleX(1.18) rotateZ(1.5deg)',
                    boxShadow: `0 0 12px rgba(79, 156, 249, 0.6)`
                  },
                  '50%': {
                    height: '36px',
                    opacity: 1,
                    transform: 'scaleY(1) scaleX(1.25) rotateZ(2deg)',
                    boxShadow: `0 0 18px rgba(79, 156, 249, 0.8)`
                  },
                  '60%': {
                    height: '28px',
                    opacity: 0.9,
                    transform: 'scaleY(0.9) scaleX(1.18) rotateZ(1.5deg)',
                    boxShadow: `0 0 12px rgba(79, 156, 249, 0.6)`
                  },
                  '75%': {
                    height: '18px',
                    opacity: 0.75,
                    transform: 'scaleY(0.7) scaleX(1.08) rotateZ(1deg)',
                    boxShadow: `0 0 8px rgba(79, 156, 249, 0.4)`
                  },
                  '88%': {
                    height: '8px',
                    opacity: 0.5,
                    transform: 'scaleY(0.4) scaleX(0.95) rotateZ(0.5deg)',
                    boxShadow: `0 0 4px rgba(79, 156, 249, 0.25)`
                  },
                  '100%': {
                    height: '2px',
                    opacity: 0.2,
                    transform: 'scaleY(0.15) scaleX(0.8) rotateZ(0deg)',
                    boxShadow: `0 0 2px rgba(79, 156, 249, 0.15)`
                  }
                },
                [`@keyframes enhancedInnerGlow${waveGroup}`]: {
                  '0%, 100%': {
                    opacity: 0.4,
                    transform: 'translate(-50%, -50%) scale(0.7) rotate(0deg)',
                    filter: 'blur(0.5px)'
                  },
                  '25%': {
                    opacity: 0.7,
                    transform: 'translate(-50%, -50%) scale(1.0) rotate(90deg)',
                    filter: 'blur(0.3px)'
                  },
                  '50%': {
                    opacity: 1,
                    transform: 'translate(-50%, -50%) scale(1.3) rotate(180deg)',
                    filter: 'blur(0px)'
                  },
                  '75%': {
                    opacity: 0.7,
                    transform: 'translate(-50%, -50%) scale(1.0) rotate(270deg)',
                    filter: 'blur(0.3px)'
                  }
                },
                [`@keyframes quantumAura${waveGroup}`]: {
                  '0%': {
                    transform: 'translate(-50%, -50%) rotate(0deg) scale(0.9)',
                    opacity: 0.3,
                    filter: 'blur(1px) saturate(0.8)'
                  },
                  '33%': {
                    transform: 'translate(-50%, -50%) rotate(120deg) scale(1.2)',
                    opacity: 0.7,
                    filter: 'blur(1.5px) saturate(1.2)'
                  },
                  '66%': {
                    transform: 'translate(-50%, -50%) rotate(240deg) scale(1.0)',
                    opacity: 0.5,
                    filter: 'blur(1.2px) saturate(1.0)'
                  },
                  '100%': {
                    transform: 'translate(-50%, -50%) rotate(360deg) scale(0.9)',
                    opacity: 0.3,
                    filter: 'blur(1px) saturate(0.8)'
                  }
                }
              }}
            />
          );
        })}
      </Flex>

      {/* Enhanced quantum energy streams with multiple layers */}
      <Box
        position="absolute"
        top="35%"
        left="-180px"
        w="180px"
        h="2.5px"
        bg="linear-gradient(90deg,
          transparent 0%,
          rgba(79, 156, 249, 0.2) 5%,
          rgba(59, 130, 246, 0.6) 15%,
          rgba(37, 99, 235, 0.9) 30%,
          rgba(29, 78, 216, 1) 50%,
          rgba(37, 99, 235, 0.9) 70%,
          rgba(139, 92, 246, 0.6) 85%,
          rgba(99, 102, 241, 0.2) 95%,
          transparent 100%
        )"
        transform="translateY(-50%)"
        animation="primaryQuantumFlow 3.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite"
        filter="blur(0.6px)"
        sx={{
          '@keyframes primaryQuantumFlow': {
            '0%': {
              left: '-180px',
              opacity: 0,
              transform: 'translateY(-50%) scaleX(0.2) rotateZ(0deg) skewX(0deg)',
              filter: 'blur(1.2px) hue-rotate(0deg) saturate(0.8)'
            },
            '8%': {
              opacity: 0.4,
              transform: 'translateY(-50%) scaleX(0.6) rotateZ(0.5deg) skewX(1deg)',
              filter: 'blur(0.9px) hue-rotate(10deg) saturate(1.0)'
            },
            '15%': {
              opacity: 0.8,
              transform: 'translateY(-50%) scaleX(1.0) rotateZ(1deg) skewX(2deg)',
              filter: 'blur(0.6px) hue-rotate(20deg) saturate(1.3)'
            },
            '25%': {
              opacity: 1,
              transform: 'translateY(-50%) scaleX(1.4) rotateZ(1.5deg) skewX(3deg)',
              filter: 'blur(0.3px) hue-rotate(35deg) saturate(1.5)'
            },
            '75%': {
              opacity: 1,
              transform: 'translateY(-50%) scaleX(1.4) rotateZ(-1.5deg) skewX(-3deg)',
              filter: 'blur(0.3px) hue-rotate(-35deg) saturate(1.5)'
            },
            '85%': {
              opacity: 0.8,
              transform: 'translateY(-50%) scaleX(1.0) rotateZ(-1deg) skewX(-2deg)',
              filter: 'blur(0.6px) hue-rotate(-20deg) saturate(1.3)'
            },
            '92%': {
              opacity: 0.4,
              transform: 'translateY(-50%) scaleX(0.6) rotateZ(-0.5deg) skewX(-1deg)',
              filter: 'blur(0.9px) hue-rotate(-10deg) saturate(1.0)'
            },
            '100%': {
              left: 'calc(100% + 180px)',
              opacity: 0,
              transform: 'translateY(-50%) scaleX(0.2) rotateZ(0deg) skewX(0deg)',
              filter: 'blur(1.2px) hue-rotate(0deg) saturate(0.8)'
            }
          }
        }}
      />

      {/* Secondary quantum stream with enhanced dynamics */}
      <Box
        position="absolute"
        top="65%"
        left="-120px"
        w="120px"
        h="1.5px"
        bg="linear-gradient(90deg,
          transparent 0%,
          rgba(139, 92, 246, 0.3) 10%,
          rgba(99, 102, 241, 0.6) 25%,
          rgba(79, 156, 249, 0.8) 45%,
          rgba(59, 130, 246, 0.9) 55%,
          rgba(37, 99, 235, 0.8) 75%,
          rgba(139, 92, 246, 0.3) 90%,
          transparent 100%
        )"
        transform="translateY(-50%)"
        animation="secondaryQuantumFlow 4.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 1.4s"
        filter="blur(0.3px)"
        sx={{
          '@keyframes secondaryQuantumFlow': {
            '0%': {
              left: '-120px',
              opacity: 0,
              transform: 'translateY(-50%) scaleX(0.3) skewX(0deg) rotateZ(0deg)',
              filter: 'blur(0.8px) saturate(0.7) hue-rotate(0deg)'
            },
            '12%': {
              opacity: 0.5,
              transform: 'translateY(-50%) scaleX(0.7) skewX(1.5deg) rotateZ(0.5deg)',
              filter: 'blur(0.5px) saturate(1.1) hue-rotate(15deg)'
            },
            '20%': {
              opacity: 0.8,
              transform: 'translateY(-50%) scaleX(1.1) skewX(3deg) rotateZ(1deg)',
              filter: 'blur(0.3px) saturate(1.4) hue-rotate(25deg)'
            },
            '80%': {
              opacity: 0.8,
              transform: 'translateY(-50%) scaleX(1.1) skewX(-3deg) rotateZ(-1deg)',
              filter: 'blur(0.3px) saturate(1.4) hue-rotate(-25deg)'
            },
            '88%': {
              opacity: 0.5,
              transform: 'translateY(-50%) scaleX(0.7) skewX(-1.5deg) rotateZ(-0.5deg)',
              filter: 'blur(0.5px) saturate(1.1) hue-rotate(-15deg)'
            },
            '100%': {
              left: 'calc(100% + 120px)',
              opacity: 0,
              transform: 'translateY(-50%) scaleX(0.3) skewX(0deg) rotateZ(0deg)',
              filter: 'blur(0.8px) saturate(0.7) hue-rotate(0deg)'
            }
          }
        }}
      />

      {/* Tertiary micro-stream with pulsing effect */}
      <Box
        position="absolute"
        top="50%"
        left="-80px"
        w="80px"
        h="1px"
        bg="linear-gradient(90deg,
          transparent 0%,
          rgba(99, 102, 241, 0.4) 20%,
          rgba(79, 156, 249, 0.7) 50%,
          rgba(59, 130, 246, 0.9) 70%,
          rgba(37, 99, 235, 0.4) 90%,
          transparent 100%
        )"
        transform="translateY(-50%)"
        animation="tertiaryQuantumFlow 3.2s ease-in-out infinite 2.3s"
        filter="blur(0.15px)"
        sx={{
          '@keyframes tertiaryQuantumFlow': {
            '0%': {
              left: '-80px',
              opacity: 0,
              transform: 'translateY(-50%) scaleX(0.5) scaleY(0.8)',
              filter: 'blur(0.4px) saturate(0.9)'
            },
            '20%': {
              opacity: 0.6,
              transform: 'translateY(-50%) scaleX(0.9) scaleY(1.2)',
              filter: 'blur(0.2px) saturate(1.2)'
            },
            '30%': {
              opacity: 0.9,
              transform: 'translateY(-50%) scaleX(1.3) scaleY(1.5)',
              filter: 'blur(0.1px) saturate(1.4)'
            },
            '70%': {
              opacity: 0.9,
              transform: 'translateY(-50%) scaleX(1.3) scaleY(1.5)',
              filter: 'blur(0.1px) saturate(1.4)'
            },
            '80%': {
              opacity: 0.6,
              transform: 'translateY(-50%) scaleX(0.9) scaleY(1.2)',
              filter: 'blur(0.2px) saturate(1.2)'
            },
            '100%': {
              left: 'calc(100% + 80px)',
              opacity: 0,
              transform: 'translateY(-50%) scaleX(0.5) scaleY(0.8)',
              filter: 'blur(0.4px) saturate(0.9)'
            }
          }
        }}
      />

      {/* Multi-layered ambient field */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="90%"
        h="70%"
        bg={`conic-gradient(from ${animationPhase * 45}deg,
          rgba(79, 156, 249, 0.08) 0deg,
          rgba(139, 92, 246, 0.12) 72deg,
          rgba(99, 102, 241, 0.10) 144deg,
          rgba(59, 130, 246, 0.08) 216deg,
          rgba(37, 99, 235, 0.06) 288deg,
          rgba(79, 156, 249, 0.08) 360deg
        )`}
        borderRadius="50%"
        animation="quantumAmbientGlow 4.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite"
        filter="blur(8px)"
        sx={{
          '@keyframes quantumAmbientGlow': {
            '0%, 100%': {
              opacity: 0.2,
              transform: 'translate(-50%, -50%) scale(0.7) rotate(0deg)',
              filter: 'blur(8px) saturate(0.8)'
            },
            '25%': {
              opacity: 0.5,
              transform: 'translate(-50%, -50%) scale(1.1) rotate(90deg)',
              filter: 'blur(12px) saturate(1.2)'
            },
            '50%': {
              opacity: 0.7,
              transform: 'translate(-50%, -50%) scale(1.3) rotate(180deg)',
              filter: 'blur(16px) saturate(1.4)'
            },
            '75%': {
              opacity: 0.5,
              transform: 'translate(-50%, -50%) scale(1.1) rotate(270deg)',
              filter: 'blur(12px) saturate(1.2)'
            }
          }
        }}
      />

      {/* Secondary ambient layer */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="60%"
        h="40%"
        bg="radial-gradient(ellipse, rgba(79, 156, 249, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 80%)"
        animation="secondaryAmbient 3.8s ease-in-out infinite 1s"
        filter="blur(4px)"
        sx={{
          '@keyframes secondaryAmbient': {
            '0%, 100%': {
              opacity: 0.4,
              transform: 'translate(-50%, -50%) scale(0.9)',
              filter: 'blur(4px)'
            },
            '50%': {
              opacity: 0.8,
              transform: 'translate(-50%, -50%) scale(1.4)',
              filter: 'blur(6px)'
            }
          }
        }}
      />

      {/* Enhanced floating particles with quantum behavior */}
      <FloatingParticles />

      {/* Quantum field distortion effect */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="linear-gradient(45deg, transparent 48%, rgba(79, 156, 249, 0.02) 49%, rgba(79, 156, 249, 0.02) 51%, transparent 52%)"
        animation="quantumDistortion 5.5s linear infinite"
        pointerEvents="none"
        sx={{
          '@keyframes quantumDistortion': {
            '0%': { transform: 'translateX(-100%) skewX(0deg)', opacity: 0 },
            '10%': { opacity: 0.3 },
            '50%': { transform: 'translateX(0%) skewX(2deg)', opacity: 0.6 },
            '90%': { opacity: 0.3 },
            '100%': { transform: 'translateX(100%) skewX(0deg)', opacity: 0 }
          }
        }}
      />
    </Box>
  );
});

WaveAnimation.displayName = 'WaveAnimation';

// Quantum floating particles with advanced behavior
const FloatingParticles = memo(() => {
  const [particlePhase, setParticlePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticlePhase(prev => (prev + 1) % 8);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0} pointerEvents="none" overflow="hidden">
      {/* Primary quantum particles */}
      {Array.from({ length: 8 }, (_, i) => {
        const phaseOffset = (i + particlePhase) % 8;

        return (
          <Box
            key={`primary-${i}`}
            position="absolute"
            w={`${1.5 + Math.sin(i) * 0.5}px`}
            h={`${1.5 + Math.sin(i) * 0.5}px`}
            bg={`rgba(${79 + i * 5}, ${156 - i * 3}, ${249 - i * 8}, ${0.3 + Math.cos(i) * 0.2})`}
            borderRadius="full"
            filter="blur(0.5px)"
            animation={`quantumFloat${i} ${3.5 + i * 0.3}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`}
            sx={{
              [`@keyframes quantumFloat${i}`]: {
                '0%': {
                  left: `${5 + i * 11}%`,
                  top: '105%',
                  opacity: 0,
                  transform: `scale(0.3) rotate(0deg)`,
                  filter: 'blur(1px)'
                },
                '10%': {
                  opacity: 0.6,
                  transform: `scale(0.8) rotate(${i * 45}deg)`,
                  filter: 'blur(0.5px)'
                },
                '25%': {
                  left: `${8 + i * 10 + Math.sin(phaseOffset) * 5}%`,
                  top: '75%',
                  opacity: 0.9,
                  transform: `scale(1.2) rotate(${i * 90}deg)`,
                  filter: 'blur(0.3px)'
                },
                '50%': {
                  left: `${12 + i * 9 + Math.cos(phaseOffset) * 8}%`,
                  top: '45%',
                  opacity: 1,
                  transform: `scale(1.5) rotate(${i * 135}deg)`,
                  filter: 'blur(0px)'
                },
                '75%': {
                  left: `${15 + i * 8 + Math.sin(phaseOffset + 1) * 6}%`,
                  top: '20%',
                  opacity: 0.7,
                  transform: `scale(1) rotate(${i * 180}deg)`,
                  filter: 'blur(0.3px)'
                },
                '90%': {
                  opacity: 0.3,
                  transform: `scale(0.6) rotate(${i * 225}deg)`,
                  filter: 'blur(0.8px)'
                },
                '100%': {
                  left: `${20 + i * 7}%`,
                  top: '-10%',
                  opacity: 0,
                  transform: `scale(0.2) rotate(${i * 270}deg)`,
                  filter: 'blur(1px)'
                }
              },
              [`@keyframes particleGlow${i}`]: {
                '0%, 100%': { opacity: 0.2, transform: 'translate(-50%, -50%) scale(0.5)' },
                '50%': { opacity: 0.8, transform: 'translate(-50%, -50%) scale(2)' }
              }
            }}
            _before={{
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200%',
              height: '200%',
              background: `radial-gradient(circle, rgba(79, 156, 249, 0.2) 0%, transparent 70%)`,
              borderRadius: 'full',
              animation: `particleGlow${i} ${3.5 + i * 0.3}s ease-in-out infinite`,
            }}
          />
        );
      })}

      {/* Secondary micro particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <Box
          key={`micro-${i}`}
          position="absolute"
          w="1px"
          h="1px"
          bg={`rgba(${139 - i * 2}, ${92 + i * 4}, ${246 - i * 6}, ${0.2 + Math.sin(i) * 0.1})`}
          borderRadius="full"
          animation={`microFloat${i} ${2.8 + i * 0.2}s linear infinite ${i * 0.2}s`}
          sx={{
            [`@keyframes microFloat${i}`]: {
              '0%': {
                left: `${i * 8}%`,
                top: '100%',
                opacity: 0,
                transform: 'scale(0.5)'
              },
              '30%': {
                opacity: 0.6,
                transform: 'scale(1)'
              },
              '70%': {
                opacity: 0.6,
                transform: 'scale(1)'
              },
              '100%': {
                left: `${(i * 8 + 15) % 100}%`,
                top: '-5%',
                opacity: 0,
                transform: 'scale(0.3)'
              }
            }
          }}
        />
      ))}
    </Box>
  );
});

FloatingParticles.displayName = 'FloatingParticles';

const SkeletonLoader = memo(({ lines = 3 }: { lines?: number }) => (
  <Box w="100%" maxW="400px">
    <Skeleton height="20px" mb={3} />
    <SkeletonText noOfLines={lines} spacing={2} />
  </Box>
));

SkeletonLoader.displayName = 'SkeletonLoader';

// Clean, innovative chat loading text component
const AlternatingText = memo(({ baseMessage }: { baseMessage?: string }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const textColor = '#64748B';

  const messages = [
    'thinking...',
    'analyzing your request...',
    'processing context...',
    'generating response...',
    'synthesizing insights...',
    'crafting answer...',
    'finalizing thoughts...',
    'almost ready...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1800); // Faster, more responsive timing

    return () => clearInterval(interval);
  }, [messages.length]);

  // Use base message if provided, otherwise use alternating messages
  const displayMessage = baseMessage || messages[currentMessageIndex];

  return (
    <Box position="relative" textAlign="center" py={3}>
      <Text
        fontSize="sm"
        color={textColor}
        fontWeight="500"
        letterSpacing="0.5px"
        opacity={0.8}
        animation="cleanTextFade 1.5s ease-in-out infinite"
        position="relative"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

        sx={{
          '@keyframes cleanTextFade': {
            '0%': {
              opacity: 0.4,
              transform: 'translateY(1px)'
            },
            '50%': {
              opacity: 1,
              transform: 'translateY(0px)'
            },
            '100%': {
              opacity: 0.4,
              transform: 'translateY(1px)'
            }
          },
        }}
      >
        {displayMessage}
      </Text>

      {/* Clean dots animation */}
      <HStack spacing={1} justify="center" mt={2}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            w="3px"
            h="3px"
            bg="#4F9CF9"
            borderRadius="full"
            animation={`cleanDotPulse 1.2s ease-in-out infinite ${index * 0.2}s`}

            sx={{
              '@keyframes cleanDotPulse': {
                '0%': {
                  opacity: 0.3,
                  transform: 'scale(0.8)'
                },
                '50%': {
                  opacity: 1,
                  transform: 'scale(1.2)'
                },
                '100%': {
                  opacity: 0.3,
                  transform: 'scale(0.8)'
                }
              }
            }}
          />
        ))}
      </HStack>
    </Box>
  );
});

AlternatingText.displayName = 'AlternatingText';

export const Loader = memo(({
  variant = 'spinner',
  size = 'md',
  message,
  fullScreen = false,
  lines = 3
}: LoaderProps) => {
  const bg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(0, 0, 0, 0.9)');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots size={size} />;
      case 'team':
        return <WaveAnimation size={size} />;
      case 'skeleton':
        return <SkeletonLoader lines={lines} />;
      case 'futuristic':
        return <FuturisticLoader size={size} message={message} variant="neural" />;
      default:
        return <Spinner size={size} color="blue.500" thickness="3px" />;
    }
  };

  const content = (
    <Flex direction="column" align="center" gap={4}>
      {/* Only show loader for non-team variants */}
      {variant !== 'team' && renderLoader()}
      {(message || variant === 'team') && (
        variant === 'team' ? (
          <AlternatingText baseMessage={message} />
        ) : (
          <Text
            fontSize="sm"
            color={textColor}
            textAlign="center"
            fontWeight="500"
            letterSpacing="0.5px"
            opacity={0.9}
            animation="fadeInOut 2s ease-in-out infinite"
            sx={{
              '@keyframes fadeInOut': {
                '0%, 100%': { opacity: 0.6 },
                '50%': { opacity: 1 }
              }
            }}
          >
            {message}
          </Text>
        )
      )}
    </Flex>
  );

  if (fullScreen) {
    return (
      <Flex
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={bg}
        backdropFilter="blur(4px)"
        zIndex={9999}
        align="center"
        justify="center"
      >
        {content}
      </Flex>
    );
  }

  return content;
});

Loader.displayName = 'Loader';

// Simplified message skeleton
export function MessageSkeleton() {
  return <Loader variant="skeleton" lines={2} />;
}

// Page loading component
export function PageLoader({ message = 'Loading page...' }: { message?: string }) {
  return (
    <Flex
      h="100vh"
      w="100%"
      align="center"
      justify="center"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
    >
      <Loader size="lg" message={message} />
    </Flex>
  );
}

// Legacy exports for backward compatibility
export default Loader;
