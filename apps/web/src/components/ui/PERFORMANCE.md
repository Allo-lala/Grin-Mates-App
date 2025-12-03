# Performance Optimization Components

This directory contains performance-optimized UI components for the Grin Mates application.

## Components

### LazyImage
Optimized image component using Next.js Image with:
- Automatic lazy loading
- Blur placeholder during load
- WebP/AVIF format optimization
- Responsive sizing

**Usage:**
```tsx
import { LazyImage } from '@/components/ui/lazy-image';

<LazyImage
  src="/path/to/image.png"
  alt="Description"
  width={400}
  height={300}
  priority={false} // Set true for above-fold images
/>
```

### Loading Components

#### LoadingSpinner
Simple spinner for loading states.

```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

<LoadingSpinner size="md" />
```

#### LoadingOverlay
Full-screen loading overlay with optional message.

```tsx
import { LoadingOverlay } from '@/components/ui/loading-spinner';

<LoadingOverlay message="Processing..." />
```

#### LoadingState
Wrapper component that shows loading spinner while content loads.

```tsx
import { LoadingState } from '@/components/ui/loading-spinner';

<LoadingState isLoading={isLoading}>
  <YourContent />
</LoadingState>
```

### Skeleton Components
Placeholder components for loading states.

```tsx
import { Skeleton, CardSkeleton, ListSkeleton } from '@/components/ui/skeleton';

// Custom skeleton
<Skeleton className="h-4 w-full" />

// Pre-built patterns
<CardSkeleton />
<ListSkeleton count={5} />
```

## Code Splitting

### Dynamic Imports
Use the utilities in `@/lib/dynamic-imports` for code splitting:

```tsx
import { createDynamicComponent } from '@/lib/dynamic-imports';

const HeavyComponent = createDynamicComponent(
  () => import('./HeavyComponent'),
  { ssr: false }
);
```

### Async Operations
Use the `useAsync` hook for managing async operations with loading states:

```tsx
import { useAsync } from '@/lib/hooks/use-async';

const { data, isLoading, error, execute } = useAsync(fetchData);

// Execute the async operation
await execute(params);
```

## Performance Utilities

### Navigation Timing
```tsx
import { measureNavigationTime } from '@/lib/performance';

measureNavigationTime(() => {
  router.push('/dashboard');
});
```

### Debounce/Throttle
```tsx
import { debounce, throttle } from '@/lib/performance';

const debouncedSearch = debounce(handleSearch, 300);
const throttledScroll = throttle(handleScroll, 100);
```

## Font Optimization

Fonts are configured with `font-display: swap` in `app/layout.tsx` to prevent FOIT (Flash of Invisible Text).

## Image Optimization

Next.js Image component automatically:
- Serves images in modern formats (WebP, AVIF)
- Generates responsive image sizes
- Lazy loads images below the fold
- Provides blur placeholders

## Requirements Satisfied

- **1.5**: Optimized images and assets with lazy loading
- **5.1**: Navigation transitions within 300ms
- **5.2**: Code splitting to reduce initial bundle size
- **5.4**: External resources loaded efficiently
- **7.2**: Loading indicators for async operations
