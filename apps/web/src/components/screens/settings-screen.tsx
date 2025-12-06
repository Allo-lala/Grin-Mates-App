'use client';

import { useState } from 'react';
import { Moon, Sun, Bell, Lock, HelpCircle, FileText, ExternalLink, Copy } from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { useTheme } from 'next-themes';
import { getContractInfo, getCurrentNetwork } from '@/lib/contracts';

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Get contract information
  const contractInfo = getContractInfo();
  const currentNetwork = getCurrentNetwork();

  const handleCopyAddress = (address: string, type: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(`${type}-${address}`);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const settings = [
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage notification preferences',
      value: notifications,
      onChange: setNotifications,
      type: 'toggle',
    },
    {
      icon: Lock,
      title: 'Biometric Security',
      description: 'Enable fingerprint or face ID',
      value: biometric,
      onChange: setBiometric,
      type: 'toggle',
    },
    {
      icon: Moon,
      title: 'Theme',
      description: `Current: ${theme === 'dark' ? 'Dark' : 'Light'} mode`,
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      type: 'action',
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      description: 'Get help and contact support',
      type: 'link',
      href: '#',
    },
    {
      icon: FileText,
      title: 'Terms & Privacy',
      description: 'Read our terms and privacy policy',
      type: 'link',
      href: '#',
    },
  ];

  return (
    <MobileLayout showBottomNav={true}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-8">
          <ResponsiveContainer maxWidth="md" padding="md">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </ResponsiveContainer>
        </div>

        {/* Settings */}
        <ResponsiveContainer maxWidth="md" padding="md" className="space-y-4 py-8">
          {settings.map((setting, index) => {
            const Icon = setting.icon;
            return (
              <button
                key={index}
                onClick={setting.onClick}
                className="flex w-full items-center justify-between rounded-lg border border-muted bg-background p-4 hover:border-primary/30 hover:bg-muted/50 transition-all min-h-[44px]"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="rounded-lg bg-primary/10 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>

                {setting.type === 'toggle' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setting.onChange?.(!setting.value);
                    }}
                    className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 ${
                      setting.value ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        setting.value ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                )}

                {setting.type === 'action' && (
                  <div className="text-right flex-shrink-0">
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                {setting.type === 'link' && (
                  <div className="text-right flex-shrink-0">
                    <div className="h-5 w-5 rounded-full border border-muted-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </ResponsiveContainer>

        {/* Contract Information */}
        <ResponsiveContainer maxWidth="md" padding="md" className="py-4">
          <div className="rounded-lg border border-muted bg-background p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Smart Contract Info</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network</p>
                <p className="text-sm text-foreground">{contractInfo.network}</p>
              </div>
              
              {'error' in contractInfo ? (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600">{contractInfo.error}</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ProofOfHuman Contract</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs font-mono text-foreground break-all">
                        {contractInfo.proofOfHuman.address}
                      </p>
                      <button
                        onClick={() => handleCopyAddress(contractInfo.proofOfHuman.address, 'contract')}
                        className="flex-shrink-0 p-1 hover:bg-muted rounded"
                      >
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <a
                        href={contractInfo.proofOfHuman.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-1 hover:bg-muted rounded"
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    </div>
                    {copiedAddress === `contract-${contractInfo.proofOfHuman.address}` && (
                      <p className="text-xs text-green-600 mt-1">Copied!</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {currentNetwork === 'celo' ? 'Self Protocol Hub' : 'Hub Contract (Mock)'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs font-mono text-foreground break-all">
                        {contractInfo.hub.address}
                      </p>
                      <button
                        onClick={() => handleCopyAddress(contractInfo.hub.address, 'hub')}
                        className="flex-shrink-0 p-1 hover:bg-muted rounded"
                      >
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <a
                        href={contractInfo.hub.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-1 hover:bg-muted rounded"
                      >
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    </div>
                    {copiedAddress === `hub-${contractInfo.hub.address}` && (
                      <p className="text-xs text-green-600 mt-1">Copied!</p>
                    )}
                  </div>

                  {currentNetwork !== 'celo' && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <p className="text-xs text-blue-600">
                        ⚠️ Using mock hub for testing. Replace with real Self Protocol hub for production.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </ResponsiveContainer>

        {/* App info */}
        <ResponsiveContainer maxWidth="md" padding="md" className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Grin Mates v0.1.0
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Built on Celo for a sustainable future
          </p>
        </ResponsiveContainer>
      </div>
    </MobileLayout>
  );
}
