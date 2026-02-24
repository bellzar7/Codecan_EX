# REAL Architecture Analysis - Bicrypto Trading Systems

## Executive Summary

After deep code analysis, here are the THREE distinct trading systems:

| System | Provider | Market Metadata | Orders | Wallets | Execution |
|--------|----------|-----------------|--------|---------|-----------|
| **Spot** | CCXT (External) | MySQL: `exchange_market` | MySQL: `exchange_order` | MySQL: `type="SPOT"` | Real exchange via CCXT |
| **Futures** | Internal | MySQL: `futures_market` | ScyllaDB: `futures_orders` | MySQL: `type="FUTURES"` | Internal matching engine |
| **Ecosystem** | Internal | MySQL: `ecosystem_market` | ScyllaDB: `ecosystem_orders` | MySQL: `type="ECO"` | Internal matching engine |

---

## 1. Spot Trading (Exchange) - REAL EXTERNAL TRADING

### Database Schema

**MySQL Tables:**
- `exchange` - Exchange providers (Binance, KuCoin, etc.)
- `exchange_market` - Market pairs (BTC/USDT, ETH/USDT, etc.)
- `exchange_currency` - Currencies
- `exchange_order` - User orders
- `wallet` (type="SPOT") - User balances

### Flow

1. **Admin enables provider** → `PUT /api/admin/finance/exchange/provider/:id/status`
   - Only ONE provider active at a time
   - Uses `ExchangeManager` singleton (backend/utils/exchange.ts)
   - Connects to CCXT: `new ccxt.pro[provider]({ apiKey, secret })`

2. **Admin imports markets** → `GET /api/admin/finance/exchange/market/import`
   - Calls `exchange.loadMarkets()` via CCXT
   - Saves to `exchange_market` with `status: false`
   - Also creates `futures_market` entries

3. **Admin enables markets** → `PUT /api/admin/finance/exchange/market/:id/status`

4. **User places order** → `POST /api/exchange/order`
   - Fetches market metadata from MySQL
   - Validates balance in MySQL wallet (type="SPOT")
   - **Creates order on real exchange** via CCXT: `exchange.createOrder(...)`
   - Saves to `exchange_order` with `referenceId` = exchange order ID
   - Updates wallet balances in MySQL

5. **WebSocket tracks orders** → `backend/api/exchange/order/index.ws.ts`
   - Polls `exchange.fetchOpenOrders()` every 5 seconds
   - Detects status changes
   - Updates MySQL `exchange_order` table
   - Updates wallet balances when orders fill

### Key Files

- `backend/utils/exchange.ts` - CCXT manager
- `backend/api/exchange/order/index.post.ts` - Order creation
- `backend/api/exchange/order/index.ws.ts` - Order tracking
- `backend/api/exchange/ticker/index.ws.ts` - Price streaming
- `models/exchange.ts`, `models/exchangeMarket.ts`, `models/exchangeOrder.ts`

---

## 2. Futures Trading - INTERNAL SIMULATED TRADING

### Database Schema

**MySQL:**
- Reuses `exchange` table (same provider)
- `futures_market` - Market pairs

**ScyllaDB:**
- Keyspace: `scyllaFuturesKeyspace`
- Table: `orders` - Futures orders
- Table: `positions` - Open positions
- Table: `orderbook` - Order book entries

**Wallets:**
- MySQL `wallet` table with `type="FUTURES"`

### Flow

1. **Markets imported** → When admin imports exchange markets
   - Creates BOTH `exchange_market` AND `futures_market` entries
   - See: `backend/api/admin/finance/exchange/market/import.get.ts:162-170`

2. **User places order** → `POST /api/ext/futures/order`
   - Fetches market from MySQL `futures_market`
   - Validates balance in MySQL wallet (type="FUTURES")
   - **Saves order to ScyllaDB** via `backend/utils/futures/queries/order.ts`
   - **Internal matching engine** matches orders
   - Updates positions in ScyllaDB
   - Updates wallet balances in MySQL

3. **Matching engine** → `backend/utils/futures/matchingEngine.ts`
   - Runs internally, no external exchange
   - Matches buy/sell orders
   - Updates orderbook in ScyllaDB
   - Handles leverage, stop-loss, take-profit

### Key Files

- `backend/api/ext/futures/order/index.post.ts` - Order creation
- `backend/utils/futures/matchingEngine.ts` - Internal matching
- `backend/utils/futures/queries/order.ts` - ScyllaDB queries
- `backend/utils/eco/wallet.ts` - Wallet management
- `models/futuresMarket.ts`

---

