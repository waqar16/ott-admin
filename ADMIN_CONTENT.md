# Admin Content Management

## Overview

The Admin Content Management system provides administrators with a powerful interface to control content visibility and demo access flags. This feature is essential for managing landing page funnels, free trial content, and public previews to maximize user conversion and engagement.

## Features

### 🎛️ Content Control Flags

**1. Visible Without Signup**
- Controls whether content appears on landing pages and previews for non-authenticated users
- Ideal for showcasing your best content to drive signups
- Recommendation: Enable on 3-5 popular, high-quality titles

**2. Demo Content**
- Marks content as free sample that can be watched without a subscription
- Perfect for giving users a taste of your platform
- Recommendation: Enable on 2-3 representative titles across different genres

### 📊 Admin Dashboard

- **Statistics Overview**: View total titles, visible content, demo content, kids titles, and immersive VR content
- **Filtering**: Filter by all titles, visible without signup, demo content, or kids content
- **Individual Toggles**: Quick toggle switches for each title
- **Bulk Actions**: Select multiple titles and update flags simultaneously
- **Search & Sort**: Find specific titles quickly

### 🔒 Security

- Protected routes requiring authentication
- Session-based access control via NextAuth
- Middleware protection for all `/admin` routes

## File Structure

```
web/
├── app/
│   ├── admin/
│   │   └── content/
│   │       └── page.tsx              # Admin content management UI
│   └── api/
│       └── admin/
│           └── content/
│               └── route.ts          # Admin API endpoints
├── components/
│   └── Header.tsx                    # Updated with Admin link
├── middleware.ts                     # Route protection
└── app/api/catalog/route.ts          # Updated CatalogTitle interface
```

## API Endpoints

### GET /api/admin/content

**Purpose:** Fetch all titles with admin flags and statistics

**Authentication:** Required (NextAuth session)

**Response:**
```json
{
  "titles": [
    {
      "id": "1",
      "title": "Cosmic Odyssey",
      "type": "movie",
      "genre": ["Sci-Fi", "Adventure"],
      "year": 2024,
      "contentType": "all",
      "requiredMembership": "FULL",
      "visibleWithoutSignup": true,
      "isDemoContent": false,
      ...
    }
  ],
  "total": 12,
  "stats": {
    "totalTitles": 12,
    "visibleWithoutSignup": 3,
    "demoContent": 2,
    "kidsTitles": 5,
    "immersiveTitles": 6
  }
}
```

### PATCH /api/admin/content

**Purpose:** Update a single title's flags

**Authentication:** Required

**Request Body:**
```json
{
  "id": "1",
  "visibleWithoutSignup": true,
  "isDemoContent": false
}
```

**Response:**
```json
{
  "success": true,
  "title": { ... },
  "message": "Title updated successfully"
}
```

### POST /api/admin/content

**Purpose:** Bulk update multiple titles

**Authentication:** Required

**Request Body:**
```json
{
  "ids": ["1", "2", "3"],
  "visibleWithoutSignup": true,
  "isDemoContent": false
}
```

**Response:**
```json
{
  "success": true,
  "updatedCount": 3,
  "message": "3 title(s) updated successfully"
}
```

### DELETE /api/admin/content

**Purpose:** Reset all flags to defaults (for testing)

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "All title flags reset to defaults"
}
```

## Data Model

### Updated CatalogTitle Interface

```typescript
export interface CatalogTitle {
  id: string;
  title: string;
  type: 'movie' | 'series';
  genre: string[];
  year: number;
  duration?: number;
  seasons?: number;
  episodes?: number;
  rating: string;
  imdbRating: number;
  description: string;
  thumbnail: string;
  banner: string;
  trailer: string;
  formats: string[];
  isImmersive: boolean;
  director?: string;
  creator?: string;
  cast: string[];
  previewImages: string[];
  contentType: 'kids' | 'all';
  requiredMembership: 'FREE' | 'KIDS' | 'FULL';
  
  // Admin flags
  visibleWithoutSignup?: boolean;  // Show on landing pages
  isDemoContent?: boolean;         // Free sample content
}
```

## Landing Funnel Strategy

### Understanding the Impact

**Visible Without Signup** affects:
- Landing page content previews
- Search engine indexing (if public)
- Social media sharing previews
- Marketing material generation
- Non-authenticated user experience

**Demo Content** affects:
- Free trial value proposition
- Conversion funnel optimization
- User onboarding experience
- Content sampling strategy
- Upgrade prompts and positioning

### Recommended Strategy

#### Phase 1: Awareness (Visible Without Signup)
```
Goal: Attract visitors and showcase quality

