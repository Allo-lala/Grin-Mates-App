# Design Document

## Overview

This design document outlines the technical approach for redesigning Grin Mates as a mobile-first dApp with improved performance, fixed KYC flow, and Privy-powered authentication. The redesign will transform the application from a desktop-focused experience to a responsive, mobile-optimized web application inspired by ETHDenver's mobile-first design patterns.

The core architectural changes include:
- Mobile-first responsive design system with breakpoint-based layouts
- Privy integration for unified wallet and authentication management
- Optimized KYC flow with proper state persistence
- Performance improvements through code splitting, lazy loading, and optimized rendering
- Consistent navigation patterns adapted for mobile and desktop viewports

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App Router                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐         ┌──────────────────────┐   │
│  │  Privy Provider│◄────────┤  Authentication      │   │
│  │  (Wallet Auth) │         │  State Management    │   │
│  └────────────────┘         └──────────────────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Mobile-First Layout System             │    │
│  │  - Responsive Breakpoints (sm/md/lg/xl)        │    │
│  │  - Bottom Navigation (mobile)                  │    │
│  │  - Sidebar Navigation (desktop)                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  Onboarding  │  │  KYC Flow    │  │  Dashboard  │  │
│  │  Screens     │  │  (3 Steps)   │  │  & Features │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App Layout (RootLayout)
├── Privy Provider (Authentication)
├── Theme Provider
└── Page Routes
    ├── / (Onboarding)
    ├── /wallet-connect (Privy Auth)
    ├── /kyc (Multi-step Form)
    └── Authenticated Routes
        ├── /dashboard
        ├── /events
        ├── /profile
        └── /settings
```

### Mobile-First Responsive Strategy

The application will use a mobile-first approach with the following breakpoints:

- **Mobile**: < 768px (default, base styles)
- **Tablet**: 768px - 1024px (md breakpoint)
- **Desktop**: > 1024px (lg breakpoint)

All components will be designed for mobile first, then enhanced for larger screens using Tailwind's responsive prefixes (`md:`, `lg:`).

## Components and Interfaces

### 1. Layout Components

#### MobileLayout Component
```typescript
interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  currentRoute?: string;
}

// Provides mobile-optimized layout with bottom navigation
// Handles safe area insets for notched devices
// Implements swipe gestures for navigation
```

#### ResponsiveContainer Component
```typescript
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Provides consistent padding and max-width across breakpoints
// Ensures content is readable on all screen sizes
```

#### BottomNavigation Component
```typescript
interface NavigationItem {
  label: string;
  icon: React.ComponentType;
  href: string;
  badge?: number;
}

interface BottomNavigationProps {
  items: NavigationItem[];
  currentPath: string;
}

// Mobile-optimized bottom navigation bar
// Touch-friendly targets (min 44x44px)
// Active state indicators
```

### 2. Authentication Components

#### PrivyAuthButton Component
```typescript
interface PrivyAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  variant?: 'primary' | 'secondary';
}

// Wraps Privy login functionality
// Handles authentication state
// Provides loading and error states
```

#### AuthGuard Component
```typescript
interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireKYC?: boolean;
}

// Protects routes requiring authentication
// Checks Privy authentication status
// Optionally checks KYC completion
// Redirects unauthenticated users
```

### 3. KYC Flow Components

#### KYCFlowManager Component
```typescript
interface KYCStep {
  id: string;
  title: string;
  component: React.ComponentType<KYCStepProps>;
  validate: (data: Partial<KYCData>) => ValidationResult;
}

interface KYCFlowManagerProps {
  steps: KYCStep[];
  onComplete: (data: KYCData) => Promise<void>;
  persistKey?: string; // LocalStorage key for persistence
}

// Manages multi-step KYC flow
// Persists data to localStorage on each step
// Handles navigation between steps
// Validates data before progression
```

#### KYCStepContainer Component
```typescript
interface KYCStepContainerProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
  isSubmitting?: boolean;
}

// Provides consistent step UI
// Shows progress indicator
// Handles navigation buttons
// Mobile-optimized layout
```

### 4. Performance Optimization Components

#### LazyImage Component
```typescript
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

// Lazy loads images with Next.js Image
// Provides blur placeholder
// Optimizes image formats (WebP, AVIF)
```

#### DynamicImport Wrapper
```typescript
// Utility for code-splitting heavy components
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // For client-only components
});
```

## Data Models

### KYC Data Model

```typescript
interface KYCData {
  // Step 1: Personal Information
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string; // ISO 8601 format
  };
  
  // Step 2: Address Information
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Step 3: Document Upload
  documents: {
    documentType: 'passport' | 'license' | 'id';
    documentFile: File | null;
    documentUrl?: string; // After upload
  };
  
  // Metadata
  currentStep: number;
  completedSteps: number[];
  submittedAt?: string; // ISO 8601 timestamp
  status: 'incomplete' | 'pending' | 'approved' | 'rejected';
}
```

### User Session Model

```typescript
interface UserSession {
  // Privy user data
  privyUser: {
    id: string;
    wallet?: {
      address: string;
      chainId: string;
    };
    email?: string;
    createdAt: string;
  };
  
