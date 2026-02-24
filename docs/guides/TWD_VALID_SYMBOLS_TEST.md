# TWD Valid Symbols Test Plan

**Date**: 2025-11-14
**Purpose**: Test TWD integration with symbols that TwelveData free tier definitely supports

---

## Why Previous Symbols Failed

The symbols that were enabled (`USD/TJS`, `USD/TMT`, `USD/RUB`, `VND/USD`) are **exotic currency pairs** that:
- Are not supported on TwelveData free tier
- Have very low liquidity
- Don't have real-time data available

**TwelveData free tier supports:**
- ✅ Major forex pairs (EUR/USD, GBP/USD, USD/JPY, etc.)
- ✅ US stocks on major exchanges (NASDAQ, NYSE)
- ✅ Major global indices (SPX, DJI, NDX)

**TwelveData free tier does NOT support:**
- ❌ Exotic forex pairs (USD/TJS, VND/USD, USD/RUB, etc.)
- ❌ Most international stocks (non-US exchanges)
- ❌ Cryptocurrency pairs on free tier

---

## Step 1: Enable Valid Major Symbols

Run the SQL script:

```bash
mysql -u root -p your_database < TWD_ENABLE_VALID_SYMBOLS.sql
```

Or run manually:

```sql
-- Disable all first
UPDATE twd_market SET status = false;

-- Enable major forex (10 pairs)
UPDATE twd_market SET status = true WHERE symbol IN (
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD',
  'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'
);

-- Enable major US tech stocks (10 stocks)
UPDATE twd_market SET status = true WHERE symbol IN (
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  'NVDA', 'TSLA', 'NFLX', 'AMD', 'INTC'
);

-- Enable major US indices (4 indices)
UPDATE twd_market SET status = true WHERE symbol IN (
  'SPX', 'DJI', 'NDX', 'RUT'
);
```

**Verify:**
```sql
SELECT type, COUNT(*) as count FROM twd_market WHERE status = true GROUP BY type;
```

**Expected:**
```
type    | count
--------|------
forex   | 10
stocks  | 10
indices | 4
TOTAL   | 24
```

---

## Step 2: Restart eco-bridge

```bash
pm2 stop eco-ws
pnpm dev:eco:ws
```

---

## Step 3: Expected Log Output

### On Startup (Database Read)

```
[eco-ws] Found 24 enabled TWD markets in database
[eco-ws] First 10 enabled markets: [
  { symbol: 'EUR/USD', type: 'forex', name: 'Euro/US Dollar' },
  { symbol: 'GBP/USD', type: 'forex', name: 'British Pound/US Dollar' },
  { symbol: 'USD/JPY', type: 'forex', name: 'US Dollar/Japanese Yen' },
  { symbol: 'USD/CHF', type: 'forex', name: 'US Dollar/Swiss Franc' },
  { symbol: 'AUD/USD', type: 'forex', name: 'Australian Dollar/US Dollar' },
  { symbol: 'USD/CAD', type: 'forex', name: 'US Dollar/Canadian Dollar' },
  { symbol: 'NZD/USD', type: 'forex', name: 'New Zealand Dollar/US Dollar' },
  { symbol: 'EUR/GBP', type: 'forex', name: 'Euro/British Pound' },
  { symbol: 'EUR/JPY', type: 'forex', name: 'Euro/Japanese Yen' },
  { symbol: 'GBP/JPY', type: 'forex', name: 'British Pound/Japanese Yen' }
]
[eco-ws] Attempting to subscribe to 24 symbols
[eco-ws] Symbol list: EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD, EUR/GBP, EUR/JPY, GBP/JPY, AAPL, MSFT, GOOGL, AMZN, META, NVDA, TSLA, NFLX, AMD, INTC, SPX, DJI, NDX, RUT
```

### WebSocket Connection

```
[twd] connecting to wss://ws.twelvedata.com/v1/quotes/price?apikey=...
[twd] connected
[twd] > subscribe {
  action: 'subscribe',
  params: { symbols: 'EUR/USD,GBP/USD,USD/JPY,USD/CHF,AUD/USD,USD/CAD,NZD/USD,EUR/GBP,EUR/JPY,GBP/JPY,AAPL,MSFT,GOOGL,AMZN,META,NVDA,TSLA,NFLX,AMD,INTC,SPX,DJI,NDX,RUT' }
}
```