✅ Enable on 3-5 titles:
- Your highest-rated content (8.0+ IMDb)
- Popular genres in your target market
- Visually impressive content (good thumbnails)
- Recently released titles
- Award-winning content

❌ Don't enable on:
- Mature/adult content
- Niche titles with limited appeal
- Lower-quality content
- Content requiring context from previous episodes
```

#### Phase 2: Engagement (Demo Content)
```
Goal: Convert visitors to registered users

✅ Mark as demo (2-3 titles):
- Representative of your catalog diversity
- Complete standalone experiences (movies or pilot episodes)
- High production value
- Accessible to broad audiences
- Short to medium length (60-120 mins)

❌ Don't mark as demo:
- Your absolute best content (save for paid tiers)
- Series finales or cliffhangers
- Content requiring subscription-only features
- Niche content for specific memberships
```

#### Phase 3: Conversion (Upgrade Prompts)
```
Goal: Convert free users to paying subscribers

After demo content:
- Show related premium content
- Display upgrade benefits
- Offer limited-time promotions
- Highlight exclusive features
```

### Example Configuration

```typescript
// High-value landing page content
{
  title: "Cosmic Odyssey",
  visibleWithoutSignup: true,  // Show in previews
  isDemoContent: false,        // Require signup to watch
  requiredMembership: "FULL"   // Require paid subscription
}

// Free trial content
{
  title: "Dinosaur Island",
  visibleWithoutSignup: true,  // Show in previews
  isDemoContent: true,         // Free to watch
  requiredMembership: "FREE"   // No subscription needed
}

// Premium exclusive
{
  title: "Neon City Chronicles",
  visibleWithoutSignup: false, // Hidden until signup
  isDemoContent: false,        // Not free
  requiredMembership: "FULL"   // Paid only
}
```

## Admin Page Features

### Statistics Dashboard

Displays real-time metrics:
- **Total Titles**: All content in catalog
- **Visible Publicly**: Content shown to non-authenticated users
- **Demo Content**: Free sample content count
- **Kids Titles**: Child-appropriate content
- **Immersive VR**: VR/360° content count

### Content Table

**Columns:**
- Checkbox for bulk selection
- Title with thumbnail and year
- Type (movie/series)
- Content type (kids/all)
- Membership requirement
- Visible without signup toggle
- Demo content toggle
- Actions (view title)

**Features:**
- Sortable and filterable
- Individual toggle switches
- Bulk selection (select all/deselect all)
- Responsive design
- Visual feedback on selection

### Bulk Actions

**Available Actions:**
- Set Visible: Mark selected titles as visible without signup
- Set Hidden: Hide selected titles from public view
- Mark as Demo: Enable demo content flag for selected titles
- Unmark Demo: Disable demo content flag
- Reset All Flags: Reset all titles to default state (confirmation required)

### Filtering Options

- **All Titles**: Show complete catalog
- **Visible Without Signup**: Show only publicly visible titles
- **Demo Content**: Show only demo/free sample content
- **Kids Content**: Show only kid-appropriate content

## Usage Guide

### Initial Setup

1. **Navigate to Admin Panel**
   ```
   /admin/content
   ```

2. **Review Statistics**
   - Check current state of all flags
   - Identify content distribution

3. **Set Landing Page Content**
   - Filter by your best content
   - Enable "Visible Without Signup" on 3-5 titles
   - Choose diverse genres and types

4. **Configure Demo Content**
   - Select 2-3 representative titles
   - Enable "Demo Content" flag
   - Ensure they're also visible without signup

### Daily Operations

**Adding New Content:**
1. Upload title to catalog
2. Access admin panel
3. Locate new title
4. Set appropriate flags based on strategy
5. Monitor conversion metrics

**Seasonal Campaigns:**
1. Use bulk actions to adjust visibility
2. Highlight seasonal content
3. Rotate demo content periodically
4. Track engagement and conversions

**A/B Testing:**
1. Set different titles as demo content
2. Monitor signup conversion rates
3. Analyze user engagement
4. Optimize flag settings

## Security & Access Control

### Route Protection

**Middleware Implementation:**
```typescript
// middleware.ts
const isAdminRoute = pathname.startsWith('/admin');

if (!token && !isPublicRoute) {
  return NextResponse.redirect(signInUrl);
}
```

### API Authentication

All admin API endpoints check for valid session:
```typescript
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Production Recommendations

1. **Role-Based Access Control (RBAC)**
   ```typescript
   interface User {
     id: string;
     role: 'admin' | 'editor' | 'user';
   }
   
   // Check if user has admin role
   if (session.user.role !== 'admin') {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
   }
   ```

