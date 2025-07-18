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

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'skeleton' | 'team' | 'futuristic' | 'modern' | 'ensemble' | 'innovative' | 'quantum' | 'glassmorph' | 'morphing' | 'chat' | 'neural' | 'holographic' | 'liquid' | 'ai-brain' | 'particle' | 'matrix';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  lines?: number;
}

// Enhanced InnovativeSpinner with modern design system integration
const InnovativeSpinner = memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [activeNode, setActiveNode] = useState(0);
  const [connectionPhase, setConnectionPhase] = useState(0);
  const [neuralPulse, setNeuralPulse] = useState(0);
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { container: 64, node: 8, core: 6, orbit: 20 },
    md: { container: 88, node: 10, core: 8, orbit: 28 },
    lg: { container: 112, node: 12, core: 10, orbit: 36 },
    xl: { container: 136, node: 14, core: 12, orbit: 44 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const intervals = [
      setInterval(() => setActiveNode(n => (n + 1) % 4), 1000),
      setInterval(() => setConnectionPhase(p => (p + 1) % 6), 400),
      setInterval(() => setNeuralPulse(p => (p + 1) % 3), 1500),
      setInterval(() => setThinkingPhase(p => (p + 1) % 8), 200)
    ];
    return () => intervals.forEach(clearInterval);
  }, [prefersReducedMotion]);

  const nodes = [
    { x: 0.3, y: 0.2, color: '#10B981', name: 'GPT', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
    { x: 0.7, y: 0.2, color: '#8B5CF6', name: 'Claude', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
    { x: 0.3, y: 0.8, color: '#F59E0B', name: 'Gemini', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
    { x: 0.7, y: 0.8, color: '#4F9CF9', name: 'Synthesis', gradient: 'linear-gradient(135deg, #4F9CF9 0%, #3B82F6 100%)' }
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
      bg="rgba(255, 255, 255, 0.02)"
      borderRadius="50%"
      backdropFilter="blur(10px)"
      border="1px solid rgba(79, 156, 249, 0.1)"
      boxShadow="0 8px 32px rgba(79, 156, 249, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      _before={{
        content: '""',
        position: "absolute",
        inset: "-2px",
        borderRadius: "50%",
        background: "linear-gradient(45deg, rgba(79, 156, 249, 0.1), rgba(139, 92, 246, 0.1), rgba(79, 156, 249, 0.1))",
        zIndex: -1,
        animation: prefersReducedMotion ? 'none' : 'borderGlow 3s ease-in-out infinite'
      }}
      sx={{
        '@keyframes borderGlow': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.8 }
        }
      }}
    >
      <svg
        width={config.container}
        height={config.container}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.6,
          filter: 'drop-shadow(0 0 4px rgba(79, 156, 249, 0.2))'
        }}
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(79, 156, 249, 0.8)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.6)" />
            <stop offset="100%" stopColor="rgba(79, 156, 249, 0.8)" />
          </linearGradient>
        </defs>
        {nodes.map((node, i) =>
          nodes.slice(i + 1).map((targetNode, j) => {
            const isActive = connectionPhase === ((i + j) % 6);
            const isThinking = thinkingPhase === ((i + j) % 8);
            return (
              <line
                key={`${i}-${j}`}
                x1={node.x * config.container}
                y1={node.y * config.container}
                x2={targetNode.x * config.container}
                y2={targetNode.y * config.container}
                stroke={isActive ? 'url(#connectionGradient)' : 'rgba(79, 156, 249, 0.15)'}
                strokeWidth={isActive ? 3 : isThinking ? 2 : 1}
                style={{
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  strokeDasharray: isActive ? 'none' : isThinking ? '4,2' : '2,3',
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(79, 156, 249, 0.4))' : 'none',
                  strokeLinecap: 'round'
                }}
              />
            );
          })
        )}
      </svg>

      {nodes.map((node, i) => {
        const isActive = activeNode === i;
        const isThinking = thinkingPhase === i;
        return (
          <Box
            key={i}
            position="absolute"
            left={`${node.x * config.container - config.node / 2}px`}
            top={`${node.y * config.container - config.node / 2}px`}
            w={`${config.node}px`}
            h={`${config.node}px`}
            borderRadius="50%"
            bg={isActive ? node.gradient : `${node.color}40`}
            border="2px solid"
            borderColor={isActive ? node.color : isThinking ? `${node.color}60` : 'transparent'}
            transform={isActive ? 'scale(1.5)' : isThinking ? 'scale(1.1)' : 'scale(1)'}
            transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            boxShadow={
              isActive
                ? `0 0 20px ${node.color}60, 0 0 40px ${node.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                : isThinking
                ? `0 0 12px ${node.color}40`
                : '0 2px 8px rgba(0, 0, 0, 0.1)'
            }
            aria-label={node.name}
            _before={isActive ? {
              content: '""',
              position: "absolute",
              inset: "-4px",
              borderRadius: "50%",
              background: `linear-gradient(45deg, ${node.color}20, transparent, ${node.color}20)`,
              zIndex: -1,
              animation: prefersReducedMotion ? 'none' : 'nodeGlow 2s ease-in-out infinite'
            } : {}}
            sx={{
              '@keyframes nodeGlow': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                '50%': { transform: 'scale(1.2)', opacity: 1 }
              }
            }}
          />
        );
      })}

      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w={`${config.core}px`}
        h={`${config.core}px`}
        borderRadius="50%"
        bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 50%, #4F9CF9 100%)"
        opacity={neuralPulse === 0 ? 1 : 0.8}
        animation={prefersReducedMotion ? 'none' : "neuralCore 2s ease-in-out infinite"}
        border="2px solid rgba(255, 255, 255, 0.3)"
        sx={{
          '@keyframes neuralCore': {
            '0%, 100%': {
              transform: 'translate(-50%, -50%) scale(1)',
              opacity: 0.9,
              boxShadow: '0 0 16px rgba(79, 156, 249, 0.5), 0 0 32px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
            },
            '50%': {
              transform: 'translate(-50%, -50%) scale(1.3)',
              opacity: 1,
              boxShadow: '0 0 24px rgba(79, 156, 249, 0.8), 0 0 48px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
            }
          }
        }}
      />

      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w={`${config.container * 0.85}px`}
        h={`${config.container * 0.85}px`}
        borderRadius="50%"
        border="2px solid"
        borderColor="rgba(79, 156, 249, 0.2)"
        animation={prefersReducedMotion ? 'none' : "energyRing 4s ease-in-out infinite"}
        sx={{
          background: 'conic-gradient(from 0deg, transparent, rgba(79, 156, 249, 0.1), transparent, rgba(139, 92, 246, 0.1), transparent)',
          '@keyframes energyRing': {
            '0%': {
              transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
              borderColor: 'rgba(79, 156, 249, 0.2)',
              opacity: 0.7
            },
            '50%': {
              transform: 'translate(-50%, -50%) scale(1.02) rotate(180deg)',
              borderColor: 'rgba(79, 156, 249, 0.4)',
              opacity: 1
            },
            '100%': {
              transform: 'translate(-50%, -50%) scale(1) rotate(360deg)',
              borderColor: 'rgba(79, 156, 249, 0.2)',
              opacity: 0.7
            }
          }
        }}
      />

      {/* Add floating particles for extra visual interest */}
      {!prefersReducedMotion && Array.from({ length: 6 }, (_, i) => (
        <Box
          key={`particle-${i}`}
          position="absolute"
          top="50%"
          left="50%"
          w="3px"
          h="3px"
          borderRadius="50%"
          bg="rgba(79, 156, 249, 0.6)"
          transform={`translate(-50%, -50%) rotate(${i * 60}deg) translateY(-${config.orbit}px)`}
          animation={`particleOrbit 3s ease-in-out infinite ${i * 0.5}s`}
          sx={{
            '@keyframes particleOrbit': {
              '0%, 100%': {
                opacity: 0.3,
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-${config.orbit}px) scale(1)`
              },
              '50%': {
                opacity: 1,
                transform: `translate(-50%, -50%) rotate(${i * 60 + 180}deg) translateY(-${config.orbit + 8}px) scale(1.5)`
              }
            }
          }}
        />
      ))}
    </Box>
  );
});

