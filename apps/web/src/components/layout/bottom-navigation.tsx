'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

interface BottomNavigationProps {
  items: NavigationItem[];
  className?: string;
}

/**
 * BottomNavigation provides mobile-optimized bottom navigation bar
 * - Touch-friendly targets (min 44x44px)
 * - Active state indicators
 * - Badge support for notifications
 */
export function BottomNavigation({ items, className }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800',
        'safe-area-inset-bottom',
        'md:hidden', // Hide on desktop
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
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
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1',
                      'min-w-[18px] h-[18px] px-1',
                      'flex items-center justify-center',
                      'text-[10px] font-semibold',
                      'bg-red-500 text-white rounded-full'
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
