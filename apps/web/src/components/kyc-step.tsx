'use client';

import { Input } from '@/components/ui/input';

interface KYCStepProps {
  title: string;
  fields: Array<{
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }>;
}

/**
 * KYC Step component with immediate validation feedback
 * Requirements: 7.5
 */
export default function KYCStep({ title, fields }: KYCStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {fields.map((field, index) => (
        <Input
          key={index}
          label={field.label}
          type={field.type}
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          placeholder={field.label}
          error={field.error}
        />
      ))}
    </div>
  );
}
