# BG Platform Super Admin Portal

This is the **Super Admin Platform** for managing the BG Accountability multi-tenant SaaS system.

## Purpose

This application is **ONLY** for platform owners (SUPER_ADMIN role) to:
- Manage tenants (companies/organizations)
- View platform-wide analytics
- Manage subscriptions and billing
- Monitor system health and operations
- Manage platform-level templates
- Handle support tickets across all tenants
- View audit logs and user sessions

## Separation from Tenant App

**CRITICAL:** This app is completely separate from the tenant dashboard.

- **Super Admin URL:** `superadmin.bgapp.com` (production) or `localhost:3001` (dev)
- **Tenant Dashboard URL:** `dashboard.bgapp.com` (production) or `localhost:3000` (dev)

Users with `SUPER_ADMIN` role **cannot** access the tenant dashboard.
Users with tenant roles (`TENANT_ADMIN`, `COACH`, `CLIENT`, etc.) **cannot** access this platform.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **API Client:** Axios
- **Backend:** NestJS API at `http://localhost:3002`

## Development

```bash
# Install dependencies
npm install

# Run development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Routes

Platform admin routes (all require `SUPER_ADMIN` role):

- `/` - Platform dashboard overview
- `/tenants` - Tenant management
- `/tenants/new` - Create new tenant
- `/tenants/[id]` - Tenant details
- `/users` - Platform-wide user management
- `/templates` - Global templates (metrics, outcomes, activities)
- `/support` - Support ticket management (all tenants)
- `/subscriptions` - Subscription & billing management
- `/analytics` - Platform analytics & insights
- `/ops` - System operations (health, backups, logs)
- `/sessions` - User session management
- `/reports` - Platform-wide reporting

## API Integration

Connects to backend endpoints:
- `/api/v1/platform/*` - Platform management
- `/api/v1/super-admin/*` - Super admin operations
- `/api/v1/ops/*` - Operations & health

## Security

- JWT authentication with `SUPER_ADMIN` role check
- All routes protected by role guard
- Separate authentication flow from tenant app
- No cross-tenant data access by design

## Next Steps

1. ✅ Folder structure created
2. ⏳ Install dependencies
3. ⏳ Set up Next.js config files
4. ⏳ Create auth flow for super admin login
5. ⏳ Build platform dashboard UI
6. ⏳ Implement tenant management pages
7. ⏳ Add subscription management
8. ⏳ Build analytics dashboard
9. ⏳ Add operations monitoring
10. ⏳ Deploy to superadmin.bgapp.com

---

**Status:** Initial structure created. Ready for implementation.