## 3. Ecosystem Trading - INTERNAL EXCHANGE FOR CUSTOM TOKENS

### Database Schema

**MySQL:**
- `ecosystem_market` - Market pairs for custom tokens
- `ecosystem_token` - Custom tokens
- `ecosystem_blockchain` - Supported blockchains
- `wallet` (type="ECO") - Balances

**ScyllaDB:**
- Similar to Futures
- Orders, positions, orderbook

### Flow

Same as Futures, but for custom ecosystem tokens instead of traditional crypto pairs.

### Key Files

- `backend/api/ext/ecosystem/order/` - Order management
- `backend/utils/eco/matchingEngine.ts` - Matching engine
- `models/ecosystemMarket.ts`, `models/ecosystemToken.ts`

---

## 4. Existing Forex System - INVESTMENT PLANS (NOT SPOT TRADING)

### Important Distinction

The existing "Forex" system (`backend/api/ext/forex/`, `models/forexAccount.ts`) is **NOT** spot trading.

It's a **managed investment system**:
- Users connect MT4/MT5 accounts
- Follow trading signals
- Invest in forex plans
- Receive ROI payouts

**Transaction types:**
- `FOREX_DEPOSIT`, `FOREX_WITHDRAW`
- `FOREX_INVESTMENT`, `FOREX_INVESTMENT_ROI`

This is DIFFERENT from what we need for TwelveData.

---

## 5. TwelveData Current State

### What Exists

**WebSocket Server** (`backend/integrations/twelvedata/server.ts`):
- Separate process on port 4002
- Connects to TwelveData WS API
- **Hardcoded symbols** from `ECO_DEFAULT_SYMBOLS` env var
- Redistributes prices to frontend clients
- REST priming for equity symbols

**API Endpoints** (`backend/api/exchange/tewlvedata/`):
- `/catalog?kind=forex|indices|stocks` - Fetches available symbols
- `/defaults` - Returns env-defined symbols
- `/watchlist` - Redis-based watchlist
- `/candles`, `/ticker`, `/summary` - Market data

**Frontend Integration:**
- Trading page (`src/pages/trade/[symbol]/index.tsx`) has TWD logic:
  ```typescript
  const isTwd = (market as any)?.isTwd;
  setExternalTwdMarket(sym);
  ```
- Pages exist: `/forex`, `/indices`, `/stocks`

### What's Missing

- ❌ No database tables for TWD markets
- ❌ No admin interface to import/enable instruments
- ❌ No order system
- ❌ No wallet integration
- ❌ No transaction records
- ❌ Symbols hardcoded in .env

---

## 6. Recommended TwelveData Architecture

### Design Principles

1. **Follow Futures/Ecosystem Pattern** (internal exchange)
   - TwelveData provides READ-ONLY market data
   - Cannot execute real trades
   - Must simulate/paper trade internally

2. **Reuse Existing Infrastructure**
   - Use MySQL wallet system (type="SPOT" or new type)
   - Use MySQL for market metadata
   - Decide: MySQL or ScyllaDB for orders?

3. **Consistent Admin Flow**
   - Enable provider
   - Import instruments
   - Enable specific instruments

### Option A: MySQL-Only (Simpler, Recommended)

**Why MySQL-only:**
- Lower complexity
- Easier to maintain
- TwelveData won't have massive order volume like real exchanges
- Follows same pattern as Spot trading
- Can reuse existing `exchange_order` table with a flag OR create `twd_order`

**Tables:**
```sql
-- Reuse existing exchange table OR create new
CREATE TABLE twd_provider (
  id UUID PRIMARY KEY,
  name VARCHAR(191) NOT NULL DEFAULT 'twelvedata',
  title VARCHAR(191) DEFAULT 'TwelveData',
  status BOOLEAN DEFAULT FALSE,
  api_key VARCHAR(191),  -- Encrypted
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Market metadata
CREATE TABLE twd_market (
  id UUID PRIMARY KEY,
  symbol VARCHAR(191) UNIQUE NOT NULL,  -- "EUR/USD", "AAPL:NASDAQ", "SPX"
  type VARCHAR(50),                      -- "forex", "stocks", "indices"
  name VARCHAR(191),
  currency VARCHAR(10),                  -- Base currency (e.g., "EUR", "AAPL")
  pair VARCHAR(10),                      -- Quote currency (e.g., "USD")
  exchange VARCHAR(50),                  -- For stocks: "NASDAQ", "NYSE"
  metadata JSON,                         -- Additional info
  is_trending BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Orders (paper trading)
CREATE TABLE twd_order (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol VARCHAR(191) NOT NULL,
  type VARCHAR(20),              -- "MARKET", "LIMIT"
  side VARCHAR(10),              -- "BUY", "SELL"
  status VARCHAR(20),            -- "OPEN", "CLOSED", "CANCELED"
  price DECIMAL(30,15),
  amount DECIMAL(30,15),
  filled DECIMAL(30,15),
  remaining DECIMAL(30,15),
  cost DECIMAL(30,15),
  fee DECIMAL(30,15),
  fee_currency VARCHAR(10),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Reuse wallet table
-- wallet (type="SPOT") for paper trading balances
```

