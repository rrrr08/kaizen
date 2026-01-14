// Structured Data (JSON-LD) helpers for SEO

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joy-juncture.vercel.app';

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Joy Juncture',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  description: 'Experience board games, events, and community engagement like never before',
  sameAs: [
    // Add your social media URLs here
    // 'https://facebook.com/joyjuncture',
    // 'https://twitter.com/joyjuncture',
    // 'https://instagram.com/joyjuncture',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@joyjuncture.com',
  },
};

// Website Schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Joy Juncture',
  url: baseUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${baseUrl}/shop?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// Product Schema Generator
export interface ProductSchemaProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
}

export function generateProductSchema(product: ProductSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Joy Juncture',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/shop/${product.id}`,
      priceCurrency: product.currency || 'USD',
      price: product.price,
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: {
        '@type': 'Organization',
        name: 'Joy Juncture',
      },
    },
    ...(product.rating && product.reviewCount
      ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        },
      }
      : {}),
    ...(product.category ? { category: product.category } : {}),
  };
}

// Event Schema Generator
export interface EventSchemaProps {
  id: string;
  name: string;
  description: string;
  image?: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address?: string;
  };
  price?: number;
  currency?: string;
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
}

export function generateEventSchema(event: EventSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    ...(event.image ? { image: event.image } : {}),
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    eventStatus: `https://schema.org/${event.eventStatus || 'EventScheduled'}`,
    eventAttendanceMode: `https://schema.org/${event.eventAttendanceMode || 'OfflineEventAttendanceMode'}`,
    location: {
      '@type': 'Place',
      name: event.location.name,
      ...(event.location.address
        ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.location.address,
          },
        }
        : {}),
    },
    ...(event.price
      ? {
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}/events/${event.id}`,
          priceCurrency: event.currency || 'USD',
          price: event.price,
          availability: 'https://schema.org/InStock',
        },
      }
      : {}),
    organizer: {
      '@type': 'Organization',
      name: 'Joy Juncture',
      url: baseUrl,
    },
  };
}

// Article/BlogPosting Schema Generator
export interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}

export function generateArticleSchema(article: ArticleSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    ...(article.image ? { image: article.image } : {}),
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Joy Juncture',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

// Breadcrumb Schema Generator
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
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

// FAQ Schema Generator
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Review Schema Generator
export interface ReviewSchemaProps {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
  itemName: string;
}

export function generateReviewSchema(review: ReviewSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    itemReviewed: {
      '@type': 'Thing',
      name: review.itemName,
    },
  };
}

// Helper function to inject JSON-LD into page
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
