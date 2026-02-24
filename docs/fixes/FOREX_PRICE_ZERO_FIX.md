# FOREX Price 0.00 Issue - Root Cause & Fix

## Problem Summary

After wallet transfer changes, FOREX markets show **0.00** for Price and Change on `/forex` page.

### Observed Symptoms

1. ✅ Markets list loads correctly (EUR/USD, VND/USD, XDR/USD visible)
2. ❌ `GET /api/ext/twd/ticker` returns empty `{}`  (Content-Length: 2)
3. ❌ No price websocket is connected (only webpack-hmr visible)
4. ❌ All prices show 0.00

---

## Root Cause Analysis

### Price Flow Architecture

```
TwelveData API (WebSocket)
         ↓
backend/integrations/twelvedata/server.ts (Port 4002)
         ↓
Redis Keys: twd:ticker:${symbol}
         ↓
backend/api/ext/twd/ticker/index.get.ts
         ↓
Frontend: src/components/pages/user/markets/TwdMarkets.tsx
         ↓
Display prices on /forex
```

### Investigation Results

**✅ What IS Working:**
- TwelveData WebSocket server is running (PID 48312)
- Server is listening on port 4002
- 9 enabled TWD markets exist in database:
  - EUR/USD (forex)
  - VND/USD (forex)
  - XDR/USD (forex)
  - DECK, DEFT, DECO (stocks)
  - 000004, 000005, 000006 (indices)

**❌ What is NOT Working:**
- **Redis has 0 ticker keys** (`twd:ticker:*`)
- Without Redis keys, the ticker API returns empty `{}`
- Frontend shows 0.00 for all prices

### Environment Configuration

```env
TWD_API_KEY=bfd83e13843541699bf45d9f397c25a3
TWD_WS_URL=wss://ws.twelvedata.com/v1/quotes/price?apikey=bfd83e13843541699bf45d9f397c25a3
TWD_MAX_SYMBOLS=3          ← Only 3 symbols subscribed (out of 9 enabled)
TWD_DISABLE_REST=true      ← REST API priming is DISABLED ⚠️
ECO_WS_PORT=4002
```

---

## The Core Issue

### Issue #1: REST Priming Disabled

**File:** `backend/integrations/twelvedata/server.ts`

**Code (Line 107-112):**
```typescript
// Prime tickers with 24h data immediately (only if REST enabled)
if (!TWD_DISABLE_REST) {
  console.log("[eco-ws] Initial priming of tickers with 24h data...");
  await primeTickersWithQuote(symbolsToSubscribe).catch((err) => {
    console.error("[eco-ws] Error during initial ticker priming:", err);
  });
}
```

**Impact:**
- With `TWD_DISABLE_REST=true`, no initial price data is fetched via REST API
- The system relies 100% on WebSocket price events
- If WebSocket doesn't send price events, Redis stays empty forever

**Why REST is Important:**
- REST `/quote` endpoint provides full 24h stats: open, high, low, volume, change, changePercent
- WebSocket only provides current price updates
- REST priming creates initial ticker data with change calculations

### Issue #2: Limited Symbol Subscriptions

**Environment:** `TWD_MAX_SYMBOLS=3`

**Code (Line 96-102):**
```typescript
// Limit to TWD_MAX_SYMBOLS to avoid overwhelming free tier
const symbolsToSubscribe = dbSymbols.slice(0, TWD_MAX_SYMBOLS);

if (dbSymbols.length > TWD_MAX_SYMBOLS) {
  console.warn(`[eco-ws] ⚠️  Found ${dbSymbols.length} enabled symbols, but TWD_MAX_SYMBOLS=${TWD_MAX_SYMBOLS}`);
  console.warn(`[eco-ws] ⚠️  Only subscribing to first ${TWD_MAX_SYMBOLS} symbols`);
  console.warn(`[eco-ws] ⚠️  Skipped symbols:`, dbSymbols.slice(TWD_MAX_SYMBOLS).join(", "));
}
```

**Impact:**
- Only first 3 out of 9 enabled symbols are subscribed
- If EUR/USD is not in the first 3, it won't receive price updates
- Other 6 symbols will never get prices

### Issue #3: WebSocket Price Events Not Received

**File:** `backend/integrations/twelvedata/server.ts` (Line 271-330)

**Flow:**
1. WebSocket receives price event from TwelveData
2. Event handler at line 271: `provider.on("event", async (ev: any) => { ... })`
3. If `ev.kind === "price"`, persist to Redis (line 283)
4. Key: `twd:ticker:${symbol}` with 24h expiry

**Problem:**
- If TwelveData WebSocket doesn't send price events (market closed, symbol invalid, API issue), no Redis keys are created
- Forex markets (EUR/USD, etc.) might not have active price updates during certain hours
- Without REST priming, there's NO fallback to populate initial data

