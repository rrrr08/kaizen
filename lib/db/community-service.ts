import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    increment,
    limit,
    startAfter
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommunityThread, EventChatRoom, CommunityMessage } from '@/lib/types';

// Comprehensive bad word list and patterns
const PROFANITY_LIST = [
    'badword', 'abuse', 'hate', 'spam', 'fuck', 'shit', 'asshole', 'bitch',
    'bastard', 'dick', 'pussy', 'slut', 'whore', 'faggot', 'nigger', 'cunt',
    'chutiya', 'madarchod', 'behenchod', 'gandu', 'bhosadi', 'randi', 'harami'
];

const censorText = (text: string): { cleanText: string; isFlagged: boolean; wordsFound: string[] } => {
    let isFlagged = false;
    let cleanText = text;
    const wordsFound: string[] = [];

    // Pre-process text to catch leetspeak (f*ck, f.u.c.k, etc)
    const normalizedText = text.toLowerCase()
        .replace(/[0o]/g, 'o')
        .replace(/[1il|]/g, 'i')
        .replace(/[4a@]/g, 'a')
        .replace(/[3e]/g, 'e')
        .replace(/[5s$]/g, 's')
        .replace(/[7t]/g, 't')
        .replace(/[^a-z]/g, '');

    PROFANITY_LIST.forEach(word => {
        // 1. Check exact word with boundaries
        const exactRegex = new RegExp(`\\b${word}\\b`, 'gi');
        if (exactRegex.test(text)) {
            isFlagged = true;
            wordsFound.push(word);
            cleanText = cleanText.replace(exactRegex, '*'.repeat(word.length));
        }

        // 2. Check for spaced out words (f u c k)
        const spacedPattern = word.split('').join('[\\s\\W_]*');
        const hybridRegex = new RegExp(spacedPattern, 'gi');
        if (hybridRegex.test(text)) {
            isFlagged = true;
            if (!wordsFound.includes(word)) wordsFound.push(word);
            cleanText = cleanText.replace(hybridRegex, (match) => '*'.repeat(match.length));
        }

        // 3. Check normalized text for hidden words
        if (normalizedText.includes(word.toLowerCase())) {
            isFlagged = true;
            if (!wordsFound.includes(word)) wordsFound.push(word);
            // If normalized check finds it but regex didn't, we still flag it
        }
    });

    return { cleanText, isFlagged, wordsFound };
};

export const CommunityService = {
    // --- THREADS (General Discussions) ---

    async createThread(data: Omit<CommunityThread, 'id' | 'createdAt' | 'updatedAt' | 'messageCount' | 'lastMessageAt'>) {
        try {
            const docRef = await addDoc(collection(db, 'community_threads'), {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                messageCount: 0,
                isLocked: false,
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating thread:', error);
            return { success: false, error };
        }
    },

    async getThreads() {
        try {
            const q = query(
                collection(db, 'community_threads'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityThread));
            return { success: true, threads };
        } catch (error) {
            console.error('Error fetching threads:', error);
            return { success: false, error };
        }
    },

    subscribeToThreads(callback: (threads: CommunityThread[]) => void) {
        const q = query(
            collection(db, 'community_threads'),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityThread));
            callback(threads);
        });
    },

    // --- MESSAGES ---

    async sendMessage(
        containerId: string,
        containerType: 'thread' | 'event',
        user: { id: string; name: string; email?: string; avatar?: string; role?: string; tierName?: string },
        content: string
    ) {
        // First check if user is banned
        try {
            const userRef = doc(db, 'users', user.id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().isBanned) {
                return { success: false, error: 'User is banned' };
            }
        } catch (e) {
            console.error('Error checking ban status:', e);
        }

        const { cleanText: finalContent, isFlagged, wordsFound } = censorText(content);

        try {
            const collectionRef = collection(db, 'community_messages');
            const messageData = {
                threadId: containerType === 'thread' ? containerId : null,
                chatRoomId: containerType === 'event' ? containerId : null,
                content: finalContent,
                senderId: user.id,
                senderName: user.name,
                senderEmail: user.email || '',
                senderAvatar: user.avatar,
                senderRole: user.role || 'member',
                senderTier: user.tierName || 'Newbie',
                timestamp: serverTimestamp(),
                isFlagged: isFlagged
            };

            const docRef = await addDoc(collectionRef, messageData);

            if (containerType === 'thread') {
                const threadRef = doc(db, 'community_threads', containerId);
                await updateDoc(threadRef, {
                    lastMessageAt: serverTimestamp(),
                    messageCount: increment(1)
                });
            }

            if (isFlagged) {
                await addDoc(collection(db, 'moderation_logs'), {
                    messageId: docRef.id,
                    userId: user.id,
                    userName: user.name,
                    userEmail: user.email || '',
                    userAvatar: user.avatar,
                    originalContent: content,
                    reason: `Profanity detected: ${wordsFound.join(', ')}`,
                    status: 'pending',
                    timestamp: serverTimestamp(),
                    context: `Posted in ${containerType} ${containerId}`
                });
            }

            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error };
        }
    },

    subscribeToMessages(containerId: string, containerType: 'thread' | 'event', callback: (messages: CommunityMessage[]) => void) {
        const field = containerType === 'thread' ? 'threadId' : 'chatRoomId';
        const q = query(
            collection(db, 'community_messages'),
            where(field, '==', containerId),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            } as unknown as CommunityMessage));
            // Reverse to show oldest first, but we fetched newest first to get the latest conversation
            callback(messages.reverse());
        });
    },

    async getOlderMessages(
        containerId: string,
        containerType: 'thread' | 'event',
        lastTimestamp: Date
    ) {
        try {
            const field = containerType === 'thread' ? 'threadId' : 'chatRoomId';
            const q = query(
                collection(db, 'community_messages'),
                where(field, '==', containerId),
                orderBy('timestamp', 'desc'),
                startAfter(lastTimestamp),
                limit(20)
            );
            const snapshot = await getDocs(q);
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            } as unknown as CommunityMessage));

            // Return them oldest-first to prepend correctly? 
            // Actually usually we return them as fetched (desc) and UI prepends them (reversed).
            // Let's return as fetched (desc: Newest -> Oldest in that chunk)
            return messages;
        } catch (error) {
            console.error('Error fetching older messages:', error);
            return [];
        }
    },

    // --- ADMIN ACTIONS ---

    async getActiveReports() {
        try {
            const q = query(
                collection(db, 'moderation_logs'),
                where('status', '==', 'pending'),
                orderBy('timestamp', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    },

    async resolveReport(reportId: string, action: 'dismiss' | 'ban_user') {
        try {
            const reportRef = doc(db, 'moderation_logs', reportId);
            const reportSnap = await getDoc(reportRef);

            if (action === 'ban_user' && reportSnap.exists()) {
                const userId = reportSnap.data().userId;
                if (userId) {
                    const userRef = doc(db, 'users', userId);
                    await updateDoc(userRef, { isBanned: true });
                }
            }

            await updateDoc(reportRef, {
                status: action === 'dismiss' ? 'dismissed' : 'resolved',
                resolvedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error resolving report:', error);
            return { success: false, error };
        }
    },

    async deleteMessage(messageId: string) {
        // Delete or mark as deleted
        // For now, let's not implement hard delete without auth checks
        return { success: false, message: "Not implemented" };
    }
};