// Optimized ModernEnsembleLoader with reduced state updates
const ModernEnsembleLoader = memo(({ size = 'md' }: { size?: string }) => {
  const [phase, setPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => setPhase(prev => (prev + 1) % 4), 1200);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);
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

// Enhanced WaveAnimation with immersive effects
const WaveAnimation = memo(({ size = 'md' }: { size?: string }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => setAnimationPhase(prev => (prev + 1) % 8), 2500);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);
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

// Optimized FuturisticLoader with 3D enhancements
const FuturisticLoader = memo(({ size = 'md' }: { size?: string }) => {
  const [neuralPhase, setNeuralPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => setNeuralPhase(prev => (prev + 1) % 6), 1000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);
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

// Enhanced QuantumLoader with mixed 2D/3D and personalization
const QuantumLoader = memo(({ size = 'md' }: { size?: string }) => {
  const containerSize = size === 'sm' ? 50 : size === 'md' ? 70 : size === 'lg' ? 90 : 110;
  const prefersReducedMotion = useReducedMotion();
  const primaryColor = useColorModeValue('#4F9CF9', '#60A5FA');
  return (
    <Box
      w={`${containerSize}px`}
      h={`${containerSize}px`}
      position="relative"
      animation={prefersReducedMotion ? 'none' : 'rotate3d 4s linear infinite'}
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
        animation={prefersReducedMotion ? 'none' : 'pulse 2s ease-in-out infinite'}
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
        animation={prefersReducedMotion ? 'none' : 'spin 3s linear infinite reverse'}
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

// New GlassmorphLoader for 2025 glassmorphism trend
const GlassmorphLoader = memo(({ size = 'md' }: { size?: string }) => {
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
        animation={prefersReducedMotion ? 'none' : 'rotate 2s linear infinite'}
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

// New MorphingLoader for morphing trend
const MorphingLoader = memo(({ size = 'md' }: { size?: string }) => {
  const [phase, setPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => setPhase(p => (p + 1) % 4), 800);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);
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
        animation={prefersReducedMotion ? 'none' : `morph 3.2s ease-in-out infinite`}
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

// Revolutionary Neural Network Loader - Real-time AI processing visualization
const NeuralNetworkLoader = memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [neuronStates, setNeuronStates] = useState<number[]>([]);
  const [synapseActivity, setSynapseActivity] = useState<{ from: number; to: number; intensity: number }[]>([]);
  const [processingWave, setProcessingWave] = useState(0);
  const [brainActivity, setBrainActivity] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { container: 80, neuron: 4, layers: 3, neuronsPerLayer: 4 },
    md: { container: 120, neuron: 6, layers: 4, neuronsPerLayer: 5 },
    lg: { container: 160, neuron: 8, layers: 5, neuronsPerLayer: 6 },
    xl: { container: 200, neuron: 10, layers: 6, neuronsPerLayer: 7 }
  };

  const config = sizeConfig[size];

  // Generate neural network structure
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

  // Generate synaptic connections
  const synapses = useMemo(() => {
    const connections: { from: number; to: number }[] = [];
    neurons.forEach(neuron => {
      if (neuron.layer < config.layers - 1) {
        const nextLayerNeurons = neurons.filter(n => n.layer === neuron.layer + 1);
        nextLayerNeurons.forEach(nextNeuron => {
          if (Math.random() > 0.3) { // 70% connection probability
            connections.push({ from: neuron.id, to: nextNeuron.id });
          }
        });
      }
    });
    return connections;
  }, [neurons, config.layers]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Initialize neuron states
    setNeuronStates(new Array(neurons.length).fill(0));

    const intervals = [
      // Neural firing pattern
      setInterval(() => {
        setNeuronStates(prev => prev.map((_, i) => {
          const neuron = neurons[i];
          if (neuron.layer === 0) {
            return Math.random() > 0.7 ? 1 : Math.max(0, prev[i] - 0.1);
          }

          // Propagate activation from previous layer
          const prevLayerNeurons = neurons.filter(n => n.layer === neuron.layer - 1);
          const activation = prevLayerNeurons.reduce((sum, prevNeuron) => {
            const hasConnection = synapses.some(s => s.from === prevNeuron.id && s.to === neuron.id);
            return sum + (hasConnection ? prev[prevNeuron.id] : 0);
          }, 0);

          return Math.min(1, Math.max(0, activation * 0.8 + (Math.random() - 0.5) * 0.2));
        }));
      }, 100),

      // Synapse activity visualization
      setInterval(() => {
        setSynapseActivity(() => {
          const newActivity = synapses
            .filter(() => Math.random() > 0.8)
            .map(synapse => ({
              ...synapse,
              intensity: Math.random()
            }));
          return newActivity;
        });
      }, 150),

      // Processing wave animation
      setInterval(() => setProcessingWave(p => (p + 1) % 100), 50),

      // Overall brain activity pulse
      setInterval(() => setBrainActivity(a => (a + 1) % 60), 100)
    ];

    return () => intervals.forEach(clearInterval);
  }, [prefersReducedMotion, config.layers, config.neuronsPerLayer]);

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
          radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(79, 156, 249, 0.02) 100%)
        `,
        backdropFilter: 'blur(20px)',
        boxShadow: `
          0 8px 32px rgba(79, 156, 249, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 0 1px rgba(79, 156, 249, 0.05)
        `
      }}
    >
      {/* Neural network background grid */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.1}
        sx={{
          backgroundImage: `
            linear-gradient(rgba(79, 156, 249, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79, 156, 249, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          animation: prefersReducedMotion ? 'none' : 'gridPulse 4s ease-in-out infinite',
          '@keyframes gridPulse': {
            '0%, 100%': { opacity: 0.05 },
            '50%': { opacity: 0.15 }
          }
        }}
      />

      {/* Synaptic connections */}
      <svg

        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      >
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
              style={{
                transition: 'all 0.2s ease',
                filter: isActive ? 'drop-shadow(0 0 4px rgba(79, 156, 249, 0.6))' : 'none'
              }}
            />
          );
        })}

        {/* Processing wave effect */}
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(79, 156, 249, 0)" />
            <stop offset="50%" stopColor="rgba(79, 156, 249, 0.8)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </linearGradient>
        </defs>

        <rect
          x={`${(processingWave / 100) * config.container - 20}px`}
          y="0"
          width="40"
          height="100%"
          fill="url(#waveGradient)"
          opacity={0.6}
          style={{
            transition: 'none',
            animation: prefersReducedMotion ? 'none' : 'none'
          }}
        />
      </svg>

      {/* Neurons */}
      {neurons.map((neuron, i) => {
        const activation = neuronStates[i] || 0;
        const isActive = activation > 0.5;
        // const pulseIntensity = Math.sin((brainActivity + i * 10) * 0.1) * 0.5 + 0.5;

        return (
          <Box
            key={neuron.id}
            position="absolute"
            left={`${neuron.x - config.neuron / 2}px`}
            top={`${neuron.y - config.neuron / 2}px`}
            w={`${config.neuron + (isActive ? 4 : 0)}px`}
            h={`${config.neuron + (isActive ? 4 : 0)}px`}
            borderRadius="50%"
            bg={isActive
              ? `linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)`
              : `rgba(79, 156, 249, ${0.3 + activation * 0.4})`
            }
            border={isActive ? '2px solid rgba(255, 255, 255, 0.8)' : '1px solid rgba(79, 156, 249, 0.3)'}
            transform={`scale(${1 + activation * 0.3})`}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            zIndex={2}
            boxShadow={isActive
              ? `0 0 ${8 + activation * 12}px rgba(79, 156, 249, ${0.6 + activation * 0.4}),
                 0 0 ${16 + activation * 24}px rgba(79, 156, 249, ${0.3 + activation * 0.2})`
              : `0 0 4px rgba(79, 156, 249, 0.2)`
            }
            _before={isActive ? {
              content: '""',
              position: "absolute",
              inset: "-2px",
              borderRadius: "50%",
              background: `conic-gradient(from ${brainActivity * 6}deg,
                rgba(79, 156, 249, 0.3),
                rgba(139, 92, 246, 0.3),
                rgba(79, 156, 249, 0.3))`,
              zIndex: -1,
              animation: prefersReducedMotion ? 'none' : 'neuronGlow 1s ease-in-out infinite'
            } : {}}
            sx={{
              '@keyframes neuronGlow': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  opacity: 0.6
                },
                '50%': {
                  transform: 'scale(1.1)',
                  opacity: 1
                }
              }
            }}
          >
            {/* Neuron core */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="60%"
              h="60%"
              borderRadius="50%"
              bg="rgba(255, 255, 255, 0.9)"
              opacity={activation}
              animation={prefersReducedMotion ? 'none' : isActive ? 'coreFlicker 0.5s ease-in-out infinite' : 'none'}
              sx={{
                '@keyframes coreFlicker': {
                  '0%, 100%': { opacity: 0.9 },
                  '50%': { opacity: 0.6 }
                }
              }}
            />
          </Box>
        );
      })}

      {/* Central processing indicator */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="20px"
        h="20px"
        borderRadius="50%"
        bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)"
        border="2px solid rgba(255, 255, 255, 0.8)"
        zIndex={3}
        animation={prefersReducedMotion ? 'none' : 'centralPulse 2s ease-in-out infinite'}
        boxShadow="0 0 20px rgba(79, 156, 249, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)"
        sx={{
          '@keyframes centralPulse': {
            '0%, 100%': {
              transform: 'translate(-50%, -50%) scale(1)',
              boxShadow: '0 0 20px rgba(79, 156, 249, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)'
            },
            '50%': {
              transform: 'translate(-50%, -50%) scale(1.2)',
              boxShadow: '0 0 30px rgba(79, 156, 249, 1), 0 0 60px rgba(139, 92, 246, 0.6)'
            }
          }
        }}
      />
    </Box>
  );
});

