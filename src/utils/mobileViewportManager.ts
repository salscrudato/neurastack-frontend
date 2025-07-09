/**
 * Enhanced Mobile Viewport Manager
 * Handles mobile-specific viewport optimizations, keyboard interactions, and safe areas
 */

import React from 'react';

interface ViewportConfig {
  enableKeyboardDetection: boolean;
  enableSafeAreaSupport: boolean;
  enableOrientationHandling: boolean;
  enableVisualViewportAPI: boolean;
}

interface ViewportState {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  keyboardVisible: boolean;
  keyboardHeight: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  visualViewport: {
    width: number;
    height: number;
    offsetTop: number;
    offsetLeft: number;
    scale: number;
  };
}

class MobileViewportManager {
  private config: ViewportConfig;
  private state: ViewportState;
  private listeners: Map<string, Set<(state: ViewportState) => void>>;
  // private resizeObserver?: ResizeObserver; // Unused for now
  private orientationChangeTimer?: NodeJS.Timeout;

  constructor(config: Partial<ViewportConfig> = {}) {
    this.config = {
      enableKeyboardDetection: true,
      enableSafeAreaSupport: true,
      enableOrientationHandling: true,
      enableVisualViewportAPI: true,
      ...config,
    };

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      keyboardVisible: false,
      keyboardHeight: 0,
      safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
      visualViewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        offsetTop: 0,
        offsetLeft: 0,
        scale: 1,
      },
    };

    this.listeners = new Map();
    this.initialize();
  }

  private initialize(): void {
    this.setupViewportMeta();
    this.setupEventListeners();
    this.updateSafeAreaInsets();
    this.updateVisualViewport();
    this.setupCSSCustomProperties();
  }

  private setupViewportMeta(): void {
    let viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }

    // Cutting-edge viewport configuration for premium mobile experience
    viewport.content = [
      'width=device-width',
      'initial-scale=1.0',
      'maximum-scale=1.0',
      'minimum-scale=1.0',
      'user-scalable=no',
      'viewport-fit=cover',
      'shrink-to-fit=no',
      'interactive-widget=resizes-content'
    ].join(', ');
  }

  private setupEventListeners(): void {
    // Window resize handling
    window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    
    // Orientation change handling
    if (this.config.enableOrientationHandling) {
      window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
      screen.orientation?.addEventListener('change', this.handleOrientationChange.bind(this));
    }

    // Visual Viewport API support
    if (this.config.enableVisualViewportAPI && window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.handleVisualViewportChange.bind(this));
      window.visualViewport.addEventListener('scroll', this.handleVisualViewportChange.bind(this));
    }

    // Keyboard detection fallback
    if (this.config.enableKeyboardDetection) {
      document.addEventListener('focusin', this.handleFocusIn.bind(this));
      document.addEventListener('focusout', this.handleFocusOut.bind(this));
    }
  }

  private handleResize(): void {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    
    // Detect keyboard visibility based on height change
    if (this.config.enableKeyboardDetection) {
      const heightDifference = this.state.height - newHeight;
      const keyboardThreshold = 150; // Minimum height change to consider keyboard
      
      if (heightDifference > keyboardThreshold && !this.state.keyboardVisible) {
        this.state.keyboardVisible = true;
        this.state.keyboardHeight = heightDifference;
        document.body.classList.add('keyboard-visible');
      } else if (heightDifference < keyboardThreshold && this.state.keyboardVisible) {
        this.state.keyboardVisible = false;
        this.state.keyboardHeight = 0;
        document.body.classList.remove('keyboard-visible');
      }
    }

    this.state.width = newWidth;
    this.state.height = newHeight;
    this.state.orientation = newWidth > newHeight ? 'landscape' : 'portrait';
    
    this.updateCSSCustomProperties();
    this.notifyListeners('resize');
  }

  private handleOrientationChange(): void {
    // Debounce orientation change to avoid multiple rapid calls
    if (this.orientationChangeTimer) {
      clearTimeout(this.orientationChangeTimer);
    }

    this.orientationChangeTimer = setTimeout(() => {
      this.state.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      this.updateCSSCustomProperties();
      this.notifyListeners('orientationchange');
    }, 100);
  }

  private handleVisualViewportChange(): void {
    if (!window.visualViewport) return;

    const vv = window.visualViewport;
    this.state.visualViewport = {
      width: vv.width,
      height: vv.height,
      offsetTop: vv.offsetTop,
      offsetLeft: vv.offsetLeft,
      scale: vv.scale,
    };

    // Enhanced keyboard detection using visual viewport
    const keyboardHeight = window.innerHeight - vv.height;
    const wasKeyboardVisible = this.state.keyboardVisible;
    
    this.state.keyboardVisible = keyboardHeight > 150;
    this.state.keyboardHeight = this.state.keyboardVisible ? keyboardHeight : 0;

    if (wasKeyboardVisible !== this.state.keyboardVisible) {
      document.body.classList.toggle('keyboard-visible', this.state.keyboardVisible);
    }

    this.updateCSSCustomProperties();
    this.notifyListeners('visualviewport');
  }

  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (this.isInputElement(target)) {
      // Delay to allow keyboard animation
      setTimeout(() => {
        this.handleResize();
      }, 300);
    }
  }

  private handleFocusOut(): void {
    // Delay to allow keyboard animation
    setTimeout(() => {
      this.handleResize();
    }, 300);
  }

  private isInputElement(element: HTMLElement): boolean {
    const inputTypes = ['input', 'textarea', 'select'];
    return inputTypes.includes(element.tagName.toLowerCase()) ||
           element.contentEditable === 'true';
  }

  private updateSafeAreaInsets(): void {
    if (!this.config.enableSafeAreaSupport) return;

    const computedStyle = getComputedStyle(document.documentElement);
    
    this.state.safeAreaInsets = {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
    };
  }

  private updateVisualViewport(): void {
    if (!window.visualViewport) return;
    this.handleVisualViewportChange();
  }

  private setupCSSCustomProperties(): void {
    this.updateCSSCustomProperties();
  }

  private updateCSSCustomProperties(): void {
    const root = document.documentElement.style;

    // Enhanced viewport dimensions
    root.setProperty('--viewport-width', `${this.state.width}px`);
    root.setProperty('--viewport-height', `${this.state.height}px`);
    root.setProperty('--viewport-width-vw', `${this.state.width / 100}px`);
    root.setProperty('--viewport-height-vh', `${this.state.height / 100}px`);
    root.setProperty('--orientation', this.state.orientation);

    // Advanced keyboard state management
    root.setProperty('--keyboard-visible', this.state.keyboardVisible ? '1' : '0');
    root.setProperty('--keyboard-height', `${this.state.keyboardHeight}px`);
    root.setProperty('--available-height', `${this.state.height - this.state.keyboardHeight}px`);
    root.setProperty('--content-height', `${this.state.height - this.state.keyboardHeight - this.state.safeAreaInsets.top - this.state.safeAreaInsets.bottom}px`);

    // Enhanced visual viewport properties
    root.setProperty('--visual-viewport-width', `${this.state.visualViewport.width}px`);
    root.setProperty('--visual-viewport-height', `${this.state.visualViewport.height}px`);
    root.setProperty('--visual-viewport-scale', this.state.visualViewport.scale.toString());
    root.setProperty('--visual-viewport-offset-top', `${this.state.visualViewport.offsetTop}px`);
    root.setProperty('--visual-viewport-offset-left', `${this.state.visualViewport.offsetLeft}px`);

    // Advanced safe area properties
    root.setProperty('--safe-area-inset-top', `${this.state.safeAreaInsets.top}px`);
    root.setProperty('--safe-area-inset-bottom', `${this.state.safeAreaInsets.bottom}px`);
    root.setProperty('--safe-area-inset-left', `${this.state.safeAreaInsets.left}px`);
    root.setProperty('--safe-area-inset-right', `${this.state.safeAreaInsets.right}px`);

    // Dynamic viewport units for better mobile support
    root.setProperty('--dvh', `${this.state.height / 100}px`);
    root.setProperty('--dvw', `${this.state.width / 100}px`);
    root.setProperty('--svh', `${Math.min(this.state.height, window.screen.height) / 100}px`);
    root.setProperty('--lvh', `${Math.max(this.state.height, window.screen.height) / 100}px`);
    
    // Safe area insets
    root.setProperty('--safe-area-inset-top', `${this.state.safeAreaInsets.top}px`);
    root.setProperty('--safe-area-inset-bottom', `${this.state.safeAreaInsets.bottom}px`);
    root.setProperty('--safe-area-inset-left', `${this.state.safeAreaInsets.left}px`);
    root.setProperty('--safe-area-inset-right', `${this.state.safeAreaInsets.right}px`);
    
    // Dynamic viewport units
    root.setProperty('--dvh', `${this.state.height * 0.01}px`);
    root.setProperty('--dvw', `${this.state.width * 0.01}px`);
  }

  private notifyListeners(event: string): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(this.state));
    }
  }

  // Public API
  public addEventListener(event: string, callback: (state: ViewportState) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public removeEventListener(event: string, callback: (state: ViewportState) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  public getState(): ViewportState {
    return { ...this.state };
  }

  public isKeyboardVisible(): boolean {
    return this.state.keyboardVisible;
  }

  public getKeyboardHeight(): number {
    return this.state.keyboardHeight;
  }

  public getSafeAreaInsets() {
    return { ...this.state.safeAreaInsets };
  }

  public destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.handleVisualViewportChange.bind(this));
      window.visualViewport.removeEventListener('scroll', this.handleVisualViewportChange.bind(this));
    }

    document.removeEventListener('focusin', this.handleFocusIn.bind(this));
    document.removeEventListener('focusout', this.handleFocusOut.bind(this));

    if (this.orientationChangeTimer) {
      clearTimeout(this.orientationChangeTimer);
    }

    this.listeners.clear();
  }
}

// Singleton instance
export const mobileViewportManager = new MobileViewportManager();

// React hook for easy integration
export const useMobileViewport = () => {
  const [state, setState] = React.useState(mobileViewportManager.getState());

  React.useEffect(() => {
    const handleStateChange = (newState: ViewportState) => {
      setState(newState);
    };

    mobileViewportManager.addEventListener('resize', handleStateChange);
    mobileViewportManager.addEventListener('orientationchange', handleStateChange);
    mobileViewportManager.addEventListener('visualviewport', handleStateChange);

    return () => {
      mobileViewportManager.removeEventListener('resize', handleStateChange);
      mobileViewportManager.removeEventListener('orientationchange', handleStateChange);
      mobileViewportManager.removeEventListener('visualviewport', handleStateChange);
    };
  }, []);

  return state;
};

export default MobileViewportManager;