**Execution Engine:**
```typescript
// Simple in-memory or cron-based execution
// Check OPEN LIMIT orders every N seconds
// Compare with current price from TwelveData
// Execute when price matches
// Update twd_order status
// Update wallet balance
```

### Option B: ScyllaDB (Higher Performance, More Complex)

**Only if:**
- Expect massive order volume
- Need sub-millisecond matching
- Want to reuse Futures matching engine

**Same as Futures architecture:**
- MySQL: `twd_market` for metadata
- ScyllaDB: orders, positions (if needed)
- Matching engine from `backend/utils/futures/matchingEngine.ts`

### Recommendation: **Option A (MySQL-Only)**

**Reasons:**
1. TwelveData is paper trading, not high-frequency
2. Simpler to implement and maintain
3. Consistent with Spot trading pattern
4. Can reuse most Spot trading code
5. MySQL is sufficient for expected load

---

## 7. Proposed Implementation Flow

### Phase 1: Database & Models

1. Create migration for `twd_provider`, `twd_market`, `twd_order`
2. Create Sequelize models
3. Seed initial provider: "twelvedata"

### Phase 2: Backend Admin APIs

```
/api/admin/ext/twd/
  provider/
    index.get.ts          # List providers
    [id]/
      index.get.ts        # Get details (test API key)
      status.put.ts       # Enable/disable

  market/
    index.get.ts          # List markets
    import.get.ts         # Import from TwelveData
    [id]/
      status.put.ts       # Enable/disable market
```

**Import Flow:**
```typescript
// backend/api/admin/ext/twd/market/import.get.ts
const kind = query.kind; // "forex" | "indices" | "stocks" | "all"

// Call TwelveData REST API
const symbols = await fetchCatalog(kind);

// Bulk insert into twd_market with status: false
await models.twdMarket.bulkCreate(
  symbols.map(s => ({
    symbol: s,
    type: kind,
    status: false,
    ...parseSymbol(s)  // Extract currency, pair, exchange
  }))
);
```

### Phase 3: Backend User APIs

```
/api/ext/twd/
  market/
    index.get.ts          # List enabled markets
    [symbol]/
      ticker.get.ts       # Current price
      candles.get.ts      # Historical data

  order/
    index.get.ts          # List user orders
    index.post.ts         # Create order (paper)
    [id]/
      index.del.ts        # Cancel order
```

**Order Creation:**
```typescript
// backend/api/ext/twd/order/index.post.ts
const { symbol, type, side, amount, price } = body;

// 1. Get market
const market = await models.twdMarket.findOne({ where: { symbol } });

// 2. Get current price from TwelveData (for market orders)
const currentPrice = await fetchTwdPrice(symbol);

// 3. Check wallet balance
const wallet = await models.wallet.findOne({
  where: { userId, type: "SPOT", currency: pair }
});

// 4. Validate balance
if (side === "BUY" && wallet.balance < cost) throw Error("Insufficient");

// 5. Create order
const order = await models.twdOrder.create({
  userId,
  symbol,
  type,
  side,
  price: type === "LIMIT" ? price : currentPrice,
  amount,
  status: "OPEN",
  ...
});

// 6. If MARKET order, execute immediately
if (type === "MARKET") {
  await executeOrder(order, currentPrice);
}

// 7. Update wallet
await updateWallet(wallet, ...);

return { message: "Order created" };
```

### Phase 4: Order Execution Engine

**For LIMIT orders:**
```typescript
// backend/utils/crons/twdOrderExecution.ts
export default {
  name: "twdOrderExecution",
  period: 5000,  // Every 5 seconds

  async function() {
    // Get all OPEN LIMIT orders
    const orders = await models.twdOrder.findAll({
      where: { status: "OPEN", type: "LIMIT" }
    });

    for (const order of orders) {
      // Get current price
      const price = await getTwdPrice(order.symbol);

      // Check if order should execute
      if (shouldExecute(order, price)) {
        await executeOrder(order, price);
      }
    }
  }
};
```

### Phase 5: WebSocket Integration

