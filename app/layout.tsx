import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BBD Mess | Today’s Menu',
  description: 'See today’s hostel mess meals, timings and weekly menu.',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'BBD Mess' },
  icons: { apple: '/icons/icon-192.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}<Analytics /></body></html>;
}
