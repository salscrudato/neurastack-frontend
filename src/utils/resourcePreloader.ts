/**
 * Resource Preloader for Critical Performance Optimization
 * 
 * Implements intelligent resource preloading strategies to achieve
 * <1s Time to Interactive on 3G networks and Lighthouse performance ≥90
 */

interface PreloadConfig {
  fonts: string[];
  criticalImages: string[];
  criticalScripts: string[];
  criticalStyles: string[];
}

class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  /**
   * Preload critical fonts with font-display: swap
   */
  preloadFonts(fonts: string[]): void {
    fonts.forEach(fontUrl => {
      if (this.preloadedResources.has(fontUrl)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      
      // Add font-display: swap for better performance
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-display: swap;
          src: url('${fontUrl}') format('woff2');
        }
      `;
      
      document.head.appendChild(link);
      document.head.appendChild(style);
      this.preloadedResources.add(fontUrl);
    });
  }

  /**
   * Preload critical images with lazy loading fallback
   */
  preloadImages(images: string[]): Promise<void[]> {
    const promises = images.map(imageUrl => {
      if (this.preloadedResources.has(imageUrl)) {
        return this.loadingPromises.get(imageUrl) || Promise.resolve();
      }

      const promise = new Promise<void>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageUrl;
        
        link.onload = () => {
          this.preloadedResources.add(imageUrl);
          resolve();
        };
        
        link.onerror = () => {
          console.warn(`Failed to preload image: ${imageUrl}`);
          reject(new Error(`Failed to preload image: ${imageUrl}`));
        };
        
        document.head.appendChild(link);
      });

      this.loadingPromises.set(imageUrl, promise);
      return promise;
    });

    return Promise.all(promises);
  }

  /**
   * Preload critical JavaScript modules
   */
  preloadScripts(scripts: string[]): void {
    scripts.forEach(scriptUrl => {
      if (this.preloadedResources.has(scriptUrl)) return;

      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = scriptUrl;
      
      document.head.appendChild(link);
      this.preloadedResources.add(scriptUrl);
    });
  }

  /**
   * Preload critical CSS
   */
  preloadStyles(styles: string[]): void {
    styles.forEach(styleUrl => {
      if (this.preloadedResources.has(styleUrl)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = styleUrl;
      
      link.onload = () => {
        // Convert to actual stylesheet after preload
        link.rel = 'stylesheet';
      };
      
      document.head.appendChild(link);
      this.preloadedResources.add(styleUrl);
    });
  }

  /**
   * Intelligent preloading based on user interaction patterns
   */
  preloadOnInteraction(config: PreloadConfig): void {
    // Preload on first user interaction
    const preloadOnFirstInteraction = () => {
      this.preloadFonts(config.fonts);
      this.preloadImages(config.criticalImages);
      this.preloadScripts(config.criticalScripts);
      this.preloadStyles(config.criticalStyles);
      
      // Remove listeners after first interaction
      document.removeEventListener('mousedown', preloadOnFirstInteraction);
      document.removeEventListener('touchstart', preloadOnFirstInteraction);
      document.removeEventListener('keydown', preloadOnFirstInteraction);
    };

    // Add interaction listeners
    document.addEventListener('mousedown', preloadOnFirstInteraction, { passive: true });
    document.addEventListener('touchstart', preloadOnFirstInteraction, { passive: true });
    document.addEventListener('keydown', preloadOnFirstInteraction, { passive: true });
  }

  /**
   * Preload resources based on viewport and connection
   */
  intelligentPreload(config: PreloadConfig): void {
    // Check connection quality
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.saveData
    );

    if (isSlowConnection) {
      // Only preload critical resources on slow connections
      this.preloadFonts(config.fonts.slice(0, 1)); // Only first font
      this.preloadImages(config.criticalImages.slice(0, 2)); // Only first 2 images
    } else {
      // Preload all resources on fast connections
      this.preloadFonts(config.fonts);
      this.preloadImages(config.criticalImages);
      this.preloadScripts(config.criticalScripts);
      this.preloadStyles(config.criticalStyles);
    }
  }

  /**
   * Preload next page resources based on likely navigation
   */
  preloadNextPage(route: string): void {
    const routePreloadMap: Record<string, string[]> = {
      '/': ['/chat', '/neurafit'], // From splash, likely to go to chat or neurafit
      '/chat': ['/neurafit', '/history'], // From chat, likely to go to neurafit or history
      '/neurafit': ['/chat'], // From neurafit, likely to go back to chat
    };

    const nextRoutes = routePreloadMap[route] || [];
    nextRoutes.forEach(nextRoute => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = nextRoute;
      document.head.appendChild(link);
    });
  }

  /**
   * Clear preloaded resources to free memory
   */
  clearPreloadedResources(): void {
    this.preloadedResources.clear();
    this.loadingPromises.clear();
  }
}

// Singleton instance
export const resourcePreloader = new ResourcePreloader();

/**
 * Default preload configuration for NeuraStack
 */
export const defaultPreloadConfig: PreloadConfig = {
  fonts: [
    // Add Google Fonts or custom fonts here
  ],
  criticalImages: [
    '/icons/neurastack-192.png',
    '/icons/neurastack-512.png',
    '/logo.svg'
  ],
  criticalScripts: [
    // Critical JavaScript modules will be auto-detected by Vite
  ],
  criticalStyles: [
    // Critical CSS will be auto-detected by Vite
  ]
};

/**
 * Initialize resource preloading for optimal performance
 */
export const initializeResourcePreloading = (config: PreloadConfig = defaultPreloadConfig): void => {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      resourcePreloader.intelligentPreload(config);
    });
  } else {
    resourcePreloader.intelligentPreload(config);
  }

  // Preload on interaction for better perceived performance
  resourcePreloader.preloadOnInteraction(config);
};

/**
 * Preload resources for specific route
 */
export const preloadForRoute = (route: string): void => {
  resourcePreloader.preloadNextPage(route);
};

export default resourcePreloader;
