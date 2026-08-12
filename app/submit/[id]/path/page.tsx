import { redirect } from 'next/navigation';

export default async function LegacyPath({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/account/story/${id}`);
}
