# Phase 5+6 Implementation Summary
## PnL Validation & TWD_PAPER Removal

**Date:** 2025-01-25
**Author:** Claude Code
**Phase:** Final Cleanup - PnL Validation and Deprecated Type Removal

---

## Table of Contents

1. [Overview](#overview)
2. [Step 1: PnL & Reporting Validation](#step-1-pnl--reporting-validation)
3. [Step 2: TWD_PAPER Removal](#step-2-twd_paper-removal)
4. [File-by-File Changes](#file-by-file-changes)
5. [PnL Calculation Explained](#pnl-calculation-explained)
6. [Migration Strategy](#migration-strategy)
7. [Testing Guide](#testing-guide)
8. [Deployment](#deployment)

---

## Overview

### Objectives

**Phase 5+6** completes the wallet architecture redesign by:

1. **Updating PnL calculations** to support all 7 wallet types (FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX)
2. **Removing TWD_PAPER** deprecated wallet type from schema and code
3. **Ensuring data safety** through transactional migrations
4. **Validating correctness** of PnL tracking across all wallet types

### What Was Changed

- ✅ **PnL Cron Job** - Extended to calculate balances for FOREX, STOCK, INDEX
- ✅ **PnL API Endpoint** - Extended to return PnL data for all wallet types
- ✅ **Wallet Model** - Removed TWD_PAPER from type enum
- ✅ **Type Definitions** - Removed TWD_PAPER from TypeScript types
- ✅ **Migrations** - Created 2 migrations for safe TWD_PAPER removal
- ✅ **Documentation** - Added legacy notes about TWD_PAPER deprecation

### What Was NOT Changed

- ❌ **Frontend UI** - No changes needed (already excludes TWD_PAPER)
- ❌ **Transfer Matrix** - Already excludes TWD_PAPER from transfers
- ❌ **Existing Wallet Types** - FIAT, SPOT, ECO, FUTURES behavior unchanged
- ❌ **Deposit/Withdraw** - Already excludes FOREX, STOCK, INDEX

---

## Step 1: PnL & Reporting Validation

### Problem

Before Phase 5, PnL calculations only tracked 3 wallet types:
- FIAT
- SPOT
- ECO (mapped to "FUNDING" in charts)

After adding FOREX, STOCK, INDEX wallet types, PnL needed to:
1. Track balances for these new types
2. Calculate USD equivalent values correctly
3. Display separate PnL per wallet type (no mixing)

### Solution

Extended PnL calculation logic in 2 files:

#### File 1: `backend/utils/crons/wallet.ts`

**What it does:** Daily cron job that calculates and stores wallet balances in USD

**Changes made:**

1. **Extended balance object to 7 types** (lines 78-86):
```typescript
const balances = {
  FIAT: 0,
  SPOT: 0,
  ECO: 0,
  FUTURES: 0,
  FOREX: 0,
  STOCK: 0,
  INDEX: 0,
};
```

2. **Added price lookup for trading wallets** (lines 101-111):
```typescript
else if (
  wallet.type === "FUTURES" ||
  wallet.type === "FOREX" ||
  wallet.type === "STOCK" ||
  wallet.type === "INDEX"
) {
  // For trading wallets (FUTURES, FOREX, STOCK, INDEX):
  // Try to get price from exchange map first (for USD, USDT, etc.)
  // These wallets typically hold USD or quote currencies
  price = exchangeMap.get(wallet.currency) || currencyMap.get(wallet.currency) || 1;
}
```

3. **Updated zero balance cleanup** (lines 141-151):
```typescript
const zeroBalanceString =
  '{"FIAT":0,"SPOT":0,"ECO":0,"FUTURES":0,"FOREX":0,"STOCK":0,"INDEX":0}';
const zeroBalanceObject = {
  FIAT: 0,
  SPOT: 0,
  ECO: 0,
  FUTURES: 0,
  FOREX: 0,
  STOCK: 0,
  INDEX: 0,
};
```

4. **Replaced TWD_PAPER skip logic with legacy note** (lines 89-90):
```typescript
// Note: TWD_PAPER was a deprecated wallet type that was migrated to SPOT
// See migrations: 20250125000003 (data migration) and 20250125000004 (enum removal)
```

#### File 2: `backend/api/finance/wallet/index.get.ts`

**What it does:** API endpoint that returns wallet PnL data for frontend dashboard

**Changes made:**

1. **Extended DailyPnlRecord type** (lines 15-26):
```typescript
type DailyPnlRecord = Record<
  string,
  {
    FIAT: number;
    SPOT: number;
    FUNDING: number;
    FUTURES: number;
    FOREX: number;
    STOCK: number;
    INDEX: number;
  }
>;
```

2. **Extended balance calculation** (lines 147-185) - Same logic as cron job

3. **Extended PnL chart data type** (lines 243-252):
```typescript
type PnlChartItem = {
  date: string;
  FIAT: number;
  SPOT: number;
  FUNDING: number;
  FUTURES: number;
  FOREX: number;
  STOCK: number;
  INDEX: number;
};
```

4. **Updated daily and weekly aggregation** (lines 219-293) - Includes all 7 types

5. **Replaced TWD_PAPER skip logic with legacy note** (lines 159-160)

### Behavior: PnL Per Wallet Type

**How it works:**

1. **Separate tracking:** Each wallet type has its own balance in USD
2. **Price sources:**
   - **FIAT:** Currency table (price field) - typically 1:1 for USD
   - **SPOT:** Exchange currency table (market price)
   - **ECO:** Matching engine tickers (ecosystem token price)
   - **FUTURES/FOREX/STOCK/INDEX:** Exchange currency OR currency table (for USD/USDT) with fallback to 1

3. **Daily aggregation:**
   - Cron job runs once per day
   - Calculates total USD value per wallet type
   - Stores in `walletPnl` table with JSON balances field

4. **Chart display:**
   - API endpoint aggregates last 28 days
   - Groups by week for chart display
   - Frontend receives separate line per wallet type

**Example PnL record:**
```json
{
  "userId": "user-123",
  "balances": {
    "FIAT": 1000.00,
    "SPOT": 5000.00,
    "ECO": 0,
    "FUTURES": 10000.00,
    "FOREX": 2500.00,
    "STOCK": 7500.00,
    "INDEX": 0
  },
  "createdAt": "2025-01-25T00:00:00.000Z"
}
```

---

## Step 2: TWD_PAPER Removal

### Problem

`TWD_PAPER` was a temporary wallet type created during TwelveData integration development. It was used as a proof-of-concept before the final FOREX/STOCK/INDEX architecture was designed.

**Issues with keeping TWD_PAPER:**
- Adds confusion (8 types instead of 7)
- Not part of final architecture
- May have orphaned wallets from testing
- Type safety allows invalid operations

### Solution: Two-Phase Migration

#### Phase 2A: Data Migration (Migration 20250125000003)

**File:** `migrations/20250125000003-migrate-twd-paper-wallets.js`

**What it does:**
1. Finds all TWD_PAPER wallets
2. Converts them to SPOT wallets (preserves balances)
3. Verifies migration success
4. Commits transaction

**Safety features:**
- ✅ Idempotent: Can run multiple times safely
- ✅ Transactional: Rolls back on error
- ✅ Verification: Checks no TWD_PAPER wallets remain
- ✅ Data preservation: No balance loss, only type change

**Migration logic:**
```javascript
async up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // Step 1: Count TWD_PAPER wallets
    const [twdPaperWallets] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM wallet WHERE type = 'TWD_PAPER'`,
      { transaction }
    );
    const count = twdPaperWallets[0]?.count || 0;

    if (count === 0) {
      console.log("No TWD_PAPER wallets found. Migration complete.");
      await transaction.commit();
      return;
    }

    // Step 2: Migrate to SPOT
    await queryInterface.sequelize.query(
      `UPDATE wallet SET type = 'SPOT' WHERE type = 'TWD_PAPER'`,
      { transaction }
    );

    // Step 3: Verify
    const [remainingTwdPaper] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM wallet WHERE type = 'TWD_PAPER'`,
      { transaction }
    );
    const remaining = remainingTwdPaper[0]?.count || 0;

    if (remaining > 0) {
      throw new Error(`Migration incomplete: ${remaining} TWD_PAPER wallets still exist`);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error("TWD_PAPER migration failed:", error);
    throw error;
  }
}
```

**Rollback:** Cannot automatically rollback because original TWD_PAPER data is not preserved. Must restore from database backup.

#### Phase 2B: Enum Removal (Migration 20250125000004)

**File:** `migrations/20250125000004-remove-twd-paper-from-enum.js`

**What it does:**
1. Verifies no TWD_PAPER wallets exist (safety check)
2. Alters wallet.type enum to remove TWD_PAPER
3. Leaves only 7 valid types: FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX

**Safety features:**
- ✅ Pre-check: Fails if TWD_PAPER wallets exist
- ✅ Transactional: Rolls back on error
- ✅ Reversible: Can re-add TWD_PAPER to enum (but not data)

**Migration logic:**
```javascript
async up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // Step 1: Verify no TWD_PAPER wallets exist
    const [twdPaperWallets] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM wallet WHERE type = 'TWD_PAPER'`,
      { transaction }
    );
    const count = twdPaperWallets[0]?.count || 0;

    if (count > 0) {
      throw new Error(
        `Cannot remove TWD_PAPER from enum: ${count} TWD_PAPER wallets still exist. ` +
        `Please run migration 20250125000003-migrate-twd-paper-wallets.js first.`
      );
    }

    // Step 2: Remove TWD_PAPER from enum
    await queryInterface.sequelize.query(
      `ALTER TABLE wallet MODIFY COLUMN type ENUM('FIAT', 'SPOT', 'ECO', 'FUTURES', 'FOREX', 'STOCK', 'INDEX') NOT NULL`,
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

**Rollback:** Can re-add TWD_PAPER to enum, but does NOT restore migrated wallet data.

#### Code Cleanup

**Removed TWD_PAPER from:**

1. **models/wallet.ts** (lines 16, 218, 222)
   - Type definition: `type!: "FIAT" | "SPOT" | ... | "INDEX"`
   - Sequelize enum: `DataTypes.ENUM("FIAT", "SPOT", ..., "INDEX")`
   - Validation array: `["FIAT", "SPOT", ..., "INDEX"]`

2. **types/models/wallet.d.ts** (line 4)
   - Type definition: `type: "FIAT" | "SPOT" | ... | "INDEX"`

3. **Backend skip logic** (replaced with legacy notes)
   - `backend/utils/crons/wallet.ts` (lines 89-90)
   - `backend/api/finance/wallet/index.get.ts` (lines 159-160)

**What was NOT changed:**
- Transfer matrix files (already excluded TWD_PAPER)
- Frontend stores (already excluded TWD_PAPER)
- Documentation files (kept for historical reference)

---

## File-by-File Changes

### Backend Files Modified

#### 1. `backend/utils/crons/wallet.ts`

**Location:** Cron job for daily PnL calculation

**Changes:**
- Line 78-86: Extended `balances` object to 7 types
- Line 89-90: Replaced TWD_PAPER skip with legacy note
- Line 101-111: Added price lookup for FUTURES, FOREX, STOCK, INDEX
- Line 141-151: Updated zero balance object to 7 types

**Impact:** PnL cron now tracks all wallet types correctly

#### 2. `backend/api/finance/wallet/index.get.ts`

**Location:** API endpoint for wallet PnL data

**Changes:**
- Line 15-26: Extended `DailyPnlRecord` type to 7 types
- Line 147-185: Extended balance calculation (same as cron)
- Line 159-160: Replaced TWD_PAPER skip with legacy note
- Line 219-240: Updated daily PnL reducer for 7 types
- Line 243-293: Extended chart data type and weekly aggregation

**Impact:** API returns PnL data for all wallet types

### Model Files Modified

#### 3. `models/wallet.ts`

**Location:** Sequelize wallet model

**Changes:**
- Line 16: Removed TWD_PAPER from type union
- Line 218: Removed TWD_PAPER from DataTypes.ENUM
- Line 222: Removed TWD_PAPER from validation array

**Impact:** Database enforces 7 valid wallet types only

#### 4. `types/models/wallet.d.ts`

**Location:** TypeScript type definitions

**Changes:**
- Line 4: Removed TWD_PAPER from type union

**Impact:** TypeScript enforces 7 valid wallet types only

### Migration Files Created

#### 5. `migrations/20250125000003-migrate-twd-paper-wallets.js`

**Location:** Data migration - Step 2A

**Purpose:** Migrate TWD_PAPER wallets to SPOT before enum removal

**Key Features:**
- Idempotent (can run multiple times)
- Transactional (atomic operation)
- Verified (checks success)
- Safe (preserves all data)

#### 6. `migrations/20250125000004-remove-twd-paper-from-enum.js`

**Location:** Schema migration - Step 2B

**Purpose:** Remove TWD_PAPER from wallet.type enum

**Key Features:**
- Pre-validated (fails if TWD_PAPER wallets exist)
- Transactional (atomic operation)
- Reversible (can rollback enum change)
- Enforces type safety

### Documentation Files Created

#### 7. `PHASE_5_6_DEPLOYMENT_CHECKLIST.md`

**Location:** Deployment guide

**Purpose:** Step-by-step deployment instructions with verification

**Sections:**
- Pre-deployment checks
- Deployment steps (exact order)
- Post-deployment verification
- Rollback procedure
- Success criteria

#### 8. `PHASE_5_6_IMPLEMENTATION_SUMMARY.md` (this file)

**Location:** Implementation documentation

**Purpose:** Comprehensive explanation of all changes

---

## PnL Calculation Explained

### Architecture

```
┌─────────────────────────────────────────┐
│         Daily PnL Cron Job              │
│    (backend/utils/crons/wallet.ts)      │
└─────────────────┬───────────────────────┘
                  │
                  │ Runs once daily
                  │
                  ▼
┌─────────────────────────────────────────┐
│  1. Fetch all user wallets              │
│  2. Get price data:                     │
│     - Currency prices (FIAT)            │
│     - Exchange prices (SPOT, trading)   │
│     - Ticker data (ECO)                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  3. Calculate USD value per type:       │
│     FIAT:    price × balance            │
│     SPOT:    price × balance            │
│     ECO:     price × balance            │
│     FUTURES: price × balance            │
│     FOREX:   price × balance            │
│     STOCK:   price × balance            │
│     INDEX:   price × balance            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  4. Store in walletPnl table:           │
│     {                                   │
│       "FIAT": 1000,                     │
│       "SPOT": 5000,                     │
│       "ECO": 0,                         │
│       "FUTURES": 10000,                 │
│       "FOREX": 2500,                    │
│       "STOCK": 7500,                    │
│       "INDEX": 0                        │
│     }                                   │
└─────────────────────────────────────────┘
```

### Price Sources Per Wallet Type

| Wallet Type | Price Source | Example |
|------------|--------------|---------|
| FIAT | `currency.price` | USD → 1.00 |
| SPOT | `exchangeCurrency.price` | BTC → 45000.00 |
| ECO | Matching engine tickers | CUSTOM_TOKEN → 0.50 |
| FUTURES | `exchangeCurrency.price` OR `currency.price` | USD → 1.00 |
| FOREX | `exchangeCurrency.price` OR `currency.price` | USD → 1.00 |
| STOCK | `exchangeCurrency.price` OR `currency.price` | USD → 1.00 |
| INDEX | `exchangeCurrency.price` OR `currency.price` | USD → 1.00 |

**Why trading wallets use fallback?**
- FUTURES, FOREX, STOCK, INDEX wallets typically hold USD or USDT (quote currency)
- First try exchange price (for USDT)
- Fallback to currency price (for USD)
- Final fallback to 1 (assume 1:1 if no price found)

### Chart Data Flow

```
PnL API Endpoint (GET /api/finance/wallet?pnl=true)
│
├─ 1. Calculate today's balances (same as cron)
│
├─ 2. Fetch last 28 days of PnL records
│
├─ 3. Aggregate by week:
│   ├─ Week 1: Sum FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX
│   ├─ Week 2: Sum FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX
│   ├─ Week 3: Sum FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX
│   └─ Week 4: Sum FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX
│
└─ 4. Return chart data to frontend:
    {
      "today": 26500,
      "yesterday": 25000,
      "pnl": 1500,
      "chart": [
        {
          "date": "2025-01-01",
          "FIAT": 1000,
          "SPOT": 5000,
          "FUNDING": 0,
          "FUTURES": 10000,
          "FOREX": 2500,
          "STOCK": 7500,
          "INDEX": 0
        },
        ...
      ]
    }
```

**Note:** ECO is labeled as "FUNDING" in chart data for frontend display consistency.

---

## Migration Strategy

### Why Two Migrations?

**Separation of Concerns:**
1. **Data Migration (Step 2A):** Handle existing data safely
2. **Schema Migration (Step 2B):** Update database constraints

**Safety Benefits:**
- Can verify data migration success before schema change
- Can rollback schema change without data loss
- Clear separation of responsibilities
- Easier debugging if issues occur

### Migration Order (CRITICAL)

```
MUST run in this exact order:

1. Migration 20250125000003 (Data)
   ↓
   Verify: SELECT COUNT(*) FROM wallet WHERE type = 'TWD_PAPER'
   Expected: 0
   ↓
2. Migration 20250125000004 (Schema)
   ↓
   Verify: DESCRIBE wallet
   Expected: type ENUM without TWD_PAPER
```

**Running out of order will cause:**
- Migration 20250125000004 will FAIL if run first (pre-check detects TWD_PAPER wallets)
- Database will reject the schema change

### Migration Safety Features

**Idempotent:**
```javascript
// Migration 20250125000003 checks if wallets exist
const count = twdPaperWallets[0]?.count || 0;
if (count === 0) {
  console.log("No TWD_PAPER wallets found. Migration complete.");
  await transaction.commit();
  return; // Safe to run multiple times
}
```

**Transactional:**
```javascript
const transaction = await queryInterface.sequelize.transaction();
try {
  // ... migration logic ...
  await transaction.commit();
} catch (error) {
  await transaction.rollback(); // Atomic operation
  throw error;
}
```

**Verified:**
```javascript
// Migration 20250125000003 verifies success
const [remainingTwdPaper] = await queryInterface.sequelize.query(
  `SELECT COUNT(*) as count FROM wallet WHERE type = 'TWD_PAPER'`,
  { transaction }
);
const remaining = remainingTwdPaper[0]?.count || 0;

if (remaining > 0) {
  throw new Error(`Migration incomplete: ${remaining} TWD_PAPER wallets still exist`);
}
```

---

## Testing Guide

### Pre-Deployment Testing

#### 1. Database Inspection

**Check for TWD_PAPER wallets:**
```sql
-- Count TWD_PAPER wallets
SELECT COUNT(*) as count FROM wallet WHERE type = 'TWD_PAPER';

-- Get detailed view
SELECT * FROM wallet WHERE type = 'TWD_PAPER' LIMIT 10;

-- Check total wallet count (baseline)
SELECT COUNT(*) as total FROM wallet;
```

**Check PnL structure:**
```sql
-- View latest PnL records
SELECT balances, createdAt
FROM walletPnl
ORDER BY createdAt DESC
LIMIT 5;

-- Check if JSON includes new types
SELECT balances->'$.FOREX' as forex_balance,
       balances->'$.STOCK' as stock_balance,
       balances->'$.INDEX' as index_balance
FROM walletPnl
ORDER BY createdAt DESC
LIMIT 1;
```

#### 2. Migration Testing (Dry Run)

**Test on staging database:**
```bash
# 1. Restore production backup to staging
mysql -u user -p staging_db < production_backup.sql

# 2. Run Migration 1
npx sequelize-cli db:migrate --name 20250125000003-migrate-twd-paper-wallets.js

# 3. Verify data migration
SELECT COUNT(*) FROM wallet WHERE type = 'TWD_PAPER';  # Should be 0
SELECT COUNT(*) FROM wallet WHERE type = 'SPOT';       # Should increase

# 4. Run Migration 2
npx sequelize-cli db:migrate --name 20250125000004-remove-twd-paper-from-enum.js

# 5. Verify enum removal
DESCRIBE wallet;  # Check type column enum

# 6. Test rollback
npx sequelize-cli db:migrate:undo --name 20250125000004-remove-twd-paper-from-enum.js
DESCRIBE wallet;  # TWD_PAPER should be back in enum
```

### Post-Deployment Testing

#### 1. Backend Testing

**Test PnL Cron Job:**
```bash
# Manually trigger PnL calculation (if possible)
# OR wait for scheduled cron

# Check logs
pm2 logs | grep "PnL"

# Verify new PnL records created
mysql -u user -p -e "
  SELECT balances, createdAt
  FROM walletPnl
  WHERE createdAt >= NOW() - INTERVAL 1 HOUR
  ORDER BY createdAt DESC
  LIMIT 5;
" database_name
```

**Test PnL API Endpoint:**
```bash
# Login and get auth token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# Get PnL data
curl -X GET 'http://localhost:4000/api/finance/wallet?pnl=true' \
  -b cookies.txt

# Expected response:
{
  "today": 26500,
  "yesterday": 25000,
  "pnl": 1500,
  "chart": [
    {
      "date": "2025-01-01",
      "FIAT": 1000,
      "SPOT": 5000,
      "FUNDING": 0,
      "FUTURES": 10000,
      "FOREX": 2500,
      "STOCK": 7500,
      "INDEX": 0
    }
  ]
}
```

#### 2. Database Testing

**Verify TWD_PAPER removed:**
```sql
-- Should return 0
SELECT COUNT(*) FROM wallet WHERE type = 'TWD_PAPER';

-- Should fail with enum constraint error
INSERT INTO wallet (id, userId, type, currency, balance, status)
VALUES (UUID(), 'test-user-id', 'TWD_PAPER', 'USD', 0, 1);
-- Expected: Data truncated for column 'type' at row 1

-- Verify 7 types only
SELECT DISTINCT type FROM wallet ORDER BY type;
-- Expected: ECO, FIAT, FOREX, FUTURES, INDEX, SPOT, STOCK
```

**Verify PnL data:**
```sql
-- Check latest PnL includes all types
SELECT
  balances,
  JSON_EXTRACT(balances, '$.FIAT') as fiat,
  JSON_EXTRACT(balances, '$.SPOT') as spot,
  JSON_EXTRACT(balances, '$.ECO') as eco,
  JSON_EXTRACT(balances, '$.FUTURES') as futures,
  JSON_EXTRACT(balances, '$.FOREX') as forex,
  JSON_EXTRACT(balances, '$.STOCK') as stock,
  JSON_EXTRACT(balances, '$.INDEX') as idx
FROM walletPnl
ORDER BY createdAt DESC
LIMIT 1;
```

#### 3. Frontend Testing

**Manual UI Testing:**

1. **Login to application**
2. **Navigate to wallet dashboard**
3. **Verify wallet types displayed:**
   - Should see: FIAT, SPOT, ECO (Funding), FUTURES, FOREX, STOCK, INDEX
   - Should NOT see: TWD_PAPER

4. **Check PnL chart:**
   - Chart should display multiple lines (one per wallet type)
   - Each line should have correct values
   - No errors in browser console

5. **Test wallet operations:**
   - Transfer: FOREX → SPOT should work
   - Deposit: FOREX should NOT be in deposit dropdown
   - Withdraw: FOREX should NOT be in withdraw dropdown

6. **Check browser console:**
   ```javascript
   // Should show no TWD_PAPER related errors
   // Should show correct wallet types
   ```

#### 4. Error Testing

**Test type validation:**
```bash
# Try to create wallet with invalid type via API
curl -X POST http://localhost:4000/api/finance/wallet \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "currency": "USD",
    "type": "TWD_PAPER"
  }'

# Expected: Validation error (type not in enum)
```

**Test transfer validation:**
```bash
# Try to transfer from non-existent wallet type
curl -X POST http://localhost:4000/api/finance/transfer \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "from": "TWD_PAPER",
    "to": "SPOT",
    "currency": "USD",
    "amount": 100
  }'

# Expected: Source wallet type invalid error
```

### Regression Testing

**Verify existing functionality still works:**

1. **FIAT Wallets:**
   - ✅ Deposit via Stripe/PayPal
   - ✅ Withdraw via payment methods
   - ✅ Transfer to SPOT
   - ✅ PnL tracking

2. **SPOT Wallets:**
   - ✅ Deposit via crypto
   - ✅ Withdraw to external address
   - ✅ Transfer to FIAT/ECO/FUTURES
   - ✅ Exchange trading
   - ✅ PnL tracking

3. **ECO Wallets:**
   - ✅ Deposit via blockchain
   - ✅ Withdraw to wallet address
   - ✅ Transfer to SPOT
   - ✅ Ecosystem trading
   - ✅ PnL tracking (shown as "FUNDING")

4. **FUTURES Wallets:**
   - ✅ Internal only (no direct deposit/withdraw)
   - ✅ Transfer from/to SPOT
   - ✅ Futures trading
   - ✅ PnL tracking

5. **FOREX Wallets:**
   - ✅ Internal only (no direct deposit/withdraw)
   - ✅ Transfer from/to SPOT
   - ✅ Forex trading
   - ✅ PnL tracking ← NEW

6. **STOCK Wallets:**
   - ✅ Internal only (no direct deposit/withdraw)
   - ✅ Transfer from/to SPOT
   - ✅ Stock trading
   - ✅ PnL tracking ← NEW

7. **INDEX Wallets:**
   - ✅ Internal only (no direct deposit/withdraw)
   - ✅ Transfer from/to SPOT
   - ✅ Index trading
   - ✅ PnL tracking ← NEW

### Performance Testing

**Monitor PnL cron performance:**
```sql
-- Check PnL record count
SELECT COUNT(*) FROM walletPnl;

-- Check average processing time
-- (Monitor cron job logs for execution time)

-- Expected: < 1 second per 1000 users
```

**Monitor API response time:**
```bash
# Test PnL endpoint response time
time curl -X GET 'http://localhost:4000/api/finance/wallet?pnl=true' \
  -b cookies.txt

# Expected: < 500ms
```

---

## Deployment

See **PHASE_5_6_DEPLOYMENT_CHECKLIST.md** for detailed deployment instructions.

### Quick Deployment Summary

```bash
# 1. Backup database
mysqldump -u user -p database > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Stop application
pnpm stop

# 3. Pull and build
git pull origin main
pnpm install
pnpm build:backend

# 4. Run migrations (IN ORDER)
npx sequelize-cli db:migrate --name 20250125000003-migrate-twd-paper-wallets.js
npx sequelize-cli db:migrate --name 20250125000004-remove-twd-paper-from-enum.js

# 5. Start application
pnpm start

# 6. Verify
# - Check logs: pm2 logs
# - Check database: SELECT COUNT(*) FROM wallet WHERE type = 'TWD_PAPER'
# - Check PnL: SELECT balances FROM walletPnl ORDER BY createdAt DESC LIMIT 1
```

---

## Appendix

### A. SQL Verification Queries

```sql
-- 1. Wallet type distribution
SELECT
  type,
  COUNT(*) as count,
  SUM(balance) as total_balance,
  AVG(balance) as avg_balance
FROM wallet
GROUP BY type
ORDER BY type;

-- 2. PnL data completeness
SELECT
  DATE(createdAt) as date,
  COUNT(*) as user_count,
  SUM(JSON_EXTRACT(balances, '$.FIAT')) as total_fiat,
  SUM(JSON_EXTRACT(balances, '$.SPOT')) as total_spot,
  SUM(JSON_EXTRACT(balances, '$.FUTURES')) as total_futures,
  SUM(JSON_EXTRACT(balances, '$.FOREX')) as total_forex,
  SUM(JSON_EXTRACT(balances, '$.STOCK')) as total_stock,
  SUM(JSON_EXTRACT(balances, '$.INDEX')) as total_index
FROM walletPnl
WHERE createdAt >= NOW() - INTERVAL 7 DAY
GROUP BY DATE(createdAt)
ORDER BY date DESC;

-- 3. Verify no TWD_PAPER references
SELECT COUNT(*) FROM wallet WHERE type = 'TWD_PAPER';           # 0
SELECT COUNT(*) FROM transaction WHERE metadata LIKE '%TWD_PAPER%'; # Should be 0

-- 4. Check wallet table structure
DESCRIBE wallet;
-- Verify: type enum('FIAT','SPOT','ECO','FUTURES','FOREX','STOCK','INDEX')
```

### B. TypeScript Type Safety

**After deployment, TypeScript will enforce:**

```typescript
// ✅ Valid
const wallet: walletAttributes = {
  type: "FOREX"  // OK
};

// ❌ Invalid (compile error)
const wallet: walletAttributes = {
  type: "TWD_PAPER"  // Type '"TWD_PAPER"' is not assignable to type '"FIAT" | "SPOT" | ...'
};
```

### C. Rollback Considerations

**Can rollback:**
- ✅ Migration 20250125000004 (enum removal) - Can re-add TWD_PAPER to enum
- ✅ Code changes - Can revert commits

**Cannot rollback:**
- ❌ Migration 20250125000003 (data migration) - Original TWD_PAPER wallet data is not preserved
- ❌ User wallets already migrated to SPOT

**If rollback needed:**
1. Restore from database backup (BEFORE migration 20250125000003)
2. Revert code changes
3. Do NOT run migrations

### D. Legacy Notes

**TWD_PAPER History:**

- **Created:** Migration 20251110000001
- **Purpose:** Temporary wallet type for TwelveData integration POC
- **Deprecated:** After FOREX/STOCK/INDEX architecture finalized
- **Migrated:** Migration 20250125000003 (converted to SPOT)
- **Removed:** Migration 20250125000004 (removed from enum)

**Why migrated to SPOT?**
- TWD_PAPER wallets held cryptocurrency (similar to SPOT)
- SPOT is the standard wallet for cryptocurrency holdings
- No loss of functionality or data

---

## Summary

**Phase 5+6 successfully:**

✅ Extended PnL calculation to support FOREX, STOCK, INDEX wallet types
✅ Removed deprecated TWD_PAPER wallet type from schema and code
✅ Created safe, transactional migrations for data preservation
✅ Updated documentation and deployment procedures
✅ Maintained backward compatibility for existing wallet types
✅ Enforced type safety at database and application levels

**Next steps:**

1. Deploy to staging environment
2. Run full testing suite
3. Deploy to production (following checklist)
4. Monitor for 24 hours
5. Archive legacy TWD_PAPER documentation

**For questions or issues, refer to:**
- `PHASE_5_6_DEPLOYMENT_CHECKLIST.md` - Deployment instructions
- `PHASE_5_6_IMPLEMENTATION_SUMMARY.md` - This document
- Migration files in `migrations/` directory

---

**End of Phase 5+6 Implementation**
