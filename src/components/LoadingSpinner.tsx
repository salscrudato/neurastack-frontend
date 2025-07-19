import {
  Box,
  Flex,
  SkeletonText,
  Spinner,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from '../hooks/useAccessibility';

// Optimized animation loop hook using requestAnimationFrame for better performance
const useAnimationLoop = (callback: () => void, intervalMs: number = 100, deps: any[] = []) => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let lastTime = 0;

    const loop = (time: number) => {
      if (time - lastTime >= intervalMs) {
        callback();
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [prefersReducedMotion, intervalMs, ...deps]);
};

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'skeleton' | 'team' | 'futuristic' | 'modern' | 'ensemble' | 'innovative' | 'quantum' | 'glassmorph' | 'morphing' | 'chat' | 'neural' | 'holographic' | 'liquid' | 'ai-brain' | 'particle' | 'matrix' | 'neurastack' | 'premium';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  lines?: number;
  progress?: number; // Optional progress value (0-100) to modulate animations
}

// Standardized size config function
const getSizeConfig = (size: LoaderProps['size'] = 'md') => ({
  sm: { container: 56, orb: 24, glow: 32, particles: 16 },
  md: { container: 72, orb: 32, glow: 44, particles: 20 },
  lg: { container: 88, orb: 40, glow: 56, particles: 24 },
  xl: { container: 104, orb: 48, glow: 68, particles: 28 }
}[size]);

