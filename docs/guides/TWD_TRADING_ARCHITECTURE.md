# TwelveData (TWD) Trading Architecture - Complete Map

## Executive Summary

**Good News:** TWD paper trading is **already fully implemented** in Bicrypto 4.6.3!

- ✅ Backend endpoints exist (`/api/ext/twd/order`)
- ✅ Database model (`twdOrder`) and wallet type (`TWD_PAPER`) configured
- ✅ Frontend fully wired (order placement, cancellation, history)
- ✅ Cron job processes LIMIT orders automatically
- ⚠️ **One critical issue**: Price source uses REST API (burns credits) instead of Redis cache

## 1. Existing Spot Trading Architecture

### Exchange (CCXT) Trading - `/api/exchange/order`

**Endpoint:** `/backend/api/exchange/order/index.post.ts`

**Flow:**
1. Validate input (currency, pair, amount, price, type, side)
2. Fetch market metadata from `exchangeMarket` table
3. Initialize ExchangeManager (CCXT wrapper)
4. For MARKET orders: fetch current price via `exchange.fetchTicker()`
5. Calculate cost, fee
6. Check wallet balance (`type: SPOT`)
7. Create order via CCXT: `exchange.createOrder()`
8. Update wallets in transaction:
   - BUY: Deduct from pair wallet, credit base wallet on fill
   - SELL: Deduct from base wallet, credit pair wallet on fill
9. Store order in `exchangeOrder` table

**Key files:**
- `/backend/api/exchange/order/index.post.ts` - Order creation
- `/backend/api/exchange/order/index.get.ts` - List orders
- `/backend/api/exchange/order/[id]/index.del.ts` - Cancel order
- `/backend/utils/exchange.ts` - ExchangeManager (CCXT wrapper)
- **DB Tables**: `exchangeOrder`, `wallet` (type: SPOT)

**Wallet structure:**
- Separate wallets per currency per user
- Type: `SPOT`
- Balances updated immediately on order execution

---

### Ecosystem Trading - `/api/ext/ecosystem/order`

**Endpoint:** `/backend/api/ext/ecosystem/order/index.post.ts`

**Flow:**
1. Validate input
2. Fetch market from `ecosystemMarket` table
3. For MARKET orders: get best price from orderbook (`getOrderBook()`)
4. Calculate cost, fee
5. Check ecosystem wallet balance
6. Self-match prevention (prevent user buying from themselves)
7. Create order in ScyllaDB via `createOrder()`
8. Update ecosystem wallet in transaction
9. Order stored in ScyllaDB, processed by matching engine

**Key files:**
- `/backend/api/ext/ecosystem/order/index.post.ts` - Order creation
- `/backend/utils/eco/scylla/queries.ts` - ScyllaDB operations
- `/backend/utils/eco/wallet.ts` - Ecosystem wallet management
- `/backend/utils/eco/matchingEngine.ts` - Order matching
- **DB**: ScyllaDB (`ecosystem` keyspace)

**Wallet structure:**
- Ecosystem wallets (separate from SPOT)
- Type: `ECO`
- Balance managed via `getWalletByUserIdAndCurrency()`

---

## 2. TwelveData (TWD) Trading Architecture

### TWD Paper Trading - `/api/ext/twd/order`

**Endpoint:** `/backend/api/ext/twd/order/index.post.ts`

**Flow:**
1. Validate input (symbol, type, side, amount, price)
2. Check market exists in `twdMarket` table (status: true)
3. Get or create `TWD_PAPER` wallet
4. **MARKET orders:**
   - ⚠️ **Current (ISSUE):** Calls `fetchTwdPrice()` → TwelveData REST API
   - ✅ **Should:** Read from Redis `twd:ticker:${symbol}`
   - Status: `CLOSED` (executed immediately)
5. **LIMIT orders:**
   - Use specified price
   - Status: `OPEN` (processed by cron job)
6. Calculate cost, fee via `calculateTwdFee()`
7. Check TWD_PAPER wallet balance
8. Execute in transaction:
   - BUY: Deduct cost + fee from wallet (MARKET) or reserve (LIMIT)
   - SELL: Add proceeds - fee to wallet (MARKET)
9. Store order in `twdOrder` table
10. For LIMIT orders: Cron job (`processTwdLimitOrders`) checks price every minute

