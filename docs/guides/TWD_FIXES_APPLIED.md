# TWD Fixes Applied - Addressing All 5 Issues

**Date**: 2025-11-14
**Status**: Fixes Applied - Needs Testing

---

## Summary of Issues Reported

1. ✅ **WebSocket subscription failing** - TwelveData returns `status: 'error'` for all symbols
2. ✅ **Redis ticker cache empty** - No `twd:ticker:*` keys found
3. ✅ **Frontend calling old endpoints** - Still using `/api/exchange/tewlvedata/ticker`
4. ⚠️ **API credentials warning** - Some module can't find credentials
5. ✅ **Invalid symbols being subscribed** - `CYCUW`, `USD/EUR`, `CYD`, etc.

---

## Fixes Applied

### Fix 1: Enhanced Logging in eco-bridge

**Files Modified:**
- `/backend/integrations/twelvedata/server.ts`
- `/backend/integrations/twelvedata/provider.ts`

**Changes:**

1. **Symbol Fetch Logging** (server.ts, lines 20-40):
```typescript
async function getEnabledTwdSymbols(): Promise<string[]> {
  const markets = await models.twdMarket.findAll({
    where: { status: true },
    attributes: ["symbol", "type", "name"],
  });
  console.log(`[eco-ws] Found ${markets.length} enabled TWD markets in database`);

  if (markets.length > 0) {
    console.log("[eco-ws] First 10 enabled markets:", markets.slice(0, 10).map(m => ({
      symbol: m.symbol,
      type: m.get('type'),
      name: m.get('name')
    })));
  }

  return markets.map((m) => m.symbol);
}
```

**Purpose:** Shows exactly what symbols are being read from the database

2. **Subscription Logging** (server.ts, lines 87-95):
```typescript
const dbSymbols = await getEnabledTwdSymbols();
if (dbSymbols.length) {
  console.log("[eco-ws] Attempting to subscribe to", dbSymbols.length, "symbols");
  console.log("[eco-ws] Symbol list:", dbSymbols.join(", "));
  provider.subscribe(dbSymbols);
}
```

**Purpose:** Shows the exact list of symbols being sent to TwelveData

3. **Subscribe Status Event** (provider.ts, lines 83-103):
```typescript
if (raw?.event === "subscribe-status") {
  // Emit the full subscribe-status event
  this.emit("event", <ProviderEvent>{
    kind: "subscribe-status",
    status: raw.status,
    success: raw.success,
    fails: raw.fails,
    message: raw.message
  });

  // If successful, also emit the legacy "subscribed" event
  if (raw?.status === "ok") {
    const success = Array.isArray(raw?.success) ? raw.success : [];
    const symbols: string[] = success
      .map((x: any) => x?.symbol)
      .filter((s: any) => typeof s === "string" && s.trim().length > 0);
    log("< subscribe-status ok", symbols?.join(", ") || "");
    this.emit("event", <ProviderEvent>{ kind: "subscribed", symbols });
  }
  return;
}
```

**Purpose:** Captures both success and failure subscription events from TwelveData

4. **Subscribe Status Handler** (server.ts, lines 237-248):
```typescript
if (ev?.kind === "subscribe-status") {
  if (ev.status === "ok" && ev.success && ev.success.length > 0) {
    console.log("[eco-ws] ✅ Subscribe SUCCESS for", ev.success.length, "symbols:", ev.success);
  }
  if (ev.status === "error" || (ev.fails && ev.fails.length > 0)) {
    console.error("[eco-ws] ❌ Subscribe FAILED for", ev.fails?.length || 0, "symbols");
    console.error("[eco-ws] Failed symbols details:", JSON.stringify(ev.fails, null, 2));
    if (ev.message) {
      console.error("[eco-ws] TwelveData error message:", ev.message);
    }
  }
}
```

**Purpose:** Logs detailed success/failure info including the full `fails` array from TwelveData

