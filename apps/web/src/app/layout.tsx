import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Grin Mates",
  icons: {
    icon: "/logo.png",
  },
  other: {
    "talentapp:project_verification":
      "3e611e8f90dc94f07205495242e4acd2f06133fff053f306d6a8c690e1b901126ac2203b5728c4e42d2e73e12bb89c77cc57b101fc2957d010aa95b65b55985e",
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
