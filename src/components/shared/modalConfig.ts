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

// Common overlay styling
export const commonOverlayStyles = {
  backdropFilter: "blur(4px)",
};

// Common content styling
export const commonContentStyles = {
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
  border: "1px solid",
  borderColor: "rgba(226, 232, 240, 0.8)",
};

// Modal size configurations
export const modalSizes = {
  small: { base: "xl", md: "lg" },
  large: { base: "full", md: "2xl" },
};

// Common close button styling
export const commonCloseButtonStyles = {
  color: "#4F9CF9",
  _hover: { bg: "blue.50" },
  borderRadius: "full",
};
