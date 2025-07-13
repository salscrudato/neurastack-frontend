import {
    Box,
    Flex,
    Skeleton,
    SkeletonText,
    Spinner,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';
import AIEnsembleSpinner from './AIEnsembleSpinner';

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'skeleton' | 'team' | 'futuristic' | 'modern' | 'ensemble';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  lines?: number; // For skeleton variant
}

// Modern AI Ensemble Loader - Clean, minimal, futuristic
const ModernEnsembleLoader = memo(({ size = 'md' }: { size?: string }) => {
  const [phase, setPhase] = useState(0);
  const [, setConfidence] = useState(0);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase(prev => (prev + 1) % 4);
    }, 1200);

    const confidenceInterval = setInterval(() => {
      setConfidence(prev => Math.min(prev + Math.random() * 15, 95));
    }, 800);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(confidenceInterval);
    };
  }, []);

  const containerSize = size === 'sm' ? '52px' : size === 'lg' ? '76px' : '64px';
  const nodeSize = size === 'sm' ? '9px' : size === 'lg' ? '13px' : '11px';

  return (
    <Box position="relative" w={containerSize} h={containerSize}>
      {/* Central AI Core */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="20px"
        h="20px"
        bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)"
        borderRadius="50%"
        animation="coreGlow 2s ease-in-out infinite"
        sx={{
          '@keyframes coreGlow': {
            '0%, 100%': {
              opacity: 0.8,
              transform: 'translate(-50%, -50%) scale(1)',
              boxShadow: '0 0 20px rgba(79, 156, 249, 0.4)'
            },
            '50%': {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1.1)',
              boxShadow: '0 0 30px rgba(79, 156, 249, 0.6)'
            }
          }
        }}
      />

      {/* AI Model Nodes */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * 72) + (phase * 18); // 72 degrees apart, rotating
        const radius = size === 'sm' ? 18 : size === 'lg' ? 28 : 24;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        return (
          <Box
            key={i}
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(-50%, -50%) translate(${x}px, ${y}px)`}
            w={nodeSize}
            h={nodeSize}
            bg={`linear-gradient(135deg,
              ${i === phase ? '#4F9CF9' : '#94A3B8'} 0%,
              ${i === phase ? '#8B5CF6' : '#CBD5E1'} 100%
            )`}
            borderRadius="50%"
            opacity={i === phase ? 1 : 0.6}
            animation={i === phase ? 'activeNode 1.2s ease-in-out infinite' : 'none'}
            transition="all 0.3s ease"
            sx={{
              '@keyframes activeNode': {
                '0%, 100%': {
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`,
                  boxShadow: '0 0 8px rgba(79, 156, 249, 0.3)'
                },
                '50%': {
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.3)`,
                  boxShadow: '0 0 15px rgba(79, 156, 249, 0.6)'
                }
              }
            }}
          />
        );
      })}

      {/* Connection Lines */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="100%"
        h="100%"
        borderRadius="50%"
        border="1px solid"
        borderColor="rgba(79, 156, 249, 0.2)"
        animation="connectionPulse 3s ease-in-out infinite"
        sx={{
          '@keyframes connectionPulse': {
            '0%, 100%': {
              borderColor: 'rgba(79, 156, 249, 0.2)',
              transform: 'translate(-50%, -50%) scale(1)'
            },
            '50%': {
              borderColor: 'rgba(79, 156, 249, 0.4)',
              transform: 'translate(-50%, -50%) scale(1.05)'
            }
          }
        }}
      />
    </Box>
  );
});

ModernEnsembleLoader.displayName = 'ModernEnsembleLoader';

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

// Ultra-Modern Neural Network Loader
const FuturisticLoader = memo(({ size = 'md' }: {
  size?: string;
  message?: string;
  variant?: string;
}) => {
  const [neuralPhase, setNeuralPhase] = useState(0);
  const [synapseActivity, setSynapseActivity] = useState(0);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setNeuralPhase(prev => (prev + 1) % 6);
    }, 1000);

    const synapseInterval = setInterval(() => {
      setSynapseActivity(prev => (prev + 1) % 8);
    }, 400);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(synapseInterval);
    };
  }, []);

  const containerSize = size === 'sm' ? '56px' : size === 'lg' ? '80px' : '68px';
  const nodeSize = size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px';

  return (
    <Box position="relative" w={containerSize} h={containerSize}>
      {/* Central Neural Core */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="16px"
        h="16px"
        bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)"
        borderRadius="50%"
        animation="neuralCore 2.5s ease-in-out infinite"
        sx={{
          '@keyframes neuralCore': {
            '0%, 100%': {
              opacity: 0.9,
              transform: 'translate(-50%, -50%) scale(1)',
              boxShadow: '0 0 16px rgba(79, 156, 249, 0.4)'
            },
            '50%': {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1.2)',
              boxShadow: '0 0 24px rgba(79, 156, 249, 0.7)'
            }
          }
        }}
      />

      {/* Neural Network Nodes */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * 60) + (neuralPhase * 10);
        const radius = size === 'sm' ? 22 : size === 'lg' ? 32 : 28;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        const isActive = (i + synapseActivity) % 6 < 2;

        return (
          <Box
            key={i}
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(-50%, -50%) translate(${x}px, ${y}px)`}
            w={nodeSize}
            h={nodeSize}
            bg={isActive ? 'linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)' : '#E2E8F0'}
            borderRadius="50%"
            opacity={isActive ? 1 : 0.4}
            transition="all 0.4s ease"
            animation={isActive ? 'synapsefire 0.8s ease-in-out infinite' : 'none'}
            sx={{
              '@keyframes synapsefire': {
                '0%, 100%': {
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`,
                  boxShadow: '0 0 6px rgba(79, 156, 249, 0.3)'
                },
                '50%': {
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.4)`,
                  boxShadow: '0 0 12px rgba(79, 156, 249, 0.6)'
                }
              }
            }}
          />
        );
      })}

      {/* Neural Pathways */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="100%"
        h="100%"
        borderRadius="50%"
        border="1px solid"
        borderColor="rgba(79, 156, 249, 0.15)"
        animation="neuralNetwork 4s linear infinite"
        sx={{
          '@keyframes neuralNetwork': {
            '0%': {
              borderColor: 'rgba(79, 156, 249, 0.15)',
              transform: 'translate(-50%, -50%) rotate(0deg) scale(1)'
            },
            '25%': {
              borderColor: 'rgba(139, 92, 246, 0.25)',
              transform: 'translate(-50%, -50%) rotate(90deg) scale(1.02)'
            },
            '50%': {
              borderColor: 'rgba(99, 102, 241, 0.3)',
              transform: 'translate(-50%, -50%) rotate(180deg) scale(1)'
            },
            '75%': {
              borderColor: 'rgba(139, 92, 246, 0.25)',
              transform: 'translate(-50%, -50%) rotate(270deg) scale(1.02)'
            },
            '100%': {
              borderColor: 'rgba(79, 156, 249, 0.15)',
              transform: 'translate(-50%, -50%) rotate(360deg) scale(1)'
            }
          }
        }}
      />

      {/* Outer Neural Field */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="120%"
        h="120%"
        borderRadius="50%"
        border="1px solid"
        borderColor="rgba(79, 156, 249, 0.08)"
        animation="outerField 6s linear infinite reverse"
        sx={{
          '@keyframes outerField': {
            '0%': {
              borderColor: 'rgba(79, 156, 249, 0.08)',
              transform: 'translate(-50%, -50%) rotate(0deg)'
            },
            '100%': {
              borderColor: 'rgba(139, 92, 246, 0.12)',
              transform: 'translate(-50%, -50%) rotate(360deg)'
            }
          }
        }}
      />
    </Box>
  );
});

