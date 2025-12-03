# Testing Infrastructure

This directory contains the testing infrastructure and utilities for the Grin Mates application.

## Overview

The testing setup includes:
- **Vitest** for unit testing
- **fast-check** for property-based testing
- **React Testing Library** for component testing
- Custom utilities for responsive and Privy testing

## Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Utilities

### Responsive Testing Utilities

Located in `test/utils/responsive.ts`, these utilities help test responsive behavior:

```typescript
import { setBreakpoint, isMobileViewport, testAtBreakpoints } from '@/test/utils';

// Set viewport to specific breakpoint
setBreakpoint('mobile'); // 375px
setBreakpoint('tablet'); // 768px
setBreakpoint('desktop'); // 1024px

// Check current viewport
if (isMobileViewport()) {
  // Test mobile-specific behavior
}

// Test at multiple breakpoints
testAtBreakpoints(['mobile', 'tablet', 'desktop'], (breakpoint) => {
  // Your test logic here
});
```

### Privy Mocking Utilities

Located in `test/utils/privy.ts`, these utilities help mock Privy authentication:

```typescript
import { 
  createMockPrivyUser,
  createMockAuthenticatedPrivy,
  simulateLogin 
} from '@/test/utils';

// Create a mock user with wallet
const user = createMockPrivyUser();

// Create authenticated state
const privyState = createMockAuthenticatedPrivy(user);

// Simulate login
await simulateLogin(privyState, user);
```

## Property-Based Testing

Property-based tests use fast-check to generate random inputs and verify properties hold across all inputs.

Example:

```typescript
import fc from 'fast-check';

// Feature: mobile-redesign-privy, Property 1: Mobile layout rendering consistency
it('should render mobile layout for all viewports < 768px', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 320, max: 767 }), // Generate random mobile widths
      (width) => {
        setViewportWidth(width);
        // Test that mobile layout is rendered
        expect(isMobileViewport()).toBe(true);
      }
    ),
    { numRuns: 100 } // Run 100 iterations
  );
});
```

## Configuration

### vitest.config.ts

The Vitest configuration includes:
- JSdom environment for DOM testing
- Path aliases (@/ → src/)
- Coverage reporting
- Setup file for global test configuration

### test/setup.ts

Global test setup includes:
- React Testing Library cleanup
- Next.js router mocking
- Next.js Image component mocking

## Writing Tests

### Unit Tests

Unit tests should focus on specific examples and edge cases:

```typescript
describe('MyComponent', () => {
  it('should render with correct props', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeInTheDocument();
  });
});
```

### Property Tests

Property tests should verify universal properties:

```typescript
// Feature: mobile-redesign-privy, Property 3: KYC step progression persistence
it('should persist data when advancing steps', () => {
  fc.assert(
    fc.property(
      fc.record({
        firstName: fc.string(),
        lastName: fc.string(),
        email: fc.emailAddress(),
      }),
      (personalData) => {
        // Test that data persists across step transitions
      }
    ),
    { numRuns: 100 }
  );
});
```

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Property Tags**: Always tag property tests with the format: `// Feature: {feature_name}, Property {number}: {property_text}`
3. **Minimal Tests**: Focus on core functionality, avoid over-testing edge cases
4. **No Mocks for Correctness**: Avoid using mocks to make tests pass - tests should validate real functionality
5. **100 Iterations**: Configure property tests to run at least 100 iterations

## Troubleshooting

### Tests not finding modules

Make sure path aliases are configured correctly in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### JSdom errors

If you encounter JSdom errors, ensure the test environment is set to 'jsdom' in `vitest.config.ts`.

### Privy mock not working

Make sure to call `mockPrivyReactAuth()` before rendering components that use Privy hooks.
