/**
 * Initialize Firebase with Mock Data
 * This function sets up mock data for development/testing
 * Run once via: http://localhost:3000/api/initialize-firebase
 */

export async function initializeFirebaseData() {
  try {
    console.log('🚀 Starting Firebase initialization...');

    // Lazy load Firebase
    const {
      setDoc, doc, getDocs, addDoc, serverTimestamp, query, limit, db: firebaseDb
    } = await import('@/lib/firebase');

    if (!firebaseDb) {
      throw new Error('Firebase not initialized');
    }

    // 0. Initialize Testimonials (Moved to top)
    await initializeTestimonials(firebaseDb, setDoc, doc, addDoc);

    /*
    // 1. Initialize Gamification Config
    await initializeGamificationConfig(firebaseDb, setDoc, doc, serverTimestamp);

    // 2. Initialize Mock Settings
    await initializeSettings(firebaseDb, getDocs, query, doc, serverTimestamp);

    // 3. Initialize Products
    await initializeProducts(firebaseDb, setDoc, doc, serverTimestamp);

    // 4. Initialize Events
    await initializeEvents(firebaseDb, setDoc, doc, serverTimestamp);

    // 5. Initialize Orders
    await initializeOrders(firebaseDb, addDoc, serverTimestamp);

    // 6. Initialize Users
    await initializeUsers(firebaseDb, setDoc, doc, addDoc);
    */

    console.log('✅ Firebase initialization complete!');
    return { success: true, message: 'Firebase initialized successfully' };
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    throw error;
  }
}

