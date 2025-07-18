/**
 * Responsive Design Validation Utilities
 * 
 * Utilities to validate and test responsive design implementation
 * across different devices and screen sizes.
 */

export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  description: string;
}

export const BREAKPOINTS: ResponsiveBreakpoint[] = [
  { name: 'xs', minWidth: 320, maxWidth: 479, description: 'Small phones' },
  { name: 'sm', minWidth: 480, maxWidth: 767, description: 'Large phones' },
  { name: 'md', minWidth: 768, maxWidth: 1023, description: 'Tablets' },
  { name: 'lg', minWidth: 1024, maxWidth: 1279, description: 'Small laptops' },
  { name: 'xl', minWidth: 1280, maxWidth: 1535, description: 'Desktops' },
  { name: '2xl', minWidth: 1536, description: 'Large screens' },
];

export interface TouchTargetValidation {
  element: HTMLElement;
  width: number;
  height: number;
  isValid: boolean;
  recommendation?: string;
}

export interface TypographyValidation {
  element: HTMLElement;
  fontSize: number;
  lineHeight: number;
  isReadable: boolean;
  recommendation?: string;
}

export interface ResponsiveValidationResult {
  breakpoint: ResponsiveBreakpoint;
  touchTargets: TouchTargetValidation[];
  typography: TypographyValidation[];
  containerOverflow: boolean;
  horizontalScroll: boolean;
  score: number;
  recommendations: string[];
}

/**
 * Validates touch target sizes according to WCAG guidelines
 */
export function validateTouchTargets(): TouchTargetValidation[] {
  const interactiveElements = document.querySelectorAll(
    'button, [role="button"], input[type="button"], input[type="submit"], a, [tabindex]:not([tabindex="-1"])'
  );

  return Array.from(interactiveElements).map((element) => {
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // WCAG AA requires minimum 44x44px touch targets
    const minSize = 44;
    const isValid = width >= minSize && height >= minSize;
    
    let recommendation: string | undefined;
    if (!isValid) {
      recommendation = `Increase size to at least ${minSize}x${minSize}px. Current: ${Math.round(width)}x${Math.round(height)}px`;
    }

    return {
      element: element as HTMLElement,
      width,
      height,
      isValid,
      recommendation,
    };
  });
}

/**
 * Validates typography readability
 */
export function validateTypography(): TypographyValidation[] {
  const textElements = document.querySelectorAll(
    'p, span, div, h1, h2, h3, h4, h5, h6, button, input, textarea, label'
  );

  return Array.from(textElements)
    .filter((element) => {
      const text = element.textContent?.trim();
      return text && text.length > 0;
    })
    .map((element) => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      const lineHeight = parseFloat(styles.lineHeight) || fontSize * 1.2;
      
      // Minimum readable font size is 16px on mobile, 14px on desktop
      const isMobile = window.innerWidth < 768;
      const minFontSize = isMobile ? 16 : 14;
      const isReadable = fontSize >= minFontSize;
      
      let recommendation: string | undefined;
      if (!isReadable) {
        recommendation = `Increase font size to at least ${minFontSize}px. Current: ${fontSize}px`;
      }

      return {
        element: element as HTMLElement,
        fontSize,
        lineHeight,
        isReadable,
        recommendation,
      };
    });
}

/**
 * Checks for horizontal scroll and container overflow
 */
export function validateLayout(): { containerOverflow: boolean; horizontalScroll: boolean } {
  const body = document.body;
  const html = document.documentElement;
  
  const documentWidth = Math.max(
    body.scrollWidth,
    body.offsetWidth,
    html.clientWidth,
    html.scrollWidth,
    html.offsetWidth
  );
  
  const viewportWidth = window.innerWidth;
  const horizontalScroll = documentWidth > viewportWidth;
  
  // Check for elements that overflow their containers
  const allElements = document.querySelectorAll('*');
  let containerOverflow = false;
  
  for (const element of allElements) {
    const rect = element.getBoundingClientRect();
    if (rect.right > viewportWidth || rect.left < 0) {
      containerOverflow = true;
      break;
    }
  }
  
  return { containerOverflow, horizontalScroll };
}

/**
 * Calculates a responsive design score (0-100)
 */
export function calculateResponsiveScore(
  touchTargets: TouchTargetValidation[],
  typography: TypographyValidation[],
  layout: { containerOverflow: boolean; horizontalScroll: boolean }
): number {
  // let score = 100;
  
  // Touch target validation (30% of score)
  const validTouchTargets = touchTargets.filter(t => t.isValid).length;
  const touchTargetScore = touchTargets.length > 0 ? (validTouchTargets / touchTargets.length) * 30 : 30;
  
  // Typography validation (40% of score)
  const readableText = typography.filter(t => t.isReadable).length;
  const typographyScore = typography.length > 0 ? (readableText / typography.length) * 40 : 40;
  
  // Layout validation (30% of score)
  let layoutScore = 30;
  if (layout.containerOverflow) layoutScore -= 15;
  if (layout.horizontalScroll) layoutScore -= 15;
  
  return Math.round(touchTargetScore + typographyScore + layoutScore);
}

/**
 * Generates recommendations based on validation results
 */
export function generateRecommendations(
  touchTargets: TouchTargetValidation[],
  typography: TypographyValidation[],
  layout: { containerOverflow: boolean; horizontalScroll: boolean }
): string[] {
  const recommendations: string[] = [];
  
  const invalidTouchTargets = touchTargets.filter(t => !t.isValid);
  if (invalidTouchTargets.length > 0) {
    recommendations.push(`${invalidTouchTargets.length} touch targets are too small. Increase to at least 44x44px.`);
  }
  
  const unreadableText = typography.filter(t => !t.isReadable);
  if (unreadableText.length > 0) {
    recommendations.push(`${unreadableText.length} text elements have font sizes that are too small for readability.`);
  }
  
  if (layout.containerOverflow) {
    recommendations.push('Some elements overflow their containers. Check for fixed widths and use responsive units.');
  }
  
  if (layout.horizontalScroll) {
    recommendations.push('Horizontal scrolling detected. Ensure content fits within viewport width.');
  }
  
  return recommendations;
}

/**
 * Runs complete responsive validation for current viewport
 */
export function validateResponsiveDesign(): ResponsiveValidationResult {
  const currentWidth = window.innerWidth;
  const breakpoint = BREAKPOINTS.find(bp => 
    currentWidth >= bp.minWidth && (!bp.maxWidth || currentWidth <= bp.maxWidth)
  ) || BREAKPOINTS[BREAKPOINTS.length - 1];
  
  const touchTargets = validateTouchTargets();
  const typography = validateTypography();
  const layout = validateLayout();
  const score = calculateResponsiveScore(touchTargets, typography, layout);
  const recommendations = generateRecommendations(touchTargets, typography, layout);
  
  return {
    breakpoint,
    touchTargets,
    typography,
    containerOverflow: layout.containerOverflow,
    horizontalScroll: layout.horizontalScroll,
    score,
    recommendations,
  };
}

/**
 * Runs validation across multiple breakpoints (for testing)
 */
export async function validateAllBreakpoints(): Promise<ResponsiveValidationResult[]> {
  const results: ResponsiveValidationResult[] = [];
  
  for (const breakpoint of BREAKPOINTS) {
    // Simulate viewport resize
    const testWidth = breakpoint.minWidth + (breakpoint.maxWidth ? 
      Math.floor((breakpoint.maxWidth - breakpoint.minWidth) / 2) : 100);
    
    // Note: In a real implementation, you'd need to actually resize the viewport
    // This is a simplified version for demonstration
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: testWidth,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    // Wait for layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = validateResponsiveDesign();
    results.push(result);
  }
  
  return results;
}

/**
 * Logs validation results to console in a readable format
 */
export function logValidationResults(result: ResponsiveValidationResult): void {
  console.group(`📱 Responsive Validation - ${result.breakpoint.name} (${result.breakpoint.description})`);
  console.log(`Score: ${result.score}/100`);
  
  if (result.recommendations.length > 0) {
    console.group('🔧 Recommendations:');
    result.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  }
  
  console.log(`Touch Targets: ${result.touchTargets.filter(t => t.isValid).length}/${result.touchTargets.length} valid`);
  console.log(`Typography: ${result.typography.filter(t => t.isReadable).length}/${result.typography.length} readable`);
  console.log(`Layout Issues: ${result.containerOverflow ? 'Container overflow detected' : 'No overflow'}`);
  console.log(`Horizontal Scroll: ${result.horizontalScroll ? 'Present' : 'None'}`);
  
  console.groupEnd();
}
