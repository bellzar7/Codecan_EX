# Phase 5+6 Deployment Checklist
## PnL Validation & TWD_PAPER Removal

**Date:** 2025-01-25
**Purpose:** Deploy PnL updates for all wallet types and safely remove deprecated TWD_PAPER wallet type

---

## Pre-Deployment Checks

### 1. Database Backup
```bash
# Create full database backup BEFORE deployment
mysqldump -u [user] -p [database] > backup_before_phase5_6_$(date +%Y%m%d_%H%M%S).sql
```

**Action:** ✅ Confirm backup created and stored safely

### 2. Verify Current State
Run these queries to understand current state:

```sql
-- Check if any TWD_PAPER wallets exist
SELECT COUNT(*) as twd_paper_count
FROM wallet
WHERE type = 'TWD_PAPER';

-- Get detailed view of TWD_PAPER wallets (if any exist)
SELECT
  id,
  userId,
  currency,
  balance,
  inOrder,
  status,
  createdAt
FROM wallet
WHERE type = 'TWD_PAPER'
ORDER BY createdAt DESC;

-- Check wallet type distribution
SELECT
  type,
  COUNT(*) as count,
  SUM(balance) as total_balance
FROM wallet
GROUP BY type
ORDER BY type;

-- Verify PnL records exist
SELECT COUNT(*) as pnl_record_count
FROM walletPnl;

-- Check latest PnL data structure
SELECT balances
FROM walletPnl
ORDER BY createdAt DESC
LIMIT 5;
```

**Action:** ✅ Review results and document current state

### 3. Application Status
- ✅ Confirm current application version
- ✅ Verify no pending migrations
- ✅ Check system health (CPU, memory, disk space)
- ✅ Verify Redis is running
- ✅ Verify MySQL is running

---

## Deployment Steps

### Step 1: Stop Application
```bash
# Stop all PM2 processes
pnpm stop

# Verify all processes stopped
pm2 list
```

**Action:** ✅ Confirm application stopped

### Step 2: Pull Latest Code
```bash
# Pull latest code from repository
git pull origin main

# Install dependencies
pnpm install

# Build backend
pnpm build:backend
```

**Action:** ✅ Confirm code updated and built successfully

### Step 3: Run Migrations (IN ORDER)

**CRITICAL:** Migrations MUST be run in this exact order:

#### Migration 1: Migrate TWD_PAPER Data to SPOT
```bash
# Run data migration
npx sequelize-cli db:migrate --name 20250125000003-migrate-twd-paper-wallets.js
```

**Expected Output:**
```
Starting TWD_PAPER wallet migration...
Found X TWD_PAPER wallets to migrate
Successfully migrated X TWD_PAPER wallets to SPOT type
Migration verification complete. All TWD_PAPER wallets migrated to SPOT.
```

**Verification:**
```sql
-- Should return 0
SELECT COUNT(*) as remaining_twd_paper
FROM wallet
WHERE type = 'TWD_PAPER';

-- Verify total wallet count unchanged
SELECT COUNT(*) as total_wallets FROM wallet;
```

**Action:** ✅ Confirm migration successful, 0 TWD_PAPER wallets remain

#### Migration 2: Remove TWD_PAPER from ENUM
```bash
# Run enum removal migration
npx sequelize-cli db:migrate --name 20250125000004-remove-twd-paper-from-enum.js
```

**Expected Output:**
```
Starting TWD_PAPER enum removal...
No TWD_PAPER wallets found. Proceeding with enum update...
Successfully removed TWD_PAPER from wallet.type enum.
Supported types: FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX
```

**Verification:**
```sql
-- Check wallet table structure
DESCRIBE wallet;

-- The 'type' column should show:
-- Type: enum('FIAT','SPOT','ECO','FUTURES','FOREX','STOCK','INDEX')
```

**Action:** ✅ Confirm TWD_PAPER removed from enum

### Step 4: Start Application
```bash
# Start application
pnpm start

# Monitor logs
pm2 logs
```

**Action:** ✅ Confirm application started successfully

---

## Post-Deployment Verification

### 1. Verify Wallet Types
```sql
-- Should return 7 distinct types (no TWD_PAPER)
SELECT DISTINCT type
FROM wallet
ORDER BY type;

-- Expected result:
-- ECO
-- FIAT
-- FOREX
-- FUTURES
-- INDEX
-- SPOT
-- STOCK
```

**Action:** ✅ Confirm only 7 wallet types exist

### 2. Verify PnL Calculation

**Wait for next PnL cron job to run OR manually trigger:**

```bash
# Check when PnL cron last ran
SELECT MAX(createdAt) as last_pnl_update
FROM walletPnl;
```

After cron runs, verify:

```sql
-- Check latest PnL record includes all wallet types
SELECT
  balances,
  createdAt
FROM walletPnl
ORDER BY createdAt DESC
LIMIT 1;

-- The balances JSON should include all 7 types:
-- {"FIAT": X, "SPOT": Y, "ECO": Z, "FUTURES": A, "FOREX": B, "STOCK": C, "INDEX": D}
```

**Action:** ✅ Confirm PnL includes FOREX, STOCK, INDEX

