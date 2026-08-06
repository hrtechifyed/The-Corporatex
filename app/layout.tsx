import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const dynamic = 'force-dynamic';

const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: 'CorporateX',
    template: '%s | CorporateX',
  },
  description: 'Structured workplace exit stories for better employer decisions.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'CorporateX',
    description: 'Before you join, hear why people left.',
    type: 'website',
    url: site,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CorporateX',
    description: 'Structured workplace exit stories for better employer decisions.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="fixed -top-20 left-4 z-[100] bg-signal p-3 text-black focus:top-4"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
