'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import OnboardingCard from '@/components/onboarding-card';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { useSwipe } from '@/lib/hooks/use-swipe';
import onboardingImg from '@/assets/images/onboarding.png';
import lockImg from '@/assets/images/lock.png';
import ecoImg from '@/assets/images/eco.png';

const onboardingData = [
  {
    id: 1,
    title: 'Engage & Empower',
    description: 'Connect your crypto wallet and start earning rewards for sustainable actions.',
    image: onboardingImg.src,
    icon: '🌱',
  },
  {
    id: 2,
    title: 'Earn Green Points',
    description: 'Complete eco-friendly activities and earn verified digital assets on Celo.',
    image: lockImg.src,
    icon: '💚',
  },
  {
    id: 3,
    title: 'Make an Impact',
    description: 'Donate, trade, and participate in our community while protecting the planet.',
    image: ecoImg.src,
    icon: '🌍',
  },
];

/**
 * OnboardingScreen with mobile-first design
 * - Uses ResponsiveContainer for consistent mobile-first layout
 * - Implements swipe gestures for mobile navigation
 * - Touch-friendly buttons (min 44x44px)
 * - Optimized images with LazyImage
 * Requirements: 1.2, 1.3, 4.3, 4.4
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/wallet-connect');
    }
  }, [currentIndex, router]);

  const handleBack = useCallback(() => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  }, [currentIndex]);

  const handleSkip = useCallback(() => {
    router.push('/wallet-connect');
  }, [router]);

  // Swipe gesture support for mobile (optional enhancement)
  useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handleBack,
  });

  const currentData = onboardingData[currentIndex];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <ResponsiveContainer maxWidth="md" padding="md">
        {/* Skip button - mobile-first touch target (min 44x44px) */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 md:right-6 md:top-6"
          aria-label="Skip onboarding"
        >
          Skip
        </button>

        {/* Main content */}
        <div className="w-full space-y-6 md:space-y-8">
          <OnboardingCard data={currentData} />

          {/* Page indicator - mobile-first sizing */}
          <div className="flex justify-center gap-2">
            {onboardingData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          {/* Navigation - mobile-first touch targets (min 44x44px) */}
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="flex-1 min-h-[44px] rounded-lg border border-muted bg-background py-3 px-4 font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button
              onClick={handleNext}
              className="flex-1 min-h-[44px] rounded-lg bg-gradient-to-r from-primary to-primary-light py-3 px-4 font-medium text-white hover:shadow-lg hover:shadow-primary/50 transition-all duration-200 flex items-center justify-center gap-2"
              aria-label={currentIndex === onboardingData.length - 1 ? 'Start using app' : 'Next slide'}
            >
              {currentIndex === onboardingData.length - 1 ? 'Start' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Swipe hint for mobile users */}
          <p className="text-center text-xs text-muted-foreground md:hidden">
            Swipe left or right to navigate
          </p>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
