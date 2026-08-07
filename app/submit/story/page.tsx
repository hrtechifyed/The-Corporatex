import { Suspense } from 'react';
import { StoryStep } from '@/components/contributor-journey';

export default function StoryPage() {
  return <Suspense fallback={null}><StoryStep /></Suspense>;
}