2. **Audit Logging**
   ```typescript
   interface AdminAction {
     userId: string;
     action: 'update' | 'bulk_update' | 'reset';
     titleIds: string[];
     changes: Record<string, any>;
     timestamp: Date;
     ipAddress: string;
   }
   ```

3. **Rate Limiting**
   ```typescript
   // Limit bulk operations to prevent abuse
   - Max 50 titles per bulk action
   - Max 10 bulk actions per minute
   - Track by user session
   ```

## In-Memory Storage

### Current Implementation

The API uses in-memory storage for title flag updates:

```typescript
let titlesCache: CatalogTitle[] = catalogData.titles.map((title) => ({
  ...title,
  visibleWithoutSignup: title.visibleWithoutSignup ?? false,
  isDemoContent: title.isDemoContent ?? false,
}));
```

**Advantages:**
- Fast read/write operations
- No database setup required
- Perfect for development and testing
- Simple implementation

**Limitations:**
- Data lost on server restart
- Not suitable for production
- No persistence across deploys
- Limited to single server instance

### Production Migration

**Database Schema (PostgreSQL example):**
```sql
CREATE TABLE catalog_titles (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20),
  visible_without_signup BOOLEAN DEFAULT false,
  is_demo_content BOOLEAN DEFAULT false,
  -- ... other fields
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(50)
);

CREATE INDEX idx_visible ON catalog_titles(visible_without_signup);
CREATE INDEX idx_demo ON catalog_titles(is_demo_content);
```

**Migration Steps:**
1. Set up database (PostgreSQL, MySQL, MongoDB)
2. Create catalog_titles table
3. Replace in-memory cache with database queries
4. Add migrations for schema updates
5. Implement connection pooling
6. Add caching layer (Redis) for performance

## Testing Checklist

- [ ] Admin route requires authentication
- [ ] Unauthenticated users redirected to signin
- [ ] Statistics display correctly
- [ ] Individual toggles update immediately
- [ ] Bulk selection works (select all/deselect all)
- [ ] Bulk actions update multiple titles
- [ ] Filter dropdown shows correct counts
- [ ] Filtering works for all options
- [ ] Reset confirmation dialog appears
- [ ] Reset clears all flags
- [ ] Table displays thumbnails correctly
- [ ] Links to title pages work
- [ ] Responsive design works on mobile
- [ ] API returns proper error codes
- [ ] Session expiry handled gracefully

## Performance Considerations

### Current Performance

- **Load Time**: < 500ms (in-memory)
- **Update Time**: < 100ms per title
- **Bulk Update**: < 300ms for 10 titles

### Optimization for Scale

**With Database:**
- Add indexes on flag columns
- Implement pagination for large catalogs
- Cache statistics separately
- Use optimistic UI updates
- Batch database writes

**Caching Strategy:**
```typescript
// Cache catalog with flags for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

// Invalidate cache on updates
async function invalidateCatalogCache() {
  await redis.del('catalog:admin');
}
```

## Troubleshooting

### Issue: Changes not persisting
**Cause:** Server restart clears in-memory cache  
**Solution:** Implement database persistence

### Issue: Unauthorized errors
**Cause:** Session expired or missing  
**Solution:** Sign in again or check NextAuth configuration

### Issue: Bulk action not working
**Cause:** No titles selected  
**Solution:** Select titles first or use "Select All"

### Issue: Statistics not updating
**Cause:** Cache not refreshed  
**Solution:** Reload page or implement real-time updates

## Related Files

- `app/admin/content/page.tsx` - Admin UI
- `app/api/admin/content/route.ts` - Admin API
- `app/api/catalog/route.ts` - Updated CatalogTitle interface
- `components/Header.tsx` - Navigation with Admin link
- `middleware.ts` - Route protection
- `lib/auth.ts` - Authentication configuration

## Future Enhancements

1. **Analytics Dashboard**
   - Track conversion rates by demo content
   - Monitor signup sources
   - A/B testing results
   - User engagement metrics

2. **Content Scheduling**
   - Schedule visibility changes
   - Automatic rotation of demo content
   - Seasonal campaigns
   - Time-based promotions

3. **Advanced Filtering**
   - Multi-select filters
   - Custom filter combinations
   - Saved filter presets
   - Export filtered results

4. **Bulk Import/Export**
   - CSV import for flag updates
   - Export current configuration
   - Backup and restore
   - Configuration templates

5. **Approval Workflow**
   - Multi-step approval for changes
   - Review queue for updates
   - Change history and rollback
   - Notifications for approvers

## Support

For questions or issues with the admin panel:
1. Check this documentation
2. Verify authentication status
3. Test with small updates first
4. Check browser console for errors
5. Review API response codes
