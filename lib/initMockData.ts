/**
 * Initialize Mock Data in Firestore
 * Run this once to populate Firestore with demo data
 * This can be called from an API route or admin panel
 */

import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, limit } from 'firebase/firestore';

export async function initializeNotificationsMockData() {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    // Check if data already exists
    const existingData = await getDocs(query(notificationsRef, limit(1)));
    if (existingData.size > 0) {
      console.log('Notifications already exist');
      return;
    }

    const mockNotifications = [
      {
        title: '50% Off Sale',
        message: 'Get 50% off on all products this weekend!',
        type: 'offer',
        recipientType: 'all',
        recipientCount: 1250,
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        actionUrl: '/shop',
      },
      {
        title: 'New Event Added',
        message: 'Check out our new virtual event this coming week',
        type: 'info',
        recipientType: 'all',
        recipientCount: 1250,
        sentAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        title: 'Welcome to Joy Juncture!',
        message: 'Welcome! Start exploring and earn points with every purchase',
        type: 'success',
        recipientType: 'all',
        recipientCount: 1250,
        sentAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    for (const notif of mockNotifications) {
      await addDoc(notificationsRef, {
        ...notif,
        createdAt: new Date(),
      });
    }

    console.log('✅ Notifications mock data initialized');
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
  }
}

export async function initializeCampaignsMockData() {
  try {
    const campaignsRef = collection(db, 'campaigns');
    
    // Check if data already exists
    const existingData = await getDocs(query(campaignsRef, limit(1)));
    if (existingData.size > 0) {
      console.log('Campaigns already exist');
      return;
    }

    const mockCampaigns = [
      {
        title: 'Flash Sale Alert',
        message: 'Limited time: 60% off on premium games!',
        status: 'sent',
        recipientCount: 1250,
        deliveredCount: 1150,
        interactionCount: 340,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        image: 'https://via.placeholder.com/1024x1024?text=Flash+Sale',
        priority: 'high',
      },
      {
        title: 'New Collection Launch',
        message: 'Discover our newest games and experiences',
        status: 'sent',
        recipientCount: 1250,
        deliveredCount: 1200,
        interactionCount: 280,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        priority: 'normal',
      },
      {
        title: 'Weekend Special',
        message: 'Double points on all purchases this weekend!',
        status: 'scheduled',
        recipientCount: 1250,
        deliveredCount: 0,
        interactionCount: 0,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        priority: 'high',
      },
    ];

    for (const campaign of mockCampaigns) {
      await addDoc(campaignsRef, campaign);
    }

    console.log('✅ Campaigns mock data initialized');
  } catch (error) {
    console.error('❌ Error initializing campaigns:', error);
  }
}

export async function initializeAllMockData() {
  console.log('🚀 Starting mock data initialization...');
  await initializeNotificationsMockData();
  await initializeCampaignsMockData();
  console.log('✅ Mock data initialization complete!');
}
