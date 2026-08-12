import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'CorporateX follows workplace truth as a sequence from experience to decision without reducing it to a rating.',
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
