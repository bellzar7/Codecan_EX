# Phase 1 Complete: Database Layer & Migrations

## ✅ What Was Created

### 1. Migrations (migrations/)

All migrations follow Sequelize CLI conventions and are properly sequenced:

**`migrations/20251110000001-add-twd-paper-wallet-type.js`**
- Adds `TWD_PAPER` to wallet type ENUM
- Includes rollback to remove TWD_PAPER type

**`migrations/20251110000002-create-twd-provider.js`**
- Creates `twd_provider` table
- Fields: id, name, title, status, timestamps
- Indexes: unique on `name`

**`migrations/20251110000003-create-twd-market.js`**
- Creates `twd_market` table
- Fields: id, symbol, type (forex/stocks/indices), name, currency, pair, exchange, metadata, isTrending, isHot, status, timestamps
- Indexes: unique on `symbol`, indexed on `type` and `status`

**`migrations/20251110000004-create-twd-order.js`**
- Creates `twd_order` table
- Fields: id, userId, symbol, type (MARKET/LIMIT), side (BUY/SELL), status, price, amount, filled, remaining, cost, fee, feeCurrency, timestamps
- Foreign key: `userId` → `user.id` (CASCADE)
- Indexes: on `userId`, `symbol`, `status`

### 2. Models (models/)

All models mirror the exchange_* pattern and auto-load via models/init.ts:

**`models/wallet.ts`** (UPDATED)
```typescript
type!: "FIAT" | "SPOT" | "ECO" | "FUTURES" | "TWD_PAPER";
```
- Added TWD_PAPER to type enum
- Validation updated

**`models/twdProvider.ts`**
```typescript
{
  id: UUID,
  name: string,          // "twelvedata"
  title: string,         // "TwelveData"
  status: boolean,       // false by default
  timestamps
}
```
- Mirrors `exchange` table structure
- Only ONE provider can be active (enforced at API level)

**`models/twdMarket.ts`**
```typescript
{
  id: UUID,
  symbol: string,        // "EUR/USD", "AAPL:NASDAQ", "SPX"
  type: enum,            // "forex" | "stocks" | "indices"
  name: string,          // Full name
  currency: string,      // Base currency
  pair: string,          // Quote currency (for forex)
  exchange: string,      // Stock exchange (for stocks)
  metadata: JSON,        // Additional info
  isTrending: boolean,
  isHot: boolean,
  status: boolean,       // false by default
  timestamps
}
```
- Mirrors `exchangeMarket` structure
- Unique constraint on `symbol`
- Type-specific fields (pair for forex, exchange for stocks)

**`models/twdOrder.ts`**
```typescript
{
  id: UUID,
  userId: UUID,          // FK to user table
  symbol: string,
  type: enum,            // "MARKET" | "LIMIT"
  side: enum,            // "BUY" | "SELL"
  status: enum,          // "OPEN" | "CLOSED" | "CANCELED" | "EXPIRED" | "REJECTED"
  price: DECIMAL(30,15),
  amount: DECIMAL(30,15),
  filled: DECIMAL(30,15),
  remaining: DECIMAL(30,15),
  cost: DECIMAL(30,15),
  fee: DECIMAL(30,15),
  feeCurrency: string,
  timestamps
}
```
- Mirrors `exchangeOrder` structure
- CASCADE delete on user deletion
- Association: `belongsTo(user)`

### 3. Seeder (seeders/)

**`seeders/20251110120000-twdProvider.js`**
- Seeds initial TwelveData provider
- Checks for duplicates before inserting
- Provider starts with `status: false` (admin must enable)
- **Note**: Timestamp is AFTER all migrations to ensure table exists first

### 4. Configuration Updates

**`config.js`** (UPDATED)
- Added `migrationStorageTableName: 'sequelize_meta'` to all environments
- Enables Sequelize migrations tracking

**`.env`** (UPDATED)
```bash
TWD_DEMO_BALANCE=100000
TWD_DEFAULT_CURRENCY=USD
```

### 5. Package.json Scripts

Add these scripts for migration management:

```json
{
  "migrate": "sequelize-cli db:migrate --config config.js",
  "migrate:undo": "sequelize-cli db:migrate:undo --config config.js",
  "migrate:status": "sequelize-cli db:migrate:status --config config.js"
}
```

## 🔄 How to Run Migrations

```bash
# 1. Run migrations (creates tables)
npx sequelize-cli db:migrate --config config.js

# 2. Run seeders (creates initial data)
pnpm seed

# 3. Verify tables were created
mysql -u appuser -p -D mydatabase -e "SHOW TABLES LIKE 'twd_%'"

# 4. Verify wallet enum was updated
mysql -u appuser -p -D mydatabase -e "SHOW COLUMNS FROM wallet WHERE Field='type'"
```

## ✅ Verification Checklist

Before proceeding to Phase 2, verify:

- [ ] Migrations run successfully without errors
- [ ] Tables `twd_provider`, `twd_market`, `twd_order` exist
- [ ] Wallet `type` column includes `TWD_PAPER`
- [ ] Seeder creates TwelveData provider record
- [ ] Models auto-load (check backend logs on startup)
- [ ] No conflicts with existing tables/models

## 📊 Database Schema Diagram

```
┌─────────────┐
│    user     │
└──────┬──────┘
       │
       │ (FK)
       │
       ▼
┌─────────────┐      ┌──────────────┐
│  twd_order  │──────│  twd_market  │
└─────────────┘      └──────────────┘
                            │
                            │
                            ▼
                     ┌──────────────┐
                     │ twd_provider │
                     └──────────────┘

┌─────────────┐
│   wallet    │  (type includes TWD_PAPER)
└─────────────┘
```

## 🎯 Models Match Existing Patterns

| Existing | TwelveData | Match? |
|----------|------------|--------|
| `exchange` | `twdProvider` | ✅ |
| `exchangeMarket` | `twdMarket` | ✅ |
| `exchangeOrder` | `twdOrder` | ✅ |
| `wallet` (SPOT) | `wallet` (TWD_PAPER) | ✅ |

**Key Differences:**
- TWD tables use separate namespace (twd_*)
- TWD markets have `type` field (forex/stocks/indices)
- TWD markets have `exchange` field for stocks
- All follow same admin → import → enable → trade pattern

## 🚀 Ready for Phase 2

Once migrations are verified, we can proceed with:

1. ✅ **Admin APIs** - Provider management, market import, market enable/disable
2. User APIs - Market data, order creation, order management
3. WebSocket - Dynamic subscription based on enabled markets
4. Execution Engine - Paper trading order execution
5. Frontend - Admin pages, trading pages

## 📝 Notes

- Models will auto-sync if migrations aren't run, but migrations provide proper version control
- Rollback support included in all migrations
- Paranoid mode enabled (soft deletes)
- All timestamps handled automatically by Sequelize
- UUID primary keys for all tables
- Proper indexes on foreign keys and frequently queried columns
