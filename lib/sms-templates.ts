/**
 * SMS Templates for Joy Juncture
 * Centralized SMS message formatting
 */

export interface SmsTemplateData {
    [key: string]: string | number;
}

/**
 * SMS Template Functions
 */
export const SmsTemplates = {
    /**
     * OTP Verification SMS
     */
    otp: (otp: string, expiryMinutes: number = 10): string => {
        return `🎮 Joy Juncture Verification

Your OTP: ${otp}

⏰ Expires in ${expiryMinutes} minutes
🔒 Keep this code private

Need help? Visit joy-juncture.com/support`;
    },

    /**
     * Order Confirmation SMS
     */
    orderConfirmation: (orderId: string, amount: number, items: number): string => {
        return `🎉 Order Confirmed!

Order #${orderId}
Items: ${items}
Total: ₹${amount}

Track: joy-juncture.com/orders/${orderId}

Thank you for shopping with us! 🛍️`;
    },

    /**
     * Event Registration SMS
     */
    eventRegistration: (eventName: string, date: string, ticketId: string): string => {
        return `🎪 Event Registration Confirmed!

Event: ${eventName}
Date: ${date}
Ticket: ${ticketId}

View ticket: joy-juncture.com/tickets/${ticketId}

See you there! 🎉`;
    },

    /**
     * Reward Earned SMS
     */
    rewardEarned: (points: number, xp: number, reason: string): string => {
        return `🏆 Rewards Earned!

+${points} JP | +${xp} XP
Reason: ${reason}

Check wallet: joy-juncture.com/wallet

Keep playing! 🎮`;
    },

    /**
     * Daily Spin Reminder SMS
     */
    dailySpinReminder: (): string => {
        return `🎡 Your Daily Spin is Ready!

Spin the wheel for prizes:
• Joy Points
• XP Boosts
• Discount Coupons
• Jackpot!

Spin now: joy-juncture.com/spin

Don't miss out! ⏰`;
    },

    /**
     * Level Up SMS
     */
    levelUp: (newTier: string, multiplier: number): string => {
        return `🎊 Level Up!

New Tier: ${newTier}
Multiplier: ${multiplier}x

You now earn ${multiplier}x Joy Points!

View profile: joy-juncture.com/profile

Keep gaming! 🚀`;
    },

    /**
     * Low Stock Alert SMS (for wishlisted items)
     */
    lowStockAlert: (productName: string, stock: number): string => {
        return `⚠️ Low Stock Alert!

${productName}
Only ${stock} left!

Shop now: joy-juncture.com/shop

Hurry before it's gone! 🏃`;
    },

    /**
     * Event Reminder SMS (24 hours before)
     */
    eventReminder: (eventName: string, time: string, location: string): string => {
        return `⏰ Event Tomorrow!

${eventName}
Time: ${time}
Location: ${location}

View details: joy-juncture.com/events

See you soon! 🎪`;
    },

    /**
     * Generic Notification SMS
     */
    notification: (title: string, message: string, actionUrl?: string): string => {
        const urlPart = actionUrl ? `\n\n🔗 ${actionUrl}` : '';
        return `🎮 ${title}

${message}${urlPart}

- Joy Juncture`;
    },

    /**
     * Password Reset SMS
     */
    passwordReset: (resetLink: string): string => {
        return `🔐 Password Reset Request

Click to reset your password:
${resetLink}

⏰ Link expires in 1 hour
🔒 Didn't request this? Ignore this message.

- Joy Juncture Security`;
    },

    /**
     * Welcome SMS (after signup)
     */
    welcome: (userName: string): string => {
        return `🎉 Welcome to Joy Juncture, ${userName}!

Start your journey:
🎮 Play 14+ games
🛍️ Shop board games
🎪 Join events
🏆 Earn rewards

Explore: joy-juncture.com

Let's play! 🚀`;
    },

    /**
     * Payment Success SMS
     */
    paymentSuccess: (amount: number, orderId: string): string => {
        return `✅ Payment Successful!

Amount: ₹${amount}
Order: #${orderId}

Your order is being processed.

Track: joy-juncture.com/orders/${orderId}

Thank you! 🙏`;
    },

    /**
     * Shipping Update SMS
     */
    shippingUpdate: (orderId: string, status: string, trackingId?: string): string => {
        const tracking = trackingId ? `\nTracking: ${trackingId}` : '';
        return `📦 Shipping Update

Order: #${orderId}
Status: ${status}${tracking}

Track: joy-juncture.com/orders/${orderId}

Questions? Contact support 📞`;
    },

    /**
     * Promotional SMS
     */
    promotion: (title: string, discount: number, code: string, expiryDate: string): string => {
        return `🎁 ${title}

${discount}% OFF with code: ${code}

Valid until: ${expiryDate}

Shop now: joy-juncture.com/shop

Happy shopping! 🛍️`;
    },

    /**
     * Tournament Invitation SMS
     */
    tournamentInvite: (gameName: string, date: string, prize: string): string => {
        return `🏆 Tournament Invitation!

Game: ${gameName}
Date: ${date}
Prize: ${prize}

Register: joy-juncture.com/tournaments

Show your skills! 🎮`;
    }
};

/**
 * Helper function to format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    // Remove +91 and format as XXX-XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        const number = cleaned.slice(2);
        return `${number.slice(0, 5)}-${number.slice(5)}`;
    }
    return phone;
}

/**
 * Helper function to truncate SMS if too long (160 chars for single SMS)
 */
export function truncateSms(message: string, maxLength: number = 160): string {
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength - 3) + '...';
}

/**
 * Helper function to get SMS character count and segment info
 */
export function getSmsInfo(message: string): {
    length: number;
    segments: number;
    encoding: 'GSM-7' | 'UCS-2';
} {
    // Check if message contains unicode characters
    const hasUnicode = /[^\x00-\x7F]/.test(message);
    const encoding = hasUnicode ? 'UCS-2' : 'GSM-7';

    // Calculate segments
    const maxPerSegment = encoding === 'GSM-7' ? 160 : 70;
    const maxConcatenated = encoding === 'GSM-7' ? 153 : 67;

    const length = message.length;
    let segments = 1;

    if (length > maxPerSegment) {
        segments = Math.ceil(length / maxConcatenated);
    }

    return { length, segments, encoding };
}