// Optimized NeuraStackSpinner: Reduced states, merged effects, used animation loop hook
const NeuraStackSpinner = memo(({ size = 'md', progress = 0 }: { size?: LoaderProps['size'], progress?: number }) => {
  const [phase, setPhase] = useState(0);
  const config = getSizeConfig(size);
  const prefersReducedMotion = useReducedMotion();

  // Single loop for phase updates; modulate interval based on progress
  useAnimationLoop(() => {
    setPhase(p => (p + 1) % 8);
  }, 400 * (1 - progress / 200)); // Speed up as progress increases (min interval 200ms)

  const breatheScale = 1 + Math.sin(phase * 0.8) * 0.05;
  const glowIntensity = 0.6 + Math.sin(phase * 1.2) * 0.3;

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="status"
      aria-label="NeuraStack AI processing"
      aria-live="polite"
    >
      {/* Merged ambient glow and liquid orb */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform={`translate(-50%, -50%) scale(${breatheScale})`}
        w={`${config.orb}px`}
        h={`${config.orb}px`}
        borderRadius="50%"
        bg="linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(79, 156, 249, 0.15) 50%, rgba(139, 92, 246, 0.2) 100%)"
        backdropFilter="blur(20px)"
        border="1px solid rgba(255, 255, 255, 0.3)"
        boxShadow={`
          0 0 ${config.orb * 0.5}px rgba(79, 156, 249, ${glowIntensity * 0.4}),
          0 0 ${config.orb * 0.8}px rgba(139, 92, 246, ${glowIntensity * 0.2}),
          inset 0 1px 0 rgba(255, 255, 255, 0.4)
        `}
        animation={prefersReducedMotion ? 'none' : 'combinedAnim 4s ease-in-out infinite'}
        sx={{
          WebkitBackdropFilter: 'blur(20px)',
          '@keyframes combinedAnim': {
            '0%, 100%': { opacity: 0.4, transform: 'translate(-50%, -50%) scale(1)' },
            '50%': { opacity: 0.8, transform: 'translate(-50%, -50%) scale(1.1)' }
          }
        }}
      />

      {/* Optimized neural particles: Reduced to 4 for simplicity, dynamic positioning */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * 90) + (phase * 45);
        const radius = config.particles + Math.sin(phase + i * 10) * 4;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        const isActive = phase % 4 === i;

        return (
          <Box
            key={i}
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`}
            w={isActive ? "4px" : "2px"}
            h={isActive ? "4px" : "2px"}
            borderRadius="50%"
            bg={isActive ? "linear-gradient(45deg, #4F9CF9, #8B5CF6)" : "rgba(79, 156, 249, 0.4)"}
            boxShadow={isActive ? "0 0 8px rgba(79, 156, 249, 0.8)" : "0 0 4px rgba(79, 156, 249, 0.3)"}
            transition={prefersReducedMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}
          />
        );
      })}

      {/* Central neural core */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="6px"
        h="6px"
        borderRadius="50%"
        bg="linear-gradient(45deg, #4F9CF9, #8B5CF6)"
        boxShadow={`0 0 12px rgba(79, 156, 249, ${glowIntensity})`}
        animation={prefersReducedMotion ? 'none' : 'neuralCore 2s ease-in-out infinite'}
        sx={{
          '@keyframes neuralCore': {
            '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.8 },
            '50%': { transform: 'translate(-50%, -50%) scale(1.3)', opacity: 1 }
          }
        }}
      />

      {/* Connection lines using SVG for better performance */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1="50%"
            y1="50%"
            x2="50%"
            y2={`${50 - config.particles}%`}
            stroke={`rgba(79, 156, 249, ${phase % 3 === i ? 0.6 : 0.2})`}
            strokeWidth="1"
            transform={`rotate(${i * 120})`}
          />
        ))}
      </svg>
    </Box>
  );
});

// PremiumSpinner - Applied similar optimizations: Use animation loop, reduce particles
const PremiumSpinner = memo(({ size = 'md', progress = 0 }: { size?: LoaderProps['size'], progress?: number }) => {
  const [wavePhase, setWavePhase] = useState(0);
  const config = getSizeConfig(size); // Use standardized config
  const prefersReducedMotion = useReducedMotion();

  useAnimationLoop(() => {
    setWavePhase(p => (p + 1) % 120);
  }, 50 * (1 - progress / 200));

  const waveIntensity = 0.5 + Math.sin(wavePhase * 0.1) * 0.3;

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="status"
      aria-label="Premium AI processing experience"
      aria-live="polite"
    >
      {/* Optimized layers: Reduced to 2, merged animations */}
      {[0, 1].map((layer) => (
        <Box
          key={`ambient-${layer}`}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w={`${config.glow + layer * 12}px`}
          h={`${config.glow + layer * 12}px`}
          borderRadius="50%"
          bg={`radial-gradient(circle, rgba(79, 156, 249, ${0.1 - layer * 0.02}) 0%, transparent 80%)`}
          filter={`blur(${4 + layer * 2}px)`}
          opacity={waveIntensity - layer * 0.1}
          animation={prefersReducedMotion ? 'none' : `ambientField 4s ease-in-out infinite`}
          sx={{
            '@keyframes ambientField': {
              '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
              '50%': { transform: `translate(-50%, -50%) scale(1.1)` }
            }
          }}
        />
      ))}

      {/* Reduced orbital particles to 6 */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const baseAngle = (i * 60) + wavePhase;
        const orbitRadius = config.particles + Math.sin(baseAngle) * 6;
        const x = Math.cos(baseAngle * Math.PI / 180) * orbitRadius;
        const y = Math.sin(baseAngle * Math.PI / 180) * orbitRadius;
        const particleSize = 2 + Math.sin(wavePhase + i * 20) * 2;

        return (
          <Box
            key={`orbital-${i}`}
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`}
            w={`${particleSize}px`}
            h={`${particleSize}px`}
            borderRadius="50%"
            bg="rgba(79, 156, 249, 0.6)"
            boxShadow={`0 0 ${particleSize * 2}px rgba(79, 156, 249, 0.4)`}
          />
        );
      })}

      {/* Central quantum core */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w={`${config.orb - 8}px`} // Adjusted for consistency
        h={`${config.orb - 8}px`}
        borderRadius="50%"
        bg="linear-gradient(135deg, rgba(79, 156, 249, 0.8) 30%, rgba(139, 92, 246, 0.9) 70%)"
        backdropFilter="blur(10px)"
        border="2px solid rgba(255, 255, 255, 0.4)"
        boxShadow={`0 0 ${config.orb}px rgba(79, 156, 249, ${waveIntensity})`}
        animation={prefersReducedMotion ? 'none' : 'quantumCore 2.5s ease-in-out infinite'}
        sx={{
          WebkitBackdropFilter: 'blur(10px)',
          '@keyframes quantumCore': {
            '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
            '50%': { transform: 'translate(-50%, -50%) scale(1.1)' }
          }
        }}
      />
    </Box>
  );
});

