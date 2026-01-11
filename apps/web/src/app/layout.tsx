import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Grin Mates",
  icons: {
    icon: "/logo.png", 
  
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-white text-gray-900">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
