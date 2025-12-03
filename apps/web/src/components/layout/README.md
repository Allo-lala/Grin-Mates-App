# Mobile-First Layout System

This directory contains the mobile-first layout components for the Grin Mates dApp. These components provide a responsive, touch-optimized user interface that adapts seamlessly between mobile, tablet, and desktop viewports.

## Components

### MobileLayout

The main layout wrapper that provides responsive navigation and consistent spacing.

**Features:**
- Automatically switches between bottom navigation (mobile) and sidebar (desktop)
- Handles safe area insets for notched devices
- Provides consistent spacing and layout structure

**Usage:**
```tsx
import { MobileLayout } from '@/components/layout';

export default function DashboardPage() {
  return (
    <MobileLayout>
      <div className="p-4">
        {/* Your page content */}
      </div>
    </MobileLayout>
  );
}
```

**Props:**
- `children`: React.ReactNode - The page content
- `showBottomNav`: boolean (default: true) - Whether to show navigation
- `className`: string (optional) - Additional CSS classes

### ResponsiveContainer

Provides consistent padding and max-width across breakpoints.

**Usage:**
```tsx
import { ResponsiveContainer } from '@/components/layout';

export default function MyComponent() {
  return (
    <ResponsiveContainer maxWidth="lg" padding="md">
      <h1>My Content</h1>
    </ResponsiveContainer>
  );
}
```

**Props:**
- `children`: React.ReactNode - The content to wrap
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' (default: 'lg') - Maximum width
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md') - Padding size
- `className`: string (optional) - Additional CSS classes

### BottomNavigation

Mobile-optimized bottom navigation bar with touch-friendly targets.

**Features:**
- Minimum 44x44px touch targets
- Active state indicators
- Badge support for notifications
- Automatically hidden on desktop (md breakpoint and above)

**Usage:**
```tsx
import { BottomNavigation, NavigationItem } from '@/components/layout';
import { Home, Calendar, User, Settings } from 'lucide-react';

const navItems: NavigationItem[] = [
  { label: 'Home', icon: Home, href: '/dashboard' },
  { label: 'Events', icon: Calendar, href: '/events', badge: 3 },
  { label: 'Profile', icon: User, href: '/profile' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function MyLayout() {
  return <BottomNavigation items={navItems} />;
}
```

### SidebarNavigation

Desktop-optimized sidebar navigation.

**Features:**
- Visible on tablet and desktop (md breakpoint and above)
- Vertical layout with icons and labels
- Active state indicators
- Badge support

**Note:** This component is automatically included in `MobileLayout` and typically doesn't need to be used directly.

## Breakpoints

The layout system uses the following breakpoints:

- **Mobile**: < 768px (default, base styles)
- **Tablet**: 768px - 1024px (md breakpoint)
- **Desktop**: > 1024px (lg breakpoint)

## Mobile-First CSS Strategy

All components follow a mobile-first approach:

```tsx
// ✅ Correct: Mobile first, then enhance
className="p-4 md:p-6 lg:p-8"

// ❌ Wrong: Desktop first, then override
className="p-8 md:p-6 sm:p-4"
```

## Example: Complete Page Layout

```tsx
'use client';

import { MobileLayout, ResponsiveContainer } from '@/components/layout';

export default function MyPage() {
  return (
    <MobileLayout>
      <ResponsiveContainer maxWidth="lg" padding="md">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold md:text-3xl">
            My Page Title
          </h1>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Your content cards */}
          </div>
        </div>
      </ResponsiveContainer>
    </MobileLayout>
  );
}
```

## Testing

The layout components include comprehensive unit tests. Run tests with:

```bash
npm test -- test/components/layout.test.tsx
```

## Accessibility

All interactive elements meet WCAG 2.1 AA standards:
- Minimum touch target size: 44x44px
- Proper ARIA labels and roles
- Keyboard navigation support
- Color contrast ratios meet accessibility standards

## Safe Area Insets

The layout system automatically handles safe area insets for devices with notches or rounded corners. The `.safe-area-inset-bottom` class is applied to the bottom navigation to ensure content is not obscured.

## Performance

- Components use CSS for responsive behavior (no JavaScript media queries)
- Navigation state is managed efficiently with Next.js routing
- Minimal re-renders through proper React optimization
