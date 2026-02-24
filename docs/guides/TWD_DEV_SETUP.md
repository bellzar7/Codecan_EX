# TWD Development Setup Guide

**Date**: 2025-11-14
**Purpose**: Complete guide for developing with TwelveData integration while minimizing API credit usage

---

## Overview

The TWD (TwelveData) integration provides **paper trading** for forex, stocks, and indices using:
- **WebSocket** for real-time price updates (free, minimal credit usage)
- **REST API** for historical data and priming (costs API credits)

In development, you want to:
- ✅ Use WebSocket for all real-time prices
- ❌ Minimize or disable REST calls to save API credits

---

## Environment Variables

Add these to your `.env` file:

```bash
# TwelveData API Credentials
TWD_API_KEY=your_twelvedata_api_key_here
TWD_BASE_URL=https://api.twelvedata.com
TWD_WS_URL=wss://ws.twelvedata.com/v1/quotes/price?apikey=your_twelvedata_api_key_here

# Development Configuration (IMPORTANT!)
TWD_MAX_SYMBOLS=3          # Limit concurrent WebSocket subscriptions (default: 3 for dev)
TWD_DISABLE_REST=true      # Disable REST calls to save API credits (default: false)

# WebSocket Server Port
ECO_WS_PORT=4002           # Port for eco-ws bridge server
```

### Configuration Explained

#### `TWD_MAX_SYMBOLS=3`

**Purpose:** Limit the number of symbols subscribed to TwelveData WebSocket at once.

**Why:**
- Free tier has connection limits
- During development, you don't need 2,000+ symbols
- Focus on a small test set (EUR/USD, GBP/USD, USD/JPY)

**Behavior:**
- If you enable 10 symbols in database, only first 3 will be subscribed
- eco-bridge logs warning showing which symbols were skipped
- You can increase for production (e.g., `TWD_MAX_SYMBOLS=50`)

#### `TWD_DISABLE_REST=true`

**Purpose:** Completely disable REST API calls to TwelveData during development.

**What it disables:**
- ❌ REST priming on eco-ws startup
- ❌ Periodic REST priming every 60 seconds
- ❌ REST fallback for equity symbols (stocks)
- ❌ Historical candles REST fallback (`/api/exchange/tewlvedata/candles`)

**What still works:**
- ✅ WebSocket price updates for all symbols
- ✅ Price, change, changePercent from WebSocket
- ✅ Redis ticker cache
- ✅ Frontend `/forex`, `/stocks`, `/indices` pages

**When to enable REST (`TWD_DISABLE_REST=false`):**
- Production environment
- When you need historical chart data
- When you have sufficient API credits

---

## Step-by-Step Setup

### 1. Enable Test Symbols in Database

Connect to your MySQL database:

```bash
# Using docker-compose MySQL
docker exec -it mysql mysql -u root -p mydatabase
```

Or using mysql client:

```bash
mysql -u root -p mydatabase
```

Run this SQL:

```sql
-- Disable all markets first
UPDATE twd_market SET status = 0;

-- Enable only 3 test symbols (forex pairs that always work)
UPDATE twd_market
  SET status = 1
WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY');

-- Verify
SELECT symbol, type, status FROM twd_market WHERE status = 1;
```

**Expected output:**
```
+----------+-------+--------+
| symbol   | type  | status |
+----------+-------+--------+
| EUR/USD  | forex |      1 |
| GBP/USD  | forex |      1 |
| USD/JPY  | forex |      1 |
+----------+-------+--------+
3 rows in set
```

**Why these 3 symbols:**
- ✅ Major forex pairs (most liquid)
- ✅ Always supported on TwelveData free tier
- ✅ Trade 24/7 (continuous price updates)
- ✅ Perfect for testing

### 2. Update .env File

Add/update these lines in your `.env`:

```bash
TWD_MAX_SYMBOLS=3
TWD_DISABLE_REST=true
```

### 3. Start eco-ws Bridge

The eco-ws bridge connects to TwelveData WebSocket and pushes tickers to Redis.

**Start in dev mode (recommended for seeing logs):**

```bash
pnpm dev:eco:ws
```

**Or start with PM2:**

```bash
pm2 restart eco-ws
pm2 logs eco-ws --lines 50
```

### 4. Watch Startup Logs

**Expected successful startup:**

