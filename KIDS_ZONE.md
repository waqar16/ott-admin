# Kids Zone Feature

## Overview

The Kids Zone is a safe, curated content area for children with simplified UI, parental controls, and age-appropriate content filtering. This feature provides a kid-friendly browsing experience while maintaining security through parental PIN protection.

## Features

### 🎨 Simplified User Interface
- **Large Thumbnails**: Big, easy-to-click content cards optimized for children
- **Colorful Design**: Bright gradient backgrounds (yellow → pink → purple)
- **Emoji Icons**: Fun visual elements throughout the interface
- **Simple Navigation**: Minimal menu options to avoid confusion
- **Clear Typography**: Large, readable fonts for young readers

### 🔒 Parental Controls
- **PIN Protection**: 4-digit PIN required to exit Kids Zone
- **Secure Exit**: ParentalPIN modal prevents unauthorized access to main catalog
- **Visual Feedback**: Error messages and validation for PIN entry
- **Keyboard Support**: Full keyboard navigation and paste support

### 📺 Content Curation
- **Kids-Only Content**: Filtered catalog showing only `contentType: "kids"` titles
- **Age Ratings**: All content displays G, TV-Y, or TV-Y7 ratings
- **Search Functionality**: Kid-friendly search with clear results
- **No Inappropriate Content**: Adult content and features are completely hidden

### 🚫 Disabled Features in Kids Zone
- **Comments**: No comment sections or user-generated content
- **User Uploads**: Upload functionality disabled
- **Complex Navigation**: Simplified header with basic links only
- **Adult Content**: Completely filtered out
- **Advanced Settings**: No access to account settings from Kids Zone

## File Structure

```
web/
├── app/
│   └── kids-zone/
│       └── page.tsx              # Kids Zone main page
├── components/
│   ├── ParentalPIN.tsx          # PIN modal component
│   ├── Header.tsx               # Updated with Kids Zone link
│   └── index.ts                 # Export barrel
├── lib/
│   ├── data/
│   │   └── catalog.json         # Updated with kids flag
│   └── types.ts                 # Type definitions
└── middleware.ts                # Route protection
```

## Component Details

### ParentalPIN Component

**Location:** `components/ParentalPIN.tsx`

**Purpose:** Modal dialog for parental PIN verification

**Props:**
```typescript
interface ParentalPINProps {
  isOpen: boolean;              // Control modal visibility
  onClose: () => void;          // Cancel callback
  onSuccess: () => void;        // Success callback
  correctPIN?: string;          // PIN to verify (default: "1234")
  title?: string;               // Modal title
  description?: string;         // Modal description
}
```

**Features:**
- 4-digit PIN input with auto-focus
- Keyboard navigation (arrows, backspace, enter)
- Paste support for PIN codes
- Error handling with visual feedback
- Loading state during verification
- Accessible with ARIA labels

**Usage:**
```tsx
import { ParentalPIN } from '@/components/ParentalPIN';

<ParentalPIN
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => router.push('/catalog')}
  correctPIN="1234"
  title="Exit Kids Zone"
  description="Enter the parental PIN to continue"
/>
```

### Kids Zone Page

**Location:** `app/kids-zone/page.tsx`

**Features:**
- Fetches kids content from catalog API with `contentType=kids` filter
- Displays content in large thumbnail grid (2-5 columns responsive)
- Search functionality with real-time filtering
- Colorful, playful design with gradients and emojis
- Exit button triggering ParentalPIN modal
- Loading state with animated balloon emoji

**Layout:**
```
┌─────────────────────────────────────┐
│  Kids Zone Header (🎨 + Exit Btn)  │
├─────────────────────────────────────┤
│        Search Bar (🔍)              │
├─────────────────────────────────────┤
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │
│  │ 📺│ │ 📺│ │ 📺│ │ 📺│ │ 📺│    │
│  └───┘ └───┘ └───┘ └───┘ └───┘    │
│  Content Grid (Large Thumbnails)    │
├─────────────────────────────────────┤
│     Footer (🌟🎈🎨🎪🎭)            │
└─────────────────────────────────────┘
```

## Data Structure

### Catalog Titles with Kids Flag

**Location:** `lib/data/catalog.json`

Each title includes:
```json
{
  "id": "3",
  "title": "Magical Forest Adventures",
  "contentType": "kids",        // ← Kids flag
  "rating": "TV-Y",              // Age-appropriate rating
  "genre": ["Animation", "Kids", "Fantasy"],
  "requiredMembership": "FREE"   // Membership level
}
```

**Kids Content Titles (5 total):**
1. **Magical Forest Adventures** (Series, TV-Y, FREE)
2. **Dinosaur Island** (Movie, G, FREE)
3. **Ocean Explorers** (Series, TV-Y, FREE)
4. **Super Space Heroes** (Series, TV-Y7, KIDS)

## Routing & Protection

### Middleware Protection

**Location:** `middleware.ts`

The `/kids-zone` route is protected and requires:
- User authentication (via NextAuth)
- **KIDS** or **FULL** membership tier
- FREE tier users are redirected to `/billing`

```typescript
// Kids Zone route (require KIDS or FULL membership)
if (pathname.startsWith('/kids-zone')) {
  if (membershipType === MembershipType.FREE) {
    return NextResponse.redirect(new URL('/billing', request.url));
  }
}
```

### Navigation

**Location:** `components/Header.tsx`

