import type { Metadata } from 'next';
import './globals.css';
import './corporatex-cinematic.css';
import './corporatex-overrides.css';
import './corporatex-performance.css';
import './contributor-journey.css';
import './signal-visual.css';
import './character-cleanup.css';
import './frozen-homepage.css';
import './frozen-assets.css';
import './frozen-global.css';
import './story-beat-navigation.css';
import './product-polish.css';
import './about-deck.css';
import './interface-refinement.css';
import './home-ending-cards.css';
import './scene-form-alignment.css';
import './global-home-character.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: 'CorporateX',
    template: '%s | CorporateX',
  },
  description: 'Every exit leaves a signal. Real workplace stories that help people choose better.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'CorporateX',
    description: 'Some stories warn. Some reassure. All can help someone choose better.',
    type: 'website',
    url: site,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CorporateX',
    description: 'Every exit leaves a signal.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="cx-body">
        <a href="#main" className="fixed -top-20 left-4 z-[100] bg-signal p-3 text-black focus:top-4">Skip to content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
