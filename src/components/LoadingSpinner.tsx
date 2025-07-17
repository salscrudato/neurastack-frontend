import {
    Box,
    Flex,
    SkeletonText,
    Spinner,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useAccessibility';

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'skeleton' | 'team' | 'futuristic' | 'modern' | 'ensemble' | 'innovative' | 'quantum' | 'glassmorph' | 'morphing' | 'chat';
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

  const renderLoader = () => {
    switch (variant) {
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

export function MessageSkeleton() { return <Loader variant="skeleton" lines={2} />; }

export function PageLoader({ message = 'Loading page...' }: { message?: string }) {
  return <Flex h="100vh" w="100%" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.900' }}><Loader size="lg" message={message} /></Flex>;
}

export default Loader;