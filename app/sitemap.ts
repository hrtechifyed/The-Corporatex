import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://corporatex.onrender.com').replace(/\/$/, '');
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${site}/browse`, changeFrequency: 'daily', priority: .9 },
    { url: `${site}/more`, changeFrequency: 'monthly', priority: .7 },
    { url: `${site}/about`, changeFrequency: 'monthly', priority: .7 },
    { url: `${site}/privacy`, changeFrequency: 'monthly', priority: .5 },
    { url: `${site}/terms`, changeFrequency: 'monthly', priority: .4 },
    { url: `${site}/community-guidelines`, changeFrequency: 'monthly', priority: .5 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase.from('published_experiences').select('company_slug,public_slug,published_at').order('published_at', { ascending: false }).limit(1000);
    const stories: MetadataRoute.Sitemap = (data || []).filter((row) => row.company_slug && row.public_slug).map((row) => ({
      url: `${site}/experience/${row.company_slug}/${row.public_slug}`,
      lastModified: row.published_at ? new Date(row.published_at) : undefined,
      changeFrequency: 'weekly',
      priority: .8,
    }));
    return [...staticRoutes, ...stories];
  } catch {
    return staticRoutes;
  }
}