// Enhanced ChatLoader specifically designed for chat interface
const ChatLoader = memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [typingDots, setTypingDots] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { container: 60, dot: 6, spacing: 8 },
    md: { container: 80, dot: 8, spacing: 12 },
    lg: { container: 100, dot: 10, spacing: 16 },
    xl: { container: 120, dot: 12, spacing: 20 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => setTypingDots(d => (d + 1) % 4), 600);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

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
      {/* Chat bubble container */}
      <Box
        position="relative"
        bg="rgba(255, 255, 255, 0.95)"
        borderRadius="24px 24px 24px 8px"
        p={4}
        border="1px solid rgba(226, 232, 240, 0.6)"
        boxShadow="0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(79, 156, 249, 0.1)"
        backdropFilter="blur(20px)"
        minW={`${config.container * 0.8}px`}
        minH={`${config.container * 0.4}px`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        _before={{
          content: '""',
          position: "absolute",
          bottom: "-1px",
          left: "8px",
          width: "0",
          height: "0",
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid rgba(255, 255, 255, 0.95)",
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
        }}
      >
        {/* Typing dots */}
        <Flex align="center" gap={1.5}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w={`${config.dot}px`}
              h={`${config.dot}px`}
              borderRadius="50%"
              bg={typingDots === i ? "#4F9CF9" : "#CBD5E1"}
              transform={typingDots === i ? "scale(1.2)" : "scale(1)"}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              animation={prefersReducedMotion ? 'none' : typingDots === i ? 'typingBounce 0.6s ease-in-out infinite' : 'none'}
              sx={{
                '@keyframes typingBounce': {
                  '0%, 100%': { transform: 'scale(1.2) translateY(0)' },
                  '50%': { transform: 'scale(1.4) translateY(-4px)' }
                }
              }}
            />
          ))}
        </Flex>

        {/* Subtle brain icon */}
        <Box
          position="absolute"
          top="-8px"
          right="-8px"
          w="20px"
          h="20px"
          borderRadius="50%"
          bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 2px 8px rgba(79, 156, 249, 0.3)"
          animation={prefersReducedMotion ? 'none' : 'brainPulse 2s ease-in-out infinite'}
          sx={{
            '@keyframes brainPulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
              '50%': { transform: 'scale(1.1)', opacity: 1 }
            }
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        </Box>
      </Box>
    </Box>
  );
});