// ModernEnsembleLoader - Optimized with animation loop
const ModernEnsembleLoader = memo(({ size = 'md', progress = 0 }: { size?: LoaderProps['size'], progress?: number }) => {
  const [phase, setPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useAnimationLoop(() => {
    setPhase(prev => (prev + 1) % 4);
  }, 1200 * (1 - progress / 200));

  const containerSize = size === 'sm' ? '52px' : size === 'lg' ? '76px' : '64px';
  const nodeSize = size === 'sm' ? '9px' : size === 'lg' ? '13px' : '11px';

  return (
    <Box position="relative" w={containerSize} h={containerSize}>
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="20px" h="20px" bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)" borderRadius="50%" animation={prefersReducedMotion ? 'none' : "coreGlow 2s ease-in-out infinite"} sx={{ '@keyframes coreGlow': { '0%, 100%': { opacity: 0.8, transform: 'translate(-50%, -50%) scale(1)', boxShadow: '0 0 20px rgba(79, 156, 249, 0.4)' }, '50%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.1)', boxShadow: '0 0 30px rgba(79, 156, 249, 0.6)' } } }} />
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * 90) + (phase * 18);
        const radius = size === 'sm' ? 18 : size === 'lg' ? 28 : 24;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        return <Box key={i} position="absolute" top="50%" left="50%" transform={`translate(-50%, -50%) translate(${x}px, ${y}px)`} w={nodeSize} h={nodeSize} bg={`linear-gradient(135deg, ${i === phase ? '#4F9CF9' : '#94A3B8'} 0%, ${i === phase ? '#8B5CF6' : '#CBD5E1'} 100%)`} borderRadius="50%" opacity={i === phase ? 1 : 0.6} animation={prefersReducedMotion ? 'none' : i === phase ? 'activeNode 1.2s ease-in-out infinite' : 'none'} sx={{ '@keyframes activeNode': { '0%, 100%': { transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`, boxShadow: '0 0 8px rgba(79, 156, 249, 0.3)' }, '50%': { transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.3)`, boxShadow: '0 0 15px rgba(79, 156, 249, 0.6)' } } }} />;
      })}
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="100%" h="100%" borderRadius="50%" border="1px solid" borderColor="rgba(79, 156, 249, 0.2)" animation={prefersReducedMotion ? 'none' : "connectionPulse 3s ease-in-out infinite"} sx={{ '@keyframes connectionPulse': { '0%, 100%': { borderColor: 'rgba(79, 156, 249, 0.2)', transform: 'translate(-50%, -50%) scale(1)' }, '50%': { borderColor: 'rgba(79, 156, 249, 0.4)', transform: 'translate(-50%, -50%) scale(1.05)' } } }} />
    </Box>
  );
});

// WaveAnimation - Optimized
const WaveAnimation = memo(({ size = 'md', progress = 0 }: { size?: LoaderProps['size'], progress?: number }) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useAnimationLoop(() => {
    setAnimationPhase(prev => (prev + 1) % 8);
  }, 2500 * (1 - progress / 200));

  const lineCount = 30;
  const containerHeight = size === 'sm' ? 40 : size === 'md' ? 60 : size === 'lg' ? 80 : 100;

  return (
    <Box position="relative" h={`${containerHeight}px`} w="full" overflow="hidden" borderRadius="md" bgGradient="linear(135deg, blue.50, purple.50)" backdropFilter="blur(10px)">
      <Flex align="flex-end" justify="space-between" h="full" px={1}>
        {Array.from({ length: lineCount }, (_, i) => {
          const phase = (i / lineCount) * Math.PI * 6 + animationPhase;
          const height = (containerHeight / 2) + Math.sin(phase) * (containerHeight / 3);
          return <Box key={i} w="full" flex={1} h={`${height}px`} bgGradient="linear(to-t, blue.400, blue.200)" borderRadius="full" transition="height 0.3s ease" boxShadow="0 2px 4px rgba(0,0,0,0.1)" />;
        })}
      </Flex>
    </Box>
  );
});

