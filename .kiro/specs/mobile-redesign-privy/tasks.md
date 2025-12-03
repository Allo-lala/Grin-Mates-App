# Implementation Plan

- [x] 1. Set up testing infrastructure and utilities
  - Install and configure Vitest for unit testing
  - Install and configure fast-check for property-based testing
  - Create test utilities for responsive testing
  - Create test utilities for Privy mocking
  - _Requirements: All (testing foundation)_

- [x] 2. Create mobile-first layout system
  - Create ResponsiveContainer component with breakpoint support
  - Create BottomNavigation component for mobile
  - Create MobileLayout wrapper component
  - Implement responsive navigation that switches between bottom nav (mobile) and sidebar (desktop)
  - _Requirements: 1.2, 1.3, 4.2, 4.3, 6.1, 6.3, 6.4_

- [ ]* 2.1 Write property test for mobile layout rendering
  - **Property 1: Mobile layout rendering consistency**
  - **Validates: Requirements 1.2**

- [ ]* 2.2 Write property test for responsive layout adaptation
  - **Property 2: Responsive layout adaptation**
  - **Validates: Requirements 1.4**

- [ ]* 2.3 Write property test for touch target sizes
  - **Property 9: Touch target minimum size**
  - **Validates: Requirements 4.3**

- [ ]* 2.4 Write unit tests for layout components
  - Test ResponsiveContainer renders with correct padding and max-width
  - Test BottomNavigation displays correct active state
  - Test MobileLayout shows/hides navigation appropriately
  - _Requirements: 1.2, 1.3, 4.2, 4.3_

- [x] 3. Implement performance optimizations
  - Create LazyImage component using Next.js Image with optimization
  - Implement code splitting for heavy components using dynamic imports
  - Optimize font loading with font-display: swap
  - Add loading states for async operations
  - _Requirements: 1.5, 5.1, 5.2, 5.4, 7.2_

- [ ]* 3.1 Write property test for navigation transition performance
  - **Property 8: Navigation transition performance**
  - **Validates: Requirements 5.1**

- [ ]* 3.2 Write property test for loading state visibility
  - **Property 11: Loading state visibility**
  - **Validates: Requirements 7.2**

- [ ]* 3.3 Write unit tests for performance components
  - Test LazyImage loads with correct optimization settings
  - Test loading indicators appear for slow operations
  - _Requirements: 1.5, 5.2, 7.2_

- [x] 4. Fix KYC flow with proper state management
  - Create KYCFlowManager component with localStorage persistence
  - Create KYCStepContainer component for consistent step UI
  - Implement step validation logic that prevents invalid progression
  - Update KYC screen to use new flow manager with proper state persistence
  - Add progress indicator that accurately reflects current step
  - Implement data persistence on each step completion
  - Fix step navigation to prevent bouncing back to step 1
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 4.1 Write property test for KYC step progression persistence
  - **Property 3: KYC step progression persistence**
  - **Validates: Requirements 2.1, 2.2**

- [ ]* 4.2 Write property test for KYC backward navigation
  - **Property 4: KYC backward navigation data preservation**
  - **Validates: Requirements 2.4**

- [ ]* 4.3 Write property test for KYC completion finality
  - **Property 5: KYC completion finality**
  - **Validates: Requirements 2.5**

- [ ]* 4.4 Write unit tests for KYC flow
  - Test KYCFlowManager persists data to localStorage on step completion
  - Test step validation prevents progression with invalid data
  - Test backward navigation preserves entered data
  - Test completion redirects to dashboard
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Enhance Privy authentication integration
  - Create PrivyAuthButton component with loading and error states
  - Create AuthGuard component for route protection
  - Update wallet-connect page to use enhanced Privy integration
  - Implement session persistence check on app initialization
  - Add embedded wallet creation for email authentication
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 6.1 Write property test for Privy session persistence
  - **Property 6: Privy authentication session persistence**
  - **Validates: Requirements 3.4**

