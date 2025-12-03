'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';

interface SendReceiveDialogProps {
  isOpen: boolean;
  type: 'send' | 'receive';
  onClose: () => void;
  walletAddress: string;
}

export default function SendReceiveDialog({
  isOpen,
  onClose,
  type,
  walletAddress,
}: SendReceiveDialogProps) {
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    // Show success notification - Requirements: 7.3
    toast.success('Address Copied!', 'Your wallet address has been copied to clipboard.');
  };

  const handleSend = async () => {
    if (!recipientAddress || !amount) {
      // Show error notification - Requirements: 7.4
      toast.error('Invalid Input', 'Please enter both recipient address and amount.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success notification - Requirements: 7.3
      toast.success('Transaction Sent!', `Successfully sent ${amount} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`);
      
      // Reset form
      setAmount('');
      setRecipientAddress('');
      onClose();
    } catch (error) {
      // Show error notification - Requirements: 7.4
      toast.error('Transaction Failed', 'Please try again or check your wallet balance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'send' ? (
              <>
                <Send className="h-5 w-5 text-blue-500" />
                Send Funds
              </>
            ) : (
              <>
                <Download className="h-5 w-5 text-green-500" />
                Receive Funds
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {type === 'send' ? (
            <>
              {/* Send Form */}
              <div className="space-y-4">
                <Input
                  label="Recipient Address"
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Amount
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <select className="rounded-lg border border-muted bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none min-h-[44px]">
                      <option>CELO</option>
                      <option>cUSD</option>
                      <option>USDC</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleSend}
                  isLoading={isSubmitting}
                  loadingText="Sending..."
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/50"
                >
                  Send
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Receive Display */}
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your Wallet Address</p>
                  <p className="font-mono text-lg font-semibold text-foreground break-all">
                    {walletAddress}
                  </p>
                </div>

                <Button
                  onClick={handleCopyAddress}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="bg-green-500 hover:bg-green-600 focus:ring-green-500/50"
                >
                  Copy Address
                </Button>

                <div className="rounded-lg border border-muted bg-background p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Share your wallet address with others to receive funds
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
