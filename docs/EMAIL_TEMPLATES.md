# Email Templates Documentation

## 📧 Email Template System

Joy Juncture uses a comprehensive email template system with Neo-Brutalist design for engaging user communications.

---

## 🎨 Design Philosophy

### Neo-Brutalist Aesthetic
- **Bold Colors**: Yellow (#FFD93D), Purple (#6C5CE7), Pink (#FF7675)
- **Black Borders**: 3-4px solid borders everywhere
- **Box Shadows**: 8-12px offset shadows
- **Typography**: Space Grotesk (800 weight for headers)
- **Uppercase**: Headers and CTAs in uppercase

### Professional Elements
- **Invoices**: Clean, formal table layouts
- **GST Compliance**: Proper tax calculations
- **Legal Info**: GSTIN, authorized signatures

---

## 📧 Available Templates

### 1. **Base Email Template**
```typescript
getBaseEmailTemplate(subject: string, message: string)
```

**Use Cases:**
- General notifications
- Announcements
- Updates
- Promotional messages

**Design:**
- Yellow header with Joy Juncture badge
- Mint green message card
- Purple CTA button
- Black footer

**Example:**
```typescript
const html = getBaseEmailTemplate(
  'New Feature Alert',
  'We've added 3 new games!\n\nCheck them out now.'
);
```

---

### 2. **Order Invoice Template**
```typescript
getOrderInvoiceTemplate(order: any)
```

**Use Cases:**
- Order confirmations
- Purchase receipts
- Invoice generation

**Features:**
- Professional table layout
- Item-wise breakdown
- GST calculation (if applicable)
- Subtotal + Grand Total
- Company GSTIN
- Authorized signatory section

**Order Object:**
```typescript
{
  id: string,
  createdAt: Date,
  items: Array<{
    name: string,
    quantity: number,
    price: number
  }>,
  totalPrice: number,
  subtotal?: number,
  gst?: number,
  gstRate?: number,
  shippingAddress: {
    name: string,
    address: string,
    city: string,
    postalCode: string
  }
}
```

---

### 3. **Event Confirmation Template**
```typescript
getEventConfirmationTemplate(
  registrationId: string,
  name: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string,
  amount: number
)
```

**Use Cases:**
- Event registration confirmations
- Tournament tickets
- Workshop bookings

**Features:**
- Neo-Brutalist ticket design
- Event details (date, time, location)
- Registration ID (for venue entry)
- Formal tax invoice section
- QR code placeholder

**Design:**
- Purple header with "TICKET CONFIRMED" badge
- Yellow ticket card with event details
- Formal bill section at bottom

---

### 4. **Password Reset Template**
```typescript
getPasswordResetTemplate(name: string, resetLink: string)
```

**Use Cases:**
- Password reset requests
- Account recovery

**Features:**
- Security-focused design
- Clear "RESET PASSWORD" CTA
- Expiry warning (1 hour)
- Ignore instruction for non-requesters

**Design:**
- Yellow header with "Security Protocol" badge
- White message card
- Red CTA button
- Warning text

---

### 5. **Order Confirmation Template**
```typescript
getOrderConfirmationTemplate(
  orderId: string,
  name: string,
  items: any[],
  totalPrice: number,
  shippingAddress: any
)
```

**Use Cases:**
- Quick order confirmations
- Simplified receipts

**Note:** This is a wrapper around `getOrderInvoiceTemplate`

---

## 🎨 Email Design Specifications

### Colors
```css
Background: #FFFDF5 (Cream)
Container: #FFFFFF (White)
Header: #FFD93D (Yellow)
Badge: #FF7675 (Pink) or #6C5CE7 (Purple)
Message Card: #DDFFF7 (Mint Green)
CTA Button: #A29BFE (Light Purple) or #FF7675 (Pink)
Footer: #000000 (Black)
Text: #000000 (Black)
```

### Typography
```css
Font Family: 'Space Grotesk', sans-serif
Headers: 800 weight, uppercase
Body: 400-500 weight
CTAs: 800 weight, uppercase
Footer: 700 weight, uppercase
```

### Borders & Shadows
```css
Border: 3-4px solid #000000
Box Shadow: 8-12px 8-12px 0px #000000
```

---

## 📱 Responsive Design

All templates are mobile-responsive:
- Max-width: 600px
- Centered layout
- Readable font sizes
- Touch-friendly buttons (min 44px height)

---

## 🛠️ Usage Examples

### Send General Notification
```typescript
import { sendEmail } from '@/lib/email-service';
import { getBaseEmailTemplate } from '@/lib/email-templates';

const html = getBaseEmailTemplate(
  'Welcome to Joy Juncture!',
  'Start your gaming journey today.\n\nExplore 14+ games and earn rewards!'
);

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Joy Juncture!',
  html
});
```

### Send Order Confirmation
```typescript
import { getOrderInvoiceTemplate } from '@/lib/email-templates';

const html = getOrderInvoiceTemplate({
  id: 'ORD123',
  createdAt: new Date(),
  items: [
    { name: 'Catan Board Game', quantity: 1, price: 2499 },
    { name: 'Chess Set', quantity: 2, price: 799 }
  ],
  totalPrice: 4097,
  subtotal: 4097,
  gst: 0,
  gstRate: 0,
  shippingAddress: {
    name: 'Rahul Sharma',
    address: '123 MG Road',
    city: 'Mumbai',
    postalCode: '400001'
  }
});

await sendEmail({
  to: 'user@example.com',
  subject: 'Order Confirmed - #ORD123',
  html
});
```

### Send Event Ticket
```typescript
import { getEventConfirmationTemplate } from '@/lib/email-templates';

const html = getEventConfirmationTemplate(
  'REG123456',
  'Rahul',
  'Chess Tournament 2026',
  '2026-01-20T18:00:00',
  'Gaming Arena, Mumbai',
  500
);

await sendEmail({
  to: 'user@example.com',
  subject: 'Ticket Confirmed: Chess Tournament 2026',
  html
});
```

### Send Password Reset
```typescript
import { getPasswordResetTemplate } from '@/lib/email-templates';

const resetLink = 'https://joy-juncture.com/reset-password?token=abc123';
const html = getPasswordResetTemplate('Rahul', resetLink);

await sendEmail({
  to: 'user@example.com',
  subject: 'Reset Your Password - Joy Juncture',
  html
});
```

---

## ✅ Email Best Practices

### DO ✅
- Use descriptive subject lines
- Include clear CTAs
- Add unsubscribe links (for marketing)
- Test on multiple email clients
- Keep HTML under 102KB
- Use inline CSS (for compatibility)
- Include plain text fallback

### DON'T ❌
- Use JavaScript (not supported)
- Rely on external CSS files
- Use forms (not supported)
- Exceed 600px width
- Use too many images
- Forget alt text for images

---

## 🧪 Testing

### Test Locally
```typescript
// Generate HTML
const html = getBaseEmailTemplate('Test', 'This is a test');

// Save to file
import fs from 'fs';
fs.writeFileSync('test-email.html', html);

// Open in browser to preview
```

### Test Email Clients
- Gmail (Web, Mobile)
- Outlook (Desktop, Web)
- Apple Mail (Mac, iOS)
- Yahoo Mail
- ProtonMail

### Tools
- [Litmus](https://litmus.com/) - Email testing
- [Email on Acid](https://www.emailonacid.com/) - Compatibility testing
- [MailTrap](https://mailtrap.io/) - Development testing

---

## 🎨 Customization

### Modify Colors
Edit `email-templates.ts`:

```typescript
// Change header color
.header {
  background-color: #YOUR_COLOR;
}

// Change CTA button
.btn {
  background-color: #YOUR_COLOR;
}
```

### Add New Template
```typescript
export const getCustomTemplate = (param1: string, param2: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          /* Your styles */
        </style>
      </head>
      <body>
        <!-- Your content -->
      </body>
    </html>
  `;
};
```

---

## 📊 Email Analytics

Track email performance:
- Open rates
- Click-through rates
- Bounce rates
- Unsubscribe rates

**Recommended Tools:**
- SendGrid Analytics
- Mailgun Analytics
- Custom tracking pixels

---

## 🔒 Security & Compliance

### GDPR Compliance
- Include unsubscribe link
- Respect user preferences
- Store consent records
- Allow data deletion

### CAN-SPAM Compliance
- Include physical address
- Clear "From" name
- Accurate subject lines
- Easy unsubscribe

### Data Protection
- Don't include sensitive data
- Use secure links (HTTPS)
- Encrypt personal information
- Follow data retention policies

---

## 📈 Performance Optimization

### Reduce Email Size
- Inline critical CSS only
- Optimize images (use CDN)
- Minify HTML
- Remove unused styles

### Improve Deliverability
- Authenticate domain (SPF, DKIM, DMARC)
- Use reputable email service
- Avoid spam trigger words
- Maintain clean email list

---

## 🌍 Internationalization

For multi-language support:

```typescript
export const getBaseEmailTemplate = (
  subject: string,
  message: string,
  lang: string = 'en'
) => {
  const translations = {
    en: {
      footer: 'THE ULTIMATE PLAYGROUND',
      cta: 'Explore More Fun'
    },
    hi: {
      footer: 'अंतिम खेल का मैदान',
      cta: 'और मज़ा देखें'
    }
  };
  
  const t = translations[lang] || translations.en;
  
  // Use t.footer, t.cta in template
};
```

---

## ✅ Email Template Checklist

Before sending:
- [ ] Subject line is clear and compelling
- [ ] Preview text is set
- [ ] All links work (test them!)
- [ ] Images have alt text
- [ ] Mobile responsive
- [ ] Tested on major email clients
- [ ] Unsubscribe link included (if marketing)
- [ ] Company info in footer
- [ ] No spelling/grammar errors
- [ ] CTA is clear and prominent

---

**All email templates are production-ready and brand-consistent!** 📧✨
