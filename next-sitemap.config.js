/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app',
  generateRobotsTxt: true,
  exclude: [
    '/admin', 
    '/admin/*', 
    '/profile', 
    '/profile/*', 
    '/wallet', 
    '/cart', 
    '/checkout',
    '/auth/*',
    '/api/*',
    '/notifications',
    '/notification-preferences',
    '/rewards',
    '/games/*/play',
    '/games/wheel',
    '/games/scratch-card',
    '/games/daily-challenge',
    '/events/registration-success'
  ],
  robotsTxtOptions: {
    policies: [
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
          '/games/*/play',
          '/games/wheel/',
          '/games/scratch-card/',
          '/games/daily-challenge/',
          '/events/registration-success/'
        ],
      },
      {
        userAgent: 'AhrefsBot',
        disallow: '/',
      },
      {
        userAgent: 'SemrushBot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
    ],
  },
}
