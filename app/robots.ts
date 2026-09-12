import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/client/',
          '/guard/',
          '/ops/',
          '/guard-dashboard/',
          '/login/',
          '/signup/',
          '/auth/',
          '/checkout/',
          '/recovery/',
          '/reset-password/',
          '/forgot-password/',
          '/apply/',
          '/setup-super-admin/',
        ],
      },
    ],
    sitemap: 'https://guardianhub.com/sitemap.xml',
  };
}