```
[eco-ws] Configuration:
  - Port: 4002
  - API Key length: 32
  - Max symbols: 3
  - REST disabled: true

[eco-ws] listening on :4002
[eco-ws] TWD_WS_URL = wss://ws.twelvedata.com/v1/quotes/price?apikey=...

[eco-ws] Found 3 enabled TWD markets in database
[eco-ws] First 10 enabled markets: [
  { symbol: 'EUR/USD', type: 'forex', name: 'Euro/US Dollar' },
  { symbol: 'GBP/USD', type: 'forex', name: 'British Pound/US Dollar' },
  { symbol: 'USD/JPY', type: 'forex', name: 'US Dollar/Japanese Yen' }
]
[eco-ws] Subscribing to 3 symbols: EUR/USD, GBP/USD, USD/JPY

[twd] connecting to wss://ws.twelvedata.com/v1/quotes/price?apikey=...
[twd] connected
[twd] > subscribe {
  action: 'subscribe',
  params: { symbols: 'EUR/USD,GBP/USD,USD/JPY' }
}

[eco-ws] ✅ Subscribe SUCCESS for 3 symbols:
  ✅ EUR/USD
  ✅ GBP/USD
  ✅ USD/JPY
[eco-ws] ✅ Subscription confirmed for symbols: [ 'EUR/USD', 'GBP/USD', 'USD/JPY' ]
[eco-ws] REST priming disabled (TWD_DISABLE_REST=true), relying on WebSocket for all prices
```

**Price events start flowing (within 10-60 seconds):**

```
[eco-ws] ✅ Price event received: { symbol: 'EUR/USD', price: 1.0845, ts: 1731... }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:EUR/USD { price: 1.0845, change: 0.0025, changePercent: 0.23 }

[eco-ws] ✅ Price event received: { symbol: 'GBP/USD', price: 1.2650, ts: 1731... }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:GBP/USD { price: 1.2650, change: 0.0012, changePercent: 0.09 }

[eco-ws] ✅ Price event received: { symbol: 'USD/JPY', price: 149.25, ts: 1731... }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:USD/JPY { price: 149.25, change: 0.15, changePercent: 0.10 }
```

### 5. Verify Redis Cache

Check that tickers are being stored:

```bash
# List all TWD ticker keys
redis-cli KEYS "twd:ticker:*"
```

**Expected output:**
```
1) "twd:ticker:EUR/USD"
2) "twd:ticker:GBP/USD"
3) "twd:ticker:USD/JPY"
```

**Check ticker data:**

```bash
redis-cli GET "twd:ticker:EUR/USD"
```

**Expected JSON:**
```json
{
  "symbol": "EUR/USD",
  "price": 1.0845,
  "open": 1.0820,
  "high": 1.0850,
  "low": 1.0815,
  "volume": 0,
  "change": 0.0025,
  "changePercent": 0.23,
  "lastUpdate": 1731590400000
}
```

**Check all 3 symbols:**

```bash
redis-cli GET "twd:ticker:GBP/USD"
redis-cli GET "twd:ticker:USD/JPY"
```

All should return valid JSON with non-zero prices.

### 6. Test Backend API

Test the ticker API endpoint:

```bash
curl http://localhost:4000/api/ext/twd/ticker | jq
```

**Expected response:**
```json
{
  "EUR/USD": {
    "symbol": "EUR/USD",
    "price": 1.0845,
    "open": 1.0820,
    "high": 1.0850,
    "low": 1.0815,
    "volume": 0,
    "change": 0.0025,
    "changePercent": 0.23,
    "lastUpdate": 1731590400000
  },
  "GBP/USD": {
    "symbol": "GBP/USD",
    "price": 1.2650,
    "open": 1.2638,
    "high": 1.2660,
    "low": 1.2630,
    "volume": 0,
    "change": 0.0012,
    "changePercent": 0.09,
    "lastUpdate": 1731590405000
  },
  "USD/JPY": {
    "symbol": "USD/JPY",
    "price": 149.25,
    "open": 149.10,
    "high": 149.35,
    "low": 149.05,
    "volume": 0,
    "change": 0.15,
    "changePercent": 0.10,
    "lastUpdate": 1731590410000
  }
}
```

### 7. Test Frontend

**Open forex page:**
```
http://localhost:3000/forex
```

**Expected:**
- ✅ Table shows 3 rows: EUR/USD, GBP/USD, USD/JPY
- ✅ **Price column shows real values** (e.g., 1.0845) NOT 0.00
- ✅ **Change column shows real percentages** (e.g., +0.23%)
- ✅ Prices update every 5 seconds
- ✅ Dev Tools Network tab shows:
  - `GET /api/ext/twd/market?type=forex` → 200 OK
  - `GET /api/ext/twd/ticker` → 200 OK (repeats every 5s)

