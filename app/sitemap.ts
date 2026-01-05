import { MetadataRoute } from 'next';
import { getProducts, getExperienceCategories, getBlogPosts } from '@/lib/firebase';
import { getEvents } from '@/lib/db/events';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app';
  const currentDate = new Date();

  // Static routes
  const routes = [
    '',
    '/shop',
    '/events/upcoming',
    '/events/past',
    '/play',
    '/play/chess',
    '/play/riddles',
    '/play/sudoku',
    '/play/puzzles',
    '/play/mathquiz',
    '/play/hangman',
    '/play/wordsearch',
    '/play/wordle',
    '/play/trivia',
    '/play/2048',
    '/play/daily-spin',
    '/blog',
    '/community',
    '/rewards',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/shop' ? 'daily' : 'weekly' as any,
    priority: route === '' ? 1 : route.startsWith('/play/') ? 0.7 : 0.8,
  }));

  try {
    // Fetch dynamic content
    const [products, upcomingEvents, pastEvents, experienceCategories, blogPosts] = await Promise.all([
      getProducts(),
      getEvents({ status: 'upcoming' }),
      getEvents({ status: 'past' }),
      getExperienceCategories(),
      getBlogPosts(),
    ]);

    // Product routes
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/shop/${product.id}`,
      lastModified: product.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'weekly' as any,
      priority: 0.7,
    }));

    // Upcoming Event routes
    const upcomingEventRoutes = upcomingEvents.map((event: any) => ({
      url: `${baseUrl}/events/upcoming/${event.id}`,
      lastModified: event.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'weekly' as any,
      priority: 0.6,
    }));

    // Past Event routes
    const pastEventRoutes = pastEvents.map((event: any) => ({
      url: `${baseUrl}/events/past/${event.id}`,
      lastModified: event.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'monthly' as any,
      priority: 0.5,
    }));

    // Experience routes
    const experienceRoutes = experienceCategories.map((category: any) => ({
      url: `${baseUrl}/experiences/${category.slug}`,
      lastModified: category.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'monthly' as any,
      priority: 0.6,
    }));

    // Blog routes
    const blogRoutes = blogPosts.map((post: any) => ({
      url: `${baseUrl}/blog/${post.id}`,
      lastModified: post.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'monthly' as any,
      priority: 0.6,
    }));

    return [
      ...routes,
      ...productRoutes,
      ...upcomingEventRoutes,
      ...pastEventRoutes,
      ...experienceRoutes,
      ...blogRoutes
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
