import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { OfflineBanner } from '@/components/pwa/offline-banner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  applicationName: 'SkillSwap',
  title: {
    default: 'SkillSwap — Trade Skills, Not Money',
    template: '%s · SkillSwap',
  },
  description:
    'A community marketplace where members trade skills using skill points.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SkillSwap',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <AppProviders>
          <OfflineBanner />
          {children}
          <InstallPrompt />
        </AppProviders>
      </body>
    </html>
  );
}