---

## Why Transfers Didn't Cause This

**Important:** The wallet transfer changes did NOT break price flow.

**Files Modified for Transfers:**
1. `backend/api/finance/currency/index.get.ts` - Transfer currency API
2. `src/stores/user/wallet/transfer.ts` - Transfer wizard store
3. `src/utils/transfer-matrix.ts` - Wallet type metadata

**None of these touch:**
- TwelveData WebSocket server
- Redis ticker storage
- Price feed logic

**Most Likely Explanation:**
1. Prices worked before because REST priming was enabled OR WebSocket was actively receiving events
2. `TWD_DISABLE_REST=true` was set to save API credits during development
3. WebSocket stopped receiving events (API limit, market closed, connection issue)
4. Without REST fallback, prices disappeared

---

## Solution

### Fix #1: Enable REST Priming (Quick Fix)

**Change `.env`:**
```env
# Before:
TWD_DISABLE_REST=true

# After:
TWD_DISABLE_REST=false
```

**Restart TwelveData server:**
```bash
# If running in dev mode:
# Stop current process (Ctrl+C in terminal)
pnpm dev:eco:ws

# If running with PM2:
pm2 restart eco-ws
pm2 logs eco-ws --lines 50
```

**Expected Logs:**
```
[eco-ws] Initial priming of tickers with 24h data...
[eco-ws] 📊 Primed ticker with quote data: EUR/USD { price: 1.0532, change: '0.00', changePercent: '0.01', volume: 0 }
[eco-ws] 📊 Primed ticker with quote data: VND/USD ...
[eco-ws] 📊 Primed ticker with quote data: XDR/USD ...
```

**Verification:**
```bash
# Check Redis keys
node -e "
const redis = require('ioredis');
const client = new redis();
client.keys('twd:ticker:*').then(keys => {
  console.log('Ticker keys:', keys.length);
  keys.forEach(k => console.log(k));
  client.disconnect();
});
"
```

**Why This Works:**
- REST API calls `/quote` endpoint for each symbol
- Fetches full 24h data: open, high, low, volume, previous_close
- Calculates change and changePercent
- Stores in Redis: `twd:ticker:${symbol}`
- Frontend immediately sees prices

---

### Fix #2: Increase Symbol Limit (If You Have More Credits)

**Change `.env`:**
```env
# Before:
TWD_MAX_SYMBOLS=3

# After:
TWD_MAX_SYMBOLS=9   # Or whatever your API plan allows
```

**Why This Helps:**
- Subscribes to all 9 enabled markets instead of just 3
- Ensures EUR/USD and other important markets are included
- More markets get real-time updates

**TwelveData API Limits:**
- **Free Tier**: 800 API calls/day, 1 WebSocket connection, 3 concurrent symbols
- **Basic Plan ($49/mo)**: 6000 calls/day, 3 WebSocket connections, 10 concurrent symbols
- **Pro Plan ($129/mo)**: 15000 calls/day, 5 WebSocket connections, 50 concurrent symbols

**If on Free Tier:** Keep `TWD_MAX_SYMBOLS=3` but prioritize important symbols (EUR/USD, etc.)

---

### Fix #3: Prioritize Important Symbols

**File:** `backend/integrations/twelvedata/server.ts` (Line 92-96)

**Current Code:**
```typescript
const symbolsToSubscribe = dbSymbols.slice(0, TWD_MAX_SYMBOLS);
```

**Improved Code:**
```typescript
// Prioritize forex symbols, then stocks, then indices
const priorityOrder = ['forex', 'stocks', 'indices'];
const sortedSymbols = dbSymbols.sort((a, b) => {
  const aMarket = markets.find(m => m.symbol === a);
  const bMarket = markets.find(m => m.symbol === b);
  const aPriority = priorityOrder.indexOf(aMarket?.get('type') || 'indices');
  const bPriority = priorityOrder.indexOf(bMarket?.get('type') || 'indices');
  return aPriority - bPriority;
});
const symbolsToSubscribe = sortedSymbols.slice(0, TWD_MAX_SYMBOLS);
```

**Why This Helps:**
- Ensures FOREX markets (EUR/USD, VND/USD, XDR/USD) are prioritized
- More important for /forex page
- Stocks and indices come after

---

### Fix #4: Check TwelveData WebSocket Connection

**Add Debug Logging:**

Edit `backend/integrations/twelvedata/provider.ts` to add connection diagnostics.

**Check WebSocket Events:**
```bash
# Watch eco-ws logs in real-time
pm2 logs eco-ws --lines 100

# Look for:
# ✅ "connected to wss://ws.twelvedata.com/..."
# ✅ "✅ Subscription confirmed for symbols: ..."
# ✅ "✅ Price event received: { symbol: 'EUR/USD', price: 1.0532 }"
# ❌ "❌ Subscribe FAILED for ..."
# ❌ WebSocket errors or disconnections
```