**Check browser console:**
- No errors
- No failed API requests
- Ticker updates logging (if you have debug logging enabled)

---

## Troubleshooting

### Issue: Only EUR/USD Gets Prices, Others Show 0.00

**Symptoms:**
- Redis only has `twd:ticker:EUR/USD`
- GBP/USD and USD/JPY show 0.00 on frontend

**Possible Causes:**

1. **TWD_MAX_SYMBOLS too low**
   - Check logs: `[eco-ws] ⚠️  Found 3 enabled symbols, but TWD_MAX_SYMBOLS=1`
   - Fix: Set `TWD_MAX_SYMBOLS=3` or higher

2. **Subscription failed for some symbols**
   - Check logs for: `[eco-ws] ❌ Subscribe FAILED`
   - Check error messages per symbol
   - Common: Exotic pairs not supported on free tier

3. **WebSocket disconnected**
   - Check logs for: `[twd] closed`
   - Restart eco-ws: `pm2 restart eco-ws`

### Issue: Subscription Fails with "Symbol not available"

**Logs show:**
```
[eco-ws] ❌ Subscribe FAILED for 1 symbols
  ❌ USD/RUB: Symbol not available on free tier
```

**Fix:** These are exotic pairs. Use only major pairs:
```sql
UPDATE twd_market SET status = 0;
UPDATE twd_market SET status = 1
WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD');
```

Restart eco-ws.

### Issue: Charts on /trade/:symbol Are Empty

**This is expected when `TWD_DISABLE_REST=true`**

**Why:**
- Historical OHLCV data requires REST API (`/time_series`)
- REST is disabled to save credits

**Solutions:**

**Option A: Accept Empty Charts in Dev**
- Focus on testing ticker/price display
- Charts will work in production with `TWD_DISABLE_REST=false`

**Option B: Enable REST Temporarily**
- Set `TWD_DISABLE_REST=false`
- Restart eco-ws
- Load chart page ONCE
- Set `TWD_DISABLE_REST=true` again
- Restart eco-ws

**Option C: Mock Chart Data Locally**
- Create fake OHLCV data in local cache
- Won't hit TwelveData API

### Issue: "No price events" After Subscription Success

**If subscription succeeds but no prices arrive:**

1. **Wait 1-2 minutes**
   - First price event can take time
   - Forex should arrive within 30-60 seconds

2. **Check Market Hours (for stocks)**
   - US stocks only update during market hours (9:30-16:00 ET)
   - If testing stocks, use forex instead (24/7 trading)

3. **Check TwelveData Dashboard**
   - Login to TwelveData account
   - Check WebSocket credits usage
   - Check for any API issues/downtime

### Issue: "eco-ws ERROR: TWD_API_KEY is empty"

**Fix:**
```bash
# Check .env file
cat .env | grep TWD_API_KEY

# Should output:
# TWD_API_KEY=your_32_char_key_here

# If missing, add it
echo "TWD_API_KEY=your_actual_key" >> .env

# Restart eco-ws
pm2 restart eco-ws
```

### Issue: Redis Keys Disappear After 24 Hours

**This is normal behavior:**
- Ticker keys have 24-hour TTL (expiry)
- eco-ws will recreate them when price events arrive
- If eco-ws is stopped for >24h, keys will expire

**Fix:** Just restart eco-ws, it will repopulate Redis.

---

## Development Workflow

### Daily Development Routine

1. **Start Services:**
   ```bash
   docker-compose up -d mysql redis
   pm2 start backend
   pm2 start eco-ws
   pnpm dev  # Frontend
   ```

2. **Check eco-ws Status:**
   ```bash
   pm2 logs eco-ws --lines 20
   # Verify "Subscribe SUCCESS" and "Price event received"
   ```

3. **Verify Data Pipeline:**
   ```bash
   redis-cli KEYS "twd:ticker:*"
   # Should show 3 keys
   ```

4. **Open Frontend:**
   ```
   http://localhost:3000/forex
   # All 3 pairs should show real prices
   ```

5. **Develop & Test:**
   - Make changes to frontend/backend
   - Prices continue updating via WebSocket
   - No REST credits burned

### Monitoring API Credits

**Check TwelveData Usage:**
1. Login to https://twelvedata.com
2. Go to Dashboard
3. Check:
   - REST API credits used / limit
   - WebSocket connections used / limit

**Expected in Dev Mode:**
- REST: Minimal usage (only initial import)
- WebSocket: 1 connection, 3 symbols

### Switching Between Dev and Production

**Development (save API credits):**
```bash
TWD_MAX_SYMBOLS=3
TWD_DISABLE_REST=true
```