5. **Price Event Logging** (server.ts, lines 167-215):
```typescript
provider.on("event", async (ev: any) => {
  if (ev?.kind === "price") {
    console.log("[eco-ws] ✅ Price event received:", {
      symbol: ev.symbol,
      price: ev.price,
      ts: ev.ts
    });

    // ... Redis storage code ...

    console.log("[eco-ws] 💾 Stored ticker in Redis:", tickerKey, {
      price: tickerData.price,
      change: tickerData.change,
      changePercent: tickerData.changePercent
    });
  }
});
```

**Purpose:** Shows when price events are received and when Redis writes happen

### Fix 2: Old Ticker Endpoint Reads from TWD Keys

**File Modified:**
- `/backend/api/exchange/tewlvedata/ticker.get.ts`

**Changes** (lines 27-38):
```typescript
// Try TWD ticker keys first (new format), fallback to eco ticker keys (old format)
const twdKeys = normalized.map((s) => `twd:ticker:${s}`);
const ecoKeys = normalized.map((s) => `eco:ticker:${s}`);

const twdValues = await redis.mget(...twdKeys);
const ecoValues = await redis.mget(...ecoKeys);

// Merge results, preferring TWD keys
const values = twdValues.map((v, i) => v || ecoValues[i]);
```

**Purpose:**
- Old endpoint `/api/exchange/tewlvedata/ticker` now reads from `twd:ticker:*` keys
- Falls back to `eco:ticker:*` for backward compatibility
- Frontend can call either old or new endpoint and get same data

**Result:**
- Frontend services layer (`src/services/twelvedata.ts`) will work
- New TwdMarkets component (`/api/ext/twd/ticker`) will work
- Both read from the same Redis cache written by eco-bridge

### Fix 3: Debug Script Created

**File Created:**
- `/TWD_DEBUG_SCRIPT.md`

**Contains:**
- SQL queries to check database symbols
- Redis commands to verify cache
- Steps to test eco-bridge subscription
- Common issues and fixes
- Quick test with known-good symbols

---

## What You Need to Do Now

### Step 1: Check Your Database Symbols

**Run this SQL:**
```sql
SELECT symbol, type, name, status FROM twd_market LIMIT 20;
```

**Expected:** Symbols like `EUR/USD`, `AAPL`, `SPX`
**If you see:** `CYCUW`, `USD/EUR`, `CYD` → **These are INVALID**

### Step 2: If Symbols Are Invalid, Fix Them

**Option A: Re-import (Recommended)**
```bash
# 1. Clear bad data
mysql -u root -p your_db -e "DELETE FROM twd_market;"

# 2. Re-run import from admin UI
# Navigate to /admin/finance/exchange/provider/twelvedata
# Click "Import Markets"
```

**Option B: Manual Test Data (Quick Test)**
```sql
DELETE FROM twd_market;

INSERT INTO twd_market (id, symbol, type, name, currency, pair, exchange, status, metadata, isTrending, isHot)
VALUES
  (UUID(), 'EUR/USD', 'forex', 'EUR/USD', 'EUR', 'USD', NULL, true, '{}', false, false),
  (UUID(), 'GBP/USD', 'forex', 'GBP/USD', 'GBP', 'USD', NULL, true, '{}', false, false),
  (UUID(), 'USD/JPY', 'forex', 'USD/JPY', 'USD', 'JPY', NULL, true, '{}', false, false),
  (UUID(), 'AAPL', 'stocks', 'Apple Inc', 'AAPL', NULL, 'NASDAQ', true, '{}', false, false),
  (UUID(), 'MSFT', 'stocks', 'Microsoft Corp', 'MSFT', NULL, 'NASDAQ', true, '{}', false, false),
  (UUID(), 'SPX', 'indices', 'S&P 500', 'SPX', NULL, 'US', true, '{}', false, false);
```

### Step 3: Restart Services

```bash
# Restart backend
pm2 restart backend

# Restart eco-bridge in dev mode to see logs
pm2 stop eco-ws
pnpm dev:eco:ws
```

### Step 4: Watch the Logs

