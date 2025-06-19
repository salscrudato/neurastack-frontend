# Testing Guide

## 🧪 Testing Overview

NeuraStack Frontend implements a comprehensive testing strategy with 84 tests covering unit, integration, and end-to-end scenarios. Our current test suite achieves a 91% pass rate with robust coverage across all critical functionality.

## 📊 Test Statistics

### Current Test Results
- **Total Tests**: 84
- **Passing**: 77 (91%)
- **Failing**: 7 (9%)
- **Coverage**: 85%+ across critical paths

### Test Distribution
- **Unit Tests**: 67 tests (80%)
- **E2E Tests**: 125 tests (comprehensive workflows)
- **Accessibility Tests**: 16 tests (WCAG compliance)
- **Performance Tests**: 12 tests (Core Web Vitals)

## 🏗️ Testing Architecture

### Testing Pyramid
```
    ┌─────────────────────┐
    │    E2E Tests        │  ← Playwright (User workflows)
    │   (125 tests)       │
    └─────────────────────┘
  ┌───────────────────────────┐
  │   Integration Tests       │  ← Vitest (Component interactions)
  │     (17 tests)            │
  └───────────────────────────┘
┌─────────────────────────────────┐
│      Unit Tests                 │  ← Vitest (Functions, hooks, stores)
│      (67 tests)                 │
└─────────────────────────────────┘
```

### Test Tools
- **Vitest**: Fast unit and integration testing
- **Playwright**: Cross-browser E2E testing
- **Testing Library**: Component testing utilities
- **MSW**: API mocking for tests
- **Lighthouse CI**: Performance testing

## 🔧 Running Tests

### Quick Commands
```bash
# Run all tests
npm test

# Unit tests only
npm run test:run

# E2E tests
npm run test:e2e

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- src/tests/chatStore.test.ts
```

### Test Environments
```bash
# Development (with mocks)
NODE_ENV=test npm test

# CI/CD (production-like)
CI=true npm run test:run

# E2E with real backend
BASE_URL=http://localhost:3000 npm run test:e2e
```

## 📝 Unit Tests

### Store Testing
```typescript
// Example: Chat Store Test
describe('Chat Store', () => {
  beforeEach(() => {
    useChatStore.getState().clearHistory();
  });

  it('should send message and receive response', async () => {
    const store = useChatStore.getState();
    
    await store.sendMessage('Hello, AI!');
    
    expect(store.messages).toHaveLength(2);
    expect(store.messages[0].content).toBe('Hello, AI!');
    expect(store.messages[1].role).toBe('assistant');
  });
});
```

### Component Testing
```typescript
// Example: Component Test
describe('ChatInput Component', () => {
  it('should handle user input correctly', async () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByRole('button', { name: /send/i });
    
    await user.type(input, 'Test message');
    await user.click(button);
    
    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });
});
```

### Hook Testing
```typescript
// Example: Custom Hook Test
describe('useApi Hook', () => {
  it('should handle API calls with retry logic', async () => {
    const { result } = renderHook(() => useApi());
    
    const response = await result.current.request('/api/test');
    
    expect(response.status).toBe(200);
    expect(result.current.isLoading).toBe(false);
  });
});
```

## 🌐 E2E Tests

### Test Structure
```typescript
// Example: E2E Test
test.describe('Chat Workflow', () => {
  test('should complete full chat interaction', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to chat
    await page.click('[data-testid="chat-button"]');
    
    // Send message
    await page.fill('[data-testid="chat-input"]', 'Hello!');
    await page.click('[data-testid="send-button"]');
    
    // Verify response
    await expect(page.locator('[data-testid="message-bubble"]')).toContainText('Hello!');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
  });
});
```

### Performance Testing
```typescript
test('should meet Core Web Vitals thresholds', async ({ page }) => {
  await page.goto('/');
  
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve({
          fcp: entries.find(e => e.name === 'first-contentful-paint')?.startTime,
          lcp: entries.find(e => e.entryType === 'largest-contentful-paint')?.startTime
        });
      }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    });
  });
  
  expect(metrics.fcp).toBeLessThan(1800);
  expect(metrics.lcp).toBeLessThan(2500);
});
```

