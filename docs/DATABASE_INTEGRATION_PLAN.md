# 🔄 FRONTEND PAGES DATABASE INTEGRATION PLAN

**Status:** 📋 Planning Phase  
**Date:** December 23, 2025

---

## 📊 CURRENT STATE vs TARGET STATE

### Pages That Currently Use Mock Data (from constants.ts)

| Page | Route | Current Data | Should Fetch From |
|------|-------|--------------|-------------------|
| Shop | `/shop` | `PRODUCTS` from constants | Firestore `products` collection |
| Shop Detail | `/shop/[id]` | `PRODUCTS` from constants | Firestore `products/{id}` |
| Community | `/community` | `EVENTS`, `TESTIMONIALS` from constants | Firestore `events` collection |
| Events | `/events` | Dynamic fetch (good) | ✅ Already Firestore |
| Events Past | `/events/past` | Dynamic fetch (good) | ✅ Already Firestore |
| Experiences | `/experiences` | `EXPERIENCES` from constants | Firestore (needs new collection) |
| Play | `/play` | `GAMES` from constants | Firestore (needs new collection) |
| Home | `/` | `PRODUCTS`, `EVENTS` from constants | ✅ Mix of both |
| Blog | `/blog` | Hardcoded posts | Firestore `blog_posts` collection |
| Orders | `/orders` | Dynamic fetch (good) | ✅ Already Firestore |

---

## 🎯 IMPLEMENTATION TASKS

### Phase 1: Create Missing Firestore Collections

#### 1.1 `experiences` Collection
```typescript
{
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  duration: string;
  image: string;
  highlights: string[];
  testimonials: Array<{
    name: string;
    role: string;
    feedback: string;
  }>;
  capacity: number;
  category: string; // Corporate, Wedding, Birthday, etc.
  createdAt: Timestamp;
}
```

#### 1.2 `games` Collection
```typescript
{
  id: string;
  title: string;
  description: string;
  category: string;
  playersMin: number;
  playersMax: number;
  playtimeMins: number;
  complexity: "Easy" | "Medium" | "Hard";
  rating: number;
  image: string;
  active: boolean;
  createdAt: Timestamp;
}
```

#### 1.3 `blog_posts` Collection
```typescript
{
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  readTime: number;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### Phase 2: Update Frontend Pages

#### 2.1 Shop Page (`/shop/page.tsx`)
**Changes:**
- ✅ Fetch from Firestore `products` collection
- ✅ Add loading state
- ✅ Add error handling
- ✅ Keep local filtering

**Code Pattern:**
```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  fetchProducts();
}, []);
```

#### 2.2 Shop Detail (`/shop/[id]/page.tsx`)
**Changes:**
- ✅ Fetch single product from Firestore
- ✅ Real-time updates
- ✅ Handle not found case

**Code Pattern:**
```typescript
const [product, setProduct] = useState<Product | null>(null);

useEffect(() => {
  const fetchProduct = async () => {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
    }
  };
  fetchProduct();
}, [id]);
```

#### 2.3 Community Page (`/community/page.tsx`)
**Changes:**
- ✅ Fetch events from Firestore
- ✅ Real-time filtering
- ✅ Remove hardcoded testimonials

#### 2.4 Experiences Page (`/experiences/page.tsx`)
**Changes:**
- ✅ Create `experiences` collection first
- ✅ Fetch from Firestore
- ✅ Dynamic rendering

#### 2.5 Play Page (`/play/page.tsx`)
**Changes:**
- ✅ Create `games` collection first
- ✅ Fetch active games from Firestore
- ✅ Real-time category filtering

#### 2.6 Blog Page (`/blog/page.tsx`)
**Changes:**
- ✅ Create `blog_posts` collection first
- ✅ Fetch published posts from Firestore
- ✅ Real-time category filtering
- ✅ Pagination (optional)

#### 2.7 Home Page (`/page.tsx`)
**Changes:**
- ✅ Fetch featured products (limit 3-4)
- ✅ Fetch upcoming events (limit 2-3)
- ✅ Keep static testimonials (or create collection)

---

### Phase 3: Update Firebase Functions

Add these helper functions to `lib/firebase.ts`:

```typescript
// Products
export async function getProducts() {
  const q = query(collection(db, 'products'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getProductById(id: string) {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

// Games
export async function getGames() {
  const q = query(
    collection(db, 'games'),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Experiences
export async function getExperiences() {
  const q = query(collection(db, 'experiences'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Blog Posts
export async function getBlogPosts() {
  const q = query(
    collection(db, 'blog_posts'),
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### Step 1: Add Mock Data to Firestore
```bash
# Call the initialization endpoint to seed new collections
POST /api/initialize-firebase
```

**Need to update:** `lib/initializeFirebaseData.ts` to include experiences, games, blog posts

### Step 2: Update Page Components
Start with highest priority:
1. **Shop** (`/shop/page.tsx`) - Most used
2. **Shop Detail** (`/shop/[id]/page.tsx`) - Linked from shop
3. **Community** (`/community/page.tsx`) - Events already work
4. **Experiences** (`/experiences/page.tsx`)
5. **Play** (`/play/page.tsx`)
6. **Blog** (`/blog/page.tsx`) - Lower priority
7. **Home** (`/page.tsx`) - Last (simplest)

### Step 3: Testing
- [ ] Each page loads correctly
- [ ] Filtering works
- [ ] No console errors
- [ ] Responsive design maintained
- [ ] Loading states working
- [ ] Error handling working

---

## ⚡ BENEFITS OF DATABASE INTEGRATION

✅ **Real-time Data:** All pages show live data from Firestore  
✅ **Scalability:** Easy to add/update data without code changes  
✅ **Admin Control:** Admins can manage products, events, games via dashboard  
✅ **Single Source of Truth:** No data duplication  
✅ **Dynamic Content:** Updates instantly across frontend  
✅ **Analytics:** Track user interactions with database items

---

## 🔧 TOOLS & IMPORTS NEEDED

```typescript
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
```

---

## ✅ QUICK CHECKLIST

- [ ] Create Firestore collections (experiences, games, blog_posts)
- [ ] Add mock data via `/api/initialize-firebase`
- [ ] Update `lib/firebase.ts` with fetch functions
- [ ] Update Shop page component
- [ ] Update Shop detail component
- [ ] Update Community page
- [ ] Update Experiences page
- [ ] Update Play page
- [ ] Update Blog page
- [ ] Update Home page
- [ ] Test all pages
- [ ] Verify no console errors
- [ ] Commit and push changes

---

**Ready to implement?** Choose Phase 1 to start!

