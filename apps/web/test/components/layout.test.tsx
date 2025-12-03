import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { Home, Calendar } from 'lucide-react';

describe('Layout Components', () => {
  describe('ResponsiveContainer', () => {
    it('should render children correctly', () => {
      render(
        <ResponsiveContainer>
          <div>Test Content</div>
        </ResponsiveContainer>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply correct padding classes', () => {
      const { container } = render(
        <ResponsiveContainer padding="lg">
          <div>Test</div>
        </ResponsiveContainer>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('px-6');
    });

    it('should apply correct max-width classes', () => {
      const { container } = render(
        <ResponsiveContainer maxWidth="sm">
          <div>Test</div>
        </ResponsiveContainer>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('max-w-screen-sm');
    });
  });

  describe('BottomNavigation', () => {
    const mockItems = [
      { label: 'Home', icon: Home, href: '/dashboard' },
      { label: 'Events', icon: Calendar, href: '/events' },
    ];

    it('should render all navigation items', () => {
      render(<BottomNavigation items={mockItems} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
    });

    it('should render badge when provided', () => {
      const itemsWithBadge = [
        { label: 'Home', icon: Home, href: '/dashboard', badge: 5 },
      ];
      
      render(<BottomNavigation items={itemsWithBadge} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display 99+ for badges over 99', () => {
      const itemsWithLargeBadge = [
        { label: 'Home', icon: Home, href: '/dashboard', badge: 150 },
      ];
      
      render(<BottomNavigation items={itemsWithLargeBadge} />);
      
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('should have minimum touch target size (44x44px)', () => {
      const { container } = render(<BottomNavigation items={mockItems} />);
      
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        expect(link.className).toContain('min-w-[44px]');
        expect(link.className).toContain('min-h-[44px]');
      });
    });
  });

  describe('MobileLayout', () => {
    it('should render children correctly', () => {
      render(
        <MobileLayout>
          <div>Page Content</div>
        </MobileLayout>
      );
      
      expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    it('should show bottom navigation by default', () => {
      render(
        <MobileLayout>
          <div>Content</div>
        </MobileLayout>
      );
      
      // Check for default navigation items (appears in both sidebar and bottom nav)
      const dashboardItems = screen.getAllByText('Dashboard');
      expect(dashboardItems.length).toBeGreaterThan(0);
      expect(screen.getAllByText('Events').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Profile').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
    });

    it('should hide navigation when showBottomNav is false', () => {
      render(
        <MobileLayout showBottomNav={false}>
          <div>Content</div>
        </MobileLayout>
      );
      
      // Navigation items should not be present
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });
});
