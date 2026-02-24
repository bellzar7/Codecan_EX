# TwelveData (TWD) Paper Trading - UI Testing Guide

## Prerequisites

Before testing, ensure:

1. ✅ **Backend is running:**
   ```bash
   pm2 status
   # Should see: backend, eco-ws, frontend all running
   ```

2. ✅ **eco-ws is streaming EUR/USD prices:**
   ```bash
   pm2 logs eco-ws --lines 20
   # Should see: "[eco-ws] ✅ Price event received: { symbol: 'EUR/USD', price: 1.xxxxx }"
   ```

3. ✅ **Redis has ticker data:**
   ```bash
   docker compose -f docker-compose.dev.yml exec redis redis-cli GET "twd:ticker:EUR/USD"
   # Should return: {"symbol":"EUR/USD","price":1.xxxxx,...}
   ```

4. ✅ **Database has TWD markets:**
   ```bash
   docker compose -f docker-compose.dev.yml exec mysql mysql -u root -ppassword bicrypto -e "SELECT symbol, name, status FROM twd_market LIMIT 5"
   # Should show: EUR/USD, GBP/USD, etc. with status = 1
   ```

**If any of these fail, see Troubleshooting section at the end.**

---

## Part 1: Initial Setup & Balance Check

### 1.1 Login to Your Test Account

1. Open browser: http://localhost:3000
2. Login with your test account (or create one if needed)
3. Navigate to: **Finance** → **Wallets**

### 1.2 Check/Create TWD_PAPER Wallet

**Find TWD_PAPER wallet in the list:**

| Type | Currency | Balance |
|------|----------|---------|
| TWD_PAPER | USD | 100,000.00 |

**If wallet doesn't exist or you want to reset it:**

1. Open DevTools → Console
2. Run:
   ```javascript
   fetch('http://localhost:4000/api/ext/twd/wallet/reset', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include'
   }).then(r => r.json()).then(console.log)
   ```
3. Refresh wallets page
4. Should see: **TWD_PAPER | USD | 100,000.00**

**Expected Result:** ✅ You have $100,000 USD in TWD_PAPER wallet

---

## Part 2: Navigate to Trading Page

### 2.1 Open Forex Markets List