### 3. Test Frontend PnL Display

1. Login as a test user with multiple wallet types
2. Navigate to wallet dashboard
3. Request PnL data (with `?pnl=true` query parameter)
4. Verify chart displays all wallet types correctly

**Action:** ✅ Confirm frontend PnL display works

### 4. Verify Model Type Safety

Test creating a wallet with invalid type (should fail):

```sql
-- This should FAIL with enum constraint error
INSERT INTO wallet (id, userId, type, currency, balance, status)
VALUES (UUID(), 'test-user-id', 'TWD_PAPER', 'USD', 0, 1);

-- Expected error: Data truncated for column 'type' at row 1
```

**Action:** ✅ Confirm TWD_PAPER rejected by database

### 5. Check Application Logs

```bash
# Monitor for any errors
pm2 logs --lines 100

# Look for:
# - No TWD_PAPER related errors
# - Successful PnL calculations
# - No type validation errors
```

**Action:** ✅ Confirm no errors in logs

---

## Rollback Procedure

**IF SOMETHING GOES WRONG:**

### Rollback Step 1: Stop Application
```bash
pnpm stop
```

### Rollback Step 2: Restore Database Backup
```bash
# Restore from backup
mysql -u [user] -p [database] < backup_before_phase5_6_YYYYMMDD_HHMMSS.sql
```

### Rollback Step 3: Revert Code
```bash
# Checkout previous commit
git checkout [previous-commit-hash]

# Rebuild
pnpm install
pnpm build:backend
```

### Rollback Step 4: Start Application
```bash
pnpm start
```

### Alternative: Rollback Migrations Only

**If database is intact but migrations need reversal:**

```bash
# Rollback enum removal (Migration 2)
npx sequelize-cli db:migrate:undo --name 20250125000004-remove-twd-paper-from-enum.js

# Note: Migration 1 (data migration) cannot be automatically rolled back
# Original TWD_PAPER wallet data is not preserved
# Restore from backup if TWD_PAPER wallets are needed
```

---

## Manual Admin Actions

**No manual admin actions required for this deployment.**

All changes are handled automatically by migrations and code updates.

---

## Verification SQL Queries (Summary)

### Quick Health Check
```sql
-- 1. Verify no TWD_PAPER wallets
SELECT COUNT(*) FROM wallet WHERE type = 'TWD_PAPER';
-- Expected: 0

-- 2. Verify 7 wallet types exist
SELECT COUNT(DISTINCT type) FROM wallet;
-- Expected: 7 (or less if some types have no wallets)

-- 3. Check wallet type distribution
SELECT type, COUNT(*) as count
FROM wallet
GROUP BY type
ORDER BY type;

-- 4. Verify latest PnL includes all types
SELECT balances
FROM walletPnl
ORDER BY createdAt DESC
LIMIT 1;

-- 5. Check wallet table structure
DESCRIBE wallet;
-- Verify type enum: ('FIAT','SPOT','ECO','FUTURES','FOREX','STOCK','INDEX')
```

---

## Success Criteria

Deployment is successful when ALL of the following are true:

- ✅ No TWD_PAPER wallets exist in database
- ✅ wallet.type enum excludes TWD_PAPER
- ✅ Only 7 wallet types are valid: FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX
- ✅ PnL cron calculates balances for all 7 wallet types
- ✅ PnL API endpoint returns data for all 7 wallet types
- ✅ Frontend dashboard displays PnL chart with all wallet types
- ✅ Application starts without errors
- ✅ No TWD_PAPER references cause runtime errors
- ✅ Type safety enforced (cannot create TWD_PAPER wallets)

---

## Estimated Downtime

- **Expected:** 5-10 minutes
- **Includes:** Stop app → Run migrations → Start app
- **Migration time:** < 1 minute (depends on TWD_PAPER wallet count)

---

## Support Contacts

- **Database Admin:** [Contact Info]
- **Backend Team:** [Contact Info]
- **DevOps:** [Contact Info]

---

## Notes

1. **TWD_PAPER History:** TWD_PAPER was a temporary wallet type used during TwelveData integration development. It has been deprecated in favor of the new FOREX, STOCK, INDEX wallet architecture.

2. **Data Safety:** All TWD_PAPER wallet balances are preserved by converting to SPOT wallets. No user funds are lost.

3. **Migration Idempotency:** Migration 20250125000003 can be run multiple times safely. It will skip if no TWD_PAPER wallets exist.

4. **PnL Backward Compatibility:** Old PnL records (before this deployment) will not be updated retroactively. They may only include FIAT, SPOT, ECO balances. This is expected and does not affect current data.

5. **Transfer Matrix:** No changes to transfer rules. FOREX, STOCK, INDEX were already excluded from direct deposits/withdrawals.

---

## Post-Deployment Monitoring

**Monitor for 24 hours after deployment:**

- PnL cron job runs successfully
- No wallet creation errors
- No transfer validation errors
- Frontend displays all wallet types correctly
- No user reports of missing wallets or balances

**Check daily for 1 week:**
- PnL data accuracy
- Wallet type distribution
- Application error logs
