# 🔌 ADMIN API INTEGRATION GUIDE

## Quick Integration Examples

This guide shows how to connect each admin page to live Firestore data.

---

## 1. DASHBOARD - Get Platform Stats

### Current (Mock Data)
```typescript
const loadDashboardData = async () => {
  const mockStats: DashboardStats = {
    totalUsers: 1250,
    totalOrders: 450,
    // ... etc
  };
  setStats(mockStats);
};
```

### Integrated (Firestore)
```typescript
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const loadDashboardData = async () => {
  try {
    // Get total users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnapshot.size;

    // Get total orders and revenue
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const totalOrders = ordersSnapshot.size;
    
    let totalRevenue = 0;
    ordersSnapshot.forEach(doc => {
      totalRevenue += doc.data().totalPrice || 0;
    });

    // Get active users (logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeQuery = query(
      collection(db, 'users'),
      where('lastLogin', '>=', today)
    );
    const activeSnapshot = await getDocs(activeQuery);
    const activeUsers = activeSnapshot.size;

    // Get recent orders
    const recentQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const recentSnapshot = await getDocs(recentQuery);
    const recentOrders = recentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setStats({
      totalUsers,
      totalOrders,
      totalRevenue,
      averageOrderValue: totalRevenue / totalOrders,
      activeUsers,
      // Calculate points from orders
      totalPointsIssued: totalOrders * 50, // Example: 50 points per order
      totalPointsRedeemed: 12350,
      monthlyGrowth: 12.5
    });

    setRecentOrders(recentOrders);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 2. ORDERS - Fetch & Display Orders

### Current (Mock Data)
```typescript
const loadOrders = async () => {
  const mockOrders = [
    { id: 'ORD-001', userEmail: 'john@example.com', ... }
  ];
  setOrders(mockOrders);
};
```

### Integrated (Firestore)
```typescript
import { getDocs, collection, query, where, orderBy } from 'firebase/firestore';

const loadOrders = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    
    // Option 1: Get all orders
    const querySnapshot = await getDocs(ordersRef);
    
    const orders = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        totalPrice: data.totalPrice,
        subtotal: data.subtotal,
        gst: data.gst,
        shippingCost: data.shippingCost,
        itemCount: data.items?.length || 0,
        paymentStatus: data.paymentStatus,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    setOrders(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    setLoading(false);
  }
};
```

### Filter Orders by Status
```typescript
const filteredOrders = orders.filter(order => {
  const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = statusFilter === 'all' || order.paymentStatus === statusFilter;
  return matchesSearch && matchesStatus;
});
```

---

## 3. PRODUCTS - Manage Inventory

### Fetch Products
```typescript
import { getDocs, collection } from 'firebase/firestore';

const loadProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        category: data.category,
        image: data.image,
        rating: data.rating || 4.5,
        sales: data.sales || 0
      };
    });

    setProducts(products);
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    setLoading(false);
  }
};
```

### Update Product Stock
```typescript
import { doc, updateDoc } from 'firebase/firestore';

const updateStock = async (productId: string, newStock: number) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, { stock: newStock });
    
    // Update local state
    setProducts(products.map(p => 
      p.id === productId ? { ...p, stock: newStock } : p
    ));
  } catch (error) {
    console.error('Error updating stock:', error);
  }
};
```

### Add New Product
```typescript
import { collection, addDoc } from 'firebase/firestore';

const addProduct = async (productData: {
  name: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
  image: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: new Date(),
      sales: 0,
      rating: 4.5
    });
    
    // Add to local state
    setProducts([...products, {
      id: docRef.id,
      ...productData,
      sales: 0,
      rating: 4.5
    }]);
  } catch (error) {
    console.error('Error adding product:', error);
  }
};
```

---

## 4. EVENTS - Manage Events

### Fetch Events
```typescript
import { getDocs, collection } from 'firebase/firestore';

const loadEvents = async () => {
  try {
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    const events = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        capacity: data.capacity,
        registered: data.registrations?.length || 0,
        status: determineStatus(data.date),
        description: data.description,
        image: data.image
      };
    });

    setEvents(events);
  } catch (error) {
    console.error('Error fetching events:', error);
  } finally {
    setLoading(false);
  }
};

const determineStatus = (dateString: string) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  
  if (eventDate > today) return 'upcoming';
  if (eventDate.toDateString() === today.toDateString()) return 'ongoing';
  return 'completed';
};
```

### Update Event
```typescript
import { doc, updateDoc } from 'firebase/firestore';