**Production (full functionality):**
```bash
TWD_MAX_SYMBOLS=50
TWD_DISABLE_REST=false
```

---

## Testing Checklist

After setup, verify these work:

- [ ] eco-ws starts without errors
- [ ] eco-ws logs show "Subscribe SUCCESS for 3 symbols"
- [ ] eco-ws logs show price events every 10-60 seconds
- [ ] Redis contains 3 `twd:ticker:*` keys
- [ ] `curl /api/ext/twd/ticker` returns 3 symbols with prices
- [ ] `/forex` page displays all 3 pairs
- [ ] **Prices are NOT 0.00** (real values like 1.0845)
- [ ] **Change percentages are NOT 0.00%** (real values like +0.23%)
- [ ] Prices update every 5 seconds on frontend
- [ ] No REST calls to TwelveData (check logs, no "fetching from REST")
- [ ] No "API credentials for twelvedata are missing" warning

---

## Common Commands Reference

```bash
# Database
mysql -u root -p mydatabase
SELECT symbol, status FROM twd_market WHERE status = 1;
UPDATE twd_market SET status = 1 WHERE symbol = 'EUR/USD';

# Redis
redis-cli KEYS "twd:ticker:*"
redis-cli GET "twd:ticker:EUR/USD"
redis-cli FLUSHDB  # Clear all (use with caution!)

# eco-ws
pm2 restart eco-ws
pm2 logs eco-ws --lines 50
pm2 stop eco-ws
pnpm dev:eco:ws  # Dev mode with live logs

# API Testing
curl http://localhost:4000/api/ext/twd/ticker | jq
curl http://localhost:4000/api/ext/twd/market?type=forex | jq

# Docker
docker-compose up -d mysql redis
docker exec -it mysql mysql -u root -p mydatabase
docker exec -it redis redis-cli
```

---

## Files Modified

1. **`/backend/integrations/twelvedata/server.ts`**
   - Added `TWD_MAX_SYMBOLS` and `TWD_DISABLE_REST` support
   - Limits WebSocket subscriptions to configured max
   - Disables all REST calls when `TWD_DISABLE_REST=true`

2. **`/backend/api/exchange/tewlvedata/candles.get.ts`**
   - Guards REST fallback with `TWD_DISABLE_REST` check
   - Returns empty candles array in dev mode

3. **`.env`** (you need to update)
   - Add `TWD_MAX_SYMBOLS=3`
   - Add `TWD_DISABLE_REST=true`

---

## Next Steps

1. **Run the SQL to enable 3 test symbols**
2. **Add env vars to `.env`**
3. **Restart eco-ws**: `pm2 restart eco-ws`
4. **Check logs**: Look for "Subscribe SUCCESS"
5. **Wait 1-2 minutes** for first price events
6. **Verify Redis**: `redis-cli KEYS "twd:ticker:*"`
7. **Open /forex**: Confirm prices show (not 0.00)

**Expected time:** ~5 minutes from SQL to working prices on frontend.

---

## Success Criteria

✅ **You know the setup works when:**

1. eco-ws logs show:
   ```
   [eco-ws] ✅ Subscribe SUCCESS for 3 symbols
   [eco-ws] ✅ Price event received: { symbol: 'EUR/USD', price: 1.0845, ... }
   [eco-ws] 💾 Stored ticker in Redis: twd:ticker:EUR/USD
   ```

2. Redis shows 3 ticker keys with real data

3. `/forex` page displays:
   - EUR/USD = **1.0845** (not 0.00)
   - GBP/USD = **1.2650** (not 0.00)
   - USD/JPY = **149.25** (not 0.00)

4. No REST calls in logs (unless you enabled REST)

5. Prices update every 5 seconds on frontend

**If all above are true: Integration is working correctly! 🎉**

---

## Getting Help

If issues persist after following this guide, provide:

1. **eco-ws logs:**
   ```bash
   pm2 logs eco-ws --lines 100 > eco-ws-debug.log
   ```

2. **Enabled symbols:**
   ```sql
   SELECT symbol, type, status FROM twd_market WHERE status = 1;
   ```

3. **Redis keys:**
   ```bash
   redis-cli KEYS "twd:ticker:*" > redis-keys.txt
   redis-cli GET "twd:ticker:EUR/USD" > ticker-sample.txt
   ```

4. **API response:**
   ```bash
   curl http://localhost:4000/api/ext/twd/ticker > ticker-api.json
   ```

5. **Screenshot** of `/forex` page showing prices

This will help diagnose the exact issue.