  // Application state
  kycCompleted: boolean;
  kycData?: Partial<KYCData>;
  onboardingCompleted: boolean;
  
  // Preferences
  theme: 'light' | 'dark' | 'system';
  language: string;
}
```

### Navigation State Model

```typescript
interface NavigationState {
  currentRoute: string;
  previousRoute?: string;
  isNavigating: boolean;
  bottomNavVisible: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Mobile layout rendering consistency
*For any* viewport width less than 768 pixels, the application should render mobile-optimized layouts with touch-friendly controls and bottom navigation
**Validates: Requirements 1.2**

### Property 2: Responsive layout adaptation
*For any* device orientation change, the application should adapt the layout without losing user data or application state
**Validates: Requirements 1.4**

### Property 3: KYC step progression persistence
*For any* KYC step completion, advancing to the next step should persist the current step's data and display the correct next step without reverting to step 1
**Validates: Requirements 2.1, 2.2**

### Property 4: KYC backward navigation data preservation
*For any* KYC step, navigating backward should display previously entered data without resetting fields to initial empty state
**Validates: Requirements 2.4**

### Property 5: KYC completion finality
*For any* successful KYC submission, the system should store completion status and redirect to dashboard without returning to step 1 on subsequent visits
**Validates: Requirements 2.5**

### Property 6: Privy authentication session persistence
*For any* authenticated user returning to the application, the system should restore their session without requiring re-authentication
**Validates: Requirements 3.4**

### Property 7: Embedded wallet creation
*For any* user authenticating via email without an existing wallet, the system should create an embedded wallet automatically
**Validates: Requirements 3.3**

### Property 8: Navigation transition performance
*For any* route navigation, the transition should complete within 300 milliseconds
**Validates: Requirements 5.1**

### Property 9: Touch target minimum size
*For any* interactive element on mobile viewports, the touch target should be at least 44x44 pixels
**Validates: Requirements 4.3**

### Property 10: Form validation feedback immediacy
*For any* form field validation failure, the system should display error messages and highlight invalid fields immediately
**Validates: Requirements 7.5**

### Property 11: Loading state visibility
*For any* asynchronous operation exceeding 200 milliseconds, the system should display a loading indicator
**Validates: Requirements 7.2**

### Property 12: Session state clearing on logout
*For any* user logout action, the system should clear all session state and return to the onboarding flow
**Validates: Requirements 6.5**

## Error Handling

### Authentication Errors

1. **Privy Connection Failure**
   - Display user-friendly error message
   - Provide retry button
   - Log error details for debugging
   - Fallback: Allow user to try different login method

2. **Session Expiration**
   - Detect expired session on API calls
   - Prompt user to re-authenticate
   - Preserve current page for redirect after auth
   - Clear stale session data

3. **Wallet Connection Errors**
   - Handle network switching errors
   - Provide guidance for unsupported chains
   - Show clear error messages for rejected connections

### KYC Flow Errors

1. **Validation Errors**
   - Display field-specific error messages
   - Highlight invalid fields with red borders
   - Prevent progression until validation passes
   - Preserve valid data when showing errors

2. **File Upload Errors**
   - Validate file size (max 10MB)
   - Validate file type (images, PDF)
   - Show progress indicator during upload
   - Handle network interruptions with retry

3. **Submission Errors**
   - Retry failed submissions automatically (max 3 attempts)
   - Preserve form data on failure
   - Display actionable error messages
   - Provide support contact for persistent failures

### Performance Errors

1. **Slow Network Conditions**
   - Show loading states for operations > 200ms
   - Implement request timeouts (30 seconds)
   - Cache responses where appropriate
   - Provide offline indicators

2. **Resource Loading Failures**
   - Implement fallback images
   - Gracefully handle missing assets
   - Retry failed resource loads
   - Log errors for monitoring

### Navigation Errors

1. **Route Not Found**
   - Display 404 page with navigation options
   - Suggest similar valid routes
   - Provide link to dashboard

2. **Unauthorized Access**
   - Redirect to authentication flow
   - Preserve intended destination
   - Show clear message about required authentication

## Testing Strategy

### Unit Testing

The application will use **Vitest** as the testing framework for unit tests. Unit tests will cover:

1. **Component Rendering**
   - Test that components render without crashing
   - Verify correct props are passed to child components
   - Test conditional rendering logic

2. **State Management**
   - Test KYC flow state transitions
   - Verify localStorage persistence logic
   - Test form validation functions

3. **Utility Functions**
   - Test responsive breakpoint utilities
   - Test data transformation functions
   - Test validation helpers

4. **Error Handling**
   - Test error boundary components
   - Verify error message display
   - Test retry logic

Example unit test structure:
```typescript
describe('KYCFlowManager', () => {
  it('should render the first step initially', () => {
    // Test implementation
  });
  
  it('should persist data to localStorage on step completion', () => {
    // Test implementation
  });
  
  it('should handle validation errors correctly', () => {
    // Test implementation
  });
});
```

### Property-Based Testing

The application will use **fast-check** for property-based testing. Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage across random inputs.

Property-based tests will verify the correctness properties defined in this document:

1. **Layout Properties**
   - Generate random viewport dimensions
   - Verify correct layout rendering for each breakpoint
   - Test orientation changes with random initial states

2. **KYC Flow Properties**
   - Generate random valid KYC data
   - Verify step progression maintains data integrity
   - Test backward navigation preserves all entered data
   - Verify completion status persists across sessions

3. **Authentication Properties**
   - Generate random user authentication states
   - Verify session persistence across page reloads
   - Test embedded wallet creation for email users

4. **Performance Properties**
   - Measure navigation transition times
   - Verify loading indicators appear for slow operations
   - Test touch target sizes across random components

Each property-based test must include a comment tag referencing the specific correctness property from this design document using the format:
```typescript
// Feature: mobile-redesign-privy, Property 3: KYC step progression persistence
```

### Integration Testing

Integration tests will verify:

1. **End-to-End User Flows**
   - Complete onboarding flow (onboarding → wallet connect → KYC → dashboard)
   - KYC submission and completion
   - Authentication and session management

2. **Privy Integration**
   - Wallet connection flow
   - Email authentication flow
   - Embedded wallet creation
   - Session persistence

3. **Responsive Behavior**
   - Layout changes across breakpoints
   - Navigation adaptation (bottom nav ↔ sidebar)
   - Touch interactions on mobile

### Performance Testing

Performance tests will measure:

1. **Load Time Metrics**
   - First Contentful Paint (FCP) < 1.5s
   - Largest Contentful Paint (LCP) < 2.5s
   - Time to Interactive (TTI) < 3.5s

2. **Bundle Size**
   - Initial bundle < 200KB (gzipped)
   - Route-specific chunks < 50KB each

3. **Runtime Performance**
   - Navigation transitions < 300ms
   - Form interactions < 100ms response time
   - Smooth scrolling (60fps)

### Testing Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.config.ts',
      ],
    },
  },
});
```

## Implementation Notes

### Mobile-First CSS Strategy

All styles will be written mobile-first:

```typescript
// ✅ Correct: Mobile first, then enhance
className="p-4 md:p-6 lg:p-8"

