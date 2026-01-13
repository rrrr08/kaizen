import { MetadataRoute } from 'next';
import { getProducts, getExperienceCategories, getBlogPosts } from '@/lib/firebase';
import { getEvents } from '@/lib/db/events';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app';
  const currentDate = new Date();

  // Static routes with priority-based ranking
  const staticRoutes = [
    // Homepage - Highest priority
    { path: '', priority: 1.0 },

    // Main sections - Very high priority
    { path: '/shop', priority: 0.9 },
    { path: '/events/upcoming', priority: 0.9 },
    { path: '/play', priority: 0.9 },
    { path: '/community', priority: 0.9 },

    // Game pages - High priority
    { path: '/play/chess', priority: 0.7 },
    { path: '/play/riddles', priority: 0.7 },
    { path: '/play/sudoku', priority: 0.7 },
    { path: '/play/puzzles', priority: 0.7 },
    { path: '/play/mathquiz', priority: 0.7 },
    { path: '/play/hangman', priority: 0.7 },
    { path: '/play/wordsearch', priority: 0.7 },
    { path: '/play/wordle', priority: 0.7 },
    { path: '/play/trivia', priority: 0.7 },
    { path: '/play/2048', priority: 0.7 },
    { path: '/play/minesweeper', priority: 0.7 },
    { path: '/play/snake', priority: 0.7 },
    { path: '/play/tango', priority: 0.7 },
    { path: '/play/daily-spin', priority: 0.7 },

    // Secondary sections - Medium-high priority
    { path: '/blog', priority: 0.8 },
    { path: '/rewards', priority: 0.7 },

    // Informational pages - Medium priority
    { path: '/about', priority: 0.6 },
    { path: '/contact', priority: 0.6 },
    { path: '/events/past', priority: 0.5 },
  ];

  const routes = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as any,
    priority: route.priority,
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

    // Product routes - High priority, daily updates
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/shop/${product.id}`,
      lastModified: product.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'daily' as any,
      priority: 0.8,
    }));

    // Upcoming Event routes - High priority, daily updates
    const upcomingEventRoutes = upcomingEvents.map((event: any) => ({
      url: `${baseUrl}/events/upcoming/${event.id}`,
      lastModified: event.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'daily' as any,
      priority: 0.8,
    }));

    // Past Event routes - Lower priority, daily updates
    const pastEventRoutes = pastEvents.map((event: any) => ({
      url: `${baseUrl}/events/past/${event.id}`,
      lastModified: event.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'daily' as any,
      priority: 0.4,
    }));

    // Experience routes - Medium priority, daily updates
    const experienceRoutes = experienceCategories.map((category: any) => ({
      url: `${baseUrl}/experiences/${category.slug}`,
      lastModified: category.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'daily' as any,
      priority: 0.6,
    }));

    // Blog routes - Medium priority, daily updates
    const blogRoutes = blogPosts.map((post: any) => ({
      url: `${baseUrl}/blog/${post.id}`,
      lastModified: post.updatedAt?.toDate?.() || currentDate,
      changeFrequency: 'daily' as any,
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