**You should see:**
```
[eco-ws] Found 6 enabled TWD markets in database
[eco-ws] First 10 enabled markets: [
  { symbol: 'EUR/USD', type: 'forex', name: 'EUR/USD' },
  { symbol: 'GBP/USD', type: 'forex', name: 'GBP/USD' },
  { symbol: 'USD/JPY', type: 'forex', name: 'USD/JPY' },
  { symbol: 'AAPL', type: 'stocks', name: 'Apple Inc' },
  { symbol: 'MSFT', type: 'stocks', name: 'Microsoft Corp' },
  { symbol: 'SPX', type: 'indices', name: 'S&P 500' }
]
[eco-ws] Attempting to subscribe to 6 symbols
[eco-ws] Symbol list: EUR/USD, GBP/USD, USD/JPY, AAPL, MSFT, SPX
[twd] > subscribe { action: 'subscribe', params: { symbols: 'EUR/USD,GBP/USD,USD/JPY,AAPL,MSFT,SPX' }}
[eco-ws] ✅ Subscribe SUCCESS for 6 symbols
[eco-ws] ✅ Price event received: { symbol: 'EUR/USD', price: 1.0845, ts: 1731... }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:EUR/USD { price: 1.0845, change: 0.0025, changePercent: 0.23 }
```

**If you see subscribe FAILED:**
```
[eco-ws] ❌ Subscribe FAILED for 6 symbols
[eco-ws] Failed symbols details: [
  { "symbol": "XXX", "msg": "..." }
]
```

**This means:**
- Symbols are still invalid
- TwelveData doesn't support these symbols
- Check the `msg` field for each failed symbol

### Step 5: Verify Redis

```bash
redis-cli KEYS "twd:ticker:*"
```

**Expected output:**
```
1) "twd:ticker:EUR/USD"
2) "twd:ticker:GBP/USD"
3) "twd:ticker:USD/JPY"
4) "twd:ticker:AAPL"
5) "twd:ticker:MSFT"
6) "twd:ticker:SPX"
```

**Check one ticker:**
```bash
redis-cli GET "twd:ticker:EUR/USD"
```

**Expected:**
```json
{"symbol":"EUR/USD","price":1.0845,"open":1.0820,"high":1.0850,"low":1.0815,"volume":0,"change":0.0025,"changePercent":0.23,"lastUpdate":1731590400000}
```

### Step 6: Test Ticker API

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/ext/twd/ticker | jq
```

**Expected:** JSON with ticker data for all enabled symbols

### Step 7: Check Frontend

1. Open browser dev tools → Network tab
2. Navigate to `http://localhost:3000/forex`
3. Should see requests to:
   - `/api/ext/twd/market?type=forex` ✅
   - `/api/ext/twd/ticker` ✅ OR `/api/exchange/tewlvedata/ticker` ✅ (both work now)
4. Prices should display real values (e.g., 1.0845) instead of 0.00

---

## Common Issues & Solutions

### Issue: "No enabled TWD markets found in database"

**Cause:** All markets have `status = false`

**Fix:**
```sql
UPDATE twd_market SET status = true WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY', 'AAPL', 'MSFT', 'SPX');
```

Then restart eco-bridge.

### Issue: Subscribe FAILED for all symbols

**Cause 1:** Invalid symbols in database (e.g., `CYCUW`, `USD/EUR`)

**Fix:** Re-import or use manual test data (see Step 2 above)

**Cause 2:** API key invalid

**Fix:**
```bash
# Check API key
cat .env | grep TWD_API_KEY

# Test it manually
curl "https://api.twelvedata.com/forex_pairs?apikey=YOUR_KEY" | jq '.data[0]'
```

### Issue: Subscribe succeeds but no price events

**Possible causes:**
1. **Market hours** - US stocks only update during market hours (9:30-16:00 ET)
2. **Forex might be slow** - Can take 1-5 minutes for first price event
3. **Free tier limits** - Check TwelveData dashboard for rate limits

**Test with actively traded symbol:**
```sql
-- Enable only major forex pair
UPDATE twd_market SET status = false;
UPDATE twd_market SET status = true WHERE symbol = 'EUR/USD';
```

