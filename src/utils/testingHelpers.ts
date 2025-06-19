/**
 * Testing Helper Utilities
 * 
 * Provides comprehensive testing utilities with human-readable naming conventions,
 * type safety, and enhanced testing patterns for achieving 85%+ test coverage.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import React from 'react';

// ============================================================================
// Type Definitions for Testing
// ============================================================================

interface ITestingUser extends UserEvent {
  // Enhanced user event interface for better type safety
}

interface IComponentTestOptions extends RenderOptions {
  initialProps?: Record<string, unknown>;
  mockProviders?: React.ComponentType<{ children: React.ReactNode }>[];
  shouldMockTimers?: boolean;
  shouldMockConsole?: boolean;
}

interface IAsyncTestOptions {
  timeoutMilliseconds?: number;
  retryIntervalMilliseconds?: number;
  maxRetryAttempts?: number;
}

// ============================================================================
// Component Testing Utilities
// ============================================================================

/**
 * Enhanced component rendering with comprehensive setup
 * Provides consistent testing environment with human-readable configuration
 */
export function renderComponentForTesting(
  ComponentToTest: React.ReactElement,
  testingOptions: IComponentTestOptions = {}
): RenderResult & { testingUser: ITestingUser } {
  const {
    initialProps = {},
    mockProviders = [],
    shouldMockTimers = false,
    shouldMockConsole = false,
    ...renderOptions
  } = testingOptions;

  // Setup test environment
  if (shouldMockTimers) {
    jest.useFakeTimers();
  }

  if (shouldMockConsole) {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }

  // Wrap component with mock providers
  let WrappedComponent = ComponentToTest;
  mockProviders.forEach(Provider => {
    WrappedComponent = React.createElement(Provider, {}, WrappedComponent);
  });

  // Render component with enhanced user event setup
  const renderResult = render(WrappedComponent, renderOptions);
  const testingUser = userEvent.setup();

  return {
    ...renderResult,
    testingUser: testingUser as ITestingUser
  };
}

/**
 * Find element by test ID with enhanced error messaging
 * Provides clear error messages for failed element queries
 */
export function findElementByTestId(
  testId: string,
  shouldThrowIfNotFound: boolean = true
): HTMLElement | null {
  try {
    return screen.getByTestId(testId);
  } catch (error) {
    if (shouldThrowIfNotFound) {
      throw new Error(
        `Element with test ID "${testId}" not found. ` +
        `Available test IDs: ${getAllAvailableTestIds().join(', ')}`
      );
    }
    return null;
  }
}

/**
 * Get all available test IDs in the current DOM
 * Helpful for debugging test failures
 */
export function getAllAvailableTestIds(): string[] {
  const elementsWithTestIds = document.querySelectorAll('[data-testid]');
  return Array.from(elementsWithTestIds).map(element => 
    element.getAttribute('data-testid') || ''
  ).filter(Boolean);
}

// ============================================================================
// User Interaction Testing Utilities
// ============================================================================

/**
 * Simulate user click with comprehensive event handling
 * Includes proper event propagation and timing
 */
