import { useEffect, useRef } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

interface AccessibilityEnhancerProps {
  /** Enable skip links for keyboard navigation */
  enableSkipLinks?: boolean;
  /** Enable focus management */
  enableFocusManagement?: boolean;
  /** Enable live region announcements */
  enableLiveRegions?: boolean;
  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts?: boolean;
}

/**
 * Accessibility enhancement component that provides comprehensive
 * WCAG 2.1 AA compliance features for the entire application
 */
export const AccessibilityEnhancer: React.FC<AccessibilityEnhancerProps> = ({
  enableSkipLinks = true,
  enableFocusManagement = true,
  enableLiveRegions = true,
  enableKeyboardShortcuts = true,
}) => {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  
  const {
    announce,
    focusElement,
  } = useAccessibility({
    announcePageChanges: true,
    enableKeyboardNavigation: enableKeyboardShortcuts,
    enableFocusManagement,
    enableScreenReaderSupport: enableLiveRegions,
  });

  // Enhanced keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to main content (Alt + M)
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const mainContent = document.querySelector('main, [role="main"], #main-content');
        if (mainContent instanceof HTMLElement) {
          focusElement(mainContent);
          announce('Skipped to main content');
          // Add visual indicator for skip action
          mainContent.style.outline = '3px solid #4F9CF9';
          setTimeout(() => {
            mainContent.style.outline = '';
          }, 2000);
        }
      }

      // Skip to navigation (Alt + N)
      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        const navigation = document.querySelector('nav, [role="navigation"], #navigation, header');
        if (navigation instanceof HTMLElement) {
          focusElement(navigation);
          announce('Skipped to navigation');
          // Add visual indicator
          navigation.style.outline = '3px solid #4F9CF9';
          setTimeout(() => {
            navigation.style.outline = '';
          }, 2000);
        }
      }

      // Open chat input (Alt + C)
      if (event.altKey && event.key === 'c') {
        event.preventDefault();
        const chatInput = document.querySelector('textarea[placeholder*="message"], input[placeholder*="message"], #chat-input');
        if (chatInput instanceof HTMLElement) {
          focusElement(chatInput);
          announce('Chat input activated');
        }
      }

      // Open search (Alt + S)
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="search"], [role="searchbox"]');
        if (searchInput instanceof HTMLElement) {
          focusElement(searchInput);
          announce('Search activated');
        }
      }

      // Toggle high contrast mode (Alt + H)
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        const body = document.body;
        const isHighContrast = body.classList.contains('high-contrast');

        if (isHighContrast) {
          body.classList.remove('high-contrast');
          announce('High contrast mode disabled');
        } else {
          body.classList.add('high-contrast');
          announce('High contrast mode enabled');
        }
      }

      // Increase font size (Alt + Plus)
      if (event.altKey && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const newSize = Math.min(currentSize + 2, 24);
        document.documentElement.style.fontSize = `${newSize}px`;
        announce(`Font size increased to ${newSize} pixels`);
      }

      // Decrease font size (Alt + Minus)
      if (event.altKey && event.key === '-') {
        event.preventDefault();
        const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const newSize = Math.max(currentSize - 2, 12);
        document.documentElement.style.fontSize = `${newSize}px`;
        announce(`Font size decreased to ${newSize} pixels`);
      }

      // Enhanced Escape key handling for modals and overlays
      if (event.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        const activeOverlay = document.querySelector('.chakra-modal__overlay');
        const activeDropdown = document.querySelector('[aria-expanded="true"]');

        if (activeModal || activeOverlay) {
          const closeButton = document.querySelector('[aria-label*="Close"], [data-testid="close-button"], .chakra-modal__close-btn');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
            announce('Modal closed');
          }
        } else if (activeDropdown) {
          // Close dropdown menus
          const button = activeDropdown.closest('button') || activeDropdown;
          if (button instanceof HTMLElement) {
            button.click();
            announce('Menu closed');
          }
        }
      }

      // Help shortcut (Alt + ?)
      if (event.altKey && (event.key === '?' || event.key === '/')) {
        event.preventDefault();
        announce('Keyboard shortcuts: Alt+M for main content, Alt+N for navigation, Alt+C for chat, Alt+H for high contrast, Alt+Plus/Minus for font size');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, focusElement, announce]);

  // Enhanced focus management for dynamic content
  useEffect(() => {
    if (!enableFocusManagement) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Handle new content that needs focus
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Auto-focus new error messages
              if (node.getAttribute('role') === 'alert' || node.classList.contains('error-message')) {
                focusElement(node);
              }

              // Auto-focus new modal content
              if (node.getAttribute('role') === 'dialog') {
                const firstFocusable = node.querySelector(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (firstFocusable instanceof HTMLElement) {
                  focusElement(firstFocusable);
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [enableFocusManagement, focusElement]);

  // Enhanced live region management
  useEffect(() => {
    if (!enableLiveRegions || !liveRegionRef.current) return;

    // Listen for route changes and announce them
    const handleRouteChange = () => {
      const pageTitle = document.title;
      const mainHeading = document.querySelector('h1')?.textContent;
      const announcement = mainHeading ? `${pageTitle}, ${mainHeading}` : pageTitle;
      
      setTimeout(() => {
        announce(announcement);
      }, 100);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Listen for programmatic navigation (if using React Router)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleRouteChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [enableLiveRegions, announce]);

  return (
    <>
      {/* Skip Links */}
      {enableSkipLinks && (
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: '6px',
            zIndex: 9999,
            background: '#000',
            color: '#fff',
            padding: '8px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.3s, top 0.3s',
          }}
          className="skip-links"
        >
          <a
            ref={skipLinkRef}
            href="#main-content"
            style={{
              color: '#fff',
              textDecoration: 'none',
              display: 'block',
              marginBottom: '4px',
            }}
            onFocus={(e) => {
              e.currentTarget.parentElement!.style.opacity = '1';
              e.currentTarget.parentElement!.style.top = '6px';
              e.currentTarget.parentElement!.style.pointerEvents = 'auto';
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement!.style.opacity = '0';
              e.currentTarget.parentElement!.style.top = '-40px';
              e.currentTarget.parentElement!.style.pointerEvents = 'none';
            }}
          >
            Skip to main content
          </a>
          <a
            href="#navigation"
            style={{
              color: '#fff',
              textDecoration: 'none',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Skip to navigation
          </a>
        </div>
      )}

      {/* Live Region for Screen Reader Announcements */}
      {enableLiveRegions && (
        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
          role="status"
          aria-label="Screen reader announcements"
        />
      )}

      {/* Keyboard Shortcuts Help */}
      {enableKeyboardShortcuts && (
        <div
          style={{ display: 'none' }}
          aria-hidden="true"
          data-keyboard-shortcuts="
            Alt + M: Skip to main content
            Alt + N: Skip to navigation  
            Alt + S: Open search
            Escape: Close modal or overlay
            Tab: Navigate forward
            Shift + Tab: Navigate backward
          "
        />
      )}
    </>
  );
};

/**
 * Hook for enhanced accessibility features
 */
export const useEnhancedAccessibility = () => {
  const announceToScreenReader = (message: string) => {
    const liveRegion = document.querySelector('[aria-live="polite"]');
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  const focusFirstError = () => {
    const firstError = document.querySelector('[aria-invalid="true"], .error-message, [role="alert"]');
    if (firstError instanceof HTMLElement) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
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

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  };

  return {
    announceToScreenReader,
    focusFirstError,
    trapFocus,
  };
};

export default AccessibilityEnhancer;
