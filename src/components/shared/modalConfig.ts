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

// Enhanced modal size configurations
export const modalSizes = {
  small: { base: "sm", md: "md" },
  medium: { base: "lg", md: "xl" },
  large: { base: "full", md: "2xl" },
  extraLarge: { base: "full", md: "4xl" }
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
