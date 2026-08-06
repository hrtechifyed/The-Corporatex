import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type LabelRow = { label: string };

export default async function Company({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: stories } = await supabase
    .from('published_experiences')
    .select('*')
    .eq('company_slug', slug)
    .order('published_at', { ascending: false });

  if (!stories?.length) {
    const { data: company } = await supabase
      .from('companies')
      .select('display_name')
      .eq('slug', slug)
      .maybeSingle();

    if (!company) notFound();

    return (
      <section className="light-panel min-h-screen px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="scene-tag">Company archive</p>
          <h1 className="mt-3 text-5xl font-black">{company.display_name}</h1>
          <p className="mt-8 border border-black/20 p-6">
            No published experiences for this company.
          </p>
        </div>
      </section>
    );
  }

  const { data: labelRows } = stories.length >= 3
    ? await supabase
        .from('experience_labels')
        .select('label')
        .in('experience_id', stories.map((story) => story.id))
    : { data: [] as LabelRow[] };

  const themes = (labelRows ?? []).reduce<Record<string, number>>(
    (counts, row) => {
      const label = String(row.label || '').trim();
      if (label) counts[label] = (counts[label] || 0) + 1;
      return counts;
    },
    {},
  );

  const repeatedThemes = Object.entries(themes).filter(([, count]) => count >= 2);

  return (
    <section className="light-panel min-h-screen px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="scene-tag">Company archive</p>
        <h1 className="mt-3 text-5xl font-black">
          {stories[0].company_display_name}
        </h1>

        {stories.length >= 3 && (
          <aside className="mt-8 border border-black/20 p-6">
            <h2 className="font-bold">
              Contributor-reported patterns—not verified company facts
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {repeatedThemes.map(([theme, count]) => (
                <span
                  className="border border-black/20 px-3 py-2 text-sm"
                  key={theme}
                >
                  {theme} · {count} accounts
                </span>
              ))}
            </div>
          </aside>
        )}

        <div className="mt-8 grid gap-4">
          {stories.map((story) => (
            <Link
              href={`/experience/${slug}/${story.public_slug}`}
              className="border border-black/20 bg-white/60 p-6"
              key={story.id}
            >
              <h2 className="text-2xl font-bold">{story.approved_headline}</h2>
              <p className="mt-2 text-black/65">{story.approved_summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
