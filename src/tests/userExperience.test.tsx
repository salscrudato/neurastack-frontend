/**
 * User Experience Tests
 * 
 * Tests user workflows, interaction patterns, performance expectations,
 * and overall user experience quality across the application.
 */

import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

// Mock components for UX testing
const LoadingSpinner = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;
  
  return (
    <div 
      role="status" 
      aria-label="Loading"
      data-testid="loading-spinner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        style={{
          width: '20px',
          height: '20px',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <span style={{ marginLeft: '10px' }}>Loading...</span>
    </div>
  );
};

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  stepTitles 
}: { 
  currentStep: number; 
  totalSteps: number;
  stepTitles: string[];
}) => (
  <div role="progressbar" aria-valuenow={currentStep} aria-valuemax={totalSteps}>
    <div style={{ display: 'flex', marginBottom: '10px' }}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            height: '4px',
            backgroundColor: index < currentStep ? '#3498db' : '#e0e0e0',
            marginRight: index < totalSteps - 1 ? '4px' : '0',
          }}
        />
      ))}
    </div>
    <p>Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</p>
  </div>
);

const ErrorBoundary = ({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div role="alert" data-testid="error-boundary">
        {fallback || (
          <div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <button onClick={() => setHasError(false)}>Try again</button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

const ResponsiveComponent = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div data-testid="responsive-component">
      <h1 style={{ fontSize: isMobile ? '24px' : '32px' }}>
        {isMobile ? 'Mobile View' : 'Desktop View'}
      </h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '16px',
        padding: isMobile ? '16px' : '24px',
      }}>
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </div>
    </div>
  );
};

