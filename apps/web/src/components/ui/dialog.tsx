// src/components/ui/dialog.tsx
'use client';

import * as React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogContent: React.FC<React.ComponentProps<typeof RadixDialog.Content>> = (props) => (
  <RadixDialog.Portal>
    <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
    <RadixDialog.Content 
      {...props} 
      className={`
        fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 
        rounded-lg bg-white p-6 shadow-lg 
        mx-4 max-h-[90vh] overflow-y-auto
        ${props.className || ''}
      `} 
    />
  </RadixDialog.Portal>
);
export const DialogHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);
export const DialogTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <RadixDialog.Title className={`text-lg font-bold ${className}`}>{children}</RadixDialog.Title>
);
export const DialogDescription: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <RadixDialog.Description className={`text-sm text-muted-foreground ${className}`}>{children}</RadixDialog.Description>
);
export const DialogClose = RadixDialog.Close;