### Subscription Success

```
[eco-ws] ✅ Subscribe SUCCESS for 24 symbols:
  ✅ EUR/USD
  ✅ GBP/USD
  ✅ USD/JPY
  ✅ USD/CHF
  ✅ AUD/USD
  ✅ USD/CAD
  ✅ NZD/USD
  ✅ EUR/GBP
  ✅ EUR/JPY
  ✅ GBP/JPY
  ✅ AAPL
  ✅ MSFT
  ✅ GOOGL
  ✅ AMZN
  ✅ META
  ✅ NVDA
  ✅ TSLA
  ✅ NFLX
  ✅ AMD
  ✅ INTC
  ✅ SPX
  ✅ DJI
  ✅ NDX
  ✅ RUT
[eco-ws] ✅ Subscription confirmed for symbols: [ 'EUR/USD', 'GBP/USD', ... ]
```

### Price Events (Continuous)

```
[eco-ws] ✅ Price event received: { symbol: 'EUR/USD', price: 1.0845, ts: 1731590400000 }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:EUR/USD { price: 1.0845, change: 0.0025, changePercent: 0.23 }

[eco-ws] ✅ Price event received: { symbol: 'GBP/USD', price: 1.2650, ts: 1731590405000 }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:GBP/USD { price: 1.2650, change: 0.0012, changePercent: 0.09 }

[eco-ws] ✅ Price event received: { symbol: 'AAPL', price: 189.45, ts: 1731590410000 }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:AAPL { price: 189.45, change: 2.25, changePercent: 1.20 }

... (continues for all symbols)
```

**Note:**
- Forex prices update every 1-30 seconds (24/7 market)
- Stock prices update only during market hours (9:30-16:00 ET, Mon-Fri)
- Outside market hours, stocks won't receive new price events

---

## Step 4: Verify Redis Cache

```bash
# List all ticker keys
redis-cli KEYS "twd:ticker:*"
```

**Expected Output:**
```
 1) "twd:ticker:EUR/USD"
 2) "twd:ticker:GBP/USD"
 3) "twd:ticker:USD/JPY"
 4) "twd:ticker:USD/CHF"
 5) "twd:ticker:AUD/USD"
 6) "twd:ticker:USD/CAD"
 7) "twd:ticker:NZD/USD"
 8) "twd:ticker:EUR/GBP"
 9) "twd:ticker:EUR/JPY"
10) "twd:ticker:GBP/JPY"
11) "twd:ticker:AAPL"
12) "twd:ticker:MSFT"
13) "twd:ticker:GOOGL"
14) "twd:ticker:AMZN"
15) "twd:ticker:META"
16) "twd:ticker:NVDA"
17) "twd:ticker:TSLA"
18) "twd:ticker:NFLX"
19) "twd:ticker:AMD"
20) "twd:ticker:INTC"
21) "twd:ticker:SPX"
22) "twd:ticker:DJI"
23) "twd:ticker:NDX"
24) "twd:ticker:RUT"
```

**Check one ticker:**
```bash
redis-cli GET "twd:ticker:EUR/USD" | jq
```

**Expected:**
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

---