1. Navigate to: **Markets** → **Forex** (http://localhost:3000/forex)
2. You should see list of forex pairs:
   - EUR/USD
   - GBP/USD
   - USD/JPY
3. **Check that EUR/USD row shows:**
   - Price: `1.xxxxx` (not `0.00000`)
   - Change%: `~0.xx%` or `-0.xx%` (may be small but not exactly `0.00%`)

### 2.2 Open EUR/USD Trading Page

1. Click **→ arrow** on EUR/USD row, OR
2. Directly navigate to: http://localhost:3000/trade/EUR_USD

**Expected screen layout:**
- **Top banner:** ⚠️ "Paper Trading Mode - All trades use virtual funds"
- **Header ticker:** Shows live EUR/USD price updating every few seconds
- **Chart:** May show error banner if API credits exhausted (expected)
- **Order panel (right):** Shows "Spot / Market / Limit" tabs
- **Bottom:** "Open Orders" and "Order History" tabs

---

## Part 3: Place MARKET BUY Order

### 3.1 Prepare Order Form

1. In the order panel (right side), ensure:
   - Main tab: **Spot** (selected)
   - Sub tab: **Market** (selected)
2. Check balance display:
   - Should show: **Balance: 100,000.00 USD** (both for EUR and USD)

### 3.2 Submit Market BUY Order

**Fill in the form:**
- **Side:** BUY (green button)
- **Amount:** `1000` (this means buy 1000 EUR)
- Price field: (greyed out for market orders)

**Click "Buy" button**

### 3.3 Verify Request (DevTools)

Open **DevTools → Network tab**, filter by `order`

**Expected request:**
```
POST http://localhost:4000/api/ext/twd/order
```

**Payload:**
```json
{
  "symbol": "EUR/USD",
  "type": "MARKET",
  "side": "BUY",
  "amount": 1000
}
```

**Response (200 OK):**
```json
{
  "message": "MARKET order executed successfully",
  "order": {
    "id": "uuid...",
    "symbol": "EUR/USD",
    "type": "MARKET",
    "side": "BUY",
    "status": "CLOSED",
    "price": 1.08450,
    "amount": 1000,
    "filled": 1000,
    "remaining": 0,
    "cost": 1084.50,
    "fee": 10.85
  }
}
```

### 3.4 Verify UI Updates

**Immediately after order succeeds:**

1. **Balance should decrease:**
   - Before: `100,000.00 USD`
   - After: `~98,904.65 USD` (100000 - 1084.50 - 10.85)
   - *(exact amount depends on price and fee calculation)*

2. **Toast notification:**
   - Should show success message: "MARKET order executed successfully"

3. **Order History tab:**
   - Click "Order History" tab at bottom
   - Should see your order with:
     - Symbol: EUR/USD
     - Type: MARKET
     - Side: BUY
     - Amount: 1000
     - Status: CLOSED
     - Price: ~1.08450

4. **Open Orders tab:**
   - Should be empty (market orders execute instantly)

**Expected Result:** ✅ Order executed, balance updated, appears in history

---

## Part 4: Place LIMIT SELL Order

### 4.1 Switch to Limit Tab

1. In order panel, click **Limit** tab
2. Form changes to show Price field (enabled)

### 4.2 Determine Limit Price

**Get current market price:**
- Look at header ticker: e.g., `EUR/USD: 1.08450`
- Set limit price ABOVE current: e.g., `1.09000` (for SELL order to not execute immediately)

### 4.3 Submit Limit SELL Order

**Fill in the form:**
- **Side:** SELL (red button)
- **Amount:** `500`
- **Price:** `1.09000` (above current price)

**Click "Sell" button**

### 4.4 Verify Request

**Expected request:**
```
POST http://localhost:4000/api/ext/twd/order
```

**Payload:**
```json
{
  "symbol": "EUR/USD",
  "type": "LIMIT",
  "side": "SELL",
  "amount": 500,
  "price": 1.09000
}
```

**Response (200 OK):**
```json
{
  "message": "LIMIT order created successfully",
  "order": {
    "id": "uuid...",
    "status": "OPEN",
    "type": "LIMIT",
    "side": "SELL",
    "filled": 0,
    "remaining": 500
  }
}
```

### 4.5 Verify UI Updates

**Immediately after order creation:**

1. **Balance:** Should NOT change yet (SELL LIMIT orders don't reserve balance)

2. **Open Orders tab:**
   - Click "Open Orders" tab at bottom
   - Should see your LIMIT order:
     - Symbol: EUR/USD
     - Type: LIMIT
     - Side: SELL
     - Amount: 500
     - Price: 1.09000
     - Status: OPEN
     - Filled/Remaining: 0/500

3. **Order History:**
   - Should NOT show this order yet (it's still open)

**Expected Result:** ✅ Limit order created, appears in Open Orders, balance unchanged

---

## Part 5: Test LIMIT Order Execution (via Cron)

LIMIT orders are processed by a cron job that runs every 1 minute. To test:

### 5.1 Wait for Price Movement

**Option A: Natural Price Movement (Slow)**
- Wait for EUR/USD price to reach 1.09000 or higher
- On free tier, prices update slowly (may take hours)

**Option B: Manual Cron Trigger (Fast)**
1. Open a terminal
2. Manually trigger the cron job:
   ```bash
   # SSH into backend container or run directly if not dockerized
   docker compose -f docker-compose.dev.yml exec backend sh -c "cd /app && node -e \"
   const { processTwdLimitOrders } = require('./dist/backend/utils/crons/twdOrder.js');
   processTwdLimitOrders().then(() => console.log('Done'));
   \""
   ```

**Option C: Modify Price in Redis (Dev Only)**
1. Manually set price to 1.09050:
   ```bash
   docker compose -f docker-compose.dev.yml exec redis redis-cli
   > GET "twd:ticker:EUR/USD"
   # Copy the JSON output
   > SET "twd:ticker:EUR/USD" '{"symbol":"EUR/USD","price":1.09050,"open":1.08230,"high":1.09050,"low":1.08150,"volume":0,"change":0.0082,"changePercent":0.76,"lastUpdate":1763387327000}'
   > EXIT
   ```
2. Wait 1 minute for cron to run
3. Check backend logs:
   ```bash
   pm2 logs backend --lines 50 | grep "TWD"
   ```
   **Expected logs:**
   ```
   [TWD Cron] Processing 1 orders for EUR/USD at price 1.09050
   [TWD] Executed SELL order <uuid> for EUR/USD at 1.09050
   ```

### 5.2 Verify Order Execution

**After cron runs and price reached 1.09000:**

1. **Refresh trading page** (or wait for auto-refresh)

2. **Open Orders tab:**
   - Should be **empty** (order executed)

3. **Order History tab:**
   - Should show the LIMIT order with:
     - Status: CLOSED
     - Filled: 500
     - Remaining: 0
     - Price: 1.09050 (actual execution price)

4. **Balance:**
   - Should have increased by proceeds minus fee
   - Example: `98,904.65 + (500 * 1.09050 - 5.45) = 99,444.00`

**Expected Result:** ✅ Limit order executed, moved to history, balance updated

---

## Part 6: Test Order Cancellation

### 6.1 Create Another LIMIT Order

1. Create a new LIMIT SELL order:
   - Amount: `200`
   - Price: `1.10000` (very high, won't execute)
2. Confirm it appears in Open Orders

### 6.2 Cancel the Order

1. In **Open Orders** tab, find the order
2. Click **Cancel** button (usually a trash icon or "X")
3. Confirm cancellation in modal (if any)

### 6.3 Verify Cancellation

**DevTools Network:**
```
DELETE http://localhost:4000/api/ext/twd/order/<order-id>
```

**Response (200 OK):**
```json
{
  "message": "Order cancelled successfully"
}
```

**UI Updates:**
1. Order disappears from Open Orders
2. Balance restored (if it was reserved - for BUY orders only)
3. Order does NOT appear in Order History (cancelled orders are soft-deleted)

**Expected Result:** ✅ Order cancelled, removed from Open Orders

---

## Part 7: Test Edge Cases

### 7.1 Insufficient Balance

1. Try to place a BUY order for a huge amount:
   - Amount: `1000000` (1 million EUR)
   - At ~1.08 price = ~1,080,000 USD needed
   - But wallet only has ~99,000 USD

**Expected:**
- Error toast: "Insufficient balance. You need at least 1,080,000.00 USD. Current balance: 99,444.00 USD"
- Order NOT created

### 7.2 Invalid Amount

1. Try amount = `0`:

**Expected:**
- Error: "Amount must be greater than zero"

2. Try amount = `-100`:

**Expected:**
- Error: "Amount must be greater than zero"

### 7.3 LIMIT Order Without Price

1. Select **Limit** tab
2. Leave Price field empty
3. Click Buy/Sell

**Expected:**
- Error: "Price must be greater than zero for LIMIT orders"

### 7.4 Market Not Streaming

1. Stop eco-ws:
   ```bash
   pm2 stop eco-ws
   ```
2. Clear Redis ticker:
   ```bash
   docker compose -f docker-compose.dev.yml exec redis redis-cli DEL "twd:ticker:EUR/USD"
   ```
3. Try to place a MARKET order

**Expected:**
- Error: "Price not available for EUR/USD. Market data is not streaming. Please try again in a few moments."

4. **Restart eco-ws:**
   ```bash
   pm2 restart eco-ws
   ```

---

## Part 8: Verify Database Persistence

### 8.1 Check `twd_order` Table

```bash
docker compose -f docker-compose.dev.yml exec mysql mysql -u root -ppassword bicrypto -e "
SELECT
  id,
  symbol,
  type,
  side,
  status,
  CAST(price AS DECIMAL(10,5)) as price,
  CAST(amount AS DECIMAL(10,2)) as amount,
  CAST(cost AS DECIMAL(10,2)) as cost,
  createdAt
FROM twd_order
WHERE deletedAt IS NULL
ORDER BY createdAt DESC
LIMIT 5;
"
```

**Expected output:**
```
+--------------------------------------+----------+--------+------+--------+---------+---------+---------+---------------------+
| id                                   | symbol   | type   | side | status | price   | amount  | cost    | createdAt           |
+--------------------------------------+----------+--------+------+--------+---------+---------+---------+---------------------+
| uuid-1                               | EUR/USD  | LIMIT  | SELL | CLOSED | 1.09050 |  500.00 |  545.25 | 2025-11-19 12:45:00 |
| uuid-2                               | EUR/USD  | MARKET | BUY  | CLOSED | 1.08450 | 1000.00 | 1084.50 | 2025-11-19 12:30:00 |
+--------------------------------------+----------+--------+------+--------+---------+---------+---------+---------------------+
```

### 8.2 Check `wallet` Table

```bash
docker compose -f docker-compose.dev.yml exec mysql mysql -u root -ppassword bicrypto -e "
SELECT
  id,
  type,
  currency,
  CAST(balance AS DECIMAL(10,2)) as balance,
  updatedAt
FROM wallet
WHERE type = 'TWD_PAPER'
LIMIT 1;
"
```

**Expected:**
```
+--------------------------------------+-----------+----------+-----------+---------------------+
| id                                   | type      | currency | balance   | updatedAt           |
+--------------------------------------+-----------+----------+-----------+---------------------+
| uuid                                 | TWD_PAPER | USD      | 99444.00  | 2025-11-19 12:45:00 |
+--------------------------------------+-----------+----------+-----------+---------------------+
```

**Balance calculation:**
- Initial: 100,000.00
- MARKET BUY: -1084.50 (cost) - 10.85 (fee) = -1095.35
- LIMIT SELL: +545.25 (proceeds) - 5.45 (fee) = +539.80
- **Final: 100000 - 1095.35 + 539.80 = 99,444.45** ✅

---

## Part 9: Test Page Refresh & Persistence

### 9.1 Refresh Trading Page

1. Press `F5` or `Ctrl+R` to refresh the page
2. Wait for page to fully load

### 9.2 Verify Data Persistence

**Check that:**
1. ✅ Balance still shows correct amount (~99,444 USD)
2. ✅ Order History still shows both executed orders
3. ✅ Open Orders shows only non-executed limit orders
4. ✅ Chart and ticker continue working

**Expected Result:** All data persists across page refresh

---

## Part 10: Compare with Non-TWD Markets (Regression Test)

To ensure existing SPOT/ECO markets still work:

### 10.1 Test Regular SPOT Market

1. Navigate to: http://localhost:3000/trade/BTC_USDT (or any SPOT market)
2. Verify:
   - ✅ Balance shows SPOT wallet balance (not TWD_PAPER)
   - ✅ Orderbook displays
   - ✅ Can place orders (if exchange is connected)
   - ✅ Order endpoint is `/api/exchange/order` (not `/api/ext/twd/order`)

### 10.2 Test Ecosystem Market (if enabled)

1. Navigate to: http://localhost:3000/trade/BTC_USDT (ECO market)
2. Verify:
   - ✅ Balance shows ECO wallet
   - ✅ Orderbook from ScyllaDB
   - ✅ Order endpoint is `/api/ext/ecosystem/order`

**Expected Result:** ✅ No regression - SPOT and ECO markets work as before

---

## Troubleshooting

### Issue: "Price not available for EUR/USD"

**Diagnosis:**
```bash
# Check if eco-ws is running
pm2 list | grep eco-ws
# Check if price in Redis
docker compose -f docker-compose.dev.yml exec redis redis-cli GET "twd:ticker:EUR/USD"
```

**Solutions:**
1. If eco-ws not running: `pm2 restart eco-ws`
2. If ticker not in Redis: Wait 10-20 seconds for WebSocket to connect
3. Check eco-ws logs: `pm2 logs eco-ws --lines 50`
   - Should see: `[eco-ws] ✅ Price event received`

---

### Issue: Wallet Balance Not Updating

**Diagnosis:**
```bash
# Check backend logs for errors
pm2 logs backend --lines 100 | grep -i error

# Check wallet in database
docker compose -f docker-compose.dev.yml exec mysql mysql -u root -ppassword bicrypto -e "SELECT * FROM wallet WHERE type='TWD_PAPER'"
```

**Solutions:**
1. Transaction may have failed - check backend logs
2. Refresh page to re-fetch wallet balance
3. Check DevTools → Network → wallet request shows updated balance

---

### Issue: LIMIT Orders Not Executing

**Diagnosis:**
```bash
# Check if cron is running
pm2 logs backend --lines 100 | grep "TWD Cron"

# Check current price vs order price
docker compose -f docker-compose.dev.yml exec redis redis-cli GET "twd:ticker:EUR/USD"

# Check open orders
docker compose -f docker-compose.dev.yml exec mysql mysql -u root -ppassword bicrypto -e "SELECT * FROM twd_order WHERE status='OPEN'"
```

**Solutions:**
1. Cron runs every 1 minute - wait patiently
2. Ensure order price is reachable (BUY: price >= current, SELL: price <= current)
3. Check backend logs for cron execution and any errors

---

### Issue: TWD_PAPER Wallet Not Created

**Solution:**
```bash
# Manually create via API
curl -X POST http://localhost:4000/api/ext/twd/wallet/reset \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Or via SQL
docker compose -f docker-compose.dev.yml exec mysql mysql -u root -ppassword bicrypto -e "
INSERT INTO wallet (id, userId, type, currency, balance, createdAt, updatedAt)
VALUES (UUID(), 'YOUR-USER-ID', 'TWD_PAPER', 'USD', 100000, NOW(), NOW());
"
```

---

## Summary Checklist

After completing all tests, you should have:

- [x] Created TWD_PAPER wallet with $100,000 initial balance
- [x] Placed MARKET BUY order → executed instantly
- [x] Placed LIMIT SELL order → appears in Open Orders
- [x] LIMIT order executed when price reached
- [x] Cancelled an open LIMIT order
- [x] Tested edge cases (insufficient balance, invalid amounts)
- [x] Verified database persistence (`twd_order`, `wallet` tables)
- [x] Verified data persists across page refresh
- [x] Confirmed SPOT/ECO markets still work (no regression)

**If all checkboxes are ticked:** ✅ **TWD paper trading is fully functional!**

---

## Additional Notes

**API Credit Usage:**
- With the fix applied, TWD trading uses ZERO REST API credits
- All prices sourced from Redis cache (updated by WebSocket)
- Candles still use REST API but cached for 60 seconds

**Performance:**
- MARKET orders execute in ~100-200ms (Redis lookup)
- LIMIT orders processed every 60 seconds (cron interval)
- Wallet balance updates are atomic (transaction-safe)

**Limitations:**
- Single USD wallet (all positions tracked via balance)
- No short selling (can't sell what you don't "have" - just paper balance)
- Fee is simulated (0.1% taker fee by default)
- No real positions - just cash balance tracking

**Future Enhancements:**
- Track virtual positions per symbol (EUR, GBP, etc.)
- Add stop-loss / take-profit orders
- Add trailing stops
- Real-time order updates via WebSocket
