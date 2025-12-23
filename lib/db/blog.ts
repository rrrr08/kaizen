import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

export const blogCollection = collection(db, 'blog_posts');

export async function getBlogPosts(filter?: { category?: string }) {
  try {
    let q: any;
    
    if (filter?.category && filter.category !== 'all') {
      q = query(
        blogCollection,
        where('category', '==', filter.category),
        where('published', '==', true),
        orderBy('publishedAt', 'desc')
      );
    } else {
      q = query(
        blogCollection,
        where('published', '==', true),
        orderBy('publishedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);

    const posts = snapshot.docs.map(docSnap => {
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        ...data,
        publishedAt: data.publishedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    });

    return posts;
  } catch (error) {
    console.error('Error getting blog posts', error);
    // Return mock data if Firestore collection doesn't exist
    console.warn('Firestore collection unavailable, returning mock blog data');
    return getMockBlogPosts(filter);
  }
}

function getMockBlogPosts(filter?: { category?: string }) {
  const mockPosts = [
    {
      id: '1',
      title: 'Getting Started with Joy Juncture',
      excerpt: 'Your guide to joining our vibrant community',
      content: 'Welcome to Joy Juncture! Learn how to get started and make the most of your membership.',
      category: 'Gameplay Guides',
      author: 'Community Team',
      image: '/images/blog-1.jpg',
      published: true,
      publishedAt: new Date('2024-12-20'),
      createdAt: new Date('2024-12-20'),
      updatedAt: new Date('2024-12-20'),
    },
    {
      id: '2',
      title: 'Winning Strategies for Events',
      excerpt: 'Pro tips to maximize your event earnings',
      content: 'Discover advanced strategies to excel at community events and tournaments.',
      category: 'Strategy & Tips',
      author: 'Pro Players',
      image: '/images/blog-2.jpg',
      published: true,
      publishedAt: new Date('2024-12-18'),
      createdAt: new Date('2024-12-18'),
      updatedAt: new Date('2024-12-18'),
    },
  ];

  if (filter?.category && filter.category !== 'all') {
    return mockPosts.filter(post => post.category === filter.category);
  }

  return mockPosts;
}

export async function getBlogPostById(postId: string) {
  try {
    const ref = doc(db, "blog_posts", postId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data() as any;
    return {
      id: snap.id,
      ...data,
      publishedAt: data.publishedAt?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error("Error getting blog post by id", error);
    throw error;
  }
}