FuturisticLoader.displayName = 'FuturisticLoader';

const SkeletonLoader = memo(({ lines = 3 }: { lines?: number }) => (
  <Box w="100%" maxW="400px">
    <Skeleton height="20px" mb={3} />
    <SkeletonText noOfLines={lines} spacing={2} />
  </Box>
));

SkeletonLoader.displayName = 'SkeletonLoader';

// Modern AI Ensemble Status Component
const AIEnsembleStatus = memo(({ baseMessage }: { baseMessage?: string }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [votingProgress, setVotingProgress] = useState(0);

  const ensemblePhases = [
    { message: 'Initializing AI ensemble...', stage: 'init' },
    { message: 'Models analyzing query...', stage: 'analysis' },
    { message: 'Generating candidate responses...', stage: 'generation' },
    { message: 'Cross-model validation...', stage: 'validation' },
    { message: 'Confidence scoring...', stage: 'scoring' },
    { message: 'Ensemble voting in progress...', stage: 'voting' },
    { message: 'Optimizing final response...', stage: 'optimization' },
    { message: 'Response ready...', stage: 'complete' }
  ];

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % ensemblePhases.length);
    }, 1600);

    const confidenceInterval = setInterval(() => {
      setConfidence(prev => Math.min(prev + Math.random() * 12, 94));
    }, 900);

    const votingInterval = setInterval(() => {
      setVotingProgress(prev => (prev + Math.random() * 8) % 100);
    }, 700);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(confidenceInterval);
      clearInterval(votingInterval);
    };
  }, [ensemblePhases.length]);

  const currentEnsemblePhase = ensemblePhases[currentPhase];
  const displayMessage = baseMessage || currentEnsemblePhase.message;

  return (
    <Box position="relative" textAlign="center" py={4} maxW="300px" mx="auto">
      {/* Main Status Text */}
      <Text
        fontSize="sm"
        color="#64748B"
        fontWeight="500"
        letterSpacing="0.3px"
        mb={3}
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        animation="statusFade 1.8s ease-in-out infinite"
        sx={{
          '@keyframes statusFade': {
            '0%, 100%': { opacity: 0.7 },
            '50%': { opacity: 1 }
          }
        }}
      >
        {displayMessage}
      </Text>

      {/* Confidence & Voting Metrics */}
      <Flex justify="space-between" align="center" fontSize="xs" color="#94A3B8" mb={2}>
        <Text>Confidence: {confidence.toFixed(0)}%</Text>
        <Text>Voting: {votingProgress.toFixed(0)}%</Text>
      </Flex>

      {/* Progress Indicators */}
      <Flex gap={1} justify="center">
        {ensemblePhases.map((_, index) => (
          <Box
            key={index}
            w="20px"
            h="2px"
            bg={index <= currentPhase ? '#4F9CF9' : '#E2E8F0'}
            borderRadius="full"
            transition="all 0.3s ease"
            animation={index === currentPhase ? 'activeProgress 1.6s ease-in-out infinite' : 'none'}
            sx={{
              '@keyframes activeProgress': {
                '0%, 100%': { opacity: 0.6 },
                '50%': { opacity: 1, transform: 'scaleY(1.5)' }
              }
            }}
          />
        ))}
      </Flex>
    </Box>
  );
});

AIEnsembleStatus.displayName = 'AIEnsembleStatus';

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
      case 'ensemble':
        return <AIEnsembleSpinner size={size} message={message} showModels={true} />;
      case 'dots':
      case 'modern':
        return <ModernEnsembleLoader size={size} />;
      case 'team':
        return <WaveAnimation size={size} />;
      case 'skeleton':
        return <SkeletonLoader lines={lines} />;
      case 'futuristic':
        return <FuturisticLoader size={size} message={message} variant="neural" />;
      case 'spinner':
        return <Spinner size={size} color="blue.500" thickness="3px" />;
      default:
        return <AIEnsembleSpinner size={size} message={message} showModels={true} />;
    }
  };

  const content = (
    <Flex direction="column" align="center" gap={3}>
      {/* Modern loader for all variants except team */}
      {variant !== 'team' && renderLoader()}

      {/* AI Ensemble Status for team variant, simple message for others */}
      {(message || variant === 'team') && (
        variant === 'team' ? (
          <AIEnsembleStatus baseMessage={message} />
        ) : (
          <Text
            fontSize="sm"
            color={textColor}
            textAlign="center"
            fontWeight="500"
            letterSpacing="0.3px"
            opacity={0.8}
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
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
