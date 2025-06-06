import { useEffect, useCallback, useState } from 'react';

// Simplified keyboard navigation hook - only used features
export const useKeyboardNavigation = (
  items: string[],
  onSelect?: (index: number) => void,
  enabled = true
) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev <= 0 ? items.length - 1 : prev - 1);
        break;
      case 'Enter':
        if (activeIndex >= 0) {
          e.preventDefault();
          onSelect?.(activeIndex);
          setActiveIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setActiveIndex(-1);
        break;
    }
  }, [enabled, items.length, activeIndex, onSelect]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return { activeIndex, setActiveIndex };
};

// Reduced motion preference detection - commonly used
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};