const updateEvent = async (eventId: string, updates: Partial<Event>) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, updates);
    
    // Update local state
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, ...updates } : e
    ));
  } catch (error) {
    console.error('Error updating event:', error);
  }
};
```

### Delete Event
```typescript
import { doc, deleteDoc } from 'firebase/firestore';

const deleteEvent = async (eventId: string) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
    setEvents(events.filter(e => e.id !== eventId));
  } catch (error) {
    console.error('Error deleting event:', error);
  }
};
```

---

## 5. NOTIFICATIONS - Send via Firebase Cloud Messaging

### Send Notification to All Users
```typescript
import { getMessaging, getToken } from 'firebase/messaging';

const sendNotificationToAll = async (title: string, message: string) => {
  try {
    // Get all user FCM tokens
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const tokens = [];
    snapshot.forEach(doc => {
      if (doc.data().fcmToken) {
        tokens.push(doc.data().fcmToken);
      }
    });

    // Send via your backend API
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens,
        notification: {
          title,
          body: message
        }
      })
    });

    if (response.ok) {
      // Save to notification history
      await addDoc(collection(db, 'notificationHistory'), {
        title,
        message,
        sentAt: new Date(),
        recipientCount: tokens.length,
        type: 'broadcast'
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
```

### Backend API Route (`/api/notifications/send`)
```typescript
// app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { tokens, notification } = await request.json();

    // Send multicast message
    const message = {
      notification,
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    
    return NextResponse.json({ 
      success: true, 
      sentCount: response.successCount 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 6. ANALYTICS - Aggregate Data

### Get Analytics Data
```typescript
import { getDocs, collection, query, where, orderBy } from 'firebase/firestore';

const loadAnalytics = async (timeRange: '7d' | '30d' | '90d') => {
  try {
    // Get date range
    const today = new Date();
    const startDate = new Date();
    
    if (timeRange === '7d') startDate.setDate(today.getDate() - 7);
    if (timeRange === '30d') startDate.setDate(today.getDate() - 30);
    if (timeRange === '90d') startDate.setDate(today.getDate() - 90);

    // Get orders in range
    const ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', startDate),
      orderBy('createdAt', 'asc')
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    
    // Calculate daily revenue
    const dailyRevenue = {};
    ordersSnapshot.forEach(doc => {
      const date = doc.data().createdAt.toDate().toLocaleDateString();
      dailyRevenue[date] = (dailyRevenue[date] || 0) + doc.data().totalPrice;
    });

    // Get user creation data for growth chart
    const usersQuery = query(
      collection(db, 'users'),
      where('created_at', '>=', startDate),
      orderBy('created_at', 'asc')
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    // Group by month
    const userGrowth = {};
    usersSnapshot.forEach(doc => {
      const month = doc.data().created_at.toDate().toLocaleDateString('en-US', { 
        month: 'short' 
      });
      userGrowth[month] = (userGrowth[month] || 0) + 1;
    });

    setAnalytics({
      dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({
        date,
        amount
      })),
      userGrowth: Object.entries(userGrowth).map(([month, count]) => ({
        month,
        count
      })),
      // Add other metrics...
    });
  } catch (error) {
    console.error('Error loading analytics:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 7. USERS - Real-time User Management

### Already Integrated! ✅
The users page is already connected to Firestore. Check:
```typescript
// app/admin/users/page.tsx
const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const userData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
      role: doc.data().role,
      created_at: doc.data().created_at
    }));
    setUsers(userData);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    setLoading(false);
  }
};
```

### Update User Role
```typescript
const handleRoleChange = async () => {
  if (selectedUser && newRole) {
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  }
};
```

---

## 📋 Integration Checklist

- [ ] Dashboard: Fetch users, orders, points from Firestore
- [ ] Orders: Fetch orders, add filters, calculate stats
- [ ] Products: Fetch products, add edit/delete functions
- [ ] Events: Fetch events, add create/edit/delete
- [ ] Notifications: Set up Firebase Cloud Messaging
- [ ] Analytics: Aggregate data from multiple collections
- [ ] Error handling: Add try-catch to all queries
- [ ] Loading states: Show loaders while fetching
- [ ] Real-time: Add listeners for live updates (optional)

---

## 🚀 Real-time Updates (Optional)

For live updates without refreshing:

```typescript
import { onSnapshot } from 'firebase/firestore';

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'orders'),
    (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(orders);
    }
  );

  return () => unsubscribe();
}, []);
```

---

## ✅ Done!

Use these examples to integrate Firestore data into your admin pages. Start with the ones that have mock data and work your way through systematically.

Happy coding! 🚀

