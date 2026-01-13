// SEO Helper Components and Utilities
import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app';

/**
 * Generate canonical URL for a page
 */
export function generateCanonicalUrl(path: string): string {
    // Remove trailing slash and ensure path starts with /
    const cleanPath = path === '/' ? '' : path.replace(/\/$/, '');
    return `${baseUrl}${cleanPath}`;
}

/**
 * Generate Organization JSON-LD structured data
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Joy Juncture',
        url: baseUrl,
        logo: `${baseUrl}/icon.png`,
        description: 'Experience board games, events, and community engagement like never before. Shop premium board games, join exciting events, and connect with fellow gamers.',
        sameAs: [
            // Add your social media URLs here
            // 'https://twitter.com/joyjuncture',
            // 'https://facebook.com/joyjuncture',
            // 'https://instagram.com/joyjuncture',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'support@joyjuncture.com',
        },
    };
}

/**
 * Generate WebSite JSON-LD structured data with search action
 */
export function generateWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Joy Juncture',
        url: baseUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/shop?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * Generate Product JSON-LD structured data
 */
export function generateProductSchema(product: {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    category?: string;
    ageGroup?: string;
    minPlayers?: number;
    maxPlayers?: number;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: 'Joy Juncture',
        },
        offers: {
            '@type': 'Offer',
            url: `${baseUrl}/shop/${product.id}`,
            priceCurrency: 'INR',
            price: product.price,
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: 'Joy Juncture',
            },
        },
        ...(product.category && { category: product.category }),
        ...(product.ageGroup && {
            audience: {
                '@type': 'PeopleAudience',
                suggestedMinAge: product.ageGroup,
            }
        }),
    };
}

/**
 * Generate Event JSON-LD structured data
 */
export function generateEventSchema(event: {
    id: string;
    title: string;
    description: string;
    datetime: string;
    location: string;
    image?: string;
    price: number;
    capacity: number;
    registered: number;
}) {
    const eventDate = new Date(event.datetime);

    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.description,
        startDate: eventDate.toISOString(),
        location: {
            '@type': 'Place',
            name: event.location,
            address: event.location,
        },
        image: event.image ? [event.image] : [],
        offers: {
            '@type': 'Offer',
            url: `${baseUrl}/events/upcoming/${event.id}`,
            price: event.price,
            priceCurrency: 'INR',
            availability: event.registered >= event.capacity
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/InStock',
            validFrom: new Date().toISOString(),
        },
        organizer: {
            '@type': 'Organization',
            name: 'Joy Juncture',
            url: baseUrl,
        },
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    };
}

/**
 * Generate Article/BlogPosting JSON-LD structured data
 */
export function generateArticleSchema(article: {
    id: string;
    title: string;
    description: string;
    image?: string;
    publishedAt: Date;
    updatedAt?: Date;
    author?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.description,
        image: article.image ? [article.image] : [],
        datePublished: article.publishedAt.toISOString(),
        dateModified: (article.updatedAt || article.publishedAt).toISOString(),
        author: {
            '@type': 'Person',
            name: article.author || 'Joy Juncture Team',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Joy Juncture',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/icon.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/blog/${article.id}`,
        },
    };
}

/**
 * Generate BreadcrumbList JSON-LD structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/**
 * Component to render JSON-LD structured data
 */
export function StructuredData({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
