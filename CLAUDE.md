# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bicrypto is a cryptocurrency exchange platform built with Next.js (frontend) and a custom uWebSockets.js backend. The platform supports cryptocurrency trading, P2P exchanges, staking, NFTs, ICO management, forex trading, and more.

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, TailwindCSS
- **Backend**: Custom server using uWebSockets.js, TypeScript
- **Databases**: MySQL (primary), ScyllaDB (ecosystem), Redis (cache)
- **ORM**: Sequelize with TypeScript
- **State Management**: Zustand
- **Process Manager**: PM2
- **Package Manager**: pnpm
- **Linter**: Ultracite (Biome-based)

## Development Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Frontend only (Next.js on port 3000)
pnpm dev:backend      # Backend only (uWebSockets on port 4000)
pnpm dev:thread       # Backend worker thread
pnpm dev:eco:ws       # Ecosystem WebSocket service (TwelveData)

# Building
pnpm build            # Build Next.js frontend
pnpm build:backend    # Build backend TypeScript to dist/
pnpm build:all        # Build both frontend and backend

# Production
pnpm start            # Start both frontend and backend with PM2
pnpm stop             # Stop all PM2 processes

# Database
pnpm seed             # Run all seeders

# Code Quality
pnpm lint             # Run Ultracite linter
pnpm format           # Format with Ultracite
pnpm style            # Fix linting and formatting issues

# Testing
pnpm test             # Run all Jest tests
pnpm test -- path/to/file.test.ts  # Run single test file
```

## Architecture Overview

### Backend Architecture

The backend uses a custom routing system built on uWebSockets.js:

1. **Entry Point**: `index.ts` → Creates `MashServer` instance
2. **Core Server**: `backend/server.ts` → `MashServer` class
3. **Route Discovery**: `backend/handler/Routes.ts` → Auto-discovers routes from `backend/api/`
4. **Request/Response**: Custom wrappers in `backend/handler/`

### File-Based API Routing

Routes are automatically discovered from `backend/api/` directory:

- File naming: `{endpoint}.{method}.ts` where method is `get`, `post`, `put`, `del`, or `ws`
- Dynamic parameters: `[id]` in folder names becomes `:id` in route
- Special files ignored: `utils.ts`, `queries.ts`, `util/` directories, `*.test.*` files

Example structure:
```
backend/api/
  user/
    index.get.ts          → GET /api/user
    [id]/
      index.get.ts        → GET /api/user/:id
      profile.put.ts      → PUT /api/user/:id/profile
  ext/
    ecosystem/
      ticker/
        index.ws.ts       → WebSocket /api/ext/ecosystem/ticker
```

### Route Handler Pattern

Each route file must export `metadata` and a default handler function:

```typescript
import { createError } from "@b/utils/error";

export const metadata: OperationObject = {
  summary: "Description for docs",
  operationId: "uniqueOperationId",
  tags: ["TagName"],
  requiresAuth: true,          // Requires JWT authentication
  requiresApi: false,          // Requires API key verification
  // For role-based access, configure in rolesManager
  responses: {
    200: { description: "Success response" },
  },
};

// Handler receives parsed request data object, not (req, res)
export default async (data: Handler) => {
  const { user, params, query, body } = data;
  
  if (!user?.id) {
    throw createError(401, "Unauthorized");
  }
  
  // Return value is automatically sent as JSON response
  return { success: true, data: result };
};
```

### Module Aliases

```
@/*   → src/*       (frontend)
@b/*  → backend/*   (backend)
@db/* → models/*    (database models)
```

### Database Models

Sequelize models in `models/` directory. Access via:
```typescript
import { models } from "@b/db";

const user = await models.user.findByPk(id);
```

Key models: `user`, `wallet`, `exchangeOrder`, `transaction`, `ecosystemToken`, `ecosystemMarket`, `nftAsset`, `p2pOffer`, `p2pTrade`

### Frontend Architecture

Next.js application in `src/`:
- **Pages**: `src/pages/` - File-based routing
- **Components**: `src/components/` - Reusable UI
- **Stores**: `src/stores/` - Zustand state (organized by feature)
- **Services**: `src/services/` - API communication
- **Layouts**: `src/layouts/` - Page layouts
- **Hooks**: `src/hooks/` - Custom React hooks

### Key Backend Utilities

Located in `backend/utils/`:
- `cache.ts` - `CacheManager` singleton (Redis-backed)
- `cron.ts` - `CronJobManager` with BullMQ workers
- `logger.ts` - Winston logging
- `query.ts` - Query builder helpers
- `roles.ts` - Role-based access control (`rolesManager`)
- `token.ts` - JWT management
- `validation.ts` - Input validation
- `eco/` - Ecosystem trading engine (ScyllaDB, matching engine)

### Middleware System

Middleware in `backend/handler/Middleware.ts`:
- `authenticate` - JWT verification (triggered by `requiresAuth: true`)
- `rolesGate` - Role/permission checks
- `rateLimit` - API rate limiting
- `handleApiVerification` - API key checks (triggered by `requiresApi: true`)
- `siteMaintenanceAccessGate` - Maintenance mode

### Cron Jobs

Cron jobs use BullMQ workers with Redis. Defined in `backend/utils/cron.ts`:
- Jobs are auto-loaded based on enabled extensions
- Only main thread initializes cron workers
- Each job has: `name`, `title`, `period` (ms), `description`, `function`

Add new cron jobs in `backend/utils/crons/` and register in `CronJobManager`.

### Server Initialization Flow

1. Load environment variables
2. Initialize database connections (MySQL, ScyllaDB, Redis)
3. Setup role-based access control
4. Auto-discover and register API routes
5. Initialize cron jobs (main thread only)
6. Setup ecosystem (matching engine, ScyllaDB)
7. Start TwelveData bridge for market data

## Important Patterns

### Error Handling

```typescript
import { createError } from "@b/utils/error";

// Throw errors with status codes
throw createError(404, "Resource not found");
throw createError(400, "Invalid input");
```

### Database Queries with Cache

```typescript
import { CacheManager } from "@b/utils/cache";

const cache = CacheManager.getInstance();
const cached = await cache.get("key");
if (!cached) {
  const data = await models.user.findAll();
  await cache.set("key", JSON.stringify(data), "EX", 300);
}
```

### WebSocket Endpoints

Create `*.ws.ts` files for WebSocket routes:
```typescript
export const metadata = {
  summary: "WebSocket endpoint",
  requiresAuth: true,
};

// WebSocket handlers use different pattern - see backend/handler/Websocket.ts
```

## Common Gotchas

1. **Route metadata is required** - Every route file must export `metadata` object
2. **Handler returns data directly** - Don't call `res.json()`, just return the data
3. **Module aliases required** - Always use `@b/`, `@db/`, `@/` imports
4. **Port defaults** - Frontend: 3000, Backend: 4000
5. **Environment variables** - Frontend vars must be prefixed with `NEXT_PUBLIC_`
6. **uWebSockets** - Never block the event loop; use async handlers
7. **Route caching** - In development, route handler changes require server restart
8. **Test files** - Use `*.test.ts` pattern, they're excluded from route discovery