**Modify TwelveData Server:**
```typescript
// backend/integrations/twelvedata/server.ts

// Remove hardcoded symbols
- const defaults = process.env.ECO_DEFAULT_SYMBOLS.split(",");

// Load from database
+ async function getEnabledSymbols() {
+   const markets = await models.twdMarket.findAll({
+     where: { status: true },
+     attributes: ["symbol"]
+   });
+   return markets.map(m => m.symbol);
+ }

+ const symbols = await getEnabledSymbols();
+ provider.subscribe(symbols);

// Refresh every 60s
+ setInterval(async () => {
+   const symbols = await getEnabledSymbols();
+   provider.subscribe(symbols);
+ }, 60000);
```

### Phase 6: Frontend Admin Pages

**Provider Management** (`src/pages/admin/ext/twd/index.tsx`):
- Similar to `/admin/finance/exchange/index.tsx`
- Enable/disable switch
- View API key status

**Market Management** (`src/pages/admin/ext/twd/market/index.tsx`):
- Import button with type selector (forex/indices/stocks/all)
- DataTable with enable/disable switches
- Filter by type
- Mark as trending/hot

### Phase 7: Frontend Trading Pages

**Update Market Pages:**
```typescript
// src/pages/forex/index.tsx
const { data: markets } = useFetch("/api/ext/twd/market?type=forex&status=true");

// src/pages/indices/index.tsx
const { data: markets } = useFetch("/api/ext/twd/market?type=indices&status=true");

// src/pages/stocks/index.tsx
const { data: markets } = useFetch("/api/ext/twd/market?type=stocks&status=true");
```

**Trading Page Already Has TWD Support:**
```typescript
// src/pages/trade/[symbol]/index.tsx
// Already detects TWD markets and sets external market
setExternalTwdMarket(sym);
```

Just need to:
- Load TWD markets from database
- Connect order form to `/api/ext/twd/order`
- Show "PAPER TRADING" indicator

---

## 8. Wallet Strategy

### Option 1: Reuse `type="SPOT"` ✅ RECOMMENDED

**Pros:**
- No schema changes
- Reuses all existing wallet code
- Users see combined balance in SPOT wallet

**Cons:**
- Mixes real SPOT trading with TWD paper trading

### Option 2: New `type="TWD"`

**Pros:**
- Clear separation
- Dedicated paper trading balances

**Cons:**
- Requires schema migration
- More complex wallet management

### Option 3: New `type="PAPER"`

**Pros:**
- Generic for all paper trading
- Could be reused for demo accounts

**Cons:**
- Same as Option 2

### Recommendation: **Option 1** (Reuse SPOT)

For paper trading, just give users initial demo balances in SPOT wallets for common quote currencies (USD, EUR, etc.).

---

## 9. Summary

### Current Architecture (Verified)

| Feature | Spot | Futures | Ecosystem |
|---------|------|---------|-----------|
| Provider | CCXT (external) | Internal | Internal |
| Market DB | MySQL | MySQL | MySQL |
| Order DB | MySQL | ScyllaDB | ScyllaDB |
| Wallet DB | MySQL (SPOT) | MySQL (FUTURES) | MySQL (ECO) |
| Execution | Real exchange | Matching engine | Matching engine |

### Proposed TwelveData Architecture

| Feature | Choice |
|---------|--------|
| Provider | TwelveData (market data only) |
| Market DB | MySQL (`twd_market`) |
| Order DB | MySQL (`twd_order`) ✅ Simpler |
| Wallet DB | MySQL (reuse `type="SPOT"`) ✅ |
| Execution | Simple cron-based paper execution |
| Admin Flow | Import → Enable → Trade (same as Spot) |

### Implementation Phases

1. ✅ Database schema & models
2. ✅ Admin backend APIs (provider, import, enable)
3. ✅ User backend APIs (markets, orders, paper execution)
4. ✅ Modify TWD WebSocket to use database
5. ✅ Frontend admin pages
6. ✅ Frontend trading pages
7. ✅ Testing & refinement

### Next Steps

**Question for User:**

1. **Approve MySQL-only architecture?** (vs ScyllaDB)
2. **Approve reusing SPOT wallet type?** (vs new TWD type)
3. **Initial demo balance amount?** (suggest $100,000 USD)
4. **Should we create `twd_*` tables or reuse `exchange_*` tables with a type field?**
   - Option A: New tables `twd_provider`, `twd_market`, `twd_order` (cleaner separation)
   - Option B: Add `provider_type` field to `exchange`, reuse tables (less duplication)

Once approved, I'll begin implementation immediately.
