'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

interface PrivyAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  variant?: 'primary' | 'secondary';
}

export default function PrivyAuthButton({
  onSuccess,
  onError,
  variant = 'primary',
}: PrivyAuthButtonProps) {
  const { login, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await login();
      // Show success notification - Requirements: 7.3
      toast.success('Wallet Connected!', 'You have successfully connected your wallet.');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      // Show error notification - Requirements: 7.4
      toast.error('Connection Failed', errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleConnect}
        disabled={!ready}
        isLoading={isLoading}
        loadingText="Connecting..."
        variant={variant}
        size="lg"
        fullWidth
        className="rounded-xl"
      >
        <Wallet className="h-5 w-5" />
        Connect Wallet
      </Button>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Connection Failed</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={handleConnect}
              className="mt-2 text-red-900 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
