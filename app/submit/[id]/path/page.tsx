import { redirect } from 'next/navigation';
import { ownedExperience } from '@/lib/auth';

export default async function Path({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ownedExperience(id);
  redirect(`/submit/${id}/guided`);
}