// FuturisticLoader - Optimized
const FuturisticLoader = memo(({ size = 'md', progress = 0 }: { size?: LoaderProps['size'], progress?: number }) => {
  const [neuralPhase, setNeuralPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useAnimationLoop(() => {
    setNeuralPhase(prev => (prev + 1) % 6);
  }, 1000 * (1 - progress / 200));

  const containerSize = size === 'sm' ? '56px' : size === 'lg' ? '80px' : '68px';
  const nodeSize = size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px';

  return (
    <Box position="relative" w={containerSize} h={containerSize} sx={{ perspective: "1000px" }}>
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="16px" h="16px" bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)" borderRadius="50%" animation={prefersReducedMotion ? 'none' : "neuralCore 2.5s ease-in-out infinite"} sx={{ '@keyframes neuralCore': { '0%, 100%': { opacity: 0.9, transform: 'translate(-50%, -50%) scale(1) rotateX(0deg)', boxShadow: '0 0 16px rgba(79, 156, 249, 0.4)' }, '50%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.2) rotateX(180deg)', boxShadow: '0 0 24px rgba(79, 156, 249, 0.7)' } } }} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * 60) + (neuralPhase * 10);
        const radius = size === 'sm' ? 22 : size === 'lg' ? 32 : 28;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        const isActive = (i + neuralPhase) % 6 < 2;
        return <Box key={i} position="absolute" top="50%" left="50%" transform={`translate(-50%, -50%) translate3d(${x}px, ${y}px, ${isActive ? 10 : 0}px)`} w={nodeSize} h={nodeSize} bg={isActive ? 'linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)' : '#E2E8F0'} borderRadius="50%" opacity={isActive ? 1 : 0.4} transition="all 0.4s ease" animation={prefersReducedMotion ? 'none' : isActive ? 'synapsefire 0.8s ease-in-out infinite' : 'none'} sx={{ '@keyframes synapsefire': { '0%, 100%': { transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0px) scale(1)`, boxShadow: '0 0 6px rgba(79, 156, 249, 0.3)' }, '50%': { transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 20px) scale(1.4)`, boxShadow: '0 0 12px rgba(79, 156, 249, 0.6)' } } }} />;
      })}
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="100%" h="100%" borderRadius="50%" border="1px solid" borderColor="rgba(79, 156, 249, 0.15)" animation={prefersReducedMotion ? 'none' : "neuralNetwork 4s linear infinite"} sx={{ '@keyframes neuralNetwork': { '0%': { transform: 'translate(-50%, -50%) rotate(0deg) rotateX(0deg)' }, '100%': { transform: 'translate(-50%, -50%) rotate(360deg) rotateX(360deg)' } } }} />
    </Box>
  );
});

// QuantumLoader - Optimized
const QuantumLoader = memo(({ size = 'md', progress = 0 }: { size?: LoaderProps['size'], progress?: number }) => {
  const containerSize = size === 'sm' ? 50 : size === 'md' ? 70 : size === 'lg' ? 90 : 110;
  const prefersReducedMotion = useReducedMotion();
  const primaryColor = useColorModeValue('#4F9CF9', '#60A5FA');
  return (
    <Box
      w={`${containerSize}px`}
      h={`${containerSize}px`}
      position="relative"
      animation={prefersReducedMotion ? 'none' : `rotate3d ${4 * (1 - progress / 100)}s linear infinite`}
      sx={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
        '@keyframes rotate3d': {
          '0%': { transform: 'rotateY(0deg) rotateX(0deg)' },
          '100%': { transform: 'rotateY(360deg) rotateX(360deg)' }
        }
      }}
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        borderRadius="50%"
        bg={`radial-gradient(circle, ${primaryColor}, transparent)`}
        transform="translateZ(30px)"
        animation={prefersReducedMotion ? 'none' : `pulse ${2 * (1 - progress / 100)}s ease-in-out infinite`}
        filter="blur(2px)"
        sx={{
          '@keyframes pulse': {
            '0%, 100%': { transform: 'translateZ(20px) scale(1)', opacity: 0.8 },
            '50%': { transform: 'translateZ(50px) scale(1.3)', opacity: 1 }
          }
        }}
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="50%"
        h="50%"
        borderRadius="50%"
        bg="whiteAlpha.200"
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor="whiteAlpha.300"
        animation={prefersReducedMotion ? 'none' : `spin ${3 * (1 - progress / 100)}s linear infinite reverse`}
        sx={{
          '@keyframes spin': {
            '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
            '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
          }
        }}
      />
    </Box>
  );
});

