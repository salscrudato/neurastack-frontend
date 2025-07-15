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
  variant?: 'spinner' | 'dots' | 'skeleton' | 'team' | 'futuristic' | 'modern' | 'ensemble' | 'innovative';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  lines?: number;
}

// Consolidated InnovativeSpinner component
const InnovativeSpinner = memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const [activeNode, setActiveNode] = useState(0);
  const [connectionPhase, setConnectionPhase] = useState(0);
  const [neuralPulse, setNeuralPulse] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const sizeConfig = {
    sm: { container: 50, node: 6, core: 3 },
    md: { container: 70, node: 8, core: 4 },
    lg: { container: 90, node: 10, core: 5 },
    xl: { container: 110, node: 12, core: 6 }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const nodeInterval = setInterval(() => setActiveNode(n => (n + 1) % 4), 800);
    const connectionInterval = setInterval(() => setConnectionPhase(p => (p + 1) % 6), 300);
    const pulseInterval = setInterval(() => setNeuralPulse(p => (p + 1) % 3), 1200);
    return () => {
      clearInterval(nodeInterval);
      clearInterval(connectionInterval);
      clearInterval(pulseInterval);
    };
  }, [prefersReducedMotion]);

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
        animation={prefersReducedMotion ? 'none' : "neuralCore 1.2s ease-in-out infinite"}
        sx={{
          '@keyframes neuralCore': {
            '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.8, boxShadow: '0 0 8px rgba(79, 156, 249, 0.4)' },
            '50%': { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 1, boxShadow: '0 0 20px rgba(79, 156, 249, 0.8)' }
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

const WaveAnimation = memo(({ size = 'md' }: { size?: string }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => setAnimationPhase(prev => (prev + 1) % 8), 2500);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);
  const waveHeight = size === 'sm' ? '1.8px' : size === 'lg' ? '3px' : '2.4px';
  const lineCount = 60;
  return (
    <Box position="relative" overflow="hidden" borderRadius="3xl" bg={`linear-gradient(135deg, rgba(79, 156, 249, ${0.03 + animationPhase * 0.008}) 0%, rgba(139, 92, 246, ${0.04 + animationPhase * 0.006}) 35%, rgba(99, 102, 241, ${0.03 + animationPhase * 0.007}) 70%, rgba(59, 130, 246, ${0.02 + animationPhase * 0.005}) 100%)`} boxShadow="inset 0 2px 6px rgba(79, 156, 249, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)" _before={{ content: '""', position: 'absolute', inset: 0, background: `conic-gradient(from ${animationPhase * 45}deg, rgba(79, 156, 249, 0.06) 0deg, rgba(139, 92, 246, 0.10) 60deg, rgba(99, 102, 241, 0.08) 120deg, rgba(59, 130, 246, 0.06) 180deg, rgba(37, 99, 235, 0.04) 240deg, rgba(79, 156, 249, 0.06) 300deg, rgba(79, 156, 249, 0.06) 360deg)`, borderRadius: '3xl', opacity: 0.8, animation: prefersReducedMotion ? 'none' : 'quantumBreathe 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite' }} _after={{ content: '""', position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)', borderRadius: '3xl', pointerEvents: 'none' }} sx={{ '@keyframes quantumBreathe': { '0%, 100%': { opacity: 0.5, transform: 'scale(1) rotate(0deg)', filter: 'blur(0px) saturate(1)' }, '20%': { opacity: 0.7, transform: 'scale(1.01) rotate(45deg)', filter: 'blur(0.3px) saturate(1.1)' }, '40%': { opacity: 0.9, transform: 'scale(1.03) rotate(90deg)', filter: 'blur(0.8px) saturate(1.3)' }, '60%': { opacity: 1, transform: 'scale(1.05) rotate(135deg)', filter: 'blur(1.2px) saturate(1.5)' }, '80%': { opacity: 0.8, transform: 'scale(1.02) rotate(180deg)', filter: 'blur(0.6px) saturate(1.2)' } }, willChange: 'transform, opacity, filter', backfaceVisibility: 'hidden', perspective: '1000px', transformStyle: 'preserve-3d' }}>
      <Flex align="center" justify="space-between" h="100%" w="100%" px={0.5}>
        {Array.from({ length: lineCount }, (_, i) => {
          const delay = i * 0.04;
          const phase = (i / lineCount) * Math.PI * 6;
          const intensity = Math.sin(phase + animationPhase) * 0.4 + 0.6;
          const waveGroup = Math.floor(i / 10);
          return <Box key={i} w={waveHeight} bg={`linear-gradient(180deg, rgba(79, 156, 249, ${0.7 + intensity * 0.3}) 0%, rgba(59, 130, 246, ${0.85 + intensity * 0.15}) 15%, rgba(37, 99, 235, ${0.95 + intensity * 0.05}) 30%, rgba(29, 78, 216, 1) 45%, rgba(37, 99, 235, ${0.95 + intensity * 0.05}) 55%, rgba(59, 130, 246, ${0.85 + intensity * 0.15}) 70%, rgba(79, 156, 249, ${0.7 + intensity * 0.3}) 85%, rgba(139, 92, 246, ${0.6 + intensity * 0.2}) 100%)`} borderRadius="full" position="relative" animation={prefersReducedMotion ? 'none' : `fluidWaveMotion${waveGroup} 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s infinite`} filter={`blur(${0.2 + Math.sin(phase) * 0.15}px) saturate(${1.1 + intensity * 0.2})`} _before={{ content: '""', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', height: '85%', background: `radial-gradient(ellipse, rgba(255, 255, 255, ${0.5 + intensity * 0.3}) 0%, rgba(79, 156, 249, ${0.1 + intensity * 0.1}) 40%, transparent 75%)`, borderRadius: 'full', opacity: 0.9, animation: prefersReducedMotion ? 'none' : `enhancedInnerGlow${waveGroup} 2.8s ease-in-out ${delay}s infinite` }} _after={{ content: '""', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '160%', height: '160%', background: `conic-gradient(from ${i * 6 + animationPhase * 15}deg, rgba(79, 156, 249, ${0.08 + intensity * 0.04}) 0deg, rgba(139, 92, 246, ${0.15 + intensity * 0.05}) 72deg, rgba(99, 102, 241, ${0.12 + intensity * 0.03}) 144deg, rgba(59, 130, 246, ${0.10 + intensity * 0.04}) 216deg, rgba(37, 99, 235, ${0.08 + intensity * 0.02}) 288deg, rgba(79, 156, 249, ${0.08 + intensity * 0.04}) 360deg)`, borderRadius: 'full', opacity: 0.6, animation: prefersReducedMotion ? 'none' : `quantumAura${waveGroup} 4.2s linear ${delay * 0.3}s infinite` }} sx={{ [`@keyframes fluidWaveMotion${waveGroup}`]: { '0%': { height: '2px', opacity: 0.2, transform: 'scaleY(0.15) scaleX(0.8) rotateZ(0deg)', boxShadow: `0 0 2px rgba(79, 156, 249, 0.15)` }, '12%': { height: '8px', opacity: 0.5, transform: 'scaleY(0.4) scaleX(0.95) rotateZ(0.5deg)', boxShadow: `0 0 4px rgba(79, 156, 249, 0.25)` }, '25%': { height: '18px', opacity: 0.75, transform: 'scaleY(0.7) scaleX(1.08) rotateZ(1deg)', boxShadow: `0 0 8px rgba(79, 156, 249, 0.4)` }, '40%': { height: '28px', opacity: 0.9, transform: 'scaleY(0.9) scaleX(1.18) rotateZ(1.5deg)', boxShadow: `0 0 12px rgba(79, 156, 249, 0.6)` }, '50%': { height: '36px', opacity: 1, transform: 'scaleY(1) scaleX(1.25) rotateZ(2deg)', boxShadow: `0 0 18px rgba(79, 156, 249, 0.8)` }, '60%': { height: '28px', opacity: 0.9, transform: 'scaleY(0.9) scaleX(1.18) rotateZ(1.5deg)', boxShadow: `0 0 12px rgba(79, 156, 249, 0.6)` }, '75%': { height: '18px', opacity: 0.75, transform: 'scaleY(0.7) scaleX(1.08) rotateZ(1deg)', boxShadow: `0 0 8px rgba(79, 156, 249, 0.4)` }, '88%': { height: '8px', opacity: 0.5, transform: 'scaleY(0.4) scaleX(0.95) rotateZ(0.5deg)', boxShadow: `0 0 4px rgba(79, 156, 249, 0.25)` }, '100%': { height: '2px', opacity: 0.2, transform: 'scaleY(0.15) scaleX(0.8) rotateZ(0deg)', boxShadow: `0 0 2px rgba(79, 156, 249, 0.15)` } }, [`@keyframes enhancedInnerGlow${waveGroup}`]: { '0%, 100%': { opacity: 0.4, transform: 'translate(-50%, -50%) scale(0.7) rotate(0deg)', filter: 'blur(0.5px)' }, '25%': { opacity: 0.7, transform: 'translate(-50%, -50%) scale(1.0) rotate(90deg)', filter: 'blur(0.3px)' }, '50%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.3) rotate(180deg)', filter: 'blur(0px)' }, '75%': { opacity: 0.7, transform: 'translate(-50%, -50%) scale(1.0) rotate(270deg)', filter: 'blur(0.3px)' } }, [`@keyframes quantumAura${waveGroup}`]: { '0%': { transform: 'translate(-50%, -50%) rotate(0deg) scale(0.9)', opacity: 0.3, filter: 'blur(1px) saturate(0.8)' }, '33%': { transform: 'translate(-50%, -50%) rotate(120deg) scale(1.2)', opacity: 0.7, filter: 'blur(1.5px) saturate(1.2)' }, '66%': { transform: 'translate(-50%, -50%) rotate(240deg) scale(1.0)', opacity: 0.5, filter: 'blur(1.2px) saturate(1.0)' }, '100%': { transform: 'translate(-50%, -50%) rotate(360deg) scale(0.9)', opacity: 0.3, filter: 'blur(1px) saturate(0.8)' } } }} />;
        })}
      </Flex>
      <Box position="absolute" top="35%" left="-180px" w="180px" h="2.5px" bg="linear-gradient(90deg, transparent 0%, rgba(79, 156, 249, 0.2) 5%, rgba(59, 130, 246, 0.6) 15%, rgba(37, 99, 235, 0.9) 30%, rgba(29, 78, 216, 1) 50%, rgba(37, 99, 235, 0.9) 70%, rgba(139, 92, 246, 0.6) 85%, rgba(99, 102, 241, 0.2) 95%, transparent 100%)" transform="translateY(-50%)" animation={prefersReducedMotion ? 'none' : "primaryQuantumFlow 3.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite"} filter="blur(0.6px)" sx={{ '@keyframes primaryQuantumFlow': { '0%': { left: '-180px', opacity: 0, transform: 'translateY(-50%) scaleX(0.2) rotateZ(0deg) skewX(0deg)', filter: 'blur(1.2px) hue-rotate(0deg) saturate(0.8)' }, '8%': { opacity: 0.4, transform: 'translateY(-50%) scaleX(0.6) rotateZ(0.5deg) skewX(1deg)', filter: 'blur(0.9px) hue-rotate(10deg) saturate(1.0)' }, '15%': { opacity: 0.8, transform: 'translateY(-50%) scaleX(1.0) rotateZ(1deg) skewX(2deg)', filter: 'blur(0.6px) hue-rotate(20deg) saturate(1.3)' }, '25%': { opacity: 1, transform: 'translateY(-50%) scaleX(1.4) rotateZ(1.5deg) skewX(3deg)', filter: 'blur(0.3px) hue-rotate(35deg) saturate(1.5)' }, '75%': { opacity: 1, transform: 'translateY(-50%) scaleX(1.4) rotateZ(-1.5deg) skewX(-3deg)', filter: 'blur(0.3px) hue-rotate(-35deg) saturate(1.5)' }, '85%': { opacity: 0.8, transform: 'translateY(-50%) scaleX(1.0) rotateZ(-1deg) skewX(-2deg)', filter: 'blur(0.6px) hue-rotate(-20deg) saturate(1.3)' }, '92%': { opacity: 0.4, transform: 'translateY(-50%) scaleX(0.6) rotateZ(-0.5deg) skewX(-1deg)', filter: 'blur(0.9px) hue-rotate(-10deg) saturate(1.0)' }, '100%': { left: 'calc(100% + 180px)', opacity: 0, transform: 'translateY(-50%) scaleX(0.2) rotateZ(0deg) skewX(0deg)', filter: 'blur(1.2px) hue-rotate(0deg) saturate(0.8)' } } }} />
      <Box position="absolute" top="65%" left="-120px" w="120px" h="1.5px" bg="linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 10%, rgba(99, 102, 241, 0.6) 25%, rgba(79, 156, 249, 0.8) 45%, rgba(59, 130, 246, 0.9) 55%, rgba(37, 99, 235, 0.8) 75%, rgba(139, 92, 246, 0.3) 90%, transparent 100%)" transform="translateY(-50%)" animation={prefersReducedMotion ? 'none' : "secondaryQuantumFlow 4.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 1.4s"} filter="blur(0.3px)" sx={{ '@keyframes secondaryQuantumFlow': { '0%': { left: '-120px', opacity: 0, transform: 'translateY(-50%) scaleX(0.3) skewX(0deg) rotateZ(0deg)', filter: 'blur(0.8px) saturate(0.7) hue-rotate(0deg)' }, '12%': { opacity: 0.5, transform: 'translateY(-50%) scaleX(0.7) skewX(1.5deg) rotateZ(0.5deg)', filter: 'blur(0.5px) saturate(1.1) hue-rotate(15deg)' }, '20%': { opacity: 0.8, transform: 'translateY(-50%) scaleX(1.1) skewX(3deg) rotateZ(1deg)', filter: 'blur(0.3px) saturate(1.4) hue-rotate(25deg)' }, '80%': { opacity: 0.8, transform: 'translateY(-50%) scaleX(1.1) skewX(-3deg) rotateZ(-1deg)', filter: 'blur(0.3px) saturate(1.4) hue-rotate(-25deg)' }, '88%': { opacity: 0.5, transform: 'translateY(-50%) scaleX(0.7) skewX(-1.5deg) rotateZ(-0.5deg)', filter: 'blur(0.5px) saturate(1.1) hue-rotate(-15deg)' }, '100%': { left: 'calc(100% + 120px)', opacity: 0, transform: 'translateY(-50%) scaleX(0.3) skewX(0deg) rotateZ(0deg)', filter: 'blur(0.8px) saturate(0.7) hue-rotate(0deg)' } } }} />
      <Box position="absolute" top="50%" left="-80px" w="80px" h="1px" bg="linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.4) 20%, rgba(79, 156, 249, 0.7) 50%, rgba(59, 130, 246, 0.9) 70%, rgba(37, 99, 235, 0.4) 90%, transparent 100%)" transform="translateY(-50%)" animation={prefersReducedMotion ? 'none' : "tertiaryQuantumFlow 3.2s ease-in-out infinite 2.3s"} filter="blur(0.15px)" sx={{ '@keyframes tertiaryQuantumFlow': { '0%': { left: '-80px', opacity: 0, transform: 'translateY(-50%) scaleX(0.5) scaleY(0.8)', filter: 'blur(0.4px) saturate(0.9)' }, '20%': { opacity: 0.6, transform: 'translateY(-50%) scaleX(0.9) scaleY(1.2)', filter: 'blur(0.2px) saturate(1.2)' }, '30%': { opacity: 0.9, transform: 'translateY(-50%) scaleX(1.3) scaleY(1.5)', filter: 'blur(0.1px) saturate(1.4)' }, '70%': { opacity: 0.9, transform: 'translateY(-50%) scaleX(1.3) scaleY(1.5)', filter: 'blur(0.1px) saturate(1.4)' }, '80%': { opacity: 0.6, transform: 'translateY(-50%) scaleX(0.9) scaleY(1.2)', filter: 'blur(0.2px) saturate(1.2)' }, '100%': { left: 'calc(100% + 80px)', opacity: 0, transform: 'translateY(-50%) scaleX(0.5) scaleY(0.8)', filter: 'blur(0.4px) saturate(0.9)' } } }} />
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="90%" h="70%" bg={`conic-gradient(from ${animationPhase * 45}deg, rgba(79, 156, 249, 0.08) 0deg, rgba(139, 92, 246, 0.12) 72deg, rgba(99, 102, 241, 0.10) 144deg, rgba(59, 130, 246, 0.08) 216deg, rgba(37, 99, 235, 0.06) 288deg, rgba(79, 156, 249, 0.08) 360deg)`} borderRadius="50%" animation={prefersReducedMotion ? 'none' : "quantumAmbientGlow 4.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite"} filter="blur(8px)" sx={{ '@keyframes quantumAmbientGlow': { '0%, 100%': { opacity: 0.2, transform: 'translate(-50%, -50%) scale(0.7) rotate(0deg)', filter: 'blur(8px) saturate(0.8)' }, '25%': { opacity: 0.5, transform: 'translate(-50%, -50%) scale(1.1) rotate(90deg)', filter: 'blur(12px) saturate(1.2)' }, '50%': { opacity: 0.7, transform: 'translate(-50%, -50%) scale(1.3) rotate(180deg)', filter: 'blur(16px) saturate(1.4)' }, '75%': { opacity: 0.5, transform: 'translate(-50%, -50%) scale(1.1) rotate(270deg)', filter: 'blur(12px) saturate(1.2)' } } }} />
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="60%" h="40%" bg="radial-gradient(ellipse, rgba(79, 156, 249, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 80%)" animation={prefersReducedMotion ? 'none' : "secondaryAmbient 3.8s ease-in-out infinite 1s"} filter="blur(4px)" sx={{ '@keyframes secondaryAmbient': { '0%, 100%': { opacity: 0.4, transform: 'translate(-50%, -50%) scale(0.9)', filter: 'blur(4px)' }, '50%': { opacity: 0.8, transform: 'translate(-50%, -50%) scale(1.4)', filter: 'blur(6px)' } } }} />
      <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="linear-gradient(45deg, transparent 48%, rgba(79, 156, 249, 0.02) 49%, rgba(79, 156, 249, 0.02) 51%, transparent 52%)" animation={prefersReducedMotion ? 'none' : "quantumDistortion 5.5s linear infinite"} pointerEvents="none" sx={{ '@keyframes quantumDistortion': { '0%': { transform: 'translateX(-100%) skewX(0deg)', opacity: 0 }, '10%': { opacity: 0.3 }, '50%': { transform: 'translateX(0%) skewX(2deg)', opacity: 0.6 }, '90%': { opacity: 0.3 }, '100%': { transform: 'translateX(100%) skewX(0deg)', opacity: 0 } } }} />
    </Box>
  );
});

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
    <Box position="relative" w={containerSize} h={containerSize}>
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="16px" h="16px" bg="linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)" borderRadius="50%" animation={prefersReducedMotion ? 'none' : "neuralCore 2.5s ease-in-out infinite"} sx={{ '@keyframes neuralCore': { '0%, 100%': { opacity: 0.9, transform: 'translate(-50%, -50%) scale(1)', boxShadow: '0 0 16px rgba(79, 156, 249, 0.4)' }, '50%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.2)', boxShadow: '0 0 24px rgba(79, 156, 249, 0.7)' } } }} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * 60) + (neuralPhase * 10);
        const radius = size === 'sm' ? 22 : size === 'lg' ? 32 : 28;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        const isActive = (i + neuralPhase) % 6 < 2;
        return <Box key={i} position="absolute" top="50%" left="50%" transform={`translate(-50%, -50%) translate(${x}px, ${y}px)`} w={nodeSize} h={nodeSize} bg={isActive ? 'linear-gradient(135deg, #4F9CF9 0%, #8B5CF6 100%)' : '#E2E8F0'} borderRadius="50%" opacity={isActive ? 1 : 0.4} transition="all 0.4s ease" animation={prefersReducedMotion ? 'none' : isActive ? 'synapsefire 0.8s ease-in-out infinite' : 'none'} sx={{ '@keyframes synapsefire': { '0%, 100%': { transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`, boxShadow: '0 0 6px rgba(79, 156, 249, 0.3)' }, '50%': { transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.4)`, boxShadow: '0 0 12px rgba(79, 156, 249, 0.6)' } } }} />;
      })}
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="100%" h="100%" borderRadius="50%" border="1px solid" borderColor="rgba(79, 156, 249, 0.15)" animation={prefersReducedMotion ? 'none' : "neuralNetwork 4s linear infinite"} sx={{ '@keyframes neuralNetwork': { '0%': { borderColor: 'rgba(79, 156, 249, 0.15)', transform: 'translate(-50%, -50%) rotate(0deg) scale(1)' }, '25%': { borderColor: 'rgba(139, 92, 246, 0.25)', transform: 'translate(-50%, -50%) rotate(90deg) scale(1.02)' }, '50%': { borderColor: 'rgba(99, 102, 241, 0.3)', transform: 'translate(-50%, -50%) rotate(180deg) scale(1)' }, '75%': { borderColor: 'rgba(139, 92, 246, 0.25)', transform: 'translate(-50%, -50%) rotate(270deg) scale(1.02)' }, '100%': { borderColor: 'rgba(79, 156, 249, 0.15)', transform: 'translate(-50%, -50%) rotate(360deg) scale(1)' } } }} />
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" w="120%" h="120%" borderRadius="50%" border="1px solid" borderColor="rgba(79, 156, 249, 0.08)" animation={prefersReducedMotion ? 'none' : "outerField 6s linear infinite reverse"} sx={{ '@keyframes outerField': { '0%': { borderColor: 'rgba(79, 156, 249, 0.08)', transform: 'translate(-50%, -50%) rotate(0deg)' }, '100%': { borderColor: 'rgba(139, 92, 246, 0.12)', transform: 'translate(-50%, -50%) rotate(360deg)' } } }} />
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
      case 'skeleton': return <SkeletonLoader lines={lines} />;
      case 'futuristic': return <FuturisticLoader size={size} />;
      case 'spinner': default: return <Spinner size={size} color="blue.500" thickness="3px" />;
    }
  };
  const content = <Flex direction="column" align="center" gap={3}>{renderLoader()}{message && <Text fontSize="sm" color={textColor} textAlign="center" fontWeight="500" letterSpacing="0.3px" opacity={0.8} fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif">{message}</Text>}</Flex>;
  if (fullScreen) return <Flex position="fixed" top={0} left={0} right={0} bottom={0} bg={bg} backdropFilter="blur(4px)" zIndex={9999} align="center" justify="center">{content}</Flex>;
  return content;
});

Loader.displayName = 'Loader';

export function MessageSkeleton() { return <Loader variant="skeleton" lines={2} />; }

export function PageLoader({ message = 'Loading page...' }: { message?: string }) {
  return <Flex h="100vh" w="100%" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.900' }}><Loader size="lg" message={message} /></Flex>;
}

export default Loader;