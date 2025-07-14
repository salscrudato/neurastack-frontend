# NeuraStack Consolidated Styling System

This document outlines the new consolidated styling architecture that replaces the previous fragmented CSS approach with a unified, maintainable system.

## 🎯 Overview

The styling system has been consolidated from **7 separate files** into **2 CSS files + enhanced TypeScript theme**, providing:

- **60% reduction** in styling files
- **Unified design tokens** via CSS custom properties
- **Enhanced TypeScript theme** with component variants
- **Better performance** through optimized CSS organization
- **Improved maintainability** with clear style ownership

## 📁 File Structure

```
src/styles/
├── global.css          # Global styles, CSS custom properties, base elements
├── utilities.css       # Utility classes, mobile optimizations, component-specific styles
└── README.md          # This documentation

src/theme/
├── theme.ts           # Main Chakra UI theme with enhanced component variants
├── components.ts      # Extracted component style patterns
├── designSystem.ts    # Design tokens and base component styles
└── chat.ts           # Chat-specific theme (minimal)
```

## 🎨 CSS Custom Properties (Design Tokens)

All design tokens are now centralized in `global.css` using CSS custom properties:

### Colors

```css
--color-brand-primary: #4F9CF9
--color-surface-glass: rgba(255, 255, 255, 0.8)
--gradient-primary: linear-gradient(135deg, #4F9CF9 0%, #6366F1 100%)
```

### Spacing (4px grid)

```css
--space-xs: 0.25rem    /* 4px */
--space-sm: 0.5rem     /* 8px */
--space-md: 1rem       /* 16px */
--space-lg: 1.5rem     /* 24px */
```

### Shadows & Effects

```css
--shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.37)
--shadow-glow: 0 0 20px rgba(79, 156, 249, 0.3)
```

## 🧩 Utility Classes

### Glass Morphism

```css
.glass-card          /* Glass card with backdrop blur */

/* Glass card with backdrop blur */

.glass-button; /* Glass button with hover effects */
```

### Gradients

```css
.gradient-primary    /* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
/* Primary brand gradient */
.gradient-secondary  /* Secondary gradient */
.text-gradient; /* Gradient text effect */
```

### Animations

```css
.animate-slide-up    /* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
/* Slide up entrance animation */
.animate-float       /* Floating animation */
.hover-lift          /* Lift on hover */
.button-press-feedback; /* Press feedback animation */
```

### Loading States

```css
.loading-shimmer     /* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
/* Shimmer loading effect */
.loading-dots-enhanced; /* Enhanced loading dots */
```

## 🎭 Component Variants

### Button Variants

```tsx
<Button variant="solid">Primary Button</Button>
<Button variant="glass">Glass Button</Button>
<Button size="mobile-lg">Mobile Large</Button>
```

### Layout Variants

```tsx
<Box variant="page-container">Page Container</Box>
<Box variant="fixed-header">Fixed Header</Box>
<Flex variant="page-wrapper">Page Wrapper</Flex>
<Flex variant="center">Centered Layout</Flex>
```

### Form Variants

```tsx
<Input variant="glass" />
<Input variant="mobile-optimized" />
<Textarea variant="mobile-optimized" />
```

### Card Variants

```tsx
<Card variant="glass">Glass Card</Card>
```

## 📱 Mobile Optimizations

All mobile optimizations are consolidated in `utilities.css`:

- **Touch targets**: Minimum 48px for mobile
- **iOS zoom prevention**: 16px font size on inputs
- **Smooth scrolling**: Touch-optimized scroll behavior
- **Safe area support**: CSS env() for notched devices
- **Performance**: GPU acceleration and will-change optimization

## 🚀 Usage Examples

### Using CSS Custom Properties

```css
.my-component {
  background: var(--color-surface-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  padding: var(--space-lg);
}
```

### Using Utility Classes

```tsx
<Box className="glass-card animate-slide-up">
  <Text className="text-gradient">Gradient Text</Text>
  <Button className="hover-lift">Hover Button</Button>
</Box>
```

### Using Theme Variants

```tsx
<Flex variant="page-wrapper">
  <Box variant="fixed-header">
    <Header />
  </Box>
  <Box variant="page-container">
    <Card variant="glass">
      <Button variant="solid" size="mobile-lg">
        Action Button
      </Button>
    </Card>
  </Box>
</Flex>
```

## 🔧 Migration Guide

### Before (Fragmented)

```tsx
// Multiple CSS imports
import "./styles/optimized-styles.css";
import "./styles/mobile-optimizations.css";
import "./styles/modern-enhancements.css";

// Inline styles
<Box
  w="100%"
  minH="100%"
  bg="#FAFBFC"
  position="relative"
  overflowX="hidden"
  sx={{
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
  }}
>
```

### After (Consolidated)

```tsx
// Single imports
import "./styles/global.css";
import "./styles/utilities.css";

// Theme variants
<Box variant="page-container">
```

## 🎯 Benefits

1. **Reduced Bundle Size**: Fewer CSS files and optimized loading
2. **Better Caching**: Consolidated files cache more effectively
3. **Improved DX**: IntelliSense support for theme variants
4. **Easier Maintenance**: Single source of truth for design tokens
5. **Better Performance**: Optimized CSS organization and delivery
6. **Consistent Design**: Unified design system across all components

## 📚 Style Guide Component

A comprehensive style guide component is available at `src/components/StyleGuide.tsx` that demonstrates all available variants and utility classes.

## 🔍 Debugging

Use browser dev tools to inspect CSS custom properties:

```css
/* In dev tools console */
getComputedStyle(document.documentElement).getPropertyValue('--color-brand-primary')
```

## 🚀 Performance

The consolidated system provides:

- **Faster initial load**: Fewer HTTP requests
- **Better caching**: Larger, more stable cache units
- **Reduced runtime**: Fewer style recalculations
- **Optimized delivery**: Better compression ratios
