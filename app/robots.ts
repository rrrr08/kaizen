import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/set-admin/',
          '/profile/',
          '/orders/',
          '/wallet/',
          '/cart/',
          '/checkout/',
          '/payment-error/',
          '/order-confirmation/',
          '/notifications/',
          '/notification-preferences/',
          '/progress/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
