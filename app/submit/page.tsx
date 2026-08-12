import type { Metadata } from 'next';
import { OpeningSignalStep } from '@/components/contributor-journey';

export const metadata: Metadata = { title: 'Share Your Story', robots: { index: false, follow: false } };

export default function Submit() {
  return <><OpeningSignalStep /><aside className="cx-flow-shell" aria-label="Contribution timing"><div className="cx-draft-assurance"><span><strong>About 8–12 minutes for most contributors.</strong> Skip any Story Beat that does not belong in your experience; CorporateX only needs enough of your own words to make the story useful.</span></div></aside></>;
}
