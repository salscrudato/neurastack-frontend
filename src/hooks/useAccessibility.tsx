import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';

// Enhanced keyboard navigation hook
export const useKeyboardNavigation = (
  items: string[],
  onSelect?: (index: number) => void,
  enabled = true
) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(prev => prev <= 0 ? items.length - 1 : prev - 1);
        break;
      case 'Enter':
        if (activeIndex >= 0 && isNavigating) {
          e.preventDefault();
          onSelect?.(activeIndex);
          setIsNavigating(false);
          setActiveIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsNavigating(false);
        setActiveIndex(-1);
        break;
      case 'Home':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(items.length - 1);
        break;
    }
  }, [enabled, items.length, activeIndex, isNavigating, onSelect]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    activeIndex: isNavigating ? activeIndex : -1,
    isNavigating,
    setActiveIndex,
    setIsNavigating,
  };
};

// Screen reader announcements
export const useScreenReader = () => {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      
      // Clear after announcement to allow re-announcement of same message
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const ScreenReaderAnnouncer = useCallback(() => (
    <div
      ref={announceRef}
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    />
  ), []);

  return { announce, ScreenReaderAnnouncer };
};

// Focus management hook
export const useFocusManagement = () => {
  const focusHistoryRef = useRef<HTMLElement[]>([]);
  const trapRef = useRef<HTMLElement>(null);

  const pushFocus = useCallback((element: HTMLElement) => {
    if (document.activeElement instanceof HTMLElement) {
      focusHistoryRef.current.push(document.activeElement);
    }
    element.focus();
  }, []);

  const popFocus = useCallback(() => {
    const previousElement = focusHistoryRef.current.pop();
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    trapRef.current = container;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      trapRef.current = null;
    };
  }, []);

  return { pushFocus, popFocus, trapFocus };
};

// Keyboard shortcuts hook
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  const toast = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Create key combination string
      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('cmd');
      if (e.altKey) keys.push('alt');
      if (e.shiftKey) keys.push('shift');
      keys.push(e.key.toLowerCase());
      
      const combination = keys.join('+');
      
      if (shortcuts[combination]) {
        e.preventDefault();
        shortcuts[combination]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  const showShortcuts = useCallback(() => {
    const shortcutList = Object.keys(shortcuts)
      .map(key => key.replace('cmd', '⌘').replace('alt', '⌥').replace('shift', '⇧'))
      .join(', ');
    
    toast({
      title: 'Keyboard Shortcuts',
      description: shortcutList,
      duration: 5000,
      isClosable: true,
    });
  }, [shortcuts, toast]);

  return { showShortcuts };
};

// Reduced motion preference detection
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

// High contrast mode detection
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
};

// ARIA live region hook for dynamic content updates
export const useAriaLiveRegion = () => {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const updateLiveRegion = useCallback((
    message: string, 
    priority: 'off' | 'polite' | 'assertive' = 'polite'
  ) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
    }
  }, []);

  const LiveRegion = useCallback(() => (
    <div
      ref={liveRegionRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    />
  ), []);

  return { updateLiveRegion, LiveRegion };
};
