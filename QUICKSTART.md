# Quick Start - Super Admin Platform

## Installation

```powershell
# Navigate to super admin app
cd d:\superadmin-app

# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env
```

## Configuration

Edit `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
NEXT_PUBLIC_APP_NAME="BG Platform Admin"
NEXT_PUBLIC_APP_ENV=development
```

## Run Development Server

```powershell
npm run dev
```

App will run on: http://localhost:3001

## Build for Production

```powershell
npm run build
npm start
```

## Project Structure

```
app/
├── (platform)/          # Platform admin routes
│   ├── layout.tsx       # Shared layout with navigation
│   ├── dashboard/       # Platform overview
│   ├── tenants/         # Tenant management
│   ├── users/           # User management
│   ├── templates/       # Global templates
│   ├── support/         # Support tickets
│   ├── analytics/       # Platform analytics
│   └── ops/             # System operations
├── layout.tsx           # Root layout
├── page.tsx             # Home (redirects to dashboard)
└── globals.css          # Global styles
```

## Next Steps

1. ✅ Dependencies installed
2. ⏳ Implement authentication
3. ⏳ Create API client for platform endpoints
4. ⏳ Build tenant management UI
5. ⏳ Add subscription management
6. ⏳ Implement analytics dashboard
7. ⏳ Add operations monitoring

## Development Workflow

### All 3 Services Running:

```powershell
# Terminal 1: Backend (NestJS)
cd D:\BGAccountabiityapp
npm run start:dev
# Port: 3002

# Terminal 2: Tenant App (Next.js)
cd D:\bridge-gaps-dashboard-main
npm run dev
# Port: 3000

# Terminal 3: Super Admin App (Next.js)
cd D:\superadmin-app
npm run dev
# Port: 3001
```

## Testing

### Super Admin Login (To Implement):
- Email: superadmin@bg.com
- Password: SuperAdmin123!
- Role: SUPER_ADMIN
- TenantID: null

### Expected Features:
- View all tenants
- Create new tenants
- Manage subscriptions
- View platform analytics
- Monitor system health
- Manage support tickets
- View audit logs

## Integration Points

### Backend Endpoints to Use:
- `/api/v1/platform/tenants` - Tenant CRUD
- `/api/v1/super-admin/users` - User management
- `/api/v1/super-admin/analytics` - Platform stats
- `/api/v1/super-admin/logs` - Audit logs
- `/api/v1/ops/health` - System health
- `/api/v1/templates/*` - Templates

## Security

### Role Check:
```typescript
// Only SUPER_ADMIN allowed
if (user?.role !== 'SUPER_ADMIN') {
  redirect to tenant app
}
```

### API Authorization:
```typescript
// All requests require Bearer token
headers: {
  Authorization: `Bearer ${accessToken}`
}
```

## Deployment

### Production URLs:
- Platform: https://superadmin.bgapp.com
- API: https://api.bgapp.com

### Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://api.bgapp.com/api/v1
NEXT_PUBLIC_APP_ENV=production
```

---

**Status:** Structure ready, awaiting implementation  
**Port:** 3001  
**Backend:** localhost:3002