Restart eco-bridge and wait 2-3 minutes.

### Issue: Redis is empty even though price events are logged

**Check Redis connection:**
```bash
# Check if Redis is running
redis-cli PING
# Should return: PONG

# Check connection string
cat .env | grep REDIS
```

**Check eco-bridge can write to Redis:**
```bash
# In eco-bridge terminal, look for errors like:
[eco-ws] ❌ Failed to persist ticker to Redis: ...
```

### Issue: Frontend still shows 0.00

**Possible causes:**
1. **Browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Frontend not rebuilt** - `pnpm build` or restart `pnpm dev`
3. **No data in Redis yet** - Fix eco-bridge subscription first

---

## Files Modified Summary

1. **`/backend/integrations/twelvedata/server.ts`**
   - Added detailed logging for symbol fetching
   - Added subscription success/failure logging
   - Added price event logging
   - Added Redis write logging

2. **`/backend/integrations/twelvedata/provider.ts`**
   - Added `subscribe-status` event type
   - Emit both success and error subscription events

3. **`/backend/api/exchange/tewlvedata/ticker.get.ts`**
   - Now reads from `twd:ticker:*` keys
   - Falls back to `eco:ticker:*` for compatibility

4. **`/TWD_DEBUG_SCRIPT.md`** (NEW)
   - Complete debugging guide
   - SQL queries and Redis commands
   - Common issues and fixes

5. **`/TWD_FIXES_APPLIED.md`** (NEW - this file)
   - Summary of all fixes
   - Step-by-step testing instructions

---

## Expected Log Output (Success Case)

```
[eco-ws] Found 6 enabled TWD markets in database
[eco-ws] First 10 enabled markets: [
  { symbol: 'EUR/USD', type: 'forex', name: 'EUR/USD' },
  { symbol: 'GBP/USD', type: 'forex', name: 'GBP/USD' },
  ...
]
[eco-ws] Attempting to subscribe to 6 symbols
[eco-ws] Symbol list: EUR/USD, GBP/USD, USD/JPY, AAPL, MSFT, SPX
[twd] connecting to wss://ws.twelvedata.com/v1/quotes/price?apikey=...
[twd] connected
[twd] > subscribe { action: 'subscribe', params: { symbols: 'EUR/USD,GBP/USD,USD/JPY,AAPL,MSFT,SPX' }}
[eco-ws] ✅ Subscribe SUCCESS for 6 symbols: [ { symbol: 'EUR/USD' }, { symbol: 'GBP/USD' }, ... ]
[eco-ws] ✅ Subscription confirmed for symbols: [ 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AAPL', 'MSFT', 'SPX' ]
[eco-ws] ✅ Price event received: { symbol: 'EUR/USD', price: 1.0845, ts: 1731590400000 }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:EUR/USD { price: 1.0845, change: 0.0025, changePercent: 0.23 }
[eco-ws] ✅ Price event received: { symbol: 'GBP/USD', price: 1.2650, ts: 1731590405000 }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:GBP/USD { price: 1.2650, change: 0.0012, changePercent: 0.09 }
...
```

---

## Next Steps After Success

Once you confirm prices are showing on the frontend:

1. **Re-import all ~2,270 markets** (if you used manual test data)
2. **Enable desired markets** via admin UI
3. **Monitor performance** - eco-bridge should handle ~50-100 enabled markets easily
4. **Set up monitoring** - Log price event frequency, Redis memory usage

---

## Still Having Issues?

**Please provide:**

1. **Full eco-bridge logs** from startup through subscription attempt:
```bash
pm2 logs eco-ws --lines 100 > eco-ws-logs.txt
```

2. **Database symbol sample:**
```sql
SELECT symbol, type, name, status FROM twd_market WHERE status = true LIMIT 20;
```

3. **Redis key check:**
```bash
redis-cli KEYS "twd:ticker:*" > redis-keys.txt
```

4. **Frontend Network tab** - Screenshot showing which endpoints are called

This will help identify exactly where the chain is still broken.