- [ ]* 6.2 Write property test for embedded wallet creation
  - **Property 7: Embedded wallet creation**
  - **Validates: Requirements 3.3**

- [ ]* 6.3 Write unit tests for authentication components
  - Test PrivyAuthButton handles success and error callbacks
  - Test AuthGuard redirects unauthenticated users
  - Test AuthGuard checks KYC completion when required
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7. Update onboarding flow for mobile-first design
  - Refactor OnboardingScreen to use mobile-first layout
  - Optimize onboarding images with LazyImage component
  - Implement swipe gestures for onboarding navigation (optional enhancement)
  - Update onboarding cards for better mobile touch targets
  - _Requirements: 1.2, 1.3, 4.3, 4.4_

- [ ]* 7.1 Write unit tests for onboarding flow
  - Test onboarding navigation between screens
  - Test skip button redirects to wallet-connect
  - Test final screen redirects to wallet-connect
  - _Requirements: 1.2, 1.3_

- [x] 8. Migrate dashboard and feature screens to mobile-first layout
  - Update dashboard page to use MobileLayout wrapper
  - Update events page to use mobile-first card layouts
  - Update profile page with mobile-optimized forms
  - Update settings page with mobile-friendly controls
  - Implement consistent navigation across all authenticated screens
  - _Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 6.1, 6.2_

- [ ]* 8.1 Write unit tests for feature screens
  - Test dashboard renders with mobile layout
  - Test navigation is consistent across screens
  - Test responsive breakpoints work correctly
  - _Requirements: 1.2, 1.3, 6.1, 6.2_

- [x] 9. Implement visual feedback and interaction states
  - Add touch feedback for all interactive elements (100ms response)
  - Implement loading indicators for async operations
  - Add success/error toast notifications
  - Implement form validation with immediate feedback
  - Add button disabled states during processing
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 9.1 Write property test for form validation feedback
  - **Property 10: Form validation feedback immediacy**
  - **Validates: Requirements 7.5**

- [ ]* 9.2 Write unit tests for interaction feedback
  - Test buttons show loading state during async operations
  - Test form validation displays error messages
  - Test success notifications appear after successful operations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Remove legacy wallet connection code
  - Audit codebase for non-Privy wallet connection code
  - Remove unused wallet utilities from lib/wallet.ts
  - Remove unused wallet connection components
  - Update all wallet interactions to use Privy hooks
  - Clean up unused dependencies related to legacy wallet code
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 10.1 Write unit tests to verify Privy-only authentication
  - Test no legacy wallet code is imported
  - Test all wallet operations use Privy
  - _Requirements: 8.1, 8.2_

- [x] 11. Implement session management and logout
  - Add logout functionality that clears all session state
  - Implement session state clearing on logout
  - Add redirect to onboarding after logout
  - Test session persistence across page reloads
  - _Requirements: 6.5_

- [ ]* 11.1 Write property test for session clearing on logout
  - **Property 12: Session state clearing on logout**
  - **Validates: Requirements 6.5**

- [ ]* 11.2 Write unit tests for session management
  - Test logout clears localStorage
  - Test logout redirects to onboarding
  - Test session persists across page reloads when authenticated
  - _Requirements: 6.5_

- [ ] 12. Optimize bundle size and loading performance
  - Analyze bundle size with Next.js bundle analyzer
  - Implement route-based code splitting
  - Remove unused dependencies from package.json
  - Optimize images and assets
  - Enable compression in production build
  - _Requirements: 5.2, 5.3, 5.4_

- [ ]* 12.1 Write performance tests
  - Measure initial bundle size (target < 200KB gzipped)
  - Measure route-specific chunk sizes (target < 50KB each)
  - Test lazy loading works for heavy components
  - _Requirements: 5.2, 5.4_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Update documentation and configuration
  - Update README with new mobile-first architecture
  - Document Privy configuration requirements
  - Add mobile testing guidelines
  - Update environment variable documentation
  - _Requirements: All (documentation)_