export const Loader = memo(({ variant = 'spinner', size = 'md', message, fullScreen = false, lines = 3 }: LoaderProps) => {
  const bg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(0, 0, 0, 0.95)');
  const textColor = useColorModeValue('#64748B', '#94A3B8');
  const containerBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');

// Particle Physics Loader - Quantum particle interactions
const ParticlePhysicsLoader = memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [particles, setParticles] = useState<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    charge: number;
    mass: number;
    energy: number;
  }[]>([]);
  const [fieldLines, setFieldLines] = useState<{ x1: number; y1: number; x2: number; y2: number; intensity: number }[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { container: 80, particleCount: 8 },
    md: { container: 120, particleCount: 12 },
    lg: { container: 160, particleCount: 16 },
    xl: { container: 200, particleCount: 20 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Initialize particles
    const initialParticles = Array.from({ length: config.particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * config.container,
      y: Math.random() * config.container,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      charge: Math.random() > 0.5 ? 1 : -1,
      mass: 0.5 + Math.random() * 0.5,
      energy: Math.random()
    }));

    setParticles(initialParticles);
  }, [prefersReducedMotion, config]);

  useEffect(() => {
    if (prefersReducedMotion || particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => {
        let fx = 0, fy = 0;

        // Calculate forces from other particles
        prev.forEach(other => {
          if (other.id !== particle.id) {
            const dx = other.x - particle.x;
            const dy = other.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy) + 1;
            const force = (particle.charge * other.charge) / (distance * distance);

            fx -= force * dx / distance;
            fy -= force * dy / distance;
          }
        });

        // Apply central attraction
        const centerX = config.container / 2;
        const centerY = config.container / 2;
        const dcx = centerX - particle.x;
        const dcy = centerY - particle.y;
        const centerDistance = Math.sqrt(dcx * dcx + dcy * dcy) + 1;

        fx += 0.1 * dcx / centerDistance;
        fy += 0.1 * dcy / centerDistance;

        // Update velocity and position
        let newVx = (particle.vx + fx * 0.1) * 0.98;
        let newVy = (particle.vy + fy * 0.1) * 0.98;

        let newX = particle.x + newVx;
        let newY = particle.y + newVy;

        // Boundary conditions
        if (newX < 0 || newX > config.container) newVx *= -0.8;
        if (newY < 0 || newY > config.container) newVy *= -0.8;

        newX = Math.max(0, Math.min(config.container, newX));
        newY = Math.max(0, Math.min(config.container, newY));

        return {
          ...particle,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          energy: Math.min(1, Math.sqrt(newVx * newVx + newVy * newVy) * 0.5)
        };
      }));

      // Update field lines
      setFieldLines(prev => {
        const newLines: typeof prev = [];
        particles.forEach((p1, i) => {
          particles.slice(i + 1).forEach(p2 => {
            const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            if (distance < 60) {
              newLines.push({
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y,
                intensity: Math.max(0, 1 - distance / 60)
              });
            }
          });
        });
        return newLines;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, config.container]);

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
      sx={{
        background: `
          radial-gradient(circle at center, rgba(79, 156, 249, 0.05) 0%, transparent 70%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.02) 100%)
        `
      }}
    >
      {/* Quantum field background */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.1}
        sx={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(79, 156, 249, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)
          `,
          animation: prefersReducedMotion ? 'none' : 'quantumField 8s ease-in-out infinite',
          '@keyframes quantumField': {
            '0%, 100%': { opacity: 0.1 },
            '50%': { opacity: 0.2 }
          }
        }}
      />

      {/* Field lines */}
      <svg

        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {fieldLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={`rgba(79, 156, 249, ${line.intensity * 0.6})`}
            strokeWidth={line.intensity * 2}
            opacity={line.intensity}
            style={{
              filter: `drop-shadow(0 0 ${line.intensity * 4}px rgba(79, 156, 249, 0.4))`
            }}
          />
        ))}
      </svg>

      {/* Particles */}
      {particles.map(particle => (
        <Box
          key={particle.id}
          position="absolute"
          left={`${particle.x}px`}
          top={`${particle.y}px`}
          w={`${4 + particle.mass * 4}px`}
          h={`${4 + particle.mass * 4}px`}
          transform="translate(-50%, -50%)"
          borderRadius="50%"
          bg={particle.charge > 0
            ? `linear-gradient(135deg, #4F9CF9 0%, #60A5FA 100%)`
            : `linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)`
          }
          border={`2px solid ${particle.charge > 0 ? 'rgba(79, 156, 249, 0.8)' : 'rgba(139, 92, 246, 0.8)'}`}
          opacity={0.8 + particle.energy * 0.2}
          boxShadow={`
            0 0 ${8 + particle.energy * 12}px ${particle.charge > 0 ? 'rgba(79, 156, 249, 0.6)' : 'rgba(139, 92, 246, 0.6)'},
            0 0 ${16 + particle.energy * 24}px ${particle.charge > 0 ? 'rgba(79, 156, 249, 0.3)' : 'rgba(139, 92, 246, 0.3)'}
          `}
          sx={{
            transition: 'all 0.1s ease',
            animation: prefersReducedMotion ? 'none' : particle.energy > 0.7 ? 'particleExcited 0.5s ease-in-out infinite' : 'none',
            '@keyframes particleExcited': {
              '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
              '50%': { transform: 'translate(-50%, -50%) scale(1.2)' }
            }
          }}
        >
          {/* Particle core */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="50%"
            h="50%"
            borderRadius="50%"
            bg="rgba(255, 255, 255, 0.9)"
            opacity={particle.energy}
          />
        </Box>
      ))}

      {/* Central quantum core */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="16px"
        h="16px"
        borderRadius="50%"
        bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)"
        border="2px solid rgba(255, 255, 255, 0.8)"
        zIndex={2}
        animation={prefersReducedMotion ? 'none' : 'quantumCore 3s ease-in-out infinite'}
        sx={{
          '@keyframes quantumCore': {
            '0%, 100%': {
              transform: 'translate(-50%, -50%) scale(1)',
              boxShadow: '0 0 16px rgba(79, 156, 249, 0.8)'
            },
            '50%': {
              transform: 'translate(-50%, -50%) scale(1.3)',
              boxShadow: '0 0 32px rgba(79, 156, 249, 1)'
            }
          }
        }}
      />
    </Box>
  );
});

