# TWD Import - Complete Debug Summary

**Date**: 2025-11-14
**Issue**: Import Markets returns 500 error
**Status**: Enhanced with comprehensive logging

---

## What Was Changed

### File: `/backend/api/admin/ext/twd/market/import.get.ts`

**Added comprehensive logging at every step**:

1. **Startup Logging**:
   - API key presence and length
   - Base URL
   - Provider check and status

2. **API Call Logging**:
   - Each TwelveData endpoint (forex, stocks, indices)
   - HTTP status codes
   - Response data structure
   - Error responses
   - Count of items processed

3. **Database Logging**:
   - Existing markets count
   - Markets to delete count
   - Transaction start/complete
   - Created/updated counts

4. **Error Logging**:
   - Detailed error messages
   - Stack traces
   - Clear error propagation

---

## How to Debug the 500 Error

### Step 1: Restart Backend with Logging

```bash
# Stop backend
pm2 stop backend

# Start in dev mode to see logs
pnpm dev:backend
```

### Step 2: Click Import Markets

1. Go to: `http://localhost:3000/admin/finance/exchange/provider/twelvedata`
2. Ensure provider is **Enabled** (green status)
3. Click **"Import Markets"** button
4. Watch the terminal logs carefully

### Step 3: Analyze the Logs

Look for these log lines in order:

```
[TWD Import] Starting market import...
[TWD Import] API Key present: true
[TWD Import] API Key length: 32
[TWD Import] Base URL: https://api.twelvedata.com
[TWD Import] Checking provider status in exchange table...
[TWD Import] Provider found: true
[TWD Import] Provider status: true
[TWD Import] Provider check passed, proceeding with API calls...
[TWD Import] Fetching forex pairs from: https://api.twelvedata.com/forex_pairs
[TWD Import] Forex response status: 200 OK
[TWD Import] Forex data structure: { hasData: true, isArray: true, count: 50, firstItem: {...} }
[TWD Import] Processed 50 forex pairs
```

**The first failure point will show exactly what's wrong.**

---

## Expected Error Scenarios

### Scenario 1: Provider Not Enabled

**Log Output**:
```
[TWD Import] Provider status: false
[TWD Import] ERROR: TwelveData provider is disabled. Please enable it first.
```

**Fix**: Click "Enable" button in admin UI, then retry import.

---

### Scenario 2: Invalid API Key

**Log Output**:
```
[TWD Import] Fetching forex pairs from: https://api.twelvedata.com/forex_pairs
[TWD Import] Forex response status: 401 Unauthorized
[TWD Import] Forex API error: 401 {"status":"error","message":"Invalid API key"}
[TWD Import] Total markets to import: 0
[TWD Import] ERROR: No markets were fetched from TwelveData API
```

**Fix**:
```bash
# Check API key
cat .env | grep TWD_API_KEY

# Update if needed
nano .env
# Change TWD_API_KEY=your_new_key

# Restart
pm2 restart backend
```

---

### Scenario 3: Rate Limit

**Log Output**:
```
[TWD Import] Forex response status: 429 Too Many Requests
[TWD Import] Forex API error: 429 Rate limit exceeded
```

**Fix**: Wait 1 minute and try again. TwelveData free tier:
- 800 calls/day
- 8 calls/minute

---

### Scenario 4: Database Error

**Log Output**:
```
[TWD Import] Starting database transaction...
[TWD Import] Upserting 5150 markets...
[TWD Import] FATAL ERROR: SequelizeDatabaseError: Deadlock found when trying to get lock
```

**Fix**: This is the `{ alter: true }` deadlock issue. See below.

---

## Database Deadlock Issue

### Problem

Your backend logs show:
```
Database sync failed: Error
sql: 'ALTER TABLE `user` CHANGE `emailVerified` `emailVerified` TINYINT(1) NOT NULL DEFAULT false;'
SequelizeDatabaseError: Deadlock found when trying to get lock; try restarting transaction
```

### Cause

In `/backend/db.ts` line 58:
```typescript
await this.sequelize.sync({ alter: true });
```

This tries to ALTER tables on every startup, which can:
1. Cause deadlocks if multiple processes start simultaneously
2. Interfere with ongoing transactions
3. Slow down startup

### Solution (Recommended)