**Common WebSocket Issues:**
1. **Invalid API Key:** Check TWD_API_KEY is correct
2. **Subscription Limits:** Free tier only allows 3 concurrent symbols
3. **Invalid Symbols:** TwelveData rejects symbols not in their database
4. **Market Closed:** Forex markets don't trade on weekends
5. **Connection Drops:** Auto-reconnect should happen, check logs

---

## Verification Checklist

### Step 1: Check Redis Keys

```bash
node -e "
const redis = require('ioredis');
const client = new redis();
client.keys('twd:ticker:*').then(keys => {
  console.log('Total ticker keys:', keys.length);
  if (keys.length > 0) {
    console.log('Sample keys:');
    keys.slice(0, 5).forEach(k => console.log('  -', k));
    return client.get(keys[0]);
  }
  return null;
}).then(data => {
  if (data) {
    console.log('Sample ticker data:', JSON.parse(data));
  } else {
    console.log('❌ No ticker keys found in Redis');
  }
  client.disconnect();
});
"
```

**Expected Output:**
```
Total ticker keys: 3
Sample keys:
  - twd:ticker:EUR/USD
  - twd:ticker:VND/USD
  - twd:ticker:XDR/USD
Sample ticker data: {
  symbol: 'EUR/USD',
  price: 1.0532,
  open: 1.0530,
  high: 1.0545,
  low: 1.0520,
  volume: 0,
  change: 0.0002,
  changePercent: 0.019,
  lastUpdate: 1672531200000
}
```

---

### Step 2: Test Ticker API

```bash
# Test ticker endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/ext/twd/ticker
```

**Expected Response:**
```json
{
  "EUR/USD": {
    "symbol": "EUR/USD",
    "price": 1.0532,
    "open": 1.0530,
    "high": 1.0545,
    "low": 1.0520,
    "volume": 0,
    "change": 0.0002,
    "changePercent": 0.019,
    "lastUpdate": 1672531200000
  },
  "VND/USD": {
    ...
  }
}
```

**If Still Empty `{}`:**
- Redis doesn't have any `twd:ticker:*` keys
- TwelveData server is not writing to Redis
- Check server logs for errors

---

### Step 3: Verify Frontend Display

1. **Navigate to:** `http://localhost:3000/forex`
2. **Check Network Tab:**
   - `GET /api/ext/twd/ticker` should return ticker data (not `{}`)
   - Request should happen every 1-5 seconds (polling)
3. **Check Table:**
   - EUR/USD should show price (e.g., 1.0532)
   - Change should show non-zero value (e.g., +0.0002 or -0.0001)
   - Percentage should show non-zero (e.g., +0.02%)

**If Still 0.00:**
- Check browser console for errors
- Verify `data` object in Network response matches expected format
- Check if frontend is correctly parsing ticker data

---

## Manual Testing Steps

### Test 1: Enable REST Priming

1. **Update `.env`:**
   ```env
   TWD_DISABLE_REST=false
   ```

2. **Restart server:**
   ```bash
   # Kill existing process
   pkill -f "twelvedata/server.ts"

   # Start fresh
   pnpm dev:eco:ws
   ```

3. **Watch logs:**
   ```
   [eco-ws] Initial priming of tickers with 24h data...
   [eco-ws] 📊 Primed ticker with quote data: EUR/USD { price: 1.0532 }
   ```

4. **Check Redis:**
   ```bash
   node -e "const redis = require('ioredis'); const c = new redis(); c.keys('twd:ticker:*').then(k => { console.log(k.length + ' keys'); c.disconnect(); });"
   ```

5. **Refresh /forex page** - prices should appear

---

### Test 2: Increase Symbol Limit

1. **Update `.env`:**
   ```env
   TWD_MAX_SYMBOLS=9
   ```

2. **Restart server**

3. **Check logs:**
   ```
   [eco-ws] Subscribing to 9 symbols: EUR/USD, VND/USD, XDR/USD, DECK, DEFT, ...
   ```

4. **Verify all symbols** get prices on /forex

---

### Test 3: WebSocket Connection

1. **Check if WebSocket is receiving events:**
   ```bash
   pm2 logs eco-ws --lines 50 | grep "Price event received"
   ```

2. **Expected Output:**
   ```
   [eco-ws] ✅ Price event received: { symbol: 'EUR/USD', price: 1.0532, ts: 1672531200000 }
   ```

3. **If No Events:**
   - WebSocket is not connected to TwelveData
   - Check TWD_WS_URL and TWD_API_KEY
   - Verify TwelveData API status: https://status.twelvedata.com/
   - Check if subscription succeeded: `grep "Subscribe SUCCESS" logs`