## Step 5: Test Ticker API

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
    ...
  },
  "AAPL": {
    "symbol": "AAPL",
    "price": 189.45,
    ...
  },
  ... (all 24 symbols)
}
```

**If empty `{}`:**
- Redis cache is empty
- eco-bridge didn't receive price events yet
- Wait 30-60 seconds and try again

---

## Step 6: Test Frontend Display

### Navigate to Forex Page

```
http://localhost:3000/forex
```

**Expected:**
- Table shows 10 forex pairs
- Prices show real values (e.g., EUR/USD = 1.0845)
- Change shows real percentages (e.g., +0.23%)
- Prices update every 5 seconds

**Dev Tools → Network Tab:**
- Should see request to `/api/ext/twd/market?type=forex`
- Should see request to `/api/ext/twd/ticker` every 5 seconds
- Both should return 200 OK with data

### Navigate to Stocks Page

```
http://localhost:3000/stocks
```

**Expected:**
- Table shows 10 US tech stocks
- Prices show real values (e.g., AAPL = $189.45)
- During market hours: Prices update in real-time
- Outside market hours: Prices stay at last close

### Navigate to Indices Page

```
http://localhost:3000/indices
```

**Expected:**
- Table shows 4 major indices
- Prices show real values (e.g., SPX = 4,550.25)

---

## Step 7: Example API Responses

### GET /api/ext/twd/market?type=forex

```json
[
  {
    "id": "uuid-1",
    "symbol": "EUR/USD",
    "type": "forex",
    "name": "Euro/US Dollar",
    "currency": "EUR",
    "pair": "USD",
    "exchange": null,
    "status": true,
    "metadata": {},
    "isTrending": false,
    "isHot": false
  },
  {
    "id": "uuid-2",
    "symbol": "GBP/USD",
    "type": "forex",
    "name": "British Pound/US Dollar",
    "currency": "GBP",
    "pair": "USD",
    "exchange": null,
    "status": true,
    "metadata": {},
    "isTrending": false,
    "isHot": false
  },
  ... (8 more)
]
```

### GET /api/ext/twd/ticker (after price events)

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
  ... (22 more symbols)
}
```

---

## Troubleshooting

### Issue: Some Symbols Fail Subscription

**If you see:**
```
[eco-ws] ❌ Subscribe FAILED for 2 symbols
  ❌ GOOGL: Symbol not available on free tier
  ❌ META: Symbol not available on free tier
```

**Solution:** Some symbols might require paid tier. Remove them:
```sql
UPDATE twd_market SET status = false WHERE symbol IN ('GOOGL', 'META');
```

Then restart eco-bridge.

### Issue: Stock Prices Don't Update

**Possible causes:**
1. **Market is closed** - US market hours: 9:30-16:00 ET, Mon-Fri
2. **First price event takes time** - Wait 2-3 minutes after subscription

**Verify:**
```bash
# Check if any stock tickers exist in Redis
redis-cli KEYS "twd:ticker:AAPL"
redis-cli GET "twd:ticker:AAPL"
```

**Test with Forex instead:**
- Forex trades 24/7, so prices always update
- Enable only EUR/USD temporarily to test

### Issue: Forex Prices Update but Stocks Don't

**This is normal if outside market hours:**
- Forex: Updates 24/7
- Stocks: Only during market hours (9:30-16:00 ET)
- Check current time vs market hours

**To test stocks:**
- Wait until market open (9:30 AM ET)
- Or test with forex pairs only

---

## Success Criteria

- [ ] eco-bridge logs show subscription SUCCESS for all 24 symbols
- [ ] eco-bridge logs show price events for at least 10 symbols (forex should always work)
- [ ] Redis contains 24 `twd:ticker:*` keys
- [ ] `/api/ext/twd/ticker` returns data for all 24 symbols
- [ ] `/forex` page shows real prices (not 0.00)
- [ ] `/stocks` page shows real prices (during market hours)
- [ ] `/indices` page shows real prices
- [ ] Prices update every 5 seconds on frontend
- [ ] No "API credentials for twelvedata are missing" warning

---

## Files Modified Summary

1. **`/backend/utils/exchange.ts`**
   - Added check to skip non-CCXT providers (TwelveData)
   - Fixes "API credentials for twelvedata are missing" warning

2. **`/backend/integrations/twelvedata/server.ts`**
   - Enhanced subscribe-status logging
   - Shows per-symbol error messages
   - Logs full event payload for debugging

3. **`/TWD_ENABLE_VALID_SYMBOLS.sql`** (NEW)
   - SQL script to enable only major, supported symbols
   - 10 forex + 10 stocks + 4 indices = 24 total

4. **`/TWD_VALID_SYMBOLS_TEST.md`** (NEW - this file)
   - Complete test plan with expected outputs
   - Troubleshooting guide
   - Success criteria checklist

---

## Next Steps

1. **Run the SQL script** to enable valid symbols
2. **Restart eco-bridge** and watch logs
3. **Wait 1-2 minutes** for price events
4. **Verify Redis** has ticker data
5. **Check frontend** displays real prices
6. **Share logs** if any symbols still fail

The major forex pairs (EUR/USD, GBP/USD, USD/JPY) should DEFINITELY work on TwelveData free tier. If those fail, there's a different issue (API key, network, etc).
