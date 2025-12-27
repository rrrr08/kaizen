// Helper functions for game API calls with Firebase Auth

import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

/**
 * Get the current user's Firebase Auth token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const auth = getAuth(app);
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('No user logged in');
      return null;
    }
    
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Award points for completing a game
 */
export async function awardGamePoints(params: {
  gameId: string;
  retry?: number;
  level?: string;
  points?: number;
}): Promise<{ success: boolean; awardedPoints?: number; error?: string; message?: string }> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const response = await fetch('/api/games/award', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        gameId: params.gameId,
        retry: params.retry || 0,
        level: params.level,
        points: params.points
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Fetch game history
 */
export async function getGameHistory(gameId: string): Promise<any[]> {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      return [];
    }
    
    const response = await fetch(`/api/games/history?gameId=${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

/**
 * Fetch game content (riddles, puzzles, etc.)
 */
export async function getGameContent(gameId: string, date?: string): Promise<any> {
  try {
    const url = date 
      ? `/api/games/content?gameId=${gameId}&date=${date}`
      : `/api/games/content?gameId=${gameId}`;
      
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.content || null;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}