**Key files:**
- `/backend/api/ext/twd/order/index.post.ts` - Order creation ⚠️ NEEDS FIX
- `/backend/api/ext/twd/order/index.get.ts` - List orders
- `/backend/api/ext/twd/order/[id]/index.del.ts` - Cancel order
- `/backend/api/ext/twd/order/utils.ts` - Fee calculation
- `/backend/api/ext/twd/utils.ts` - Wallet and price utilities
- `/backend/utils/crons/twdOrder.ts` - LIMIT order processor
- **DB Tables**: `twdOrder`, `twd_market`, `wallet` (type: TWD_PAPER)

**Wallet structure:**
- **Single wallet per user** (not per currency like SPOT)
- Type: `TWD_PAPER`
- Currency: `USD` (env: `TWD_DEFAULT_CURRENCY`)
- Initial balance: 100,000 USD (env: `TWD_DEMO_BALANCE`)
- All trades denominated in USD equivalent

**LIMIT Order Processing (Cron):**
- File: `/backend/utils/crons/twdOrder.ts`
- Runs: Every 1 minute
- Logic:
  ```
  1. Fetch all orders WHERE status='OPEN' AND type='LIMIT'
  2. Group by symbol
  3. For each symbol: fetch current price
  4. For each order:
     - BUY: Execute if currentPrice <= order.price
     - SELL: Execute if currentPrice >= order.price
  5. Update wallet and order status in transaction
  ```

---

## 3. Frontend Integration

### Order Store - `/src/stores/trade/order/index.ts`

**Key functions:**

```typescript
// Fetch TWD_PAPER wallet balance
fetchWallets(isEco, currency, pair, isTwd)
  - If isTwd: GET /api/finance/wallet?type=TWD_PAPER
  - Sets currencyBalance & pairBalance to same value

// Fetch TWD orders
fetchOrders(isEco, currency, pair, isTwd)
  - If isTwd: GET /api/ext/twd/order?status=OPEN|CLOSED

// Place TWD order
placeOrder(isEco, currency, pair, orderType, side, amount, price, isTwd, symbol)
  - If isTwd: POST /api/ext/twd/order
  - Body: { symbol, amount, type, side, price }

// Cancel TWD order
cancelOrder(id, isEco, currency, pair, timestamp, isTwd)
  - If isTwd: DELETE /api/ext/twd/order/${id}
```

**Components:**
- `/src/components/pages/trade/order/Order.tsx` - Main order panel
- `/src/components/pages/trade/order/OrderInput/OrderInput.tsx` - Order form
- `/src/components/pages/trade/orders/Orders.tsx` - Order history/open orders

**Integration points:**
- Trading page detects TWD market via `market.isTwd` flag (set in `setExternalTwdMarket()`)
- Order form passes `isTwd` to all store functions
- Wallet balance shows single USD balance for both sides
- Order history filters by TWD status

---

## 4. Database Schema

### `twdOrder` Table

```sql
CREATE TABLE twd_order (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  symbol VARCHAR(191) NOT NULL,  -- e.g., "EUR/USD", "AAPL"
  type ENUM('MARKET', 'LIMIT') NOT NULL,
  side ENUM('BUY', 'SELL') NOT NULL,
  status ENUM('OPEN', 'CLOSED', 'CANCELED', 'EXPIRED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
  price DECIMAL(30,15) NOT NULL,
  amount DECIMAL(30,15) NOT NULL,
  filled DECIMAL(30,15) NOT NULL DEFAULT 0,
  remaining DECIMAL(30,15) NOT NULL,
  cost DECIMAL(30,15) NOT NULL,
  fee DECIMAL(30,15) NOT NULL DEFAULT 0,
  feeCurrency VARCHAR(10),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  deletedAt TIMESTAMP,

  INDEX twdOrderUserIdFkey (userId),
  INDEX twdOrderSymbol (symbol),
  INDEX twdOrderStatus (status)
);
```

### `wallet` Table (TWD entries)

```sql
-- Example TWD_PAPER wallet
INSERT INTO wallet (userId, type, currency, balance)
VALUES ('user-uuid', 'TWD_PAPER', 'USD', 100000.00);
```

---

## 5. Critical Issue: Price Source

### Current Implementation (WRONG)

File: `/backend/api/ext/twd/order/index.post.ts:107`

```typescript
if (orderType === "MARKET") {
  executionPrice = await fetchTwdPrice(symbol); // ❌ Calls REST API!
  orderStatus = "CLOSED";
}
```

