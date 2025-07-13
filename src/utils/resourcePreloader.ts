/**
 * Simple Resource Preloader for MVP
 * Basic preloading without complex optimization
 */

class ResourcePreloader {
  private preloadedResources = new Set<string>();

  /**
   * Simple font preloading
   */
  preloadFonts(fonts: string[]): void {
    fonts.forEach(fontUrl => {
      if (this.preloadedResources.has(fontUrl)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';

      document.head.appendChild(link);
      this.preloadedResources.add(fontUrl);
    });
  }

  /**
   * Simple image preloading
   */
  preloadImages(images: string[]): Promise<void[]> {
    const promises = images.map(imageUrl => {
      if (this.preloadedResources.has(imageUrl)) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.preloadedResources.add(imageUrl);
          resolve();
        };
        img.onerror = () => resolve(); // Don't fail on missing images
        img.src = imageUrl;
      });
    });

    return Promise.all(promises);
  }

}

// Simple singleton
export const resourcePreloader = new ResourcePreloader();

/**
 * Simple initialization - no complex preloading
 */
export const initializeResourcePreloading = (): void => {
  // Do nothing for MVP - keep it simple
  console.log('Resource preloading disabled for MVP');
};

export default resourcePreloader;