// ❌ Wrong: Desktop first, then override
className="p-8 md:p-6 sm:p-4"
```

### Code Splitting Strategy

1. **Route-based splitting**: Each page is automatically split by Next.js App Router
2. **Component-based splitting**: Heavy components use dynamic imports
3. **Library splitting**: Large libraries (charts, editors) loaded on demand

### Performance Optimization Checklist

- [ ] Use Next.js Image component for all images
- [ ] Implement lazy loading for below-fold content
- [ ] Enable React Server Components where possible
- [ ] Minimize client-side JavaScript
- [ ] Use CSS-in-JS sparingly (prefer Tailwind)
- [ ] Implement proper caching headers
- [ ] Optimize font loading (font-display: swap)
- [ ] Remove unused dependencies
- [ ] Enable compression (gzip/brotli)
- [ ] Implement service worker for offline support (future enhancement)

### Privy Configuration

```typescript
// Privy will be configured with:
- Login methods: wallet, email
- Embedded wallets: enabled for users without wallets
- Supported chains: Celo (42220), Alfajores (44787), Base (8453), Avalanche (43114)
- Appearance: light theme, custom accent color (#1db584)
- Session management: automatic session refresh
```

### KYC State Persistence Strategy

```typescript
// LocalStorage schema for KYC persistence
{
  "kyc_data": {
    "personal": { /* step 1 data */ },
    "address": { /* step 2 data */ },
    "documents": { /* step 3 data */ },
    "currentStep": 2,
    "completedSteps": [1, 2],
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  "kyc_completed": false
}

// Clear on successful submission
// Restore on page reload if incomplete
// Expire after 24 hours of inactivity
```

### Migration Strategy

1. **Phase 1**: Implement new layout system alongside existing code
2. **Phase 2**: Migrate authentication to Privy
3. **Phase 3**: Fix KYC flow with proper state management
4. **Phase 4**: Remove legacy wallet connection code
5. **Phase 5**: Performance optimization and testing
6. **Phase 6**: Deploy and monitor

This phased approach allows for incremental testing and reduces risk of breaking existing functionality.
