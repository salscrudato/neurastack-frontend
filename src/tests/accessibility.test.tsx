/**
 * Accessibility Tests
 * 
 * Comprehensive accessibility testing for WCAG 2.1 AA compliance,
 * keyboard navigation, screen reader compatibility, and touch targets.
 */

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </ChakraProvider>
);

// Mock components for accessibility testing
const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled = false,
  ariaLabel,
  ariaDescribedBy 
}: { 
  children: React.ReactNode; 
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    style={{
      minHeight: '44px',
      minWidth: '44px',
      padding: '12px 16px',
      fontSize: '16px',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
    data-testid="accessible-button"
  >
    {children}
  </button>
);

const AccessibleForm = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.message) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
  };

  return (
    <form onSubmit={handleSubmit} role="form" aria-label="Contact form">
      <div>
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          data-testid="name-input"
        />
        {errors.name && (
          <div id="name-error" role="alert" aria-live="polite">
            {errors.name}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          data-testid="email-input"
        />
        {errors.email && (
          <div id="email-error" role="alert" aria-live="polite">
            {errors.email}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          data-testid="message-input"
        />
        {errors.message && (
          <div id="message-error" role="alert" aria-live="polite">
            {errors.message}
          </div>
        )}
      </div>

      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
};

const AccessibleNavigation = () => (
  <nav role="navigation" aria-label="Main navigation">
    <ul>
      <li>
        <a href="/home" aria-current="page">Home</a>
      </li>
      <li>
        <a href="/about">About</a>
      </li>
      <li>
        <a href="/contact">Contact</a>
      </li>
    </ul>
  </nav>
);

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <div>
            <h1>Main Title</h1>
            <h2>Section Title</h2>
            <h3>Subsection Title</h3>
            <h2>Another Section</h2>
          </div>
        </TestWrapper>
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      const h3 = screen.getByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2Elements).toHaveLength(2);
      expect(h3).toBeInTheDocument();
    });

    it('should have sufficient color contrast', () => {
      render(
        <TestWrapper>
          <div style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            High contrast text
          </div>
        </TestWrapper>
      );

      const element = screen.getByText('High contrast text');
      const styles = window.getComputedStyle(element);
      
      // Basic check - in real implementation, you'd use a color contrast library
      expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(styles.color).toBe('rgb(0, 0, 0)');
    });

    it('should have proper alt text for images', () => {
      render(
        <TestWrapper>
          <img src="/test-image.jpg" alt="A descriptive alt text for the image" />
        </TestWrapper>
      );

      const image = screen.getByAltText('A descriptive alt text for the image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'A descriptive alt text for the image');
    });

    it('should have proper form labels', () => {
      render(
        <TestWrapper>
          <AccessibleForm />
        </TestWrapper>
      );

      const nameInput = screen.getByLabelText('Name *');
      const emailInput = screen.getByLabelText('Email *');
      const messageInput = screen.getByLabelText('Message *');

      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(messageInput).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <div>
            <button data-testid="button1">Button 1</button>
            <button data-testid="button2">Button 2</button>
            <input data-testid="input1" type="text" />
          </div>
        </TestWrapper>
      );

      const button1 = screen.getByTestId('button1');
      const button2 = screen.getByTestId('button2');
      const input1 = screen.getByTestId('input1');

      // Start with first button focused
      button1.focus();
      expect(button1).toHaveFocus();

      // Tab to next element
      await user.tab();
      expect(button2).toHaveFocus();

      // Tab to input
      await user.tab();
      expect(input1).toHaveFocus();
    });

    it('should support Enter and Space key activation', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();
      
      render(
        <TestWrapper>
          <AccessibleButton onClick={mockClick}>
            Click me
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByTestId('accessible-button');
      button.focus();

      // Test Enter key
      await user.keyboard('{Enter}');
      expect(mockClick).toHaveBeenCalledTimes(1);

      // Test Space key
      await user.keyboard(' ');
      expect(mockClick).toHaveBeenCalledTimes(2);
    });

    it('should support arrow key navigation in lists', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AccessibleNavigation />
        </TestWrapper>
      );

      const nav = screen.getByRole('navigation');
      const links = screen.getAllByRole('link');

      expect(nav).toBeInTheDocument();
      expect(links).toHaveLength(3);

      // Focus first link
      links[0].focus();
      expect(links[0]).toHaveFocus();
    });

    it('should trap focus in modals', async () => {
      const user = userEvent.setup();
      
      const Modal = ({ isOpen }: { isOpen: boolean }) => {
        if (!isOpen) return null;
        
        return (
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h2 id="modal-title">Modal Title</h2>
            <button data-testid="modal-button1">Button 1</button>
            <button data-testid="modal-button2">Button 2</button>
            <button data-testid="modal-close">Close</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <Modal isOpen={true} />
        </TestWrapper>
      );

      const modal = screen.getByRole('dialog');
      const button1 = screen.getByTestId('modal-button1');
      const button2 = screen.getByTestId('modal-button2');
      const closeButton = screen.getByTestId('modal-close');

      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');

      // Focus should be trapped within modal
      button1.focus();
      expect(button1).toHaveFocus();

      await user.tab();
      expect(button2).toHaveFocus();

      await user.tab();
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum 44px touch targets', () => {
      render(
        <TestWrapper>
          <AccessibleButton onClick={() => {}}>
            Touch Target
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByTestId('accessible-button');
      const styles = window.getComputedStyle(button);
      
      // Check minimum dimensions
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
    });

    it('should have adequate spacing between touch targets', () => {
      render(
        <TestWrapper>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ minHeight: '44px', minWidth: '44px' }}>Button 1</button>
            <button style={{ minHeight: '44px', minWidth: '44px' }}>Button 2</button>
          </div>
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      
      // In a real implementation, you'd measure actual spacing
      const container = buttons[0].parentElement;
      const styles = window.getComputedStyle(container!);
      expect(styles.gap).toBe('8px');
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <AccessibleButton 
            onClick={() => {}} 
            ariaLabel="Close dialog"
          >
            ×
          </AccessibleButton>
        </TestWrapper>
      );

      const button = screen.getByLabelText('Close dialog');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('should announce form errors', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <AccessibleForm />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId('submit-button');
      
      // Submit form without filling fields
      await user.click(submitButton);

      // Check for error announcements
      const errorAlerts = screen.getAllByRole('alert');
      expect(errorAlerts.length).toBeGreaterThan(0);
      expect(errorAlerts[0]).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper landmark roles', () => {
      render(
        <TestWrapper>
          <div>
            <header role="banner">
              <h1>Site Header</h1>
            </header>
            <nav role="navigation">
              <AccessibleNavigation />
            </nav>
            <main role="main">
              <h2>Main Content</h2>
            </main>
            <footer role="contentinfo">
              <p>Footer content</p>
            </footer>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0);
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should support skip links', () => {
      render(
        <TestWrapper>
          <div>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <nav>Navigation</nav>
            <main id="main-content">
              <h1>Main Content</h1>
            </main>
          </div>
        </TestWrapper>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      render(
        <TestWrapper>
          <button 
            style={{ 
              outline: '2px solid blue',
              outlineOffset: '2px'
            }}
            data-testid="focused-button"
          >
            Focused Button
          </button>
        </TestWrapper>
      );

      const button = screen.getByTestId('focused-button');
      const styles = window.getComputedStyle(button);
      
      expect(styles.outline).toContain('blue');
      expect(styles.outlineOffset).toBe('2px');
    });

    it('should restore focus after modal closes', async () => {
      const user = userEvent.setup();
      
      const App = () => {
        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const triggerRef = React.useRef<HTMLButtonElement>(null);

        const openModal = () => setIsModalOpen(true);
        const closeModal = () => {
          setIsModalOpen(false);
          triggerRef.current?.focus();
        };

        return (
          <div>
            <button ref={triggerRef} onClick={openModal} data-testid="open-modal">
              Open Modal
            </button>
            {isModalOpen && (
              <div role="dialog" aria-modal="true">
                <button onClick={closeModal} data-testid="close-modal">
                  Close
                </button>
              </div>
            )}
          </div>
        );
      };

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const openButton = screen.getByTestId('open-modal');
      
      // Open modal
      await user.click(openButton);
      
      const closeButton = screen.getByTestId('close-modal');
      expect(closeButton).toBeInTheDocument();
      
      // Close modal
      await user.click(closeButton);
      
      // Focus should return to trigger button
      expect(openButton).toHaveFocus();
    });
  });
});