async function initializeGamificationConfig(db: any, setDoc: any, doc: any, serverTimestamp: any) {
  try {
    const configRef = doc(db, 'settings', 'gamification');
    const config = {
      pointsPerRupee: 1,
      firstTimeBonusPoints: 100,
      firstTimeThreshold: 500,
      redeemRate: 0.5,
      maxRedeemPercent: 50,
      referralBonus: 50,
      birthdayBonus: 100,
      bonusRules: [
        {
          id: '1',
          name: 'First Purchase Bonus',
          type: 'percentage',
          active: true,
          description: 'Get 100 bonus points on your first purchase',
          bonusPoints: 100,
          minPurchaseAmount: 0,
          purchaseCount: 1,
          applicableCategories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Referral Bonus',
          type: 'fixed',
          active: true,
          description: 'Get 50 points when you refer a friend',
          bonusPoints: 50,
          minPurchaseAmount: 0,
          purchaseCount: 0,
          applicableCategories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Birthday Bonus',
          type: 'fixed',
          active: true,
          description: 'Get 100 bonus points on your birthday',
          bonusPoints: 100,
          minPurchaseAmount: 0,
          purchaseCount: 0,
          applicableCategories: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(configRef, config);
    console.log('✅ Gamification config initialized');
  } catch (error) {
    console.error('❌ Error initializing gamification config:', error);
    throw error;
  }
}

async function initializeSettings(db: any, getDocs: any, query: any, doc: any, serverTimestamp: any) {
  try {
    const settingsRef = doc(db, 'settings', 'store');
    const settings = {
      storeName: 'Joy Juncture',
      storeEmail: 'support@joyjuncture.com',
      storePhone: '+91-XXXXXXXXXX',
      currency: 'INR',
      gstRate: 18,
      shippingCost: 50,
      freeShippingThreshold: 500,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const { setDoc } = await import('@/lib/firebase');
    await setDoc(settingsRef, settings);
    console.log('✅ Store settings initialized');
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    throw error;
  }
}

async function initializeProducts(db: any, setDoc: any, doc: any, serverTimestamp: any) {
  try {
    console.log('📦 Starting product initialization...');
    const { collection, getDocs, addDoc } = await import('@/lib/firebase');
    const productsRef = collection(db, 'products');

    // Check if products already exist
    const existingProducts = await getDocs(productsRef);
    if (existingProducts.size > 0) {
      console.log(`✅ Products already exist (${existingProducts.size} found), skipping initialization`);
      return;
    }

    const mockProducts = [
      {
        name: 'Classic Cotton T-Shirt',
        price: 799,
        cost: 350,
        stock: 150,
        category: 'apparel',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        rating: 4.5,
        sales: 245,
        description: 'Comfortable 100% cotton t-shirt',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Premium Denim Jeans',
        price: 2499,
        cost: 1200,
        stock: 85,
        category: 'apparel',
        image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=400&fit=crop',
        rating: 4.8,
        sales: 189,
        description: 'Stylish premium denim jeans',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Leather Wallet',
        price: 1299,
        cost: 450,
        stock: 200,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
        rating: 4.6,
        sales: 312,
        description: 'Genuine leather wallet with RFID protection',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Stainless Steel Watch',
        price: 3999,
        cost: 1500,
        stock: 45,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1523170335684-f042fcbb620a?w=400&h=400&fit=crop',
        rating: 4.9,
        sales: 87,
        description: 'Elegant stainless steel wristwatch',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Vintage Vinyl Record',
        price: 599,
        cost: 150,
        stock: 120,
        category: 'collectibles',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
        rating: 4.3,
        sales: 67,
        description: 'Rare vintage vinyl record collection',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Limited Edition Sneakers',
        price: 5999,
        cost: 2500,
        stock: 32,
        category: 'apparel',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        rating: 4.7,
        sales: 156,
        description: 'Exclusive limited edition sneakers',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Canvas Backpack',
        price: 1899,
        cost: 700,
        stock: 95,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
        rating: 4.4,
        sales: 203,
        description: 'Durable canvas travel backpack',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Designer Sunglasses',
        price: 2999,
        cost: 900,
        stock: 60,
        category: 'accessories',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
        rating: 4.8,
        sales: 124,
        description: 'Premium designer sunglasses',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Collectible Action Figure',
        price: 1499,
        cost: 400,
        stock: 25,
        category: 'collectibles',
        image: 'https://images.unsplash.com/photo-1587829191301-4d59aaed2252?w=400&h=400&fit=crop',
        rating: 4.9,
        sales: 89,
        description: 'Rare collectible action figure',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Wool Blend Sweater',
        price: 1799,
        cost: 650,
        stock: 110,
        category: 'apparel',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        rating: 4.6,
        sales: 178,
        description: 'Cozy wool blend winter sweater',
        createdAt: new Date().toISOString(),
      },
    ];

    let addedCount = 0;
    for (const product of mockProducts) {
      try {
        const docRef = await addDoc(productsRef, product);
        addedCount++;
        console.log(`✅ Added product: ${product.name} (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ Failed to add product ${product.name}:`, error);
      }
    }

    console.log(`✅ Products initialization complete - Added ${addedCount} products`);
  } catch (error) {
    console.error('❌ Error initializing products:', error);
    throw error;
  }
}

async function initializeEvents(db: any, setDoc: any, doc: any, serverTimestamp: any) {
  try {
    console.log('📅 Starting events initialization...');
    const { collection, getDocs, addDoc } = await import('@/lib/firebase');
    const eventsRef = collection(db, 'events');

    const existingEvents = await getDocs(eventsRef);
    if (existingEvents.size > 0) {
      console.log(`✅ Events already exist (${existingEvents.size} found), skipping initialization`);
      return;
    }

    const mockEvents = [
      {
        title: 'Tech Talk: Web Performance',
        description: 'Join us for an insightful discussion on optimizing web performance and best practices.',
        date: '2026-01-15',
        time: '18:00',
        location: 'Joy Juncture Main Hall',
        capacity: 200,
        registered: 156,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Fashion Show 2026',
        description: 'Exclusive fashion showcase featuring latest collections from renowned designers.',
        date: '2026-01-20',
        time: '19:00',
        location: 'Downtown Exhibition Center',
        capacity: 500,
        registered: 423,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1540575467063-178f50002cbc?w=400&h=400&fit=crop',
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Gaming Tournament',
        description: '24-hour gaming marathon to raise funds for childrens education.',
        date: '2026-01-12',
        time: '10:00',
        location: 'Gaming Arena Downtown',
        capacity: 150,
        registered: 128,
        status: 'ongoing',
        image: 'https://images.unsplash.com/photo-1538481143235-a32877e30666?w=400&h=400&fit=crop',
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Community Cleanup Drive',
        description: 'Help us clean up local parks and streets. All supplies provided.',
        date: '2025-12-05',
        time: '08:00',
        location: 'Central Park',
        capacity: 100,
        registered: 92,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=400&fit=crop',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const event of mockEvents) {
      const docRef = await addDoc(eventsRef, event);
      console.log(`✅ Added event: ${event.title}`);
    }

    console.log(`✅ Events initialization complete - Added ${mockEvents.length} events`);
  } catch (error) {
    console.error('❌ Error initializing events:', error);
    throw error;
  }
}

async function initializeOrders(db: any, addDoc: any, serverTimestamp: any) {
  try {
    console.log('📦 Starting orders initialization...');
    const { collection, getDocs } = await import('@/lib/firebase');
    const ordersRef = collection(db, 'orders');

    const existingOrders = await getDocs(ordersRef);
    if (existingOrders.size > 0) {
      console.log(`✅ Orders already exist (${existingOrders.size} found), skipping initialization`);
      return;
    }

    const mockOrders = [
      {
        items: [
          { name: 'Classic Cotton T-Shirt', price: 799, quantity: 2, id: 'prod1' },
          { name: 'Leather Wallet', price: 1299, quantity: 1, id: 'prod3' },
        ],
        totalPrice: 2897,
        totalPoints: 2897,
        status: 'delivered',
        shippingAddress: {
          name: 'John Doe',
          address: '123 Main St, City',
          city: 'Mumbai',
          postalCode: '400001',
          phone: '+91-9876543210',
        },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        items: [
          { name: 'Limited Edition Sneakers', price: 5999, quantity: 1, id: 'prod6' },
        ],
        totalPrice: 5999,
        totalPoints: 5999,
        status: 'processing',
        shippingAddress: {
          name: 'Jane Smith',
          address: '456 Oak Ave, Town',
          city: 'Bangalore',
          postalCode: '560001',
          phone: '+91-9876543211',
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        items: [
          { name: 'Designer Sunglasses', price: 2999, quantity: 1, id: 'prod8' },
          { name: 'Canvas Backpack', price: 1899, quantity: 1, id: 'prod7' },
        ],
        totalPrice: 4898,
        totalPoints: 4898,
        status: 'shipped',
        shippingAddress: {
          name: 'Michael Johnson',
          address: '789 Pine Rd, Village',
          city: 'Delhi',
          postalCode: '110001',
          phone: '+91-9876543212',
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        items: [
          { name: 'Stainless Steel Watch', price: 3999, quantity: 1, id: 'prod4' },
          { name: 'Premium Denim Jeans', price: 2499, quantity: 1, id: 'prod2' },
        ],
        totalPrice: 6498,
        totalPoints: 6498,
        status: 'pending',
        shippingAddress: {
          name: 'Sarah Williams',
          address: '321 Elm St, District',
          city: 'Pune',
          postalCode: '411001',
          phone: '+91-9876543213',
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const order of mockOrders) {
      await addDoc(ordersRef, order);
      console.log(`✅ Added order with ${order.items.length} items`);
    }

    console.log(`✅ Orders initialization complete - Added ${mockOrders.length} orders`);
  } catch (error) {
    console.error('❌ Error initializing orders:', error);
    throw error;
  }
}

async function initializeUsers(db: any, setDoc: any, doc: any, addDoc: any) {
  try {
    console.log('👥 Starting users initialization...');
    const { collection, getDocs } = await import('@/lib/firebase');
    const usersRef = collection(db, 'users');

    const existingUsers = await getDocs(usersRef);
    if (existingUsers.size > 0) {
      console.log(`✅ Users already exist (${existingUsers.size} found), skipping initialization`);
      return;
    }

    const mockUsers = [
      {
        name: 'Admin User',
        email: 'admin@joyjuncture.com',
        role: 'admin',
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        points: 15000,
        wallet: 5000,
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'member',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        points: 3500,
        wallet: 1200,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'member',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        points: 5200,
        wallet: 2500,
      },
      {
        name: 'Michael Johnson',
        email: 'michael@example.com',
        role: 'member',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        points: 8900,
        wallet: 3800,
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        role: 'member',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        points: 2100,
        wallet: 800,
      },
    ];

    for (const user of mockUsers) {
      await addDoc(usersRef, user);
      console.log(`✅ Added user: ${user.name}`);
    }

    console.log(`✅ Users initialization complete - Added ${mockUsers.length} users`);
  } catch (error) {
    console.error('❌ Error initializing users:', error);
    throw error;
  }
}

async function initializeTestimonials(db: any, setDoc: any, doc: any, addDoc: any) {
  try {
    console.log('💬 Starting testimonials initialization (Admin SDK)...');
    // Import Admin SDK dynamically to avoid build issues if mixed with client code
    const { db: adminDb } = await import('@/lib/firebase-admin');

    // Check if we are successfully connected
    if (!adminDb) {
      console.error('❌ Admin DB not available, skipping testimonials.');
      return;
    }

    const testimonialsRef = adminDb.collection('testimonials');
    const snapshot = await testimonialsRef.get();

    const mockTestimonials = [
      {
        name: 'Sarah M.',
        quote: 'Joy Juncture transformed our team building! We\'ve never laughed so hard together.',
        role: 'Corporate Team',
        image: 'https://picsum.photos/seed/person1/100/100',
        status: 'approved',
        createdAt: new Date(Date.now() - 10000000).toISOString()
      },
      {
        name: 'Marcus L.',
        quote: 'The games are exceptional quality and brought our entire family together.',
        role: 'Family Game Night',
        image: 'https://picsum.photos/seed/person2/100/100',
        status: 'approved',
        createdAt: new Date(Date.now() - 5000000).toISOString()
      },
      {
        name: 'Emily R.',
        quote: 'Best decision for our wedding reception. Every guest had a blast!',
        role: 'Wedding Reception',
        image: 'https://picsum.photos/seed/person3/100/100',
        status: 'approved',
        createdAt: new Date(Date.now() - 2000000).toISOString()
      },
      {
        name: 'David K.',
        quote: 'Amazing collection of rare board games. I found pieces I thought were lost to time.',
        role: 'Collector',
        image: 'https://picsum.photos/seed/person4/100/100',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        name: 'Priya S.',
        quote: 'The staff was incredibly helpful in teaching us the rules. A truly welcoming space.',
        role: 'First Time Visitor',
        image: 'https://picsum.photos/seed/person5/100/100',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        name: 'Rahul V.',
        quote: 'Too loud and crowded on weekends.',
        role: 'Visitor',
        image: 'https://picsum.photos/seed/person6/100/100',
        status: 'rejected',
        createdAt: new Date(Date.now() - 8000000).toISOString()
      }
    ];

    const existingNames = new Set();
    snapshot.forEach((doc: any) => {
      existingNames.add(doc.data().name);
    });

    let addedCount = 0;
    for (const t of mockTestimonials) {
      if (!existingNames.has(t.name)) {
        await testimonialsRef.add(t);
        console.log(`✅ Added testimonial (Admin): ${t.name}`);
        addedCount++;
      }
    }

    if (addedCount === 0) {
      console.log('✅ All testimonials already exist, none added.');
    } else {
      console.log(`✅ Testimonials initialization complete - Added ${addedCount} new testimonials`);
    }
  } catch (error) {
    console.error('❌ Error initializing testimonials:', error);
    // Don't throw, just log so other initializations can proceed if this fails
  }
}
