import { useCallback, useEffect, useRef, useState } from 'react';

export interface AccessibilityOptions {
  announcePageChanges?: boolean;
  enableKeyboardNavigation?: boolean;
  enableFocusManagement?: boolean;
  enableScreenReaderSupport?: boolean;
  reducedMotion?: boolean;
}

export interface AccessibilityState {
  isScreenReaderActive: boolean;
  prefersReducedMotion: boolean;
  highContrastMode: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  keyboardNavigationEnabled: boolean;
}

// Enhanced accessibility hook with comprehensive WCAG compliance
export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    announcePageChanges = true,
    enableKeyboardNavigation = true,
    enableFocusManagement = true,
    enableScreenReaderSupport = true,
    reducedMotion = true
  } = options;

  const [state, setState] = useState<AccessibilityState>({
    isScreenReaderActive: false,
    prefersReducedMotion: false,
    highContrastMode: false,
    fontSize: 'medium',
    keyboardNavigationEnabled: enableKeyboardNavigation
  });

  const announcementRef = useRef<HTMLDivElement>(null);
  const focusHistoryRef = useRef<HTMLElement[]>([]);

  // Detect screen reader usage
  useEffect(() => {
    const detectScreenReader = () => {
      const hasScreenReader =
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        window.speechSynthesis?.getVoices().length > 0;

      setState(prev => ({ ...prev, isScreenReaderActive: hasScreenReader }));
    };

    detectScreenReader();

    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', detectScreenReader);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', detectScreenReader);
    }
  }, []);

  // Announce messages to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReaderSupport || !announcementRef.current) return;

    const announcement = announcementRef.current;
    announcement.setAttribute('aria-live', priority);
    announcement.textContent = message;

    setTimeout(() => {
      announcement.textContent = '';
    }, 1000);
  }, [enableScreenReaderSupport]);

  // Focus management
  const focusElement = useCallback((element: HTMLElement | null, options?: FocusOptions) => {
    if (!enableFocusManagement || !element) return;

    if (document.activeElement && document.activeElement !== document.body) {
      focusHistoryRef.current.push(document.activeElement as HTMLElement);
    }

    element.focus(options);
  }, [enableFocusManagement]);

  const trapFocus = useCallback((container: HTMLElement) => {
    if (!enableFocusManagement) return () => {};

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

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
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [enableFocusManagement]);

  // ARIA live region for announcements
  useEffect(() => {
    if (!enableScreenReaderSupport) return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    document.body.appendChild(liveRegion);
    announcementRef.current = liveRegion;

    return () => {
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    };
  }, [enableScreenReaderSupport]);

  return {
    state,
    announce,
    focusElement,
    trapFocus,
    announcePageChanges,
    reducedMotion
  };
};

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

// Hook for managing ARIA attributes
export const useAriaAttributes = () => {
  const setAriaLabel = useCallback((element: HTMLElement | null, label: string) => {
    if (element) {
      element.setAttribute('aria-label', label);
    }
  }, []);

  const setAriaDescribedBy = useCallback((element: HTMLElement | null, id: string) => {
    if (element) {
      element.setAttribute('aria-describedby', id);
    }
  }, []);

  const setAriaExpanded = useCallback((element: HTMLElement | null, expanded: boolean) => {
    if (element) {
      element.setAttribute('aria-expanded', expanded.toString());
    }
  }, []);

  const setAriaHidden = useCallback((element: HTMLElement | null, hidden: boolean) => {
    if (element) {
      element.setAttribute('aria-hidden', hidden.toString());
    }
  }, []);

  const setAriaLive = useCallback((element: HTMLElement | null, live: 'off' | 'polite' | 'assertive') => {
    if (element) {
      element.setAttribute('aria-live', live);
    }
  }, []);

  return {
    setAriaLabel,
    setAriaDescribedBy,
    setAriaExpanded,
    setAriaHidden,
    setAriaLive
  };
};

// Hook for enhanced keyboard navigation patterns
export const useEnhancedKeyboardNavigation = (options: {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onSpace?: () => void;
} = {}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          options.onEscape?.();
          break;
        case 'Enter':
          options.onEnter?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          options.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          options.onArrowDown?.();
          break;
        case 'ArrowLeft':
          options.onArrowLeft?.();
          break;
        case 'ArrowRight':
          options.onArrowRight?.();
          break;
        case ' ':
          e.preventDefault();
          options.onSpace?.();
          break;
        case 'Tab':
          if (e.shiftKey) {
            options.onShiftTab?.();
          } else {
            options.onTab?.();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options]);
};


