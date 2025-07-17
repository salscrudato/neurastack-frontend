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
  variant?: 'spinner' | 'dots' | 'skeleton' | 'team' | 'futuristic' | 'modern' | 'ensemble' | 'innovative' | 'quantum' | 'glassmorph' | 'morphing';
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
  const prefersReducedMotion = useReducedMotion();
  const primaryColor = 'var(--color-brand-primary)';

  const sizeConfig = {
    sm: { container: 56, node: 7, core: 4 },
    md: { container: 76, node: 9, core: 5 },
    lg: { container: 96, node: 11, core: 6 },
    xl: { container: 116, node: 13, core: 7 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const intervals = [
      setInterval(() => setActiveNode(n => (n + 1) % 4), 800),
      setInterval(() => setConnectionPhase(p => (p + 1) % 6), 300),
      setInterval(() => setNeuralPulse(p => (p + 1) % 3), 1200)
    ];
    return () => intervals.forEach(clearInterval);
  }, [prefersReducedMotion]);

  const nodes = [
    { x: 0.25, y: 0.25, color: 'var(--color-success)', name: 'GPT' },
    { x: 0.75, y: 0.25, color: 'var(--color-brand-secondary)', name: 'Claude' },
    { x: 0.25, y: 0.75, color: 'var(--color-warning)', name: 'Gemini' },
    { x: 0.75, y: 0.75, color: 'var(--color-brand-accent)', name: 'Synthesis' }
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
                stroke={isActive ? primaryColor : 'rgba(79, 156, 249, 0.2)'}
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
            aria-label={node.name}
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
        bg={primaryColor}
        opacity={neuralPulse === 0 ? 1 : 0.6}
        animation={prefersReducedMotion ? 'none' : "neuralCore 1.2s ease-in-out infinite"}
        sx={{
          '@keyframes neuralCore': {
            '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.8, boxShadow: '0 0 8px rgba(79, 156, 249, 0.4)' },
            '50%': { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 1, boxShadow: '0 0 20px rgba(79, 156, 249, 0.8)' }
          }
        }}
      />

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
        animation={prefersReducedMotion ? 'none' : "energyRing 3s ease-in-out infinite"}
        sx={{
          '@keyframes energyRing': {
            '0%, 100%': { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', borderColor: 'rgba(79, 156, 249, 0.15)', opacity: 0.6 },
            '50%': { transform: 'translate(-50%, -50%) scale(1.05) rotate(180deg)', borderColor: 'rgba(79, 156, 249, 0.3)', opacity: 1 }
          }
        }}
      />
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

export const Loader = memo(({ variant = 'spinner', size = 'md', message, fullScreen = false, lines = 3 }: LoaderProps) => {
  const bg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(0, 0, 0, 0.9)');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const renderLoader = () => {
    switch (variant) {
      case 'innovative': return <InnovativeSpinner size={size} />;
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
  const content = <Flex direction="column" align="center" gap={3}>{renderLoader()}{message && <Text fontSize="sm" color={textColor} textAlign="center" fontWeight="500">{message}</Text>}</Flex>;
  if (fullScreen) return <Flex position="fixed" top={0} left={0} right={0} bottom={0} bg={bg} backdropFilter="blur(4px)" zIndex={9999} align="center" justify="center">{content}</Flex>;
  return content;
});

export function MessageSkeleton() { return <Loader variant="skeleton" lines={2} />; }

export function PageLoader({ message = 'Loading page...' }: { message?: string }) {
  return <Flex h="100vh" w="100%" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.900' }}><Loader size="lg" message={message} /></Flex>;
}

export default Loader;