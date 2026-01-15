# SMS Templates Documentation

## 📱 SMS Template System

Joy Juncture uses a centralized SMS template system for consistent, branded messaging across all SMS communications.

---

## 🎨 Available Templates

### 1. **OTP Verification**
```typescript
SmsTemplates.otp(otp: string, expiryMinutes: number = 10)
```

**Example Output:**
```
🎮 Joy Juncture Verification

Your OTP: 123456

⏰ Expires in 10 minutes
🔒 Keep this code private

Need help? Visit joy-juncture.com/support
```

---

### 2. **Order Confirmation**
```typescript
SmsTemplates.orderConfirmation(orderId: string, amount: number, items: number)
```

**Example Output:**
```
🎉 Order Confirmed!

Order #ABC123
Items: 3
Total: ₹1,499

Track: joy-juncture.com/orders/ABC123

Thank you for shopping with us! 🛍️
```

---

### 3. **Event Registration**
```typescript
SmsTemplates.eventRegistration(eventName: string, date: string, ticketId: string)
```

**Example Output:**
```
🎪 Event Registration Confirmed!

Event: Chess Tournament 2026
Date: Jan 20, 2026 at 6:00 PM
Ticket: TKT123456

View ticket: joy-juncture.com/tickets/TKT123456

See you there! 🎉
```

---

### 4. **Reward Earned**
```typescript
SmsTemplates.rewardEarned(points: number, xp: number, reason: string)
```

**Example Output:**
```
🏆 Rewards Earned!

+50 JP | +25 XP
Reason: Completed Chess Game

Check wallet: joy-juncture.com/wallet

Keep playing! 🎮
```

---

### 5. **Daily Spin Reminder**
```typescript
SmsTemplates.dailySpinReminder()
```

**Example Output:**
```
🎡 Your Daily Spin is Ready!

Spin the wheel for prizes:
• Joy Points
• XP Boosts
• Discount Coupons
• Jackpot!

Spin now: joy-juncture.com/spin

Don't miss out! ⏰
```

---

### 6. **Level Up**
```typescript
SmsTemplates.levelUp(newTier: string, multiplier: number)
```

**Example Output:**
```
🎊 Level Up!

New Tier: Strategist
Multiplier: 1.25x

You now earn 1.25x Joy Points!

View profile: joy-juncture.com/profile

Keep gaming! 🚀
```

---

### 7. **Low Stock Alert**
```typescript
SmsTemplates.lowStockAlert(productName: string, stock: number)
```

**Example Output:**
```
⚠️ Low Stock Alert!

Catan Board Game
Only 2 left!

Shop now: joy-juncture.com/shop

Hurry before it's gone! 🏃
```

---

### 8. **Event Reminder**
```typescript
SmsTemplates.eventReminder(eventName: string, time: string, location: string)
```

**Example Output:**
```
⏰ Event Tomorrow!

Chess Tournament Finals
Time: 6:00 PM IST
Location: Gaming Arena, Mumbai

View details: joy-juncture.com/events

See you soon! 🎪
```

---

### 9. **Generic Notification**
```typescript
SmsTemplates.notification(title: string, message: string, actionUrl?: string)
```

**Example Output:**
```
🎮 New Feature Alert

We've added 3 new games! Check them out now.

🔗 joy-juncture.com/games

- Joy Juncture
```

---

### 10. **Password Reset**
```typescript
SmsTemplates.passwordReset(resetLink: string)
```

**Example Output:**
```
🔐 Password Reset Request

Click to reset your password:
joy-juncture.com/reset/abc123

⏰ Link expires in 1 hour
🔒 Didn't request this? Ignore this message.

- Joy Juncture Security
```

---

### 11. **Welcome Message**
```typescript
SmsTemplates.welcome(userName: string)
```

**Example Output:**
```
🎉 Welcome to Joy Juncture, Rahul!

Start your journey:
🎮 Play 14+ games
🛍️ Shop board games
🎪 Join events
🏆 Earn rewards

Explore: joy-juncture.com

Let's play! 🚀
```

---

### 12. **Payment Success**
```typescript
SmsTemplates.paymentSuccess(amount: number, orderId: string)
```

**Example Output:**
```
✅ Payment Successful!

Amount: ₹1,499
Order: #ABC123

Your order is being processed.

Track: joy-juncture.com/orders/ABC123

Thank you! 🙏
```

---

### 13. **Shipping Update**
```typescript
SmsTemplates.shippingUpdate(orderId: string, status: string, trackingId?: string)
```

