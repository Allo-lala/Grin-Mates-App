'use client';

import { LazyImage } from '@/components/ui/lazy-image';

interface OnboardingCardProps {
  data: {
    id: number;
    title: string;
    description: string;
    image: string;
    icon: string;
  };
}

/**
 * OnboardingCard component with mobile-first design
 * - Uses LazyImage for optimized image loading
 * - Mobile-first responsive sizing
 * - Touch-friendly spacing and typography
 * Requirements: 1.2, 1.3, 4.3, 4.4
 */
export default function OnboardingCard({ data }: OnboardingCardProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Image container - mobile-first sizing */}
      <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-6 md:h-80 md:p-8">
        <div className="relative h-full w-full">
          <LazyImage
            src={data.image || "/onboarding.png"}
            alt={data.title}
            fill
            priority
            className="object-contain"
            sizes="(max-width: 768px) 90vw, 50vw"
          />
        </div>
      </div>

      {/* Text content - mobile-first typography */}
      <div className="space-y-2 text-center md:space-y-3">
        <div className="text-3xl md:text-4xl">{data.icon}</div>
        <h1 className="text-2xl font-bold text-foreground text-balance md:text-3xl">
          {data.title}
        </h1>
        <p className="text-base text-muted-foreground text-balance md:text-lg">
          {data.description}
        </p>
      </div>
    </div>
  );
}
