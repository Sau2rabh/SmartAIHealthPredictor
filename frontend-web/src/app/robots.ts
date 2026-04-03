import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/about', '/guide'],
      disallow: ['/dashboard', '/profile', '/history', '/predict', '/api/'],
    },
    sitemap: 'https://healthai.example.com/sitemap.xml',
  };
}