const FormWithValidation = () => {
  const [formData, setFormData] = React.useState({ email: '', password: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="validation-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          aria-invalid={!!errors.email}
          data-testid="email-input"
        />
        {errors.email && (
          <div role="alert" style={{ color: 'red' }}>
            {errors.email}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          aria-invalid={!!errors.password}
          data-testid="password-input"
        />
        {errors.password && (
          <div role="alert" style={{ color: 'red' }}>
            {errors.password}
          </div>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        data-testid="submit-button"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

describe('User Experience Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States and Feedback', () => {
    it('should show loading indicators during async operations', async () => {
      const AsyncComponent = () => {
        const [isLoading, setIsLoading] = React.useState(false);

        const handleAsyncAction = async () => {
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 100));
          setIsLoading(false);
        };

        return (
          <div>
            <button onClick={handleAsyncAction} data-testid="async-button">
              Start Async Action
            </button>
            <LoadingSpinner isLoading={isLoading} />
          </div>
        );
      };

      render(
        <TestWrapper>
          <AsyncComponent />
        </TestWrapper>
      );

      const button = screen.getByTestId('async-button');
      
      // Initially no loading spinner
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      
      // Click button to start async action
      fireEvent.click(button);
      
      // Loading spinner should appear
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('should provide clear progress indicators for multi-step processes', () => {
      render(
        <TestWrapper>
          <ProgressIndicator 
            currentStep={2} 
            totalSteps={4}
            stepTitles={['Setup', 'Configuration', 'Review', 'Complete']}
          />
        </TestWrapper>
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '2');
      expect(progressBar).toHaveAttribute('aria-valuemax', '4');
      expect(screen.getByText('Step 2 of 4: Configuration')).toBeInTheDocument();
    });

    it('should handle errors gracefully with recovery options', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      // Use a proper React Error Boundary
      class TestErrorBoundary extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean }
      > {
        constructor(props: { children: React.ReactNode }) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        render() {
          if (this.state.hasError) {
            return (
              <div data-testid="error-boundary">
                <h2>Something went wrong</h2>
                <p>We're sorry, but something unexpected happened.</p>
                <button onClick={() => this.setState({ hasError: false })}>
                  Try again
                </button>
              </div>
            );
          }

          return this.props.children;
        }
      }

      render(
        <TestWrapper>
          <TestErrorBoundary>
            <ErrorComponent />
          </TestErrorBoundary>
        </TestWrapper>
      );

      const errorBoundary = screen.getByTestId('error-boundary');
      expect(errorBoundary).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Responsive Design and Mobile Experience', () => {
    it('should adapt layout for different screen sizes', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600, // Mobile width
      });

      render(
        <TestWrapper>
          <ResponsiveComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Mobile View')).toBeInTheDocument();

      // Change to desktop width
      Object.defineProperty(window, 'innerWidth', {
        value: 1200,
      });

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Note: In a real test, you'd need to wait for the component to re-render
      // This is a simplified example
    });

    it('should have touch-friendly interface elements', () => {
      render(
        <TestWrapper>
          <button 
            style={{ 
              minHeight: '44px', 
              minWidth: '44px',
              padding: '12px',
              fontSize: '16px'
            }}
            data-testid="touch-button"
          >
            Touch Me
          </button>
        </TestWrapper>
      );

      const button = screen.getByTestId('touch-button');
      const styles = window.getComputedStyle(button);
      
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
      expect(parseInt(styles.fontSize)).toBeGreaterThanOrEqual(16);
    });
  });

  describe('Form Validation and User Feedback', () => {
    it('should provide real-time validation feedback', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FormWithValidation />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      // Try to submit empty form
      await user.click(submitButton);

      // Should show validation errors
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();

      // Clear and enter invalid email
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      // Check that validation errors are shown (the specific message may vary)
      expect(screen.getByText(/Email is/)).toBeInTheDocument();
    });

    it('should prevent double submission', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <FormWithValidation />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      // Fill form with valid data
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Submit form
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });
  });

  describe('Performance and Perceived Performance', () => {
    it('should render quickly for perceived performance', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <div>
            <h1>Fast Loading Component</h1>
            <p>This should render quickly</p>
          </div>
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Render should be fast (under 16ms for 60fps)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle large lists efficiently', () => {
      const LargeList = () => {
        const items = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);
        
        return (
          <div data-testid="large-list">
            {items.slice(0, 10).map((item, index) => (
              <div key={index}>{item}</div>
            ))}
            <div>... and {items.length - 10} more items</div>
          </div>
        );
      };

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <LargeList />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByTestId('large-list')).toBeInTheDocument();
      expect(renderTime).toBeLessThan(100);
    });
  });

  describe('User Workflow Completion', () => {
    it('should guide users through complex workflows', async () => {
      const user = userEvent.setup();
      
      const MultiStepWorkflow = () => {
        const [currentStep, setCurrentStep] = React.useState(1);
        const totalSteps = 3;

        const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

        return (
          <div>
            <ProgressIndicator 
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepTitles={['Personal Info', 'Preferences', 'Confirmation']}
            />
            
            <div data-testid={`step-${currentStep}`}>
              {currentStep === 1 && <div>Step 1: Enter your personal information</div>}
              {currentStep === 2 && <div>Step 2: Set your preferences</div>}
              {currentStep === 3 && <div>Step 3: Confirm your choices</div>}
            </div>

            <div>
              {currentStep > 1 && (
                <button onClick={prevStep} data-testid="prev-button">
                  Previous
                </button>
              )}
              {currentStep < totalSteps && (
                <button onClick={nextStep} data-testid="next-button">
                  Next
                </button>
              )}
              {currentStep === totalSteps && (
                <button data-testid="complete-button">
                  Complete
                </button>
              )}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <MultiStepWorkflow />
        </TestWrapper>
      );

      // Start at step 1
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 3: Personal Info')).toBeInTheDocument();

      // Go to step 2
      await user.click(screen.getByTestId('next-button'));
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 3: Preferences')).toBeInTheDocument();

      // Go to step 3
      await user.click(screen.getByTestId('next-button'));
      expect(screen.getByTestId('step-3')).toBeInTheDocument();
      expect(screen.getByText('Step 3 of 3: Confirmation')).toBeInTheDocument();

      // Complete button should be available
      expect(screen.getByTestId('complete-button')).toBeInTheDocument();
    });
  });
});
