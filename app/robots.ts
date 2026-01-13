import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/auth/',
          '/profile/',
          '/checkout/',
          '/notifications/',
          '/notification-preferences/',
          '/wallet/',
          '/rewards/',
          '/play/*/play',
          '/games/wheel/',
          '/games/scratch-card/',
          '/games/daily-challenge/',
          '/events/registration-success/',
          '/set-admin/',
          '/orders/',
          '/cart/',
          '/payment-error/',
          '/order-confirmation/',
          '/progress/',
        ],
      },
      // Block aggressive crawlers
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot'],
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