// Matrix Digital Rain Loader - Cyberpunk AI interface
const MatrixLoader = memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [columns, setColumns] = useState<{
    id: number;
    chars: string[];
    speeds: number[];
    positions: number[];
    opacities: number[];
  }[]>([]);
  const [codeStream, setCodeStream] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { container: 80, cols: 8, charSize: 8 },
    md: { container: 120, cols: 12, charSize: 10 },
    lg: { container: 160, cols: 16, charSize: 12 },
    xl: { container: 200, cols: 20, charSize: 14 }
  };

  const config = sizeConfig[size];

  const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const aiTerms = ['AI', 'ML', 'DL', 'NN', 'GPU', 'CPU', 'API', 'SDK', 'NLP', 'CV', 'RL', 'GAN'];

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Initialize columns
    const initialColumns = Array.from({ length: config.cols }, (_, i) => {
      const charsPerCol = Math.floor(config.container / config.charSize);
      return {
        id: i,
        chars: Array.from({ length: charsPerCol }, () =>
          Math.random() > 0.1
            ? matrixChars[Math.floor(Math.random() * matrixChars.length)]
            : aiTerms[Math.floor(Math.random() * aiTerms.length)]
        ),
        speeds: Array.from({ length: charsPerCol }, () => 0.5 + Math.random() * 1.5),
        positions: Array.from({ length: charsPerCol }, () => Math.random() * config.container),
        opacities: Array.from({ length: charsPerCol }, () => Math.random())
      };
    });

    setColumns(initialColumns);
  }, [prefersReducedMotion, config]);

  useEffect(() => {
    if (prefersReducedMotion || columns.length === 0) return;

    const interval = setInterval(() => {
      setColumns(prev => prev.map(column => ({
        ...column,
        chars: column.chars.map(() =>
          Math.random() > 0.05
            ? matrixChars[Math.floor(Math.random() * matrixChars.length)]
            : aiTerms[Math.floor(Math.random() * aiTerms.length)]
        ),
        positions: column.positions.map((pos, i) => {
          const newPos = pos + column.speeds[i];
          return newPos > config.container ? -config.charSize : newPos;
        }),
        opacities: column.opacities.map(() => 0.3 + Math.random() * 0.7)
      })));

      setCodeStream(s => (s + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, config.container, config.charSize]);

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
      sx={{
        background: `
          linear-gradient(135deg,
            rgba(0, 0, 0, 0.95) 0%,
            rgba(0, 20, 0, 0.9) 50%,
            rgba(0, 0, 0, 0.95) 100%
          )
        `,
        boxShadow: `
          0 0 20px rgba(0, 255, 0, 0.3),
          inset 0 0 20px rgba(0, 255, 0, 0.1)
        `
      }}
    >
      {/* Matrix rain columns */}
      {columns.map((column, colIndex) => (
        <Box
          key={column.id}
          position="absolute"
          left={`${(colIndex / config.cols) * 100}%`}
          top="0"
          w={`${100 / config.cols}%`}
          h="100%"
        >
          {column.chars.map((char, charIndex) => (
            <Text
              key={charIndex}
              position="absolute"
              top={`${column.positions[charIndex]}px`}
              left="50%"
              transform="translateX(-50%)"
              fontSize={`${config.charSize}px`}
              fontFamily="monospace"
              fontWeight="bold"
              color={charIndex === 0 ? '#00FF00' : `rgba(0, 255, 0, ${column.opacities[charIndex]})`}
              opacity={column.opacities[charIndex]}
              textShadow={charIndex === 0
                ? '0 0 10px #00FF00, 0 0 20px #00FF00'
                : '0 0 5px rgba(0, 255, 0, 0.5)'
              }
              sx={{
                animation: prefersReducedMotion ? 'none' : charIndex === 0 ? 'matrixGlow 1s ease-in-out infinite' : 'none',
                '@keyframes matrixGlow': {
                  '0%, 100%': {
                    textShadow: '0 0 10px #00FF00, 0 0 20px #00FF00',
                    transform: 'translateX(-50%) scale(1)'
                  },
                  '50%': {
                    textShadow: '0 0 15px #00FF00, 0 0 30px #00FF00, 0 0 40px #00FF00',
                    transform: 'translateX(-50%) scale(1.1)'
                  }
                }
              }}
            >
              {char}
            </Text>
          ))}
        </Box>
      ))}

      {/* Central AI core */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="40px"
        h="40px"
        border="2px solid #00FF00"
        borderRadius="lg"
        bg="rgba(0, 255, 0, 0.1)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        animation={prefersReducedMotion ? 'none' : 'matrixCore 2s ease-in-out infinite'}
        sx={{
          '@keyframes matrixCore': {
            '0%, 100%': {
              borderColor: '#00FF00',
              boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
              transform: 'translate(-50%, -50%) scale(1)'
            },
            '50%': {
              borderColor: '#00FFFF',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
              transform: 'translate(-50%, -50%) scale(1.1)'
            }
          }
        }}
      >
        <Text
          fontSize="12px"
          fontFamily="monospace"
          fontWeight="bold"
          color="#00FF00"
          textShadow="0 0 10px #00FF00"
        >
          AI
        </Text>
      </Box>

      {/* Scanning lines */}
      <Box
        position="absolute"
        top={`${(codeStream / 100) * 100}%`}
        left="0"
        right="0"
        h="2px"
        bg="linear-gradient(90deg, transparent, #00FF00, transparent)"
        opacity={0.8}
        animation={prefersReducedMotion ? 'none' : 'scanLine 2s linear infinite'}
        sx={{
          '@keyframes scanLine': {
            '0%': { top: '0%' },
            '100%': { top: '100%' }
          }
        }}
      />

      {/* Corner brackets */}
      {[
        { top: '10px', left: '10px', borderTop: '2px solid #00FF00', borderLeft: '2px solid #00FF00' },
        { top: '10px', right: '10px', borderTop: '2px solid #00FF00', borderRight: '2px solid #00FF00' },
        { bottom: '10px', left: '10px', borderBottom: '2px solid #00FF00', borderLeft: '2px solid #00FF00' },
        { bottom: '10px', right: '10px', borderBottom: '2px solid #00FF00', borderRight: '2px solid #00FF00' }
      ].map((style, i) => (
        <Box
          key={i}
          position="absolute"
          w="15px"
          h="15px"
          opacity={0.6 + Math.sin(codeStream * 0.1 + i) * 0.4}
          sx={style}
        />
      ))}

      {/* Status indicators */}
      <Box
        position="absolute"
        bottom="5px"
        left="5px"
        fontSize="6px"
        fontFamily="monospace"
        color="rgba(0, 255, 0, 0.8)"
        display="flex"
        gap={1}
      >
        {['NEURAL', 'ACTIVE', 'PROCESSING'].map((status, i) => (
          <Text
            key={status}
            opacity={(codeStream + i * 20) % 60 < 30 ? 1 : 0.3}
            transition="opacity 0.2s ease"
          >
            {status}
          </Text>
        ))}
      </Box>
    </Box>
  );
});

  const renderLoader = () => {
    switch (variant) {
      case 'neural': return <NeuralNetworkLoader size={size} />;
      case 'holographic': return <HolographicLoader size={size} />;
      case 'liquid': return <LiquidMetalLoader size={size} />;
      case 'particle': return <ParticlePhysicsLoader size={size} />;
      case 'matrix': return <MatrixLoader size={size} />;
      case 'innovative': return <InnovativeSpinner size={size} />;
      case 'chat': return <ChatLoader size={size} />;
      case 'ensemble': case 'modern': return <ModernEnsembleLoader size={size} />;
      case 'team': return <WaveAnimation size={size} />;
      case 'futuristic': return <FuturisticLoader size={size} />;
      case 'quantum': return <QuantumLoader size={size} />;
      case 'glassmorph': return <GlassmorphLoader size={size} />;
      case 'morphing': return <MorphingLoader size={size} />;
      case 'skeleton': return <SkeletonLoader lines={lines} />;
      case 'spinner': default: return <Spinner size={size} color="blue.500" thickness="3px" />;
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

// Holographic AI Interface Loader - 3D holographic projection effect
const HolographicLoader = memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [hologramPhase, setHologramPhase] = useState(0);
  const [scanLine, setScanLine] = useState(0);
  const [dataStream, setDataStream] = useState<{ id: number; x: number; y: number; opacity: number }[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { container: 80, projection: 60 },
    md: { container: 120, projection: 90 },
    lg: { container: 160, projection: 120 },
    xl: { container: 200, projection: 150 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const intervals = [
      setInterval(() => setHologramPhase(p => (p + 1) % 360), 50),
      setInterval(() => setScanLine(s => (s + 1) % 100), 80),
      setInterval(() => {
        setDataStream(() => {
          const newStream = Array.from({ length: 20 }, (_, i) => ({
            id: Date.now() + i,
            x: Math.random() * config.projection,
            y: Math.random() * config.projection,
            opacity: Math.random()
          }));
          return newStream;
        });
      }, 200)
    ];

    return () => intervals.forEach(clearInterval);
  }, [prefersReducedMotion, config.projection]);

  return (
    <Box
      position="relative"
      w={`${config.container}px`}
      h={`${config.container}px`}
      role="status"
      aria-label="Holographic AI interface loading"
      aria-live="polite"
      sx={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Holographic base platform */}
      <Box
        position="absolute"
        bottom="10px"
        left="50%"
        transform="translateX(-50%)"
        w="80%"
        h="4px"
        bg="linear-gradient(90deg, transparent, rgba(79, 156, 249, 0.8), transparent)"
        borderRadius="full"
        animation={prefersReducedMotion ? 'none' : 'platformGlow 2s ease-in-out infinite'}
        sx={{
          '@keyframes platformGlow': {
            '0%, 100%': {
              boxShadow: '0 0 10px rgba(79, 156, 249, 0.5)',
              opacity: 0.8
            },
            '50%': {
              boxShadow: '0 0 20px rgba(79, 156, 249, 0.8)',
              opacity: 1
            }
          }
        }}
      />

      {/* Main holographic projection */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform={`translate(-50%, -50%) rotateY(${hologramPhase}deg) rotateX(10deg)`}
        w={`${config.projection}px`}
        h={`${config.projection}px`}
        border="2px solid rgba(79, 156, 249, 0.6)"
        borderRadius="lg"
        bg="rgba(79, 156, 249, 0.05)"
        backdropFilter="blur(10px)"
        sx={{
          background: `
            linear-gradient(45deg,
              rgba(79, 156, 249, 0.1) 0%,
              rgba(139, 92, 246, 0.1) 50%,
              rgba(79, 156, 249, 0.1) 100%
            )
          `,
          boxShadow: `
            0 0 20px rgba(79, 156, 249, 0.4),
            inset 0 0 20px rgba(79, 156, 249, 0.1),
            0 8px 32px rgba(79, 156, 249, 0.2)
          `,
          animation: prefersReducedMotion ? 'none' : 'hologramFlicker 3s ease-in-out infinite',
          '@keyframes hologramFlicker': {
            '0%, 100%': { opacity: 0.9 },
            '25%': { opacity: 0.7 },
            '50%': { opacity: 1 },
            '75%': { opacity: 0.8 }
          }
        }}
      >
        {/* Holographic scan lines */}
        <Box
          position="absolute"
          top={`${scanLine}%`}
          left="0"
          right="0"
          h="2px"
          bg="linear-gradient(90deg, transparent, rgba(79, 156, 249, 0.8), transparent)"
          animation={prefersReducedMotion ? 'none' : 'scanMove 2s linear infinite'}
          sx={{
            '@keyframes scanMove': {
              '0%': { top: '0%' },
              '100%': { top: '100%' }
            }
          }}
        />

        {/* Data stream particles */}
        {dataStream.map(particle => (
          <Box
            key={particle.id}
            position="absolute"
            left={`${particle.x}px`}
            top={`${particle.y}px`}
            w="2px"
            h="2px"
            bg="rgba(79, 156, 249, 0.8)"
            borderRadius="full"
            opacity={particle.opacity}
            animation={prefersReducedMotion ? 'none' : 'particleFloat 1s ease-out forwards'}
            sx={{
              '@keyframes particleFloat': {
                '0%': {
                  transform: 'scale(0) translateY(0)',
                  opacity: 0
                },
                '50%': {
                  transform: 'scale(1) translateY(-10px)',
                  opacity: 1
                },
                '100%': {
                  transform: 'scale(0) translateY(-20px)',
                  opacity: 0
                }
              }
            }}
          />
        ))}

        {/* Central AI core */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="30px"
          h="30px"
          borderRadius="50%"
          bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)"
          border="2px solid rgba(255, 255, 255, 0.8)"
          animation={prefersReducedMotion ? 'none' : 'coreRotate 4s linear infinite'}
          boxShadow="0 0 20px rgba(79, 156, 249, 0.8)"
          sx={{
            '@keyframes coreRotate': {
              '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
              '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
            }
          }}
        >
          {/* Core inner elements */}
          {[0, 1, 2].map(i => (
            <Box
              key={i}
              position="absolute"
              top="50%"
              left="50%"
              w="4px"
              h="4px"
              bg="rgba(255, 255, 255, 0.9)"
              borderRadius="full"
              transform={`translate(-50%, -50%) rotate(${i * 120}deg) translateY(-8px)`}
              animation={prefersReducedMotion ? 'none' : `orbit${i} 2s ease-in-out infinite`}
              sx={{
                [`@keyframes orbit${i}`]: {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 }
                }
              }}
            />
          ))}
        </Box>

        {/* Holographic grid overlay */}
        <Box
          position="absolute"
          inset="10px"
          opacity={0.3}
          sx={{
            backgroundImage: `
              linear-gradient(rgba(79, 156, 249, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(79, 156, 249, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '10px 10px',
            animation: prefersReducedMotion ? 'none' : 'gridShift 4s ease-in-out infinite',
            '@keyframes gridShift': {
              '0%, 100%': {
                backgroundPosition: '0 0',
                opacity: 0.3
              },
              '50%': {
                backgroundPosition: '5px 5px',
                opacity: 0.5
              }
            }
          }}
        />
      </Box>

      {/* Holographic interference patterns */}
      {[0, 1, 2].map(i => (
        <Box
          key={i}
          position="absolute"
          top="50%"
          left="50%"
          transform={`translate(-50%, -50%) rotate(${i * 60 + hologramPhase}deg)`}
          w={`${config.projection + i * 20}px`}
          h="2px"
          bg={`linear-gradient(90deg,
            transparent,
            rgba(79, 156, 249, ${0.2 - i * 0.05}),
            transparent
          )`}
          opacity={0.6}
          animation={prefersReducedMotion ? 'none' : `interference${i} 3s ease-in-out infinite`}
          sx={{
            [`@keyframes interference${i}`]: {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 0.8 }
            }
          }}
        />
      ))}

      {/* Holographic status indicators */}
      <Box
        position="absolute"
        top="10px"
        right="10px"
        display="flex"
        flexDirection="column"
        gap={1}
      >
        {['NEURAL', 'QUANTUM', 'MATRIX'].map((label, i) => (
          <Box
            key={label}
            fontSize="6px"
            color="rgba(79, 156, 249, 0.8)"
            fontFamily="monospace"
            fontWeight="bold"
            opacity={(hologramPhase + i * 30) % 90 < 45 ? 1 : 0.3}
            transition="opacity 0.2s ease"
          >
            {label}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

// Liquid Metal Morphing Loader - Fluid, organic transformations
const LiquidMetalLoader = memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [morphPhase, setMorphPhase] = useState(0);
  // const [liquidState, setLiquidState] = useState(0);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; scale: number }[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { container: 80, blob: 40 },
    md: { container: 120, blob: 60 },
    lg: { container: 160, blob: 80 },
    xl: { container: 200, blob: 100 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const intervals = [
      setInterval(() => setMorphPhase(p => (p + 1) % 360), 100),
      // setInterval(() => setLiquidState(s => (s + 1) % 100), 150),
      setInterval(() => {
        setRipples(prev => {
          const newRipple = {
            id: Date.now(),
            x: Math.random() * config.container,
            y: Math.random() * config.container,
            scale: 0
          };
          return [...prev.slice(-5), newRipple];
        });
      }, 800)
    ];

    return () => intervals.forEach(clearInterval);
  }, [prefersReducedMotion, config.container]);

  // Update ripple animations
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setRipples(prev => prev.map(ripple => ({
        ...ripple,
        scale: Math.min(ripple.scale + 0.1, 2)
      })).filter(ripple => ripple.scale < 2));
    }, 50);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const morphTransform = useMemo(() => {
    const wave1 = Math.sin(morphPhase * 0.02) * 10;
    const wave2 = Math.cos(morphPhase * 0.03) * 8;
    const wave3 = Math.sin(morphPhase * 0.025) * 6;

    return `
      polygon(
        ${50 + wave1}% ${20 + wave2}%,
        ${80 + wave2}% ${50 + wave3}%,
        ${50 + wave3}% ${80 + wave1}%,
        ${20 + wave1}% ${50 + wave2}%
      )
    `;
  }, [morphPhase]);

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
      sx={{
        background: `
          radial-gradient(circle at 30% 30%, rgba(79, 156, 249, 0.1) 0%, transparent 70%),
          radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 70%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%)
        `
      }}
    >
      {/* Liquid metal base */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w={`${config.blob}px`}
        h={`${config.blob}px`}
        sx={{
          background: `
            linear-gradient(${morphPhase}deg,
              #4F9CF9 0%,
              #8B5CF6 25%,
              #4F9CF9 50%,
              #6366F1 75%,
              #4F9CF9 100%
            )
          `,
          clipPath: morphTransform,
          filter: 'blur(1px) contrast(1.2)',
          animation: prefersReducedMotion ? 'none' : 'liquidPulse 3s ease-in-out infinite',
          boxShadow: `
            0 0 20px rgba(79, 156, 249, 0.6),
            0 0 40px rgba(79, 156, 249, 0.3),
            inset 0 0 20px rgba(255, 255, 255, 0.2)
          `,
          '@keyframes liquidPulse': {
            '0%, 100%': {
              transform: 'translate(-50%, -50%) scale(1)',
              filter: 'blur(1px) contrast(1.2) brightness(1)'
            },
            '50%': {
              transform: 'translate(-50%, -50%) scale(1.1)',
              filter: 'blur(2px) contrast(1.4) brightness(1.2)'
            }
          }
        }}
      />

      {/* Liquid droplets */}
      {[0, 1, 2, 3].map(i => {
        const angle = (morphPhase + i * 90) * (Math.PI / 180);
        const radius = 30 + Math.sin(morphPhase * 0.02 + i) * 10;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <Box
            key={i}
            position="absolute"
            top="50%"
            left="50%"
            transform={`translate(-50%, -50%) translate(${x}px, ${y}px)`}
            w={`${8 + Math.sin(morphPhase * 0.03 + i) * 4}px`}
            h={`${8 + Math.sin(morphPhase * 0.03 + i) * 4}px`}
            borderRadius="50%"
            bg={`linear-gradient(135deg,
              rgba(79, 156, 249, 0.8) 0%,
              rgba(139, 92, 246, 0.8) 100%
            )`}
            opacity={0.7 + Math.sin(morphPhase * 0.02 + i) * 0.3}
            animation={prefersReducedMotion ? 'none' : `droplet${i} 2s ease-in-out infinite`}
            sx={{
              [`@keyframes droplet${i}`]: {
                '0%, 100%': {
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`,
                  opacity: 0.7
                },
                '50%': {
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.3)`,
                  opacity: 1
                }
              }
            }}
          />
        );
      })}

      {/* Surface ripples */}
      {ripples.map(ripple => (
        <Box
          key={ripple.id}
          position="absolute"
          left={`${ripple.x}px`}
          top={`${ripple.y}px`}
          w={`${20 * ripple.scale}px`}
          h={`${20 * ripple.scale}px`}
          transform="translate(-50%, -50%)"
          border="2px solid rgba(79, 156, 249, 0.4)"
          borderRadius="50%"
          opacity={1 - ripple.scale * 0.5}
          pointerEvents="none"
        />
      ))}

      {/* Liquid surface tension lines */}
      <svg

        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <filter id="liquidGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {[0, 1, 2].map(i => {
          const pathData = `
            M ${config.container * 0.2} ${config.container * 0.5 + Math.sin(morphPhase * 0.02 + i) * 10}
            Q ${config.container * 0.5} ${config.container * 0.3 + Math.cos(morphPhase * 0.025 + i) * 15}
            ${config.container * 0.8} ${config.container * 0.5 + Math.sin(morphPhase * 0.03 + i) * 8}
          `;

          return (
            <path
              key={i}
              d={pathData}
              stroke="rgba(79, 156, 249, 0.3)"
              strokeWidth="2"
              fill="none"
              filter="url(#liquidGlow)"
              opacity={0.6 + Math.sin(morphPhase * 0.02 + i) * 0.4}
            />
          );
        })}
      </svg>

      {/* Central core indicator */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="12px"
        h="12px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.9)"
        border="2px solid rgba(79, 156, 249, 0.8)"
        zIndex={2}
        animation={prefersReducedMotion ? 'none' : 'coreFloat 4s ease-in-out infinite'}
        sx={{
          '@keyframes coreFloat': {
            '0%, 100%': {
              transform: 'translate(-50%, -50%) translateY(0px)',
              boxShadow: '0 0 10px rgba(79, 156, 249, 0.6)'
            },
            '50%': {
              transform: 'translate(-50%, -50%) translateY(-5px)',
              boxShadow: '0 0 20px rgba(79, 156, 249, 0.8)'
            }
          }
        }}
      />
    </Box>
  );
});

export function MessageSkeleton() { return <Loader variant="skeleton" lines={2} />; }

export function PageLoader({ message = 'Loading page...' }: { message?: string }) {
  return <Flex h="100vh" w="100%" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.900' }}><Loader size="lg" message={message} /></Flex>;
}

export default Loader;