**Option 1: Disable Auto-Sync** (safest for production):

Edit `/backend/db.ts` line 58:
```typescript
// OLD:
await this.sequelize.sync({ alter: true });

// NEW:
await this.sequelize.sync({ alter: false }); // Only create missing tables, don't alter
```

**Option 2: Remove Sync Entirely** (if schema is stable):
```typescript
// Comment out the sync:
// await this.sequelize.sync({ alter: true });
console.log("Skipping schema sync (stable schema)");
```

**Option 3: Sync Only on First Run**:
```typescript
const shouldSync = process.env.DB_SYNC_ON_STARTUP === "true";
if (shouldSync) {
  await this.sequelize.sync({ alter: true });
}
```

Then in `.env`:
```env
# Set to false after first successful run
DB_SYNC_ON_STARTUP=false
```

**After changing**, restart:
```bash
pm2 restart all
```

---

## Test Script

Run this to test TwelveData API without importing:

```bash
ts-node -r dotenv/config -r module-alias/register backend/utils/twd/test-api.ts
```

**Expected Output**:
```
=== TwelveData API Test ===

API Key: abc12345...
Base URL: https://api.twelvedata.com

1. Testing Forex Pairs endpoint...
   Status: 200 OK
   ✅ Success!
   Data keys: [ 'data', 'status' ]
   Has data array: true
   Count: 50
   First item: { symbol: 'EUR/USD', currency_base: 'EUR', currency_quote: 'USD', ... }

2. Testing Stocks endpoint...
   Status: 200 OK
   ✅ Success!
   Count: 5000

3. Testing Indices endpoint...
   Status: 200 OK
   ✅ Success!
   Count: 100

=== Test Complete ===
```

If any test fails, you'll see exactly why.

---

## Complete Testing Checklist

### 1. Pre-Import Checks

- [ ] Backend running without errors
- [ ] `.env` has `TWD_API_KEY` (32 chars)
- [ ] Database is accessible
- [ ] TWD provider exists in `exchange` table
- [ ] Provider status = 1 (enabled)

**SQL Checks**:
```sql
-- Check provider
SELECT * FROM exchange WHERE productId = 'twelvedata';
-- Should return 1 row with status = 1

-- Check existing markets (should be 0 before first import)
SELECT COUNT(*) FROM twd_market;
```

### 2. Run Import

- [ ] Navigate to `/admin/finance/exchange/provider/twelvedata`
- [ ] Status tag shows "Active" (green)
- [ ] Click "Import Markets" button
- [ ] Wait for response (5-30 seconds depending on API speed)

### 3. Success Verification

**Frontend**:
- [ ] Green success alert appears
- [ ] Message: "Markets imported successfully!"
- [ ] Shows counts: "X forex, Y stocks, Z indices"
- [ ] Markets table below shows data

**Backend Logs**:
- [ ] `[TWD Import] Import successful!`
- [ ] No FATAL ERROR messages

**Database**:
```sql
-- Check total count
SELECT COUNT(*) FROM twd_market;
-- Should be ~5150 (50 forex + 5000 stocks + 100 indices)

-- Check by type
SELECT type, COUNT(*) FROM twd_market GROUP BY type;
-- Should show:
-- forex   | ~50
-- stocks  | ~5000
-- indices | ~100

-- All should be disabled initially
SELECT COUNT(*) FROM twd_market WHERE status = true;
-- Should be: 0
```

### 4. Enable Markets

- [ ] Filter by type: "forex"
- [ ] Enable EUR/USD (click status toggle → green)
- [ ] Enable GBP/USD
- [ ] Enable USD/JPY
- [ ] Filter by type: "stocks"
- [ ] Enable AAPL
- [ ] Enable MSFT
- [ ] Filter by type: "indices"
- [ ] Enable SPX

**Verify**:
```sql
SELECT symbol, type, status FROM twd_market WHERE status = true;
-- Should show the 7 markets you enabled
```

### 5. WebSocket Subscription

```bash
# Check eco-bridge logs
pm2 logs backend --lines 50 | grep eco-bridge

# Should see (within 60 seconds):
[eco-bridge] > subscribe EUR/USD,GBP/USD,USD/JPY,AAPL,MSFT,SPX
```

