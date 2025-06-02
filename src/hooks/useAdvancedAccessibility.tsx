import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import { useToast } from '@chakra-ui/react';

interface AccessibilityConfig {
  enableKeyboardNavigation: boolean;
  enableScreenReaderSupport: boolean;
  enableFocusManagement: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  announcePageChanges: boolean;
  announceFormErrors: boolean;
  announceLoadingStates: boolean;
}

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

interface FocusableElement {
  element: HTMLElement;
  priority: number;
  group?: string;
}

const DEFAULT_CONFIG: AccessibilityConfig = {
  enableKeyboardNavigation: true,
  enableScreenReaderSupport: true,
  enableFocusManagement: true,
  enableHighContrast: false,
  enableReducedMotion: false,
  announcePageChanges: true,
  announceFormErrors: true,
  announceLoadingStates: true,
};

// Screen reader announcements
export const useScreenReaderAnnouncements = () => {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region for screen reader announcements
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      
      // Clear after announcement to allow repeated announcements
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (config: Partial<AccessibilityConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const toast = useToast();

  // Register keyboard shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev.filter(s => s.key !== shortcut.key), shortcut]);
  }, []);

  // Unregister keyboard shortcut
  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  }, []);

  // Register focusable element
  const registerFocusableElement = useCallback((element: HTMLElement, priority: number = 0, group?: string) => {
    setFocusableElements(prev => [
      ...prev.filter(f => f.element !== element),
      { element, priority, group }
    ].sort((a, b) => b.priority - a.priority));
  }, []);

  // Handle keyboard events
  useEffect(() => {
    if (!fullConfig.enableKeyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for registered shortcuts
      const matchingShortcut = shortcuts.find(shortcut => 
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
        return;
      }

      // Handle arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const visibleElements = focusableElements.filter(f => 
          f.element.offsetParent !== null && !f.element.hasAttribute('disabled')
        );

        if (visibleElements.length === 0) return;

        let newIndex = currentFocusIndex;

        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            newIndex = (currentFocusIndex + 1) % visibleElements.length;
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            newIndex = currentFocusIndex <= 0 ? visibleElements.length - 1 : currentFocusIndex - 1;
            break;
        }

        if (newIndex !== currentFocusIndex) {
          event.preventDefault();
          visibleElements[newIndex].element.focus();
          setCurrentFocusIndex(newIndex);
        }
      }

      // Handle Escape key
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }

      // Handle Tab key for focus trapping
      if (event.key === 'Tab') {
        const focusableSelectors = [
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          'a[href]',
          '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        const focusableElements = Array.from(document.querySelectorAll(focusableSelectors)) as HTMLElement[];
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

        if (event.shiftKey) {
          // Shift+Tab (backward)
          if (currentIndex <= 0) {
            event.preventDefault();
            focusableElements[focusableElements.length - 1]?.focus();
          }
        } else {
          // Tab (forward)
          if (currentIndex >= focusableElements.length - 1) {
            event.preventDefault();
            focusableElements[0]?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, focusableElements, currentFocusIndex, fullConfig.enableKeyboardNavigation]);

  // Show keyboard shortcuts help
  const showKeyboardHelp = useCallback(() => {
    const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) acc[shortcut.category] = [];
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    const helpText = Object.entries(shortcutsByCategory)
      .map(([category, shortcuts]) => 
        `${category}:\n${shortcuts.map(s => `  ${s.key}: ${s.description}`).join('\n')}`
      )
      .join('\n\n');

    toast({
      title: 'Keyboard Shortcuts',
      description: helpText,
      status: 'info',
      duration: 10000,
      isClosable: true,
    });
  }, [shortcuts, toast]);

  return {
    registerShortcut,
    unregisterShortcut,
    registerFocusableElement,
    showKeyboardHelp,
    shortcuts,
  };
};

// Focus management hook
export const useFocusManagement = () => {
  const focusHistory = useRef<HTMLElement[]>([]);
  const trapFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      focusHistory.current.push(activeElement);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistory.current.pop();
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    trapFocusRef.current = container;
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  const releaseFocusTrap = useCallback(() => {
    trapFocusRef.current = null;
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
    releaseFocusTrap,
  };
};

// High contrast mode hook
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast(prev => {
      const newValue = !prev;
      document.documentElement.setAttribute('data-high-contrast', newValue.toString());
      return newValue;
    });
  }, []);

  return { isHighContrast, toggleHighContrast };
};

// Reduced motion hook
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

  return { prefersReducedMotion };
};

// Main accessibility hook
export const useAdvancedAccessibility = (config: Partial<AccessibilityConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const { announce } = useScreenReaderAnnouncements();
  const keyboardNav = useKeyboardNavigation(fullConfig);
  const focusManagement = useFocusManagement();
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  const { prefersReducedMotion } = useReducedMotion();

  // Register default keyboard shortcuts
  useEffect(() => {
    keyboardNav.registerShortcut({
      key: '?',
      action: keyboardNav.showKeyboardHelp,
      description: 'Show keyboard shortcuts',
      category: 'Help',
    });

    keyboardNav.registerShortcut({
      key: 'h',
      altKey: true,
      action: toggleHighContrast,
      description: 'Toggle high contrast mode',
      category: 'Accessibility',
    });
  }, [keyboardNav, toggleHighContrast]);

  return {
    config: fullConfig,
    announce,
    keyboardNav,
    focusManagement,
    isHighContrast,
    toggleHighContrast,
    prefersReducedMotion,
  };
};

// Accessibility context
const AccessibilityContext = createContext<ReturnType<typeof useAdvancedAccessibility> | null>(null);

export const AccessibilityProvider: React.FC<{ 
  children: React.ReactNode;
  config?: Partial<AccessibilityConfig>;
}> = ({ children, config }) => {
  const accessibility = useAdvancedAccessibility(config);

  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};
