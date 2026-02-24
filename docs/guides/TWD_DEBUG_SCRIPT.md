# TWD Debug & Fix Script

## Step 1: Check What Symbols Are Actually in the Database

Run this SQL query to see what's stored:

```sql
-- Check all TWD markets
SELECT symbol, type, name, status FROM twd_market LIMIT 20;

-- Check enabled markets
SELECT symbol, type, name FROM twd_market WHERE status = true;

-- Count by type
SELECT type, COUNT(*) as count FROM twd_market GROUP BY type;
```

**Expected Results:**
- ~120 forex symbols like `EUR/USD`, `GBP/USD`, `USD/JPY`
- ~2000 stock symbols like `AAPL`, `MSFT`, `GOOGL`
- ~150 index symbols like `SPX`, `DJI`, `NDX`

**If you see symbols like `CYCUW`, `USD/EUR`, `CYD`:**
- These are INVALID
- The import saved wrong data
- You need to re-import with correct symbol format

## Step 2: Enable a Small Test Set

```sql
-- Disable all first
UPDATE twd_market SET status = false;

-- Enable only these valid symbols for testing
UPDATE twd_market SET status = true WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY', 'AAPL', 'MSFT', 'SPX');
```

## Step 3: Check Redis Keys

```bash
# Check what keys exist
redis-cli KEYS "twd:ticker:*"
redis-cli KEYS "eco:ticker:*"

# If no twd:ticker:* keys exist, eco-bridge hasn't written anything yet
# This means WS subscription is failing
```

## Step 4: Restart eco-bridge with Enhanced Logging

```bash
# Stop current process
pm2 stop eco-ws

# Start in dev mode to see all logs
pnpm dev:eco:ws
```

**Watch for these logs:**
```
[eco-ws] Found X enabled TWD markets in database
[eco-ws] First 10 enabled markets: [list of symbols with type and name]
[eco-ws] Attempting to subscribe to X symbols
[eco-ws] Symbol list: EUR/USD, GBP/USD, USD/JPY, AAPL, MSFT, SPX
[twd] > subscribe { action: 'subscribe', params: { symbols: 'EUR/USD,GBP/USD,...' }}
```

**If subscription succeeds:**
```
[eco-ws] ✅ Subscribe SUCCESS for 6 symbols
[eco-ws] ✅ Subscription confirmed for symbols: [...]
```

**If subscription fails:**
```
[eco-ws] ❌ Subscribe FAILED for X symbols
[eco-ws] Failed symbols details: [{ symbol: "XXX", ... }]
```

## Step 5: Wait for Price Events

**If subscription succeeded, you should see:**
```
[eco-ws] ✅ Price event received: { symbol: 'EUR/USD', price: 1.0845, ts: 1731... }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:EUR/USD { price: 1.0845, change: 0.0025, changePercent: 0.23 }
```

**If no price events appear:**
- Subscription failed (check fails list)
- Symbols are invalid format
- TwelveData API doesn't support these symbols
- Network/API key issue

## Step 6: Verify Redis Contains Data

```bash
# Check keys
redis-cli KEYS "twd:ticker:*"

# Should return:
# 1) "twd:ticker:EUR/USD"
# 2) "twd:ticker:GBP/USD"
# 3) "twd:ticker:USD/JPY"
# ... etc

# Check one ticker
redis-cli GET "twd:ticker:EUR/USD"

# Should return JSON like:
# {"symbol":"EUR/USD","price":1.0845,"open":1.0820,"high":1.0850,"low":1.0815,"volume":0,"change":0.0025,"changePercent":0.23,"lastUpdate":1731590400000}
```

## Step 7: Test Ticker API Endpoint

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/ext/twd/ticker | jq
```

**Expected Response:**
```json
{
  "EUR/USD": {
    "symbol": "EUR/USD",
    "price": 1.0845,
    "change": 0.0025,
    "changePercent": 0.23,
    ...
  },
  "AAPL": {
    "symbol": "AAPL",
    "price": 189.45,
    ...
  }
}
```

## Step 8: Check Frontend

1. Open browser dev tools → Network tab
2. Navigate to `http://localhost:3000/forex`
3. Look for requests to:
   - `/api/ext/twd/market?type=forex` ✅ NEW endpoint
   - `/api/ext/twd/ticker` ✅ NEW endpoint
   - `/api/exchange/tewlvedata/ticker` ❌ OLD endpoint (should NOT appear)

## Common Issues & Fixes

### Issue 1: eco-bridge Says "No enabled TWD markets found"

**Cause:** No markets have `status = true` in database

