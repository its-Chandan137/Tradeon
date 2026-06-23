import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { NavigationProgressProvider } from "@/components/ui/navigation-progress-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tradeon — Premium Trading Journal",
    template: "%s · Tradeon",
  },
  description:
    "A premium trading journal for disciplined execution. Track accounts, trades, psychology, and performance analytics in a private multi-user workspace.",
  applicationName: "Tradeon",
  authors: [{ name: "Tradeon" }],
  keywords: [
    "trading journal",
    "trade tracker",
    "prop firm",
    "trading psychology",
    "performance analytics",
    "forex journal",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavigationProgress />
        <Suspense fallback={null}>
          <NavigationProgressProvider />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
