# TWD Quick Start - Get All 3 Symbols Working

**Goal:** Fix EUR/USD, GBP/USD, USD/JPY to all show real prices on `/forex`

---

## The Problem

- ✅ EUR/USD works (price updates in Redis and frontend)
- ❌ GBP/USD shows 0.00 (no Redis key)
- ❌ USD/JPY shows 0.00 (no Redis key)

**Root Cause:** eco-ws was only subscribing to 1 symbol, or subscriptions failed for other symbols.

---

## The Solution (5 Steps)

### Step 1: Update `.env`

Add these two lines:

```bash
TWD_MAX_SYMBOLS=3
TWD_DISABLE_REST=true
```

**What this does:**
- `TWD_MAX_SYMBOLS=3` → Subscribe to up to 3 symbols via WebSocket
- `TWD_DISABLE_REST=true` → Stop burning REST API credits

### Step 2: Verify Enabled Symbols in Database

```bash
docker exec -it mysql mysql -u root -p mydatabase
```

Run:

```sql
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
```

**If different symbols or wrong count:**

```sql
-- Disable all
UPDATE twd_market SET status = 0;

-- Enable only these 3
UPDATE twd_market SET status = 1
WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY');

-- Verify
SELECT symbol FROM twd_market WHERE status = 1;
```

### Step 3: Restart eco-ws

```bash
pm2 restart eco-ws
pm2 logs eco-ws --lines 50
```

**Watch for these logs:**

```
[eco-ws] Configuration:
  - Max symbols: 3
  - REST disabled: true

[eco-ws] Found 3 enabled TWD markets in database
[eco-ws] Subscribing to 3 symbols: EUR/USD, GBP/USD, USD/JPY

[twd] connected
[twd] > subscribe { action: 'subscribe', params: { symbols: 'EUR/USD,GBP/USD,USD/JPY' }}

[eco-ws] ✅ Subscribe SUCCESS for 3 symbols:
  ✅ EUR/USD
  ✅ GBP/USD
  ✅ USD/JPY
[eco-ws] ✅ Subscription confirmed for symbols: [ 'EUR/USD', 'GBP/USD', 'USD/JPY' ]
[eco-ws] REST priming disabled (TWD_DISABLE_REST=true), relying on WebSocket for all prices
```

**Wait 1-2 minutes, then look for:**

```
[eco-ws] ✅ Price event received: { symbol: 'EUR/USD', price: 1.0845, ... }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:EUR/USD { price: 1.0845, change: 0.0025, changePercent: 0.23 }

[eco-ws] ✅ Price event received: { symbol: 'GBP/USD', price: 1.2650, ... }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:GBP/USD { price: 1.2650, change: 0.0012, changePercent: 0.09 }

[eco-ws] ✅ Price event received: { symbol: 'USD/JPY', price: 149.25, ... }
[eco-ws] 💾 Stored ticker in Redis: twd:ticker:USD/JPY { price: 149.25, change: 0.15, changePercent: 0.10 }
```

### Step 4: Verify Redis

```bash
redis-cli KEYS "twd:ticker:*"
```

**Expected:**
```
1) "twd:ticker:EUR/USD"
2) "twd:ticker:GBP/USD"
3) "twd:ticker:USD/JPY"
```

**Check each one:**

```bash
redis-cli GET "twd:ticker:EUR/USD" | jq
redis-cli GET "twd:ticker:GBP/USD" | jq
redis-cli GET "twd:ticker:USD/JPY" | jq
```

All should show JSON with real price data.

### Step 5: Test Frontend

Open: `http://localhost:3000/forex`

**Expected:**

| Symbol   | Price   | Change  | 24h Volume |
|----------|---------|---------|------------|
| EUR/USD  | 1.0845  | +0.23%  | 0          |
| GBP/USD  | 1.2650  | +0.09%  | 0          |
| USD/JPY  | 149.25  | +0.10%  | 0          |