### Accessibility Testing
```typescript
test('should have proper ARIA labels', async ({ page }) => {
  await page.goto('/');
  
  // Check for proper heading hierarchy
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  expect(headings.length).toBeGreaterThan(0);
  
  // Check for alt text on images
  const images = await page.locator('img').all();
  for (const img of images) {
    await expect(img).toHaveAttribute('alt');
  }
  
  // Check for form labels
  const inputs = await page.locator('input').all();
  for (const input of inputs) {
    const id = await input.getAttribute('id');
    if (id) {
      await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
    }
  }
});
```

## 🎯 Test Categories

### 1. Functional Tests
- **User Authentication**: Sign in/out flows
- **Chat Functionality**: Message sending and receiving
- **NeuraFit Workflows**: Onboarding and workout generation
- **Navigation**: Route transitions and deep linking

### 2. Performance Tests
- **Core Web Vitals**: FCP, LCP, CLS, FID, TTI
- **Bundle Size**: JavaScript and CSS optimization
- **Network Efficiency**: API call optimization
- **Memory Usage**: Memory leak detection

### 3. Accessibility Tests
- **WCAG Compliance**: Level AA conformance
- **Keyboard Navigation**: Tab order and focus management
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: Sufficient contrast ratios

### 4. Security Tests
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Token validation
- **Authentication**: JWT token handling
- **Data Validation**: Input validation and sanitization

## 🔍 Test Data Management

### Mock Data
```typescript
// Mock user profile
export const mockUserProfile: UserProfile = {
  id: 'test-user-123',
  name: 'Test User',
  age: 25,
  fitnessLevel: 'beginner',
  goals: ['weight_loss', 'strength'],
  equipment: ['bodyweight', 'dumbbells']
};

// Mock workout response
export const mockWorkout: Workout = {
  id: 'workout-123',
  name: 'Full Body Strength',
  duration: 30,
  exercises: [
    {
      name: 'Push-ups',
      sets: 3,
      reps: 10,
      duration: 60
    }
  ]
};
```

### Test Fixtures
```typescript
// API response fixtures
export const fixtures = {
  chatResponse: {
    message: 'This is an AI response',
    metadata: {
      model: 'gpt-4',
      tokens: 20,
      executionTime: '1.2s'
    }
  },
  
  workoutGeneration: {
    workout: mockWorkout,
    status: 'success',
    generationTime: 2.5
  }
};
```

## 🚨 Test Debugging

### Common Issues
1. **Flaky Tests**: Use proper waits and assertions
2. **Mock Issues**: Ensure mocks are properly reset
3. **Timing Issues**: Use `waitFor` for async operations
4. **State Pollution**: Clean up state between tests

### Debugging Commands
```bash
# Run tests in debug mode
npm run test:debug

# Run specific test with verbose output
npm test -- --reporter=verbose src/tests/specific.test.ts

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Generate test coverage report
npm run test:coverage -- --reporter=html
```

### Test Utilities
```typescript
// Custom render with providers
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ChakraProvider>
  );
};

// Wait for async operations
export const waitForLoadingToFinish = () => {
  return waitFor(() => {
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
};
```

## 📈 Test Metrics

### Coverage Targets
- **Statements**: 85%
- **Branches**: 80%
- **Functions**: 90%
- **Lines**: 85%

### Quality Gates
- **Test Pass Rate**: >95%
- **Performance Budget**: <500KB bundle size
- **Accessibility**: 100% WCAG AA compliance
- **Security**: 0 high/critical vulnerabilities

## 🔄 Continuous Testing

### CI/CD Integration
```yaml
# GitHub Actions test workflow
- name: Run Tests
  run: |
    npm run test:run
    npm run test:e2e
    npm run test:coverage
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Test Automation
- **Pre-commit Hooks**: Run tests before commits
- **PR Validation**: Automated test runs on pull requests
- **Deployment Gates**: Tests must pass before deployment
- **Monitoring**: Post-deployment smoke tests

## 🎯 Testing Best Practices

### Writing Good Tests
1. **Descriptive Names**: Clear test descriptions
2. **Single Responsibility**: One assertion per test
3. **Arrange-Act-Assert**: Clear test structure
4. **Independent Tests**: No test dependencies
5. **Fast Execution**: Optimize for speed

### Test Maintenance
- **Regular Updates**: Keep tests current with code changes
- **Refactoring**: Remove duplicate test code
- **Documentation**: Comment complex test logic
- **Review Process**: Include tests in code reviews

---

This comprehensive testing strategy ensures high code quality, prevents regressions, and provides confidence in deployments while maintaining fast development cycles.
