import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ResponsiveLayoutWrapper } from "@/components/ResponsiveLayoutWrapper";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { CommandPalette } from "@/components/CommandPalette";
// import { DebugAIAssistant } from "@/components/DebugAIAssistant";
// import { EventDebugger } from "@/components/EventDebugger";
import { DeveloperNavigation } from "@/components/DeveloperNavigation";
import { DevToolsToggle } from "@/components/DevToolsToggle";
import { PageAnalyticsProvider } from "@/components/PageAnalyticsProvider";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { CookieConsent } from "@/components/CookieConsent";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vibelux - Professional Horticultural Lighting Platform",
  description: "Advanced lighting design, analysis, and optimization for indoor farming and greenhouses",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <meta name="theme-color" content="#4f46e5" />
        </head>
        <body className={`${inter.className} gradient-background dark`}>
          <GlobalErrorHandler />
          <ImpersonationBanner />
          <ServiceWorkerRegistration />
          <CommandPalette />
          <DeveloperNavigation />
          <DevToolsToggle />
          <SubscriptionProvider>
            <PageAnalyticsProvider>
              <ResponsiveLayoutWrapper>
                {children}
              </ResponsiveLayoutWrapper>
            </PageAnalyticsProvider>
          </SubscriptionProvider>
          <script src="/sidebar-toggle.js" defer></script>
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  );
}// Trigger deploy Thu Jul  3 06:38:12 CDT 2025
// Build trigger Thu Jul  3 07:29:06 CDT 2025