**Example Output:**
```
📦 Shipping Update

Order: #ABC123
Status: Out for Delivery
Tracking: TRK987654

Track: joy-juncture.com/orders/ABC123

Questions? Contact support 📞
```

---

### 14. **Promotional**
```typescript
SmsTemplates.promotion(title: string, discount: number, code: string, expiryDate: string)
```

**Example Output:**
```
🎁 Weekend Sale!

25% OFF with code: WEEKEND25

Valid until: Jan 20, 2026

Shop now: joy-juncture.com/shop

Happy shopping! 🛍️
```

---

### 15. **Tournament Invitation**
```typescript
SmsTemplates.tournamentInvite(gameName: string, date: string, prize: string)
```

**Example Output:**
```
🏆 Tournament Invitation!

Game: Chess
Date: Jan 25, 2026
Prize: ₹10,000 + Trophy

Register: joy-juncture.com/tournaments

Show your skills! 🎮
```

---

## 🛠️ Usage Examples

### In API Routes

```typescript
import { SmsTemplates } from '@/lib/sms-templates';
import twilio from 'twilio';

// Send OTP
const client = twilio(accountSid, authToken);
await client.messages.create({
  body: SmsTemplates.otp('123456', 10),
  from: twilioPhone,
  to: userPhone
});

// Send order confirmation
await client.messages.create({
  body: SmsTemplates.orderConfirmation('ORD123', 1499, 3),
  from: twilioPhone,
  to: userPhone
});
```

### In Notification Service

```typescript
import { SmsTemplates } from './sms-templates';

// Generic notification
const smsBody = SmsTemplates.notification(
  'New Feature',
  'Check out our new games!',
  'https://joy-juncture.com/games'
);
```

---

## 📏 SMS Best Practices

### Character Limits
- **Single SMS**: 160 characters (GSM-7) or 70 characters (Unicode)
- **Concatenated SMS**: 153 characters per segment (GSM-7) or 67 (Unicode)

### Helper Functions

```typescript
import { getSmsInfo, truncateSms } from '@/lib/sms-templates';

// Get SMS info
const info = getSmsInfo(message);
console.log(info);
// { length: 145, segments: 1, encoding: 'GSM-7' }

// Truncate if too long
const short = truncateSms(longMessage, 160);
```

---

## 🎨 Customization

### Modify Existing Templates

Edit `lib/sms-templates.ts`:

```typescript
export const SmsTemplates = {
  otp: (otp: string, expiryMinutes: number = 10): string => {
    return `Your custom OTP message here: ${otp}`;
  },
  // ... other templates
};
```

### Add New Templates

```typescript
export const SmsTemplates = {
  // ... existing templates
  
  customTemplate: (param1: string, param2: number): string => {
    return `Your custom message with ${param1} and ${param2}`;
  }
};
```

---

## 🌍 Internationalization

For multi-language support:

```typescript
export const SmsTemplates = {
  otp: (otp: string, expiryMinutes: number = 10, lang: string = 'en'): string => {
    const messages = {
      en: `Your OTP: ${otp}\nExpires in ${expiryMinutes} minutes`,
      hi: `आपका OTP: ${otp}\n${expiryMinutes} मिनट में समाप्त`,
      // Add more languages
    };
    return messages[lang] || messages.en;
  }
};
```

---

## 📊 SMS Cost Optimization

### Tips to Reduce Costs
1. **Use GSM-7 encoding** (avoid emojis for cost-sensitive messages)
2. **Keep messages under 160 characters** (single segment)
3. **Batch notifications** instead of individual sends
4. **Use templates** to ensure consistency and optimal length

### Cost Comparison
- **Single SMS**: ~₹0.25 - ₹0.50
- **Concatenated (2 segments)**: ~₹0.50 - ₹1.00
- **With emojis (Unicode)**: Higher cost per segment

---

## ✅ Testing

### Test in Development

```typescript
// Mock mode (no actual SMS sent)
process.env.USE_MOCK_OTP = 'true';

// Test template output
console.log(SmsTemplates.otp('123456', 10));
```

### Test in Production

Use Twilio test credentials or verified numbers for testing.

---

## 📝 Template Guidelines

### DO ✅
- Keep messages concise and clear
- Include branding (Joy Juncture)
- Add relevant emojis for engagement
- Provide action URLs when applicable
- Include expiry times for time-sensitive info

### DON'T ❌
- Exceed 160 characters unnecessarily
- Use excessive emojis (increases cost)
- Include sensitive data in plain text
- Send promotional SMS without consent
- Forget to add unsubscribe options (for marketing)

---

**All SMS templates are production-ready and optimized for user engagement!** 📱