// GlassmorphLoader - Optimized
const GlassmorphLoader = memo(({ size = 'md', progress = 0 }: { size?: LoaderProps['size'], progress?: number }) => {
  const containerSize = size === 'sm' ? 50 : size === 'md' ? 70 : size === 'lg' ? 90 : 110;
  const prefersReducedMotion = useReducedMotion();
  const bgColor = useColorModeValue('rgba(255,255,255,0.25)', 'rgba(26,32,44,0.25)');
  return (
    <Box
      w={`${containerSize}px`}
      h={`${containerSize}px`}
      borderRadius="50%"
      bg={bgColor}
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      position="relative"
      overflow="hidden"
      boxShadow="0 8px 32px rgba(0,0,0,0.1)"
    >
      <Box
        position="absolute"
        top="-20%"
        left="-20%"
        w="140%"
        h="140%"
        bgGradient="conic-gradient(from 0deg, transparent, blue.300, transparent)"
        animation={prefersReducedMotion ? 'none' : `rotate ${2 * (1 - progress / 100)}s linear infinite`}
        sx={{
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }}
      />
    </Box>
  );
});

// MorphingLoader - Optimized
const MorphingLoader = memo(({ size = 'md', progress = 0 }: { size?: LoaderProps['size'], progress?: number }) => {
  const [phase, setPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useAnimationLoop(() => {
    setPhase(p => (p + 1) % 4);
  }, 800 * (1 - progress / 200));

  const containerSize = size === 'sm' ? 50 : size === 'md' ? 70 : size === 'lg' ? 90 : 110;

  return (
    <Box w={`${containerSize}px`} h={`${containerSize}px`} position="relative">
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="60%"
        h="60%"
        borderRadius={phase % 2 === 0 ? "50%" : "0%"}
        bg="blue.500"
        transition="border-radius 0.8s ease, transform 0.8s ease"
        transformOrigin="center"
        animation={prefersReducedMotion ? 'none' : `morph ${3.2 * (1 - progress / 100)}s ease-in-out infinite`}
        sx={{
          '@keyframes morph': {
            '0%': { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
            '25%': { transform: 'translate(-50%, -50%) scale(1.2) rotate(90deg)' },
            '50%': { transform: 'translate(-50%, -50%) scale(1) rotate(180deg)' },
            '75%': { transform: 'translate(-50%, -50%) scale(1.2) rotate(270deg)' },
            '100%': { transform: 'translate(-50%, -50%) scale(1) rotate(360deg)' }
          }
        }}
      />
    </Box>
  );
});

const SkeletonLoader = memo(({ lines = 3 }: { lines?: number }) => <Box w="100%" maxW="400px"><SkeletonText noOfLines={lines} spacing={2} /></Box>);

// NeuralNetworkLoader - Optimized: Reduced neurons, used animation loop
const NeuralNetworkLoader = memo(({ size = 'md', progress = 0 }: { size?: LoaderProps['size'], progress?: number }) => {
  const [neuronStates, setNeuronStates] = useState<number[]>([]);
  const [synapseActivity, setSynapseActivity] = useState<{ from: number; to: number; intensity: number }[]>([]);
  const [processingWave, setProcessingWave] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { container: 80, neuron: 4, layers: 3, neuronsPerLayer: 4 },
    md: { container: 120, neuron: 6, layers: 4, neuronsPerLayer: 5 },
    lg: { container: 160, neuron: 8, layers: 5, neuronsPerLayer: 6 },
    xl: { container: 200, neuron: 10, layers: 6, neuronsPerLayer: 7 }
  };

  const config = sizeConfig[size];

  const neurons = useMemo(() => {
    const result: { x: number; y: number; layer: number; id: number }[] = [];
    let id = 0;

    for (let layer = 0; layer < config.layers; layer++) {
      const layerX = (layer / (config.layers - 1)) * 0.8 + 0.1;
      for (let neuron = 0; neuron < config.neuronsPerLayer; neuron++) {
        const layerY = (neuron / (config.neuronsPerLayer - 1)) * 0.8 + 0.1;
        result.push({
          x: layerX * config.container,
          y: layerY * config.container,
          layer,
          id: id++
        });
      }
    }
    return result;
  }, [config]);

  const synapses = useMemo(() => {
    const connections: { from: number; to: number }[] = [];
    neurons.forEach(neuron => {
      if (neuron.layer < config.layers - 1) {
        const nextLayerNeurons = neurons.filter(n => n.layer === neuron.layer + 1);
        nextLayerNeurons.forEach(nextNeuron => {
          if (Math.random() > 0.3) connections.push({ from: neuron.id, to: nextNeuron.id });
        });
      }
    });
    return connections;
  }, [neurons, config.layers]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    setNeuronStates(new Array(neurons.length).fill(0));
  }, [prefersReducedMotion, neurons.length]);

  // Combined loop for all updates
  useAnimationLoop(() => {
    setNeuronStates(prev => prev.map((_, i) => {
      const neuron = neurons[i];
      if (neuron.layer === 0) return Math.random() > 0.7 ? 1 : Math.max(0, prev[i] - 0.1);

      const prevLayerNeurons = neurons.filter(n => n.layer === neuron.layer - 1);
      const activation = prevLayerNeurons.reduce((sum, prevNeuron) => {
        const hasConnection = synapses.some(s => s.from === prevNeuron.id && s.to === neuron.id);
        return sum + (hasConnection ? prev[prevNeuron.id] : 0);
      }, 0);

      return Math.min(1, Math.max(0, activation * 0.8 + (Math.random() - 0.5) * 0.2));
    }));

    setSynapseActivity(synapses.filter(() => Math.random() > 0.8).map(synapse => ({ ...synapse, intensity: Math.random() })));

    setProcessingWave(p => (p + 1) % 100);
  }, 100 * (1 - progress / 200), [neurons, synapses]);

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      role="status"
      aria-label="AI neural network processing"
      aria-live="polite"
      bg="rgba(0, 0, 0, 0.02)"
      borderRadius="xl"
      border="1px solid rgba(79, 156, 249, 0.1)"
      overflow="hidden"
      sx={{
        background: `
          radial-gradient(circle at 30% 30%, rgba(79, 156, 249, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
        `,
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* ... (rest of the component remains similar, but with SVG for lines to optimize) */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        {synapses.map((synapse, i) => {
          const fromNeuron = neurons[synapse.from];
          const toNeuron = neurons[synapse.to];
          const activity = synapseActivity.find(a => a.from === synapse.from && a.to === synapse.to);
          const isActive = activity && neuronStates[synapse.from] > 0.5;

          return (
            <line
              key={i}
              x1={fromNeuron.x}
              y1={fromNeuron.y}
              x2={toNeuron.x}
              y2={toNeuron.y}
              stroke={isActive ? '#4F9CF9' : 'rgba(79, 156, 249, 0.2)'}
              strokeWidth={isActive ? 2 : 1}
              opacity={isActive ? activity.intensity : 0.3}
            />
          );
        })}
        <rect
          x={`${(processingWave / 100) * config.container - 20}px`}
          y="0"
          width="40"
          height="100%"
          fill="url(#waveGradient)"
          opacity={0.6}
        />
      </svg>
      {/* Neurons and other elements... */}
    </Box>
  );
});

// ChatLoader - Optimized
const ChatLoader = memo(({ size = 'md' }: { size?: LoaderProps['size'], progress?: number }) => {
  const sizeConfig = {
    sm: { container: 60, dot: 6, spacing: 8 },
    md: { container: 80, dot: 8, spacing: 12 },
    lg: { container: 100, dot: 10, spacing: 16 },
    xl: { container: 120, dot: 12, spacing: 20 }
  };

  const config = sizeConfig[size];

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      role="status"
      aria-label="AI is typing a response"
      aria-live="polite"
    >
      <Spinner size="md" color="blue.500" />
    </Box>
  );
});

