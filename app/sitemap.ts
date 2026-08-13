import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://hrtechifyed.github.io/The-Corporatex/').replace(/\/$/, '');
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${site}/stories.html`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site}/how-it-works.html`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${site}/privacy-safety.html`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${site}/terms.html`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${site}/community-guidelines.html`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${site}/user-guide.html`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${site}/feedback.html`, changeFrequency: 'weekly', priority: 0.6 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('published_experiences')
      .select('id,published_at')
      .order('published_at', { ascending: false })
      .limit(1000);

    const stories: MetadataRoute.Sitemap = (data || [])
      .filter((row) => row.id)
      .map((row) => ({
        url: `${site}/story-detail.html?id=${encodeURIComponent(row.id)}`,
        lastModified: row.published_at ? new Date(row.published_at) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [...staticRoutes, ...stories];
  } catch {
    return staticRoutes;
  }
}
