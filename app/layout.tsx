import type { Metadata } from 'next';
import { QueryProvider } from '@/components/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://superadmin-app-smoky.vercel.app'),
  title: 'BG Platform Admin',
  description: 'Super Admin Portal for BG Accountability Platform',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'BG Platform Admin',
    description: 'Super Admin Portal for BG Accountability Platform',
    images: ['/bridge_gaps_TM.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
