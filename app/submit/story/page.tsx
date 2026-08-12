import { Suspense } from 'react';
import { StoryStep } from '@/components/contributor-journey';
import { ContributionDraftStatus } from '@/components/contribution-draft-status';

export default function StoryPage() {
  return <><Suspense fallback={null}><StoryStep /></Suspense><ContributionDraftStatus /></>;
}
