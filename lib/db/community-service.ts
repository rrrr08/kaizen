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

// Simple bad word list for demo purposes - in prod use a robust library or API
const PROFANITY_LIST = ['badword', 'abuse', 'spam', 'hate'];

const censorText = (text: string): { cleanText: string; isFlagged: boolean } => {
    let isFlagged = false;
    let cleanText = text;

    PROFANITY_LIST.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (regex.test(cleanText)) {
            isFlagged = true;
            cleanText = cleanText.replace(regex, '*'.repeat(word.length));
        }
    });

    return { cleanText, isFlagged };
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
        user: { id: string; name: string; avatar?: string; role?: string; tierName?: string },
        content: string
    ) {
        const lowerContent = content.toLowerCase();
        let finalContent = content;
        let isFlagged = false;

        const BAD_WORDS = ['badword', 'abuse', 'hate', 'spam'];
        for (const word of BAD_WORDS) {
            if (lowerContent.includes(word)) {
                finalContent = '*'.repeat(content.length);
                isFlagged = true;
                break;
            }
        }

        try {
            const collectionRef = collection(db, 'community_messages');
            const messageData = {
                threadId: containerType === 'thread' ? containerId : null,
                chatRoomId: containerType === 'event' ? containerId : null,
                content: finalContent,
                senderId: user.id,
                senderName: user.name,
                senderAvatar: user.avatar,
                senderRole: user.role || 'member',
                senderTier: user.tierName || 'Newbie', // Default to Newbie if missing
                timestamp: serverTimestamp(),
                isFlagged: isFlagged
            };

            const docRef = await addDoc(collectionRef, messageData);

            // Update thread/chatroom metadata (message count, last activity)
            if (containerType === 'thread') {
                const threadRef = doc(db, 'community_threads', containerId);
                await updateDoc(threadRef, {
                    lastMessageAt: serverTimestamp(),
                    messageCount: increment(1)
                });
            }

            // --- MODERATION LOGGING ---
            if (isFlagged) {
                await addDoc(collection(db, 'moderation_logs'), {
                    messageId: docRef.id,
                    userId: user.id,
                    userName: user.name, // Using name as proxy
                    userAvatar: user.avatar,
                    originalContent: content,
                    reason: 'Profanity detected',
                    status: 'pending',
                    timestamp: serverTimestamp(),
                    context: `Posted in ${containerType} ${containerId}`
                });
            }
            // --------------------------

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
                where('status', '==', 'active'),
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
