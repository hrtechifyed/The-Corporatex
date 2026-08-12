import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://corporatex.onrender.com';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/account', '/moderation', '/login', '/submit', '/api/', '/auth/'] },
    ],
    sitemap: `${site.replace(/\/$/, '')}/sitemap.xml`,
    host: site.replace(/\/$/, ''),
  };
}