**Fix:**
```sql
-- Enable test markets
UPDATE twd_market SET status = true WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY', 'AAPL', 'MSFT', 'SPX');

-- Verify
SELECT symbol FROM twd_market WHERE status = true;
```

Then restart eco-bridge.

### Issue 2: Subscription Fails for All Symbols

**Cause:** Invalid symbol format or API key issue

**Check:**
```bash
# Verify API key is set
cat .env | grep TWD_API_KEY

# Should output:
# TWD_API_KEY=your_32_char_key_here
```

**Test API key manually:**
```bash
curl "https://api.twelvedata.com/forex_pairs?apikey=YOUR_KEY" | jq '.data[0]'
```

**Check symbol format:**
- Forex MUST be: `EUR/USD`, `GBP/JPY` (base/quote)
- Stocks MUST be: `AAPL`, `MSFT` (plain ticker)
- Indices MUST be: `SPX`, `DJI` (plain ticker)

**INVALID formats that TwelveData rejects:**
- `USD/EUR` (inverted, should be `EUR/USD`)
- `CYCUW`, `CYD` (not real symbols)
- `VND/USD` (exotic pairs not supported)

### Issue 3: Redis Keys Are Empty

**Cause:** No price events received = subscription failed

**Debug:**
1. Check eco-bridge logs for subscription status
2. Verify symbols in database are valid
3. Test with known-good symbols: `EUR/USD`, `AAPL`, `SPX`

### Issue 4: Frontend Still Shows 0.00

**Possible causes:**
1. **Frontend not rebuilt** - Run `pnpm build` or restart `pnpm dev`
2. **Browser cache** - Hard refresh (Ctrl+Shift+R)
3. **Wrong endpoint called** - Check Network tab, should call `/api/ext/twd/ticker`
4. **No data in Redis** - Fix eco-bridge subscription first

### Issue 5: "API credentials for twelvedata are missing"

**Cause:** Some module looking for differently-named env var

**Check all TWD env vars:**
```bash
cat .env | grep -i twd
cat .env | grep -i twelve
```

**Should have:**
```
TWD_API_KEY=your_key_here
TWD_BASE_URL=https://api.twelvedata.com
TWD_WS_URL=wss://ws.twelvedata.com/v1/quotes/price?apikey=your_key_here
```

## Quick Test with Known-Good Symbols

If import is broken, manually insert valid test data:

```sql
-- Clear existing broken data
DELETE FROM twd_market;

-- Insert known-good symbols
INSERT INTO twd_market (id, symbol, type, name, currency, pair, exchange, status, metadata, isTrending, isHot)
VALUES
  (UUID(), 'EUR/USD', 'forex', 'EUR/USD', 'EUR', 'USD', NULL, true, '{}', false, false),
  (UUID(), 'GBP/USD', 'forex', 'GBP/USD', 'GBP', 'USD', NULL, true, '{}', false, false),
  (UUID(), 'USD/JPY', 'forex', 'USD/JPY', 'USD', 'JPY', NULL, true, '{}', false, false),
  (UUID(), 'AAPL', 'stocks', 'Apple Inc', 'AAPL', NULL, 'NASDAQ', true, '{}', false, false),
  (UUID(), 'MSFT', 'stocks', 'Microsoft Corp', 'MSFT', NULL, 'NASDAQ', true, '{}', false, false),
  (UUID(), 'SPX', 'indices', 'S&P 500', 'SPX', NULL, 'US', true, '{}', false, false);
```

Then restart eco-bridge and check if subscription succeeds.

## Success Checklist

- [ ] Database has valid symbols (EUR/USD, AAPL, SPX format)
- [ ] At least 3-6 markets are enabled (`status = true`)
- [ ] eco-bridge logs show "Subscribe SUCCESS"
- [ ] eco-bridge logs show price events received
- [ ] Redis contains `twd:ticker:*` keys
- [ ] `/api/ext/twd/ticker` returns price data
- [ ] Frontend calls new endpoints (not old `/api/exchange/tewlvedata/ticker`)
- [ ] Frontend displays real prices (not 0.00)
- [ ] Prices update every 5 seconds

## Next Steps After Fixing

Once you confirm eco-bridge is receiving prices and Redis has data:

1. **Fix the old endpoint mismatch** - Either update `/api/exchange/tewlvedata/ticker` to read from `twd:ticker:*`, or make sure frontend uses new endpoint
2. **Ensure frontend component is wired correctly** - Verify `/forex`, `/stocks`, `/indices` pages use TwdMarkets component
3. **Re-import all markets** - Once you confirm 3-6 symbols work, re-import full ~2,270 markets
4. **Enable desired markets** via admin UI