export async function simulateUserClick(
  targetElement: HTMLElement,
  clickOptions: {
    shouldWaitForResponse?: boolean;
    waitTimeoutMilliseconds?: number;
    clickCount?: number;
  } = {}
): Promise<void> {
  const {
    shouldWaitForResponse = false,
    waitTimeoutMilliseconds = 1000,
    clickCount = 1
  } = clickOptions;

  // Perform click(s)
  for (let i = 0; i < clickCount; i++) {
    fireEvent.click(targetElement);
    
    if (i < clickCount - 1) {
      // Small delay between multiple clicks
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  // Wait for response if requested
  if (shouldWaitForResponse) {
    await waitFor(() => {
      // This will wait for any pending async operations
    }, { timeout: waitTimeoutMilliseconds });
  }
}

/**
 * Simulate user typing with realistic timing
 * Mimics human typing patterns for more realistic tests
 */
export async function simulateUserTyping(
  inputElement: HTMLElement,
  textToType: string,
  typingOptions: {
    typingDelayMilliseconds?: number;
    shouldClearFirst?: boolean;
    shouldTriggerBlur?: boolean;
  } = {}
): Promise<void> {
  const {
    typingDelayMilliseconds = 50,
    shouldClearFirst = false,
    shouldTriggerBlur = false
  } = typingOptions;

  if (shouldClearFirst) {
    fireEvent.change(inputElement, { target: { value: '' } });
  }

  // Type each character with delay
  for (const character of textToType) {
    fireEvent.change(inputElement, { 
      target: { value: (inputElement as HTMLInputElement).value + character } 
    });
    await new Promise(resolve => setTimeout(resolve, typingDelayMilliseconds));
  }

  if (shouldTriggerBlur) {
    fireEvent.blur(inputElement);
  }
}

// ============================================================================
// Async Testing Utilities
// ============================================================================

/**
 * Wait for element to appear with enhanced retry logic
 * Provides comprehensive async element waiting with clear error messages
 */
export async function waitForElementToAppear(
  elementSelector: () => HTMLElement | null,
  asyncOptions: IAsyncTestOptions = {}
): Promise<HTMLElement> {
  const {
    timeoutMilliseconds = 5000,
    retryIntervalMilliseconds = 100,
    maxRetryAttempts = timeoutMilliseconds / retryIntervalMilliseconds
  } = asyncOptions;

  let currentAttempt = 0;

  while (currentAttempt < maxRetryAttempts) {
    const foundElement = elementSelector();
    
    if (foundElement) {
      return foundElement;
    }

    currentAttempt++;
    await new Promise(resolve => setTimeout(resolve, retryIntervalMilliseconds));
  }

  throw new Error(
    `Element did not appear within ${timeoutMilliseconds}ms after ${maxRetryAttempts} attempts. ` +
    `Available elements: ${getAllAvailableTestIds().join(', ')}`
  );
}

/**
 * Wait for async operation to complete with comprehensive error handling
 * Provides detailed error information for failed async operations
 */
export async function waitForAsyncOperation<TOperationResult>(
  asyncOperation: () => Promise<TOperationResult>,
  operationDescription: string,
  asyncOptions: IAsyncTestOptions = {}
): Promise<TOperationResult> {
  const {
    timeoutMilliseconds = 5000,
    maxRetryAttempts = 3
  } = asyncOptions;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetryAttempts; attempt++) {
    try {
      const result = await Promise.race([
        asyncOperation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Operation "${operationDescription}" timed out`)), timeoutMilliseconds)
        )
      ]);

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetryAttempts) {
        console.warn(`Attempt ${attempt} failed for "${operationDescription}":`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
      }
    }
  }

  throw new Error(
    `Async operation "${operationDescription}" failed after ${maxRetryAttempts} attempts. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
}

// ============================================================================
// Mock Utilities
// ============================================================================

/**
 * Create comprehensive mock function with enhanced tracking
 * Provides detailed call tracking and response simulation
 */
export function createMockFunction<TFunctionArgs extends unknown[], TFunctionReturn>(
  mockImplementation?: (...args: TFunctionArgs) => TFunctionReturn,
  mockName: string = 'MockFunction'
): jest.MockedFunction<(...args: TFunctionArgs) => TFunctionReturn> {
  const mockFunction = jest.fn(mockImplementation);
  
  // Add enhanced tracking
  mockFunction.mockName(mockName);
  
  return mockFunction;
}

/**
 * Create mock API response with realistic structure
 * Provides consistent API response mocking patterns
 */
export function createMockApiResponse<TResponseData>(
  responseData: TResponseData,
  responseOptions: {
    shouldSucceed?: boolean;
    responseDelayMilliseconds?: number;
    errorMessage?: string;
  } = {}
): Promise<{ success: boolean; data?: TResponseData; error?: string }> {
  const {
    shouldSucceed = true,
    responseDelayMilliseconds = 100,
    errorMessage = 'Mock API error'
  } = responseOptions;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSucceed) {
        resolve({ success: true, data: responseData });
      } else {
        reject(new Error(errorMessage));
      }
    }, responseDelayMilliseconds);
  });
}

// ============================================================================
// Export Testing Utilities
// ============================================================================

export const TestingHelpers = {
  renderComponentForTesting,
  findElementByTestId,
  getAllAvailableTestIds,
  simulateUserClick,
  simulateUserTyping,
  waitForElementToAppear,
  waitForAsyncOperation,
  createMockFunction,
  createMockApiResponse,
};

export default TestingHelpers;