### 6. User Can See Markets

- [ ] Log out from admin
- [ ] Log in as regular user
- [ ] Navigate to `/forex`
- [ ] Should see: EUR/USD, GBP/USD, USD/JPY
- [ ] Should NOT see other forex pairs
- [ ] Navigate to `/stocks`
- [ ] Should see: AAPL, MSFT
- [ ] Navigate to `/indices`
- [ ] Should see: SPX

### 7. Trading Flow

- [ ] Click EUR/USD market
- [ ] Trading page loads
- [ ] See "Paper Trading" banner
- [ ] Paper wallet shows $10,000 balance
- [ ] Price updates in real-time
- [ ] Can place market order
- [ ] Can place limit order
- [ ] Orders appear in history

---

## Common Log Patterns

### ✅ Successful Import

```
[TWD Import] Starting market import...
[TWD Import] API Key present: true
[TWD Import] API Key length: 32
[TWD Import] Provider check passed, proceeding with API calls...
[TWD Import] Forex response status: 200 OK
[TWD Import] Processed 50 forex pairs
[TWD Import] Stocks response status: 200 OK
[TWD Import] Processed 5000 stocks
[TWD Import] Indices response status: 200 OK
[TWD Import] Processed 100 indices
[TWD Import] Total markets to import: 5150
[TWD Import] Starting database transaction...
[TWD Import] Upserting 5150 markets...
[TWD Import] Transaction complete: { created: 5150, updated: 0, deleted: 0 }
[TWD Import] Import successful!
```

### ❌ API Key Error

```
[TWD Import] Starting market import...
[TWD Import] API Key present: false
[TWD Import] ERROR: TWD_API_KEY is not configured in .env file
[TWD Import] FATAL ERROR: Error: TWD_API_KEY is not configured in .env file
```

### ❌ Provider Disabled

```
[TWD Import] Starting market import...
[TWD Import] Checking provider status in exchange table...
[TWD Import] Provider found: true
[TWD Import] Provider status: false
[TWD Import] ERROR: TwelveData provider is disabled. Please enable it first.
```

### ❌ TwelveData API Error

```
[TWD Import] Fetching forex pairs from: https://api.twelvedata.com/forex_pairs
[TWD Import] Forex response status: 401 Unauthorized
[TWD Import] Forex API error: 401 {"status":"error","message":"Invalid API key"}
[TWD Import] Fetching stocks from: https://api.twelvedata.com/stocks
[TWD Import] Stocks response status: 401 Unauthorized
[TWD Import] Total markets to import: 0
[TWD Import] ERROR: No markets were fetched from TwelveData API. Please check your API key and connection.
```

---

## Next Steps

1. **Restart backend** with the enhanced logging:
   ```bash
   pm2 restart backend
   # Or for dev mode:
   pnpm dev:backend
   ```

2. **Try import again** and watch the logs

3. **Share the logs** with me if it still fails:
   ```bash
   pm2 logs backend --lines 200 > import-logs.txt
   ```

4. **If successful**, verify the full flow works:
   - Markets in database
   - Markets appear in admin table
   - Enable markets works
   - eco-bridge subscribes
   - Users see enabled markets

---

## Files Modified

1. **`/backend/api/admin/ext/twd/market/import.get.ts`**
   - Added 20+ console.log statements
   - Logs every step of the import process
   - Detailed error messages
   - Stack trace on errors

2. **`/backend/utils/twd/test-api.ts`** (NEW)
   - Standalone test script
   - Tests all 3 TwelveData endpoints
   - Verifies API key works
   - No database dependencies

3. **`/TWD_TROUBLESHOOTING.md`** (NEW)
   - Complete troubleshooting guide
   - Common errors and solutions
   - Database deadlock fix

4. **`/TWD_DEBUG_SUMMARY.md`** (NEW - this file)
   - Debug process documentation
   - Log patterns
   - Testing checklist

---

## Summary

**What was broken**: Import endpoint returned 500 with no detailed error

**What was fixed**: Added comprehensive logging to trace exactly where it fails

**How to use**: Restart backend and check logs when clicking Import Markets

**Expected outcome**: You'll now see exactly which step fails and why

---

**Ready for testing!** Please restart backend and try import again. The logs will tell us exactly what's wrong.
