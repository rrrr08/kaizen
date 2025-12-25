# Error & Loading Pages Quick Reference

## Error Pages Overview

### Global Error Pages
| Page | Path | Triggers | Actions |
|------|------|----------|---------|
| Root Error | `app/error.tsx` | Unhandled errors | Try Again, Home |
| Not Found | `app/not-found.tsx` | Invalid routes | Shop, Events, Wallet, Community, Home |
| Server Error | `app/500.tsx` | Server issues | Try Again, Home |

### Section Error Pages
| Section | Path | Triggers | Actions |
|---------|------|----------|---------|
| Events | `app/events/error.tsx` | Event load fail | Try Again, Back to Events, Home |
| Shop | `app/shop/error.tsx` | Product load fail | Try Again, Back to Shop, Home |
| Checkout | `app/checkout/error.tsx` | Checkout fail | Try Again, Back to Shop, Home |
| Blog | `app/blog/error.tsx` | Blog load fail | Try Again, Back to Blog, Home |
| Community | `app/community/error.tsx` | Community fail | Try Again, Back to Community, Home |
| Wallet | `app/wallet/error.tsx` | Wallet fail | Try Again, Back to Wallet, Home |
| Orders | `app/orders/error.tsx` | Orders fail | Try Again, Back to Orders, Home |
| Cart | `app/cart/error.tsx` | Cart fail | Try Again, Back to Shop, Home |
| API | `app/api/error.tsx` | API error | Try Again, Home |

---

## Loading Pages Overview

### Loading State Pages
| Section | Path | Displays |
|---------|------|----------|
| Shop | `app/shop/loading.tsx` | 8 product skeleton cards |
| Events | `app/events/loading.tsx` | 6 event skeleton cards |
| Blog | `app/blog/loading.tsx` | 3 blog post skeletons |
| Community | `app/community/loading.tsx` | 6 community item skeletons |
| Checkout | `app/checkout/loading.tsx` | Form + order summary skeletons |
| Wallet | `app/wallet/loading.tsx` | Balance + transaction skeletons |
| Orders | `app/orders/loading.tsx` | 5 order item skeletons |

---

## Component Updates

### Error Boundary
- **Location**: `components/ErrorBoundary.tsx`
- **Usage**: Wraps root layout
- **Shows**: Error page on component crash
- **Features**: Dev error details, refresh button

### Event Registration Form
- **Location**: `components/EventRegistrationForm.tsx`
- **Updates**: 
  - Added `showErrorModal` state
  - Added error modal component
  - Shows validation errors
  - Shows payment errors
  - Dismissible error display

---

## How to Use

### To View Error Page
1. **Events Error**: Disable Firebase → try loading events
2. **Shop Error**: Disable product API → try loading shop
3. **Checkout Error**: Disconnect network → try checkout
4. **Any Error**: Trigger intentional error in component

### To View Loading State
1. **Shop Loading**: `app/shop/loading.tsx`
2. **Events Loading**: `app/events/loading.tsx`
3. Use DevTools network throttling to see loading states

### To View Error Boundary
1. Introduce intentional error in React component
2. Error Boundary catches it
3. Shows error page instead of crash

---

## Customization

### To Add New Error Page
```bash
# Create new error page
touch app/[section]/error.tsx

# Copy content from existing error page
# Update: title, messages, navigation links
```

### To Add New Loading State
```bash
# Create new loading page
touch app/[section]/loading.tsx

# Design skeleton layout
# Use Skeleton components from components/ui/skeleton
```

---

## Design Specifications

### Error Page Layout
```
┌─────────────────────────────┐
│      [Icon with glow]       │
├─────────────────────────────┤
│  Main Title (e.g., "Oops!") │
│  Subtitle message           │
│  [Error details - dev only] │
├─────────────────────────────┤
│  • Issue 1                  │
│  • Issue 2                  │
│  • Issue 3                  │
├─────────────────────────────┤
│ [Try Again] [Back] [Home]   │
└─────────────────────────────┘
```

### Loading State Layout
```
┌─────────────────────────────┐
│    [Skeleton Header]        │
├─────────────────────────────┤
│  [Skeleton Item 1]          │
│  [Skeleton Item 2]          │
│  [Skeleton Item 3]          │
│  [Skeleton Item 4]          │
├─────────────────────────────┤
│         ...loading...       │
└─────────────────────────────┘
```

---

## Key Features

### Error Pages Include
✅ Red alert icon with glow effect
✅ Clear, non-technical error message
✅ List of possible causes
✅ Error details (development only)
✅ Multiple navigation options
✅ Responsive design
✅ Dark theme styling

### Loading States Include
✅ Skeleton screens matching actual layout
✅ Prevents layout shift
✅ Multiple placeholder items
✅ Professional appearance
✅ Smooth transition to content
✅ Responsive grid layout

### Error Boundary Includes
✅ Global error catching
✅ Component crash prevention
✅ Refresh button
✅ Navigation option
✅ Dev error details

---

## File Checklist

### ✅ Error Pages Created
- [x] `app/events/error.tsx`
- [x] `app/shop/error.tsx`
- [x] `app/checkout/error.tsx`
- [x] `app/blog/error.tsx`
- [x] `app/community/error.tsx`
- [x] `app/wallet/error.tsx`
- [x] `app/orders/error.tsx`
- [x] `app/cart/error.tsx`
- [x] `app/api/error.tsx`
- [x] `app/500.tsx`

### ✅ Loading States Created
- [x] `app/shop/loading.tsx`
- [x] `app/events/loading.tsx`
- [x] `app/blog/loading.tsx`
- [x] `app/community/loading.tsx`
- [x] `app/checkout/loading.tsx`
- [x] `app/wallet/loading.tsx`
- [x] `app/orders/loading.tsx`

### ✅ Components Updated
- [x] `components/ErrorBoundary.tsx` (NEW)
- [x] `components/EventRegistrationForm.tsx` (UPDATED)
- [x] `app/layout.tsx` (UPDATED)

### ✅ Documentation Created
- [x] `docs/ERROR_HANDLING_IMPLEMENTATION.md`
- [x] `docs/ERROR_PAGES_SUMMARY.md`
- [x] Quick Reference (this file)

---

## Integration Status

### ✅ Fully Integrated
- Error Boundary in root layout
- Error pages for all sections
- Loading states for critical pages
- Event registration error modal
- All styling and icons

### Ready for
- User testing
- Error tracking integration (optional)
- Automatic retry logic (optional)
- Support contact forms (optional)

---

## Version Info
- **Created**: December 23, 2025
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Status**: Complete & Integrated

---

## Support

For questions or customization:
1. Check `docs/ERROR_HANDLING_IMPLEMENTATION.md`
2. Review error page templates in `app/*/error.tsx`
3. Check loading templates in `app/*/loading.tsx`
4. See ErrorBoundary in `components/ErrorBoundary.tsx`