---

## Production Deployment

### Recommended Configuration

**For Free Tier (800 calls/day, 3 symbols):**
```env
TWD_DISABLE_REST=false      # Enable REST priming for initial data
TWD_MAX_SYMBOLS=3           # Limit to 3 symbols
```

**Manual Symbol Priority:**
1. Edit `twd_market` table to set `status=true` only for most important symbols
2. Prioritize EUR/USD, GBP/USD, USD/JPY (most liquid forex pairs)
3. Disable less important symbols

**For Paid Plans (6000+ calls/day, 10+ symbols):**
```env
TWD_DISABLE_REST=false      # Enable REST priming
TWD_MAX_SYMBOLS=10          # Subscribe to more symbols
```

---

## Why This Happens

### TwelveData API Behavior

**WebSocket Events:**
- Only send updates when market is ACTIVE
- Forex markets close on weekends (Saturday/Sunday)
- Stock markets close after hours (4PM EST)
- No events = no Redis updates

**REST API:**
- Always returns last known price
- Includes full 24h stats (open, high, low, volume, change)
- Works even when market is closed

**Why REST Priming is Critical:**
1. Provides initial data when page loads
2. Fills in gaps when WebSocket is quiet
3. Gives change/percentage calculations
4. Works 24/7 regardless of market hours

---

## Long-Term Solution

### Hybrid Approach (Recommended)

**Strategy:**
1. Use REST priming to fetch initial 24h data
2. Use WebSocket for real-time price updates during active hours
3. Refresh REST data periodically (every 60 seconds) as fallback

**Current Implementation:**
- ✅ Initial REST priming (if `TWD_DISABLE_REST=false`)
- ✅ Periodic REST refresh every 60 seconds (line 121-143)
- ✅ WebSocket updates in real-time (line 271-343)

**Configuration:**
```env
TWD_DISABLE_REST=false           # Enable REST priming
TWD_MAX_SYMBOLS=3                # Adjust based on API plan
TWD_REST_REFRESH_INTERVAL=60000  # Refresh every 60 seconds (optional)
```

---

## Common Errors and Solutions

### Error: "No tickers found in cache"

**Cause:** Redis has no `twd:ticker:*` keys

**Solution:**
1. Enable REST priming: `TWD_DISABLE_REST=false`
2. Restart TwelveData server
3. Wait 10-30 seconds for priming to complete
4. Check Redis keys

---

### Error: "Subscribe FAILED for symbols"

**Cause:** TwelveData rejected subscription (invalid symbol, API limit, etc.)

**Solution:**
1. Check logs for specific error messages
2. Verify symbol format (should match TwelveData format)
3. Reduce `TWD_MAX_SYMBOLS` if hitting free tier limit
4. Check API key is valid and has sufficient credits

---

### Error: Prices Never Update

**Cause:** WebSocket not receiving events

**Solution:**
1. Check if market is open (forex markets close on weekends)
2. Verify WebSocket connection: `grep "connected to wss://" logs`
3. Check subscription status: `grep "Subscription confirmed" logs`
4. Enable REST priming as fallback

---

## Summary

### The Fix (TL;DR)

**1. Edit `.env`:**
```env
TWD_DISABLE_REST=false
```

**2. Restart Server:**
```bash
pkill -f "twelvedata/server.ts"
pnpm dev:eco:ws
```

**3. Verify:**
- Check logs for "Primed ticker with quote data"
- Check Redis has keys: `twd:ticker:*`
- Refresh /forex page - prices should appear

**Why This Works:**
- REST API fetches full 24h stats immediately
- Populates Redis with ticker data
- Frontend ticker API returns data instead of `{}`
- Prices display correctly on /forex

---

## Files Involved

### Backend
- `backend/integrations/twelvedata/server.ts` - WebSocket server + REST priming
- `backend/integrations/twelvedata/provider.ts` - TwelveData WebSocket client
- `backend/api/ext/twd/ticker/index.get.ts` - Ticker REST API

### Frontend
- `src/components/pages/user/markets/TwdMarkets.tsx` - FOREX markets table
- `src/pages/forex.tsx` - FOREX page

### Configuration
- `.env` - Environment variables (TWD_DISABLE_REST, TWD_MAX_SYMBOLS, etc.)
- `package.json` - Scripts (dev:eco:ws, eco:ws:start, etc.)

---

## Related Documentation

- **TWD Trading Architecture:** `TWD_TRADING_ARCHITECTURE.md`
- **TWD Quick Start:** `TWD_QUICK_START.md`
- **TWD Dev Setup:** `TWD_DEV_SETUP.md`
- **Wallet Architecture:** `docs/WALLET_ARCHITECTURE_REDESIGN.md`