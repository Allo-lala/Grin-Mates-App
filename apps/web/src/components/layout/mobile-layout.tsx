'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MobileAppContainer } from './mobile-app-container';
import { Home, Calendar, Briefcase, Settings } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  currentRoute?: string;
  className?: string;
}

/**
 * MobileLayout provides mobile-optimized layout with bottom navigation
 * - Keeps app in mobile-sized container even on large screens (like ETHDenver)
 * - Handles safe area insets for notched devices
 * - Provides consistent spacing and layout structure
 * - Bottom navigation always visible
 */
export function MobileLayout({
  children,
  showBottomNav = true,
  className,
}: MobileLayoutProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
    },
    {
      label: 'Events',
      icon: Calendar,
      href: '/events',
    },
    {
      label: 'Services',
      icon: Briefcase,
      href: '/services',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
    },
  ];

  return (
    <MobileAppContainer>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Main content area */}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            // Add padding for bottom nav
            showBottomNav && 'pb-16',
            className
          )}
        >
          {children}
        </main>

        {/* Bottom navigation - sticky at bottom */}
        {showBottomNav && (
          <nav className="sticky bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 mt-auto">
            <div className="flex items-center justify-around h-16">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex flex-col items-center justify-center',
                      'min-w-[44px] min-h-[44px] flex-1',
                      'transition-colors duration-200',
                      'relative',
                      isActive
                        ? 'text-[#1db584]'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs mt-1 font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </MobileAppContainer>
  );
}