**Problem:**
- `fetchTwdPrice()` calls TwelveData REST API: `${baseUrl}/price?symbol=${symbol}`
- Burns 1 API credit per MARKET order
- With active trading: burns hundreds of credits per day

### Correct Implementation (SHOULD BE)

**Use Redis ticker cache:**

```typescript
import { RedisSingleton } from "@b/utils/redis";
const redis = RedisSingleton.getInstance();

if (orderType === "MARKET") {
  // Get price from Redis ticker cache (updated by eco-ws every few seconds)
  const tickerKey = `twd:ticker:${symbol}`;
  const cached = await redis.get(tickerKey);

  if (!cached) {
    throw new Error(`Price not available for ${symbol}. Please try again.`);
  }

  const ticker = JSON.parse(cached);
  executionPrice = ticker.price;
  orderStatus = "CLOSED";
}
```

**Fallback for LIMIT orders in cron:**
- Cron job MUST also use Redis ticker
- Current cron already calls `fetchTwdPrice()` (also needs fix)

---

## 6. Environment Variables

```bash
# .env

# TWD Wallet Configuration
TWD_DEFAULT_CURRENCY=USD        # Default currency for TWD_PAPER wallets
TWD_DEMO_BALANCE=100000         # Initial balance for new TWD wallets

# TWD API (already configured for data)
TWD_API_KEY=your_api_key
TWD_BASE_URL=https://api.twelvedata.com
TWD_MAX_SYMBOLS=3               # Limit WebSocket subscriptions
TWD_DISABLE_REST=true           # Disable background REST calls
```

**Trading Configuration:**
- No additional env vars needed for trading
- All config uses existing TWD settings

---

## 7. API Endpoints Summary

### TWD Trading Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ext/twd/order` | Create order (MARKET/LIMIT) |
| GET | `/api/ext/twd/order` | List orders (filtered by status) |
| GET | `/api/ext/twd/order/:id` | Get single order |
| DELETE | `/api/ext/twd/order/:id` | Cancel order (returns balance) |
| GET | `/api/ext/twd/market` | List available TWD markets |
| GET | `/api/ext/twd/ticker` | Get current prices (all symbols) |
| GET | `/api/ext/twd/candles` | Get historical candles |
| POST | `/api/ext/twd/wallet/reset` | Reset TWD_PAPER wallet to demo balance |

### Wallet Endpoints (Used by Frontend)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/finance/wallet?type=TWD_PAPER` | Get TWD_PAPER wallets |
| GET | `/api/finance/wallet/symbol` | Get SPOT/ECO wallets |

---

## 8. Comparison: SPOT vs ECO vs TWD

| Feature | SPOT (Exchange) | ECO (Ecosystem) | TWD (TwelveData) |
|---------|----------------|-----------------|------------------|
| **Price Source** | CCXT Exchange | ScyllaDB Orderbook | Redis Cache (WS) |
| **Execution** | External via CCXT | Internal Matching Engine | Instant (Paper) |
| **Wallet Type** | SPOT (per currency) | ECO (per currency) | TWD_PAPER (single USD) |
| **Order Storage** | MySQL `exchangeOrder` | ScyllaDB | MySQL `twdOrder` |
| **Matching** | Exchange handles | Matching engine | Instant for MARKET, Cron for LIMIT |
| **API Endpoint** | `/api/exchange/order` | `/api/ext/ecosystem/order` | `/api/ext/twd/order` |
| **Fees** | From market metadata | From market metadata | `calculateTwdFee()` |
| **Self-Match** | No (external) | Prevented | N/A (single user) |
| **Position Tracking** | Via balances | Via balances | Via single USD balance |

---

## 9. Order Flow Diagrams

### MARKET Order Flow (TWD)

```
User clicks "Buy EUR/USD (Market, 1000)" on /trade/EUR_USD
   ↓
OrderInput.tsx → useOrderStore.placeOrder(..., isTwd=true, symbol="EUR/USD")
   ↓
POST /api/ext/twd/order { symbol: "EUR/USD", type: "MARKET", side: "BUY", amount: 1000 }
   ↓
Backend:
   1. Get TWD_PAPER wallet (balance: $100,000)
   2. ⚠️ fetchTwdPrice("EUR/USD") → calls REST API → 1.08450 (SLOW, BURNS CREDITS)
   3. ✅ SHOULD: redis.get("twd:ticker:EUR/USD") → {price: 1.08450} (FAST, FREE)
   4. Calculate: cost = 1000 * 1.08450 = 1084.50
   5. Calculate: fee = calculateTwdFee(1000, 1.08450) → 10.85
   6. Check: wallet.balance (100000) >= cost + fee (1095.35) ✅
   7. Transaction:
      - Update wallet: 100000 - 1095.35 = 98904.65
      - Create order: status="CLOSED", filled=1000, remaining=0
   8. Commit
   ↓
Frontend:
   1. fetchWallets() → updated balance: $98,904.65
   2. fetchOrders() → order appears in "Order History"
   3. Success toast: "MARKET order executed successfully"
```

