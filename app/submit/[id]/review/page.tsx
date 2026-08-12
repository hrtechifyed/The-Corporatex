import { redirect } from 'next/navigation';

export default async function LegacyReview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/account/story/${id}`);
}
