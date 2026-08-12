import { Suspense } from 'react';
import { FinishSubmissionStep } from '@/components/finish-submission-step';

export default function FinishSubmissionPage() {
  return <Suspense fallback={null}><FinishSubmissionStep /></Suspense>;
}
