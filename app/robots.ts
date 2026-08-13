import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://hrtechifyed.github.io/The-Corporatex/';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/account.html', '/login.html', '/guided-story.html', '/api/', '/auth/'] },
    ],
    sitemap: `${site.replace(/\/$/, '')}/sitemap.xml`,
    host: site.replace(/\/$/, ''),
  };
}