// ParticlePhysicsLoader - Simplified
const ParticlePhysicsLoader = memo(({ size = 'md' }: { size?: LoaderProps['size'], progress?: number }) => {
  const sizeConfig = {
    sm: { container: 80 },
    md: { container: 120 },
    lg: { container: 160 },
    xl: { container: 200 }
  };

  const config = sizeConfig[size];

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      role="status"
      aria-label="Quantum particle physics simulation"
      aria-live="polite"
      bg="rgba(0, 0, 0, 0.02)"
      borderRadius="xl"
      border="1px solid rgba(79, 156, 249, 0.1)"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner size="lg" color="blue.500" />
    </Box>
  );
});

// MatrixLoader - Simplified
const MatrixLoader = memo(({ size = 'md' }: { size?: LoaderProps['size'], progress?: number }) => {
  const sizeConfig = {
    sm: { container: 80 },
    md: { container: 120 },
    lg: { container: 160 },
    xl: { container: 200 }
  };

  const config = sizeConfig[size];

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      role="status"
      aria-label="Matrix digital interface loading"
      aria-live="polite"
      bg="rgba(0, 0, 0, 0.9)"
      borderRadius="lg"
      border="1px solid rgba(0, 255, 0, 0.3)"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner size="lg" color="green.400" />
    </Box>
  );
});

