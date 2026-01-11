'use client';

import { useState } from 'react';
import { Bell, Lock, HelpCircle, FileText, Shield, MessageCircle, Send, Mail, X } from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
      icon: HelpCircle,
      title: 'Help & Support',
      description: 'Get help and contact support',
      type: 'action',
      onClick: () => setShowSupportModal(true),
    },
    {
      icon: FileText,
      title: 'Terms & Conditions',
      description: 'Read our terms and conditions',
      type: 'action',
      onClick: () => setShowTermsModal(true),
    },
    {
      icon: Shield,
      title: 'Privacy Policy',
      description: 'Read our privacy policy',
      type: 'action',
      onClick: () => setShowPrivacyModal(true),
    },
  ];

  return (
    <MobileLayout showBottomNav={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1db584] to-[#15a576] pb-8 pt-6">
          <ResponsiveContainer maxWidth="md" padding="md">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
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
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-primary/30 hover:bg-gray-50 transition-all min-h-[44px]"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="rounded-lg p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{setting.title}</p>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                </div>

                {setting.type === 'toggle' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setting.onChange?.(!setting.value);
                    }}
                    className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 ${
                      setting.value ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform ${
                        setting.value 
                          ? 'translate-x-5 bg-white' 
                          : 'translate-x-0.5 bg-white'
                      }`}
                    />
                  </button>
                )}

                {setting.type === 'action' && (
                  <div className="text-right flex-shrink-0">
                    {/* No circle for action items */}
                  </div>
                )}
              </button>
            );
          })}
        </ResponsiveContainer>

        {/* App info */}
        <ResponsiveContainer maxWidth="md" padding="md" className="py-8 text-center">
          <p className="text-sm text-gray-600">
            Grin Mates v0.1.0
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Built on Celo for a sustainable future
          </p>
        </ResponsiveContainer>

        {/* Support Modal */}
        {showSupportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Help & Support</h3>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-3">
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp</p>
                    <p className="text-sm text-gray-600">Chat with our support team</p>
                  </div>
                </a>
                
                <a
                  href="https://t.me/yoursupport"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Send className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Telegram</p>
                    <p className="text-sm text-gray-600">Join our support channel</p>
                  </div>
                </a>
                
                <a
                  href="mailto:support@grinmates.com"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@grinmates.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Terms Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <div className="prose prose-sm text-gray-900">
                <p className="text-sm text-gray-600 mb-4">
                  Last updated: January 2026
                </p>
                
                <h4 className="font-semibold mb-2">1. Acceptance of Terms</h4>
                <p className="text-sm mb-4">
                  By using Grin Mates, you agree to these terms and conditions.
                </p>
                
                <h4 className="font-semibold mb-2">2. Use of Service</h4>
                <p className="text-sm mb-4">
                  You may use our service for lawful purposes only. You agree not to use the service for any illegal activities.
                </p>
                
                <h4 className="font-semibold mb-2">3. User Accounts</h4>
                <p className="text-sm mb-4">
                  You are responsible for maintaining the security of your account and all activities that occur under your account.
                </p>
                
                <h4 className="font-semibold mb-2">4. Limitation of Liability</h4>
                <p className="text-sm">
                  Grin Mates shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <div className="prose prose-sm text-gray-900">
                <p className="text-sm text-gray-600 mb-4">
                  Last updated: January 2026
                </p>
                
                <h4 className="font-semibold mb-2">Information We Collect</h4>
                <p className="text-sm mb-4">
                  We collect information you provide directly to us, such as when you create an account or contact us for support.
                </p>
                
                <h4 className="font-semibold mb-2">How We Use Your Information</h4>
                <p className="text-sm mb-4">
                  We use the information we collect to provide, maintain, and improve our services.
                </p>
                
                <h4 className="font-semibold mb-2">Information Sharing</h4>
                <p className="text-sm mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.
                </p>
                
                <h4 className="font-semibold mb-2">Data Security</h4>
                <p className="text-sm">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
