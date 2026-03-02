'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import { Shield, User, Mail, Key } from 'lucide-react';

export default function AdminSetupPage() {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'super_admin',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Success!', 'Admin user created successfully');
        setIsCreated(true);
      } else {
        toast.error('Error', data.error || 'Failed to create admin user');
      }
    } catch (error) {
      toast.error('Error', 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isCreated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Created!</h1>
            <p className="text-gray-600">
              Your admin user has been created successfully. You can now access the admin dashboard.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => window.location.href = '/'}
              variant="primary"
              size="lg"
              fullWidth
              className="bg-[#1db584] hover:bg-[#15a576]"
            >
              Go to Dashboard
            </Button>
            
            <Button
              onClick={() => {
                setIsCreated(false);
                setFormData({ email: '', displayName: '', role: 'admin', password: '' });
              }}
              variant="secondary"
              size="lg"
              fullWidth
            >
              Create Another Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Setup</h1>
          <p className="text-gray-600">
            Create the first admin user for Grin Mates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@grinmates.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Display Name
            </label>
            <Input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="System Administrator"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="inline h-4 w-4 mr-1" />
              Admin Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="admin">Admin (Standard Access)</option>
              <option value="moderator">Moderator (Limited Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="inline h-4 w-4 mr-1" />
              Setup Password
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter setup password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the ADMIN_SETUP_PASSWORD from your environment variables
            </p>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingText="Creating Admin..."
            variant="primary"
            size="lg"
            fullWidth
            disabled={!formData.email || !formData.displayName || !formData.password}
            className="bg-[#1db584] hover:bg-[#15a576]"
          >
            Create Admin User
          </Button>
        </form>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            <strong>Security Note:</strong> This setup page should only be used for initial admin creation. 
            Consider removing or securing this endpoint after setup.
          </p>
        </div>
      </div>
    </div>
  );
}