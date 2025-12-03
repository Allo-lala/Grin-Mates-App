'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavigationItem } from './bottom-navigation';
import Image from 'next/image';
import logoImg from '@/assets/images/logo.png';

interface SidebarNavigationProps {
  items: NavigationItem[];
  className?: string;
}

/**
 * SidebarNavigation provides desktop-optimized sidebar navigation
 * - Visible on tablet and desktop (md breakpoint and above)
 * - Vertical layout with icons and labels
 * - Active state indicators
 */
export function SidebarNavigation({ items, className }: SidebarNavigationProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col',
        'w-64 h-screen',
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
        'fixed left-0 top-0',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b border-gray-200 dark:border-gray-800">
        <Image src={logoImg} alt="Grin Mates" width={32} height={32} />
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          Grin Mates
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg',
                'transition-colors duration-200',
                'relative',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'ml-auto min-w-[20px] h-[20px] px-2',
                    'flex items-center justify-center',
                    'text-xs font-semibold',
                    'bg-red-500 text-white rounded-full'
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