Kids Zone link added to navigation:
```typescript
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/kids-zone', label: 'Kids Zone', icon: '🎨' },
  { href: '/billing', label: 'Plans' },
];
```

## API Integration

### Catalog API Filtering

**Endpoint:** `GET /api/catalog?contentType=kids`

**Query Parameters:**
- `contentType=kids` - Filter for kids content only
- `pageSize=50` - Number of results to return
- `page=1` - Pagination page number

**Response:**
```json
{
  "titles": [...],
  "total": 5,
  "page": 1,
  "pageSize": 50,
  "hasMore": false
}
```

## Security Considerations

### Current Implementation (Development)
- Default PIN: `1234` (hardcoded for demo)
- Client-side PIN verification
- PIN visible in footer for testing

### Production Recommendations

1. **Store PINs Securely**
   ```typescript
   // Store hashed PIN in database per user/account
   interface UserProfile {
     parentalPINHash: string;
     saltRounds: number;
   }
   ```

2. **Server-Side Verification**
   ```typescript
   // Create API endpoint for PIN verification
   POST /api/parental-pin/verify
   {
     "pin": "1234",
     "userId": "user123"
   }
   ```

3. **Rate Limiting**
   ```typescript
   // Limit PIN attempts to prevent brute force
   - Max 5 attempts per 15 minutes
   - Lockout after 10 failed attempts
   - Alert parent via email
   ```

4. **Session Management**
   ```typescript
   // Set session flag when entering Kids Zone
   - Kids mode cookie/session flag
   - Auto-expire after inactivity
   - Re-verify PIN for sensitive actions
   ```

5. **Audit Logging**
   ```typescript
   // Log all Kids Zone exits
   interface KidsZoneLog {
     timestamp: Date;
     userId: string;
     action: 'enter' | 'exit' | 'failed_pin';
     ipAddress: string;
   }
   ```

## Membership Tiers & Access

| Tier | Access | Device Limit |
|------|--------|--------------|
| **FREE** | ❌ No access | 1 device |
| **KIDS** | ✅ Full access | 2 devices |
| **FULL** | ✅ Full access | 5 devices |

## Styling & Design

### Color Palette
- **Background**: Gradient from yellow-100 → pink-100 → purple-100
- **Header**: Gradient from purple-500 → pink-500 → yellow-500
- **Accent**: Purple-600, Pink-500
- **Cards**: White with shadow
- **Hover**: Scale transform + shadow increase

### Typography
- **Headings**: Bold, large sizes (3xl - 5xl)
- **Body**: Clear, readable sizes (base - lg)
- **Ratings**: Badge with colored background

### Responsive Breakpoints
```css
/* Mobile: 2 columns */
grid-cols-2

/* Tablet: 3 columns */
md:grid-cols-3

/* Desktop: 4 columns */
lg:grid-cols-4

/* Large Desktop: 5 columns */
xl:grid-cols-5
```

## Testing Checklist

- [ ] Kids Zone accessible with KIDS membership
- [ ] Kids Zone accessible with FULL membership
- [ ] FREE tier redirected to billing page
- [ ] Only kids content displayed
- [ ] Search filters work correctly
- [ ] PIN modal opens on exit button click
- [ ] Correct PIN (1234) allows exit
- [ ] Incorrect PIN shows error message
- [ ] PIN input supports keyboard navigation
- [ ] PIN input supports paste
- [ ] Mobile responsive layout works
- [ ] Large thumbnails display correctly
- [ ] Content cards link to title detail pages
- [ ] Navigation shows Kids Zone link with icon
- [ ] Loading state displays during fetch

## Future Enhancements

1. **Viewing Time Limits**
   - Set daily/weekly time limits per child
   - Display remaining time in header
   - Gentle reminders before limit reached

2. **Multiple Child Profiles**
   - Separate profiles per child
   - Customized content preferences
   - Individual viewing history

3. **Progress Tracking**
   - Resume watching functionality
   - "Continue Watching" section
   - Episode progress indicators

4. **Educational Content Tags**
   - Filter by educational topics
   - Age-specific recommendations
   - Learning goals and achievements

5. **Parental Dashboard**
   - View watch history
   - Content recommendations
   - Usage reports and statistics

6. **Offline Mode**
   - Download content for offline viewing
   - Sync watch progress
   - Manage downloads

## Troubleshooting

### Issue: Kids Zone not accessible
**Solution:** Check user's membership tier. FREE tier does not have access. Upgrade to KIDS or FULL.

### Issue: PIN not working
**Solution:** Default demo PIN is `1234`. In production, this should be user-configurable.

### Issue: No content showing
**Solution:** Verify catalog.json has titles with `"contentType": "kids"`. At least 5 titles should be marked.

### Issue: Exit button not working
**Solution:** Check that ParentalPIN component is imported and modal state is managed correctly.

## Related Files

- `app/kids-zone/page.tsx` - Kids Zone main page
- `components/ParentalPIN.tsx` - PIN modal component
- `components/Header.tsx` - Navigation with Kids Zone link
- `lib/data/catalog.json` - Content data with kids flag
- `app/api/catalog/route.ts` - Catalog API with filtering
- `middleware.ts` - Route protection
- `lib/auth.ts` - Membership types
- `lib/types.ts` - TypeScript interfaces

## Support & Maintenance

For questions or issues with the Kids Zone feature:
1. Check this README for documentation
2. Review the TypeScript errors (expected until `pnpm install`)
3. Test with demo PIN: `1234`
4. Verify membership tier requirements
5. Check browser console for API errors