**Check Dev Tools Network tab:**
- `GET /api/ext/twd/ticker` should return JSON with all 3 symbols
- Should repeat every 5 seconds

---

## If It Still Doesn't Work

### Issue: Only EUR/USD Works

**Check eco-ws logs for:**

```
[eco-ws] ❌ Subscribe FAILED for 2 symbols
  ❌ GBP/USD: Symbol not available on free tier
  ❌ USD/JPY: Symbol not available on free tier
```

**Fix:** Your TwelveData account might not support these. Try different symbols:

```sql
UPDATE twd_market SET status = 0;
UPDATE twd_market SET status = 1
WHERE symbol IN ('EUR/USD', 'USD/CHF', 'AUD/USD');
```

Then restart eco-ws.

### Issue: Subscription Succeeds but No Price Events

**Check:**
1. Wait 2-3 minutes (first price can take time)
2. Forex trades 24/7, so prices should arrive
3. Check TwelveData dashboard for WebSocket status

**Debug:**
```bash
pm2 logs eco-ws | grep "Price event"
```

If no price events after 5 minutes, there's a TwelveData connectivity issue.

### Issue: Redis Keys Exist but Frontend Shows 0.00

**Test API directly:**
```bash
curl http://localhost:4000/api/ext/twd/ticker | jq
```

**If empty `{}`:**
- Backend can't read Redis
- Check Redis connection in `.env`

**If has data:**
- Frontend issue (check browser console for errors)
- Try hard refresh (Ctrl+Shift+R)

---

## Success Checklist

- [ ] `.env` has `TWD_MAX_SYMBOLS=3` and `TWD_DISABLE_REST=true`
- [ ] Database shows 3 enabled symbols
- [ ] eco-ws logs show "Subscribe SUCCESS for 3 symbols"
- [ ] eco-ws logs show price events for all 3 symbols
- [ ] Redis has 3 `twd:ticker:*` keys with real data
- [ ] `/api/ext/twd/ticker` returns 3 symbols
- [ ] `/forex` page shows all 3 symbols with real prices (not 0.00)
- [ ] Prices update every 5 seconds

**If all checked:** ✅ Working perfectly!

---

## Commands Quick Reference

```bash
# Update .env
echo "TWD_MAX_SYMBOLS=3" >> .env
echo "TWD_DISABLE_REST=true" >> .env

# Enable 3 symbols in MySQL
docker exec -it mysql mysql -u root -p mydatabase -e "
  UPDATE twd_market SET status = 0;
  UPDATE twd_market SET status = 1 WHERE symbol IN ('EUR/USD', 'GBP/USD', 'USD/JPY');
  SELECT symbol, status FROM twd_market WHERE status = 1;
"

# Restart eco-ws
pm2 restart eco-ws
pm2 logs eco-ws --lines 50

# Check Redis (after 1-2 minutes)
redis-cli KEYS "twd:ticker:*"
redis-cli GET "twd:ticker:EUR/USD"
redis-cli GET "twd:ticker:GBP/USD"
redis-cli GET "twd:ticker:USD/JPY"

# Test API
curl http://localhost:4000/api/ext/twd/ticker | jq

# Open frontend
xdg-open http://localhost:3000/forex
```

---

## Next Steps After This Works

1. **Enable more symbols** (up to TWD_MAX_SYMBOLS):
   ```sql
   UPDATE twd_market SET status = 1
   WHERE symbol IN ('EUR/GBP', 'USD/CHF', 'AUD/USD');
   ```

2. **Increase limit** for more symbols:
   ```bash
   # In .env
   TWD_MAX_SYMBOLS=10
   ```

3. **Test stocks page** (during market hours):
   ```sql
   UPDATE twd_market SET status = 1
   WHERE symbol IN ('AAPL', 'MSFT', 'GOOGL');
   ```

4. **Enable REST for charts** (when needed):
   ```bash
   # In .env
   TWD_DISABLE_REST=false
   ```

---

**Time estimate:** 5-10 minutes from start to working prices.