### LIMIT Order Flow (TWD)

```
User clicks "Sell EUR/USD (Limit @ 1.09000, 500)" on /trade/EUR_USD
   ↓
OrderInput.tsx → useOrderStore.placeOrder(..., isTwd=true, price=1.09000)
   ↓
POST /api/ext/twd/order { symbol: "EUR/USD", type: "LIMIT", side: "SELL", amount: 500, price: 1.09000 }
   ↓
Backend:
   1. Get TWD_PAPER wallet
   2. Set executionPrice = 1.09000 (user-specified)
   3. Set status = "OPEN"
   4. Calculate: cost = 500 * 1.09000 = 545.00
   5. Calculate: fee = calculateTwdFee(500, 1.09000) → 5.45
   6. For SELL LIMIT: no balance reservation (positions not tracked)
   7. Transaction:
      - Create order: status="OPEN", filled=0, remaining=500
   8. Commit
   ↓
Frontend:
   1. fetchOrders() → order appears in "Open Orders"
   2. Success toast: "LIMIT order created successfully"
   ↓
Cron Job (every 1 minute):
   1. Fetch all OPEN LIMIT orders
   2. For symbol "EUR/USD": fetch current price
      - ⚠️ Currently: fetchTwdPrice() → REST API (BURNS CREDITS)
      - ✅ SHOULD: redis.get("twd:ticker:EUR/USD")
   3. Current price: 1.08950 → NOT executed (< 1.09000 for SELL)
   4. Wait 1 minute...
   5. Current price: 1.09050 → EXECUTE! (>= 1.09000 for SELL)
   6. Transaction:
      - Calculate proceeds: 500 * 1.09050 = 545.25
      - Update wallet: balance + (545.25 - 5.45) = balance + 539.80
      - Update order: status="CLOSED", filled=500, remaining=0, price=1.09050
   7. Commit
   ↓
Frontend (next refresh):
   1. Order moves from "Open Orders" to "Order History"
   2. Wallet balance updated
```

---

## 10. What's Already Working

✅ **Backend:**
- Order creation endpoint (`/api/ext/twd/order`)
- Order listing endpoint (open/closed filters)
- Order cancellation endpoint
- TWD_PAPER wallet creation/management
- Fee calculation
- LIMIT order processing cron job
- Database schema and models

✅ **Frontend:**
- Order store with TWD support
- Order form submits to correct endpoint
- Wallet balance fetching
- Order history displays TWD orders
- Order cancellation works

✅ **Integration:**
- Trading page detects TWD markets
- Market store sets `isTwd` flag correctly
- All data flows through proper channels

---

## 11. What Needs Fixing

❌ **CRITICAL - Price Source in Order Creation:**
- **File:** `/backend/api/ext/twd/order/index.post.ts:107`
- **Issue:** Uses `fetchTwdPrice()` which calls REST API
- **Fix:** Read from Redis `twd:ticker:${symbol}`

❌ **CRITICAL - Price Source in Cron Job:**
- **File:** `/backend/utils/crons/twdOrder.ts:40`
- **Issue:** Uses `fetchTwdPrice()` which calls REST API
- **Fix:** Read from Redis `twd:ticker:${symbol}`

⚠️ **OPTIONAL - Error Handling:**
- **File:** Order endpoints
- **Issue:** If ticker not in Redis, should show clear error
- **Fix:** Add fallback message: "Market price unavailable"

---

## 12. Summary

**TWD trading infrastructure is 95% complete.** The only critical issue is the price source using REST API instead of Redis cache. Once fixed:

1. Orders will execute using cached prices from eco-ws (updated every few seconds)
2. No API credits burned on order execution
3. Faster execution (Redis vs HTTP request)
4. Same user experience as SPOT/ECO trading

**Next step:** Fix the two price source issues, then test end-to-end.
