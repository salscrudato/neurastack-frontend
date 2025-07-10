# Grok-Inspired Theme System

## Overview
This directory contains the modular theme system for the Grok-inspired UI/UX design. The theme is built with CSS custom properties (CSS variables) for maximum flexibility and maintainability.

## File Structure

```
src/themes/
├── README.md           # This file
├── variables.css       # Design tokens and CSS custom properties
├── components.css      # Reusable component styles
└── global.css         # Base styles and global resets
```

## Design Tokens

### Color System
The color palette is inspired by Grok's futuristic, minimalist aesthetic:

#### Primary Colors
- `--color-bg-primary: #1A1A1A` - Dark charcoal backdrop
- `--color-accent-primary: #00C4B4` - Vibrant teal for interactions
- `--color-surface-primary: #F5F5F5` - Soft off-white for content

#### Text Colors
- `--color-text-primary-light: #333333` - Dark text on light backgrounds
- `--color-text-primary-dark: #FFFFFF` - Light text on dark backgrounds
- `--color-text-tertiary-light: #A0A0A0` - Muted text and placeholders

### Typography
- **Font Family**: Inter (clean, geometric sans-serif)
- **Font Sizes**: 12px to 48px scale
- **Font Weights**: 300 (light), 400 (regular), 700 (bold)
- **Line Heights**: 1.2 (tight), 1.5 (normal), 1.625 (relaxed)

### Spacing System
Based on 8px grid system:
- `--space-1: 4px` to `--space-24: 96px`
- Consistent spacing for layouts and components

### Shadow System
Enhanced shadows with teal tints:
- `--shadow-glow: 0 0 20px rgba(0, 196, 180, 0.25)`
- `--shadow-hover: 0 8px 25px rgba(0, 196, 180, 0.15)`

## Component Classes

### Buttons
```css
.btn                 /* Base button styles */
.btn--primary        /* Teal background, white text */
.btn--secondary      /* Transparent with teal border */
.btn--sm|md|lg       /* Size variants */
```

### Cards
```css
.card                /* Base card styles */
.card--glass         /* Glass morphism effect */
.card--dark          /* Dark theme variant */
```

### Inputs
```css
.input               /* Base input styles */
.textarea            /* Textarea variant */
```

### Modals
```css
.modal-backdrop      /* Modal overlay */
.modal               /* Modal container */
.modal-header        /* Modal header */
.modal-close         /* Close button */
```

### Utilities
```css
.glass               /* Glass morphism utility */
.glow                /* Glow effect utility */
.touch-target        /* Touch-friendly sizing */
```

## Usage Examples

### Using CSS Custom Properties
```css
.my-component {
  background: var(--color-surface-primary);
  color: var(--color-text-primary-light);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### Using Component Classes
```html
<!-- Primary button -->
<button class="btn btn--primary btn--md">
  Click me
</button>

<!-- Glass card -->
<div class="card card--glass">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

### Using with Chakra UI
```jsx
import { Button } from '@chakra-ui/react';

<Button
  colorScheme="teal"
  variant="solid"
  size="md"
>
  Grok-styled Button
</Button>
```

## Customization

### Modifying Colors
Update colors in `variables.css`:
```css
:root {
  --color-accent-primary: #00D4C4; /* Lighter teal */
  --color-accent-secondary: #00B8AA; /* Darker teal */
}
```

### Adding New Components
Add new component styles to `components.css`:
```css
.my-new-component {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: var(--transition-normal);
}

.my-new-component:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}
```

## Responsive Design

### Breakpoints
```css
--breakpoint-sm: 480px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
```

### Mobile-First Approach
```css
/* Mobile styles first */
.component {
  padding: var(--space-4);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: var(--space-6);
  }
}
```

## Accessibility

### Focus Management
All interactive elements have visible focus indicators:
```css
*:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

### Color Contrast
All color combinations meet WCAG 2.1 AA standards:
- Text: 4.5:1 minimum contrast ratio
- UI components: 3:1 minimum contrast ratio

### Touch Targets
Minimum 44px touch targets for accessibility:
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

## Performance

### CSS Custom Properties
- Efficient runtime theming
- Reduced bundle size
- Better browser caching

### GPU Acceleration
Animations use transform and opacity for optimal performance:
```css
.animated-element {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

## Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **CSS Features**: Custom Properties, Grid, Flexbox, Backdrop Filter
- **Fallbacks**: Provided for older browsers where necessary

## Maintenance

### Regular Tasks
1. **Audit Colors**: Ensure consistent usage across components
2. **Check Contrast**: Verify WCAG compliance for new colors
3. **Update Documentation**: Keep examples current
4. **Performance Review**: Monitor CSS bundle size

### Adding New Design Tokens
1. Add to `variables.css` with descriptive names
2. Document usage in this README
3. Update component examples
4. Test across browsers and devices

## Migration from Old Theme

### Color Mapping
```css
/* Old blue accent */
#2563EB → var(--color-accent-primary) /* #00C4B4 */

/* Old backgrounds */
#FFFFFF → var(--color-surface-primary) /* #F5F5F5 */
#FAFAFA → var(--color-surface-secondary) /* #FFFFFF */
```

### Component Updates
Replace hardcoded styles with theme classes:
```css
/* Before */
.old-button {
  background: #2563EB;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}

/* After */
.new-button {
  /* Use .btn .btn--primary classes instead */
}
```

## Contributing

### Guidelines
1. Follow existing naming conventions
2. Use semantic color names (not descriptive)
3. Maintain 8px spacing grid
4. Test accessibility compliance
5. Document new additions

### Code Style
- Use kebab-case for CSS classes
- Group related properties
- Include comments for complex styles
- Follow mobile-first responsive design