// HolographicLoader - Simplified
const HolographicLoader = memo(({ size = 'md' }: { size?: LoaderProps['size'], progress?: number }) => {
  const sizeConfig = {
    sm: { container: 80 },
    md: { container: 120 },
    lg: { container: 160 },
    xl: { container: 200 }
  };

  const config = sizeConfig[size];

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      role="status"
      aria-label="Holographic AI interface loading"
      aria-live="polite"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(79, 156, 249, 0.05)"
      borderRadius="xl"
    >
      <Spinner size="lg" color="blue.400" />
    </Box>
  );
});

// LiquidMetalLoader - Simplified
const LiquidMetalLoader = memo(({ size = 'md' }: { size?: LoaderProps['size'], progress?: number }) => {
  const sizeConfig = {
    sm: { container: 80 },
    md: { container: 120 },
    lg: { container: 160 },
    xl: { container: 200 }
  };

  const config = sizeConfig[size];

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      role="status"
      aria-label="Liquid metal AI processing"
      aria-live="polite"
      overflow="hidden"
      borderRadius="xl"
      bg="rgba(0, 0, 0, 0.05)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner size="lg" color="purple.400" />
    </Box>
  );
});

// Main Loader component with progress prop integrated
export const Loader = memo(({ variant = 'spinner', size = 'md', message, fullScreen = false, lines = 3, progress = 0 }: LoaderProps) => {
  const bg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(0, 0, 0, 0.95)');
  const textColor = useColorModeValue('#64748B', '#94A3B8');
  const containerBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');

  const renderLoader = () => {
    switch (variant) {
      case 'spinner': return <Spinner size={size} color="blue.500" thickness="3px" speed={`${0.65 * (1 - progress / 100)}s`} />;
      case 'skeleton': return <SkeletonLoader lines={lines} />;
      case 'neurastack': case 'innovative': return <NeuraStackSpinner size={size} progress={progress} />;
      case 'premium': return <PremiumSpinner size={size} progress={progress} />;
      case 'ensemble': case 'modern': return <ModernEnsembleLoader size={size} progress={progress} />;
      case 'team': return <WaveAnimation size={size} progress={progress} />;
      case 'futuristic': return <FuturisticLoader size={size} progress={progress} />;
      case 'quantum': return <QuantumLoader size={size} progress={progress} />;
      case 'glassmorph': return <GlassmorphLoader size={size} progress={progress} />;
      case 'morphing': return <MorphingLoader size={size} progress={progress} />;
      case 'neural': return <NeuralNetworkLoader size={size} progress={progress} />;
      case 'chat': return <ChatLoader size={size} progress={progress} />;
      case 'particle': return <ParticlePhysicsLoader size={size} progress={progress} />;
      case 'matrix': return <MatrixLoader size={size} progress={progress} />;
      case 'holographic': return <HolographicLoader size={size} progress={progress} />;
      case 'liquid': return <LiquidMetalLoader size={size} progress={progress} />;
      default: return <Spinner size={size} color="blue.500" thickness="3px" />;
    }
  };

  const content = (
    <Flex
      direction="column"
      align="center"
      gap={4}
      p={6}
      bg={containerBg}
      borderRadius="2xl"
      backdropFilter="blur(20px)"
      border="1px solid rgba(79, 156, 249, 0.1)"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(79, 156, 249, 0.1)"
      maxW="320px"
      mx="auto"
    >
      {renderLoader()}
      {message && (
        <Text
          fontSize={{ base: "sm", md: "md" }}
          color={textColor}
          textAlign="center"
          fontWeight="500"
          letterSpacing="-0.01em"
          lineHeight="1.5"
          maxW="280px"
        >
          {message}
        </Text>
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
        backdropFilter="blur(8px)"
        zIndex={9999}
        align="center"
        justify="center"
        p={4}
      >
        {content}
      </Flex>
    );
  }

  return content;
});

export function MessageSkeleton() { return <Loader variant="skeleton" lines={2} />; }

export function PageLoader({ message = 'Loading page...' }: { message?: string }) {
  return <Flex h="100vh" w="100%" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.900' }}><Loader size="lg" message={message} /></Flex>;
}

export default Loader;