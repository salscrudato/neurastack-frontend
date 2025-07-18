/**
 * Shared Modal Configuration
 * Common styling and behavior patterns for modals
 */

// Common modal props that can be reused
export const commonModalProps = {
  scrollBehavior: "inside" as const,
  isCentered: true,
  closeOnOverlayClick: true,
  closeOnEsc: true,
  trapFocus: true,
  blockScrollOnMount: true,
};

// Enhanced overlay styling with improved glass morphism
export const commonOverlayStyles = {
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  bg: "rgba(15, 23, 42, 0.4)",
  zIndex: "var(--z-modal-backdrop)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
};

// Enhanced content styling with modern glass effects
export const commonContentStyles = {
  bg: "var(--color-surface-glass-strong)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  boxShadow: "var(--shadow-2xl), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "var(--radius-3xl)",
  position: "relative",
  overflow: "hidden",
  _before: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)",
    pointerEvents: "none"
  }
};

// Enhanced modal size configurations with better mobile handling
export const modalSizes = {
  small: { base: "sm", md: "md" },
  medium: { base: "md", md: "lg" },
  large: { base: "lg", md: "xl" },
  extraLarge: { base: "xl", md: "2xl" },
  fullscreen: { base: "full", md: "full" }
};

// Enhanced modal spacing configurations with better content handling
export const modalSpacing = {
  // Standard modal margins and positioning
  standard: {
    mx: { base: 3, md: 6 },
    mt: {
      base: "calc(var(--header-height-mobile) + env(safe-area-inset-top, 0px) + 12px)",
      md: "calc(var(--header-height-desktop) + 16px)"
    },
    mb: { base: 3, md: 6 },
    maxH: { base: "90vh", md: "85vh" },
    minH: { base: "200px", md: "300px" }
  },

  // Full-screen modal positioning with safe area handling
  fullscreen: {
    m: 0,
    h: {
      base: "calc(100vh - var(--header-height-mobile) - env(safe-area-inset-bottom, 0px))",
      md: "calc(100vh - var(--header-height-desktop))"
    },
    maxH: {
      base: "calc(100vh - var(--header-height-mobile) - env(safe-area-inset-bottom, 0px))",
      md: "calc(100vh - var(--header-height-desktop))"
    },
    w: {
      base: "calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))",
      md: "100vw"
    },
    maxW: "100vw",
    position: "fixed",
    top: {
      base: "calc(var(--header-height-mobile) + env(safe-area-inset-top, 0px))",
      md: "var(--header-height-desktop)"
    },
    left: {
      base: "env(safe-area-inset-left, 0px)",
      md: 0
    }
  },

  // Modal content padding with better mobile spacing
  content: {
    header: { py: { base: 2, md: 4 }, px: { base: 3, md: 6 } },
    body: { py: { base: 3, md: 6 }, px: { base: 3, md: 6 } },
    footer: { py: { base: 2, md: 4 }, px: { base: 3, md: 6 } }
  }
}

// Enhanced modal content styles for better scrolling
export const modalContentStyles = {
  // Ensure proper scrolling behavior
  scrollable: {
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    WebkitOverflowScrolling: "touch" as const,
    overscrollBehavior: "contain" as const,
    scrollbarWidth: "thin" as const,
    scrollbarColor: "rgba(79, 156, 249, 0.3) transparent",
    "&::-webkit-scrollbar": {
      width: "6px"
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent"
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(79, 156, 249, 0.3)",
      borderRadius: "3px"
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "rgba(79, 156, 249, 0.5)"
    }
  },

  // Prevent content cutoff
  contentSafe: {
    wordWrap: "break-word" as const,
    overflowWrap: "break-word" as const,
    hyphens: "auto" as const,
    minWidth: 0, // Allows flex items to shrink below content size
    flex: "1 1 auto" // Allows content to grow and shrink
  }
};

// Enhanced close button styling
export const commonCloseButtonStyles = {
  color: "var(--color-text-muted)",
  bg: "var(--color-surface-glass)",
  borderRadius: "var(--radius-lg)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  _hover: {
    bg: "var(--color-surface-primary)",
    color: "var(--color-text-primary)",
    transform: "scale(1.05)",
    boxShadow: "var(--shadow-button-hover)"
  },
  _active: {
    transform: "scale(0.95)"
  },
  _focus: {
    outline: "none",
    boxShadow: "0 0 0 3px rgba(79, 156, 249, 0.3)"
  }
};
