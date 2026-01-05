# SEO Implementation Guide

## ✅ What's Been Done

### 1. **Centralized Metadata Configuration**
Created [lib/metadata.ts](../lib/metadata.ts) with:
- Default SEO settings for the entire site
- Page-specific metadata for all major pages
- Helper functions for generating metadata
- Support for dynamic pages (products, events, blog posts)

### 2. **Root Layout Enhanced**
Updated [app/layout.tsx](../app/layout.tsx) with:
- Comprehensive Open Graph tags
- Twitter Card metadata
- Structured metadata with template support
- Keywords and author information
- Robot directives

### 3. **Page-Level Metadata Added**
Added metadata exports to these pages:
- ✅ [app/orders/page.tsx](../app/orders/page.tsx)
- ✅ [app/shop/page.tsx](../app/shop/page.tsx)
- ✅ [app/cart/page.tsx](../app/cart/page.tsx)
- ✅ [app/rewards/page.tsx](../app/rewards/page.tsx)
- ✅ [app/play/page.tsx](../app/play/page.tsx)
- ✅ [app/profile/page.tsx](../app/profile/page.tsx)
- ✅ [app/wallet/page.tsx](../app/wallet/page.tsx)
- ✅ [app/contact/page.tsx](../app/contact/page.tsx)

### 4. **SEO Files Created**
- ✅ [app/robots.ts](../app/robots.ts) - Controls search engine crawling
- ✅ [app/sitemap.ts](../app/sitemap.ts) - XML sitemap for search engines

---

## 🎯 How to Add Metadata to Any Page

### For Static Pages (Client Components)
In any `page.tsx` file, add at the top:

```typescript
'use client';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description for SEO',
  keywords: ['keyword1', 'keyword2'],
  robots: { index: true, follow: true }, // or false for private pages
};

// Your component code...
```

### Using the Centralized Config
Import and use the helper function:

```typescript
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata('shop'); // Use predefined config
```

### For Dynamic Pages (Products, Blog Posts, etc.)
Example for product detail page:

```typescript
import { generateDynamicMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }): Promise<Metadata> {
  // Fetch product data
  const product = await getProduct(params.id);
  
  return generateDynamicMetadata({
    title: product.name,
    description: product.description,
    image: product.image,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/${params.id}`,
    type: 'product',
    keywords: product.tags,
  });
}
```

---

## 📋 Remaining Tasks

### 1. **Update Environment Variable**
Add to your `.env.local` file:
```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```
For local development:
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. **Create OG Images**
Create these images in the `public` folder:
- `/public/og-image.jpg` (1200x630px) - For Open Graph
- `/public/twitter-image.jpg` (1200x628px) - For Twitter Cards

You can use tools like:
- Canva
- Figma
- https://www.opengraph.xyz/

### 3. **Add Metadata to Remaining Pages**
Pages that still need metadata:
- `app/blog/page.tsx` (if exists)
- `app/blog/[slug]/page.tsx` (dynamic)
- `app/community/page.tsx` (if exists)
- `app/about/page.tsx` (if exists)
- `app/checkout/page.tsx`
- `app/shop/[id]/page.tsx` (dynamic - needs generateMetadata function)
- All game pages in `app/play/*`

### 4. **Update Sitemap with Dynamic Content**
Edit [app/sitemap.ts](../app/sitemap.ts) to include:
- Dynamic product pages (fetch from database)
- Dynamic blog posts
- Dynamic event pages

Example:
```typescript
export default async function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://joyjuncture.com';
  
  // Fetch dynamic content
  const products = await getProducts();
  const blogPosts = await getBlogPosts();
  
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  return [...staticPages, ...productUrls, ...blogUrls];
}
```

### 5. **Add Structured Data (JSON-LD)**
For products, events, and articles, add structured data in the page component:

```typescript
export default function ProductPage({ product }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Your component JSX */}
    </>
  );
}
```

### 6. **Verify Search Console**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Get verification code
4. Add to [app/layout.tsx](../app/layout.tsx):
```typescript
verification: {
  google: 'your-verification-code',
}
```

### 7. **Test Your SEO**
After deployment, test with:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

## 🔍 Quick Reference

### Page Types and SEO Settings

| Page Type | Index | Follow | Priority |
|-----------|-------|--------|----------|
| Homepage | ✅ Yes | ✅ Yes | 1.0 |
| Shop/Products | ✅ Yes | ✅ Yes | 0.9 |
| Blog/Content | ✅ Yes | ✅ Yes | 0.8 |
| Public Info | ✅ Yes | ✅ Yes | 0.5-0.7 |
| User Pages | ❌ No | ❌ No | N/A |
| Checkout | ❌ No | ❌ No | N/A |
| Admin | ❌ No | ❌ No | N/A |

### Keywords by Section
- **Shop**: board games, card games, tabletop, strategy games, party games
- **Events**: gaming events, tournaments, meetups, community
- **Play**: free games, online games, puzzles, brain games
- **Blog**: game reviews, strategy guides, tutorials, news

---

## 📊 Monitoring SEO Performance

After implementation:
1. Submit sitemap to Google Search Console: `yourdomain.com/sitemap.xml`
2. Monitor in Search Console: impressions, clicks, CTR
3. Check page indexing status
4. Review mobile usability
5. Monitor Core Web Vitals

---

## 💡 Best Practices

1. **Title Length**: 50-60 characters
2. **Description Length**: 150-160 characters
3. **Keywords**: 5-10 relevant keywords per page
4. **Images**: Always include alt text
5. **URLs**: Keep them clean and descriptive
6. **Content**: Regular updates improve ranking
7. **Mobile**: Ensure mobile-friendly design
8. **Speed**: Optimize images and code splitting

---

## ❓ Need Help?

- Next.js Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Open Graph Protocol: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- Schema.org: https://schema.org/
