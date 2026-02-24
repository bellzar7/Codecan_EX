# Trading Flow Analysis - Bicrypto Platform

## Table of Contents
1. [Overview](#overview)
2. [Spot Trading Flow (Crypto)](#spot-trading-flow-crypto)
3. [Current TwelveData Implementation](#current-twelvedata-implementation)
4. [Problems with Current TwelveData Integration](#problems-with-current-twelvedata-integration)
5. [Proposed TwelveData Integration](#proposed-twelvedata-integration)

---

## Overview

Bicrypto has THREE trading systems:
1. **Spot Trading** - Crypto trading via CCXT exchange providers (Binance, KuCoin, etc.)
2. **Futures Trading** - Similar to Spot but for futures markets
3. **TwelveData** - Forex/Indices/Stocks (INCOMPLETE IMPLEMENTATION)

---

## Spot Trading Flow (Crypto)

### Database Schema

#### 1. Exchange Provider (`exchange` table)
```typescript
{
  id: UUID
  name: string          // "binance", "kucoin", etc.
  title: string         // Display name
  status: boolean       // Only ONE can be active at a time
  username: string
  licenseStatus: boolean
  version: string
  productId: string     // Unique identifier
  type: string          // "spot" or "futures"
}
```

#### 2. Exchange Currencies (`exchange_currency` table)
```typescript
{
  id: UUID
  currency: string      // "BTC", "ETH", etc.
  name: string         // Full name
  precision: number
  price: number        // Current price
  fee: number
  status: boolean
}
```

#### 3. Exchange Markets (`exchange_market` table)
```typescript
{
  id: UUID
  currency: string      // "BTC"
  pair: string         // "USDT"
  isTrending: boolean
  isHot: boolean
  metadata: JSON       // Contains precision, limits, fees
  status: boolean      // Market enabled/disabled
}
```

**metadata structure:**
```json
{
  "taker": 0.001,
  "maker": 0.001,
  "precision": {
    "price": 2,
    "amount": 8
  },
  "limits": {
    "amount": { "min": 0.001, "max": 10000 },
    "price": { "min": 0.01, "max": 100000 },
    "cost": { "min": 10, "max": 1000000 }
  }
}
```

#### 4. Exchange Orders (`exchange_order` table)
```typescript
{
  id: UUID
  referenceId: string   // Order ID from exchange (e.g., Binance order ID)
  userId: UUID
  status: "OPEN" | "CLOSED" | "CANCELED" | "EXPIRED" | "REJECTED"
  symbol: string        // "BTC/USDT"
  type: "MARKET" | "LIMIT"
  timeInForce: "GTC" | "IOC" | "FOK" | "PO"
  side: "BUY" | "SELL"
  price: number
  average: number
  amount: number
  filled: number
  remaining: number
  cost: number
  trades: JSON
  fee: number
  feeCurrency: string
}
```

### Backend Flow

#### Step 1: Admin Enables Exchange Provider

**Endpoint:** `PUT /api/admin/finance/exchange/provider/:id/status`

**Code:** `backend/api/admin/finance/exchange/provider/[id]/status.put.ts`

```typescript
// When enabling a provider:
// 1. Disable all other providers (only ONE active at a time)
await models.exchange.update(
  { status: false },
  { where: { id: { [Op.ne]: id } } }
);

// 2. Enable selected provider
await models.exchange.update({ status }, { where: { id } });
```

**ExchangeManager** (`backend/utils/exchange.ts`):
- Singleton that manages CCXT exchange connections
- Fetches active provider from database (WHERE status = true)
- Uses environment variables for API credentials:
  - `APP_BINANCE_API_KEY`
  - `APP_BINANCE_API_SECRET`
  - `APP_BINANCE_API_PASSPHRASE` (if needed)
- Initializes CCXT provider: `new ccxt.pro[provider]({ apiKey, secret, password })`
- Caches exchange instances
- Handles rate limiting and ban status

#### Step 2: Admin Imports Markets

**Endpoint:** `GET /api/admin/finance/exchange/market/import`

**Code:** `backend/api/admin/finance/exchange/market/import.get.ts`

```typescript
// 1. Start exchange provider
const exchange = await ExchangeManager.startExchange();

// 2. Load all markets from exchange
await exchange.loadMarkets();
const markets = exchange.markets;

// 3. Filter valid markets (active, with precision)
for (const market of Object.values(markets)) {
  if (market.active && market.precision.price && market.precision.amount) {
    const { symbol, precision, limits, taker, maker } = market;
    validSymbols[symbol] = {
      taker,
      maker,
      precision: {
        price: countDecimals(precision.price),
        amount: countDecimals(precision.amount)
      },
      limits: {
        amount: limits.amount || { min: 0, max: null },
        price: limits.price || { min: 0, max: null },
        cost: limits.cost || { min: 0.0001, max: 9000000 }
      }
    };
  }
}

// 4. Save to database with status: false (disabled by default)
await models.exchangeMarket.create({
  currency,
  pair,
  metadata: symbolData,
  status: false  // Admin must manually enable markets
});

// 5. ALSO creates futuresMarket record
await models.futuresMarket.create({
  currency,
  pair,
  metadata: symbolData,
  status: false
});
```

#### Step 3: Admin Enables Specific Markets

**Endpoint:** `PUT /api/admin/finance/exchange/market/:id/status`

**Code:** `backend/api/admin/finance/exchange/market/[id]/status.put.ts`

```typescript
// Simply toggle market status
return updateStatus("exchangeMarket", id, status);
```

#### Step 4: User Places Order

**Endpoint:** `POST /api/exchange/order`

**Code:** `backend/api/exchange/order/index.post.ts`

**Full Order Creation Flow:**

```typescript
// 1. Check ban status (rate limiting)
const unblockTime = await loadBanStatus();
if (await handleBanStatus(unblockTime)) {
  throw new Error("Service temporarily unavailable");
}

// 2. Validate input
const { currency, pair, amount, price, type, side } = body;

// 3. Fetch market metadata
const market = await models.exchangeMarket.findOne({
  where: { currency, pair }
});
const metadata = JSON.parse(market.metadata);

// 4. Validate amount/price against min/max limits
if (amount < metadata.limits.amount.min) {
  throw new Error("Amount too low");
}

// 5. Initialize exchange
const exchange = await ExchangeManager.startExchange();

// 6. For market orders, fetch current price
if (type === "market") {
  const ticker = await exchange.fetchTicker(symbol);
  orderPrice = ticker.last;
}

// 7. Calculate cost
const cost = amount * orderPrice;

// 8. Check user wallets
const currencyWallet = await models.wallet.findOne({
  where: { userId, currency, type: "SPOT" }
});
const pairWallet = await models.wallet.findOne({
  where: { userId, pair, type: "SPOT" }
});

// 9. Validate balances
if (side === "BUY" && pairWallet.balance < cost) {
  throw new Error("Insufficient balance");
}
if (side === "SELL" && currencyWallet.balance < amount) {
  throw new Error("Insufficient balance");
}

// 10. Create order on exchange via CCXT
const order = await exchange.createOrder(
  symbol,
  type,
  side,
  amount,
  price
);

// 11. Fetch order details back
let orderData = await exchange.fetchOrder(order.id, symbol);

// 12. Update wallets and save order in transaction
await sequelize.transaction(async (transaction) => {
  if (side === "BUY") {
    // Deduct cost from pair wallet
    await updateWallet(pairWallet.id, pairWallet.balance - cost, transaction);

    // If order filled, credit currency wallet
    if (orderData.status === "closed") {
      const netAmount = orderData.amount - orderData.fee;
      await updateWallet(
        currencyWallet.id,
        currencyWallet.balance + netAmount,
        transaction
      );
    }
  } else { // SELL
    // Deduct from currency wallet
    await updateWallet(
      currencyWallet.id,
      currencyWallet.balance - amount,
      transaction
    );

    // If order filled, credit pair wallet
    if (orderData.status === "closed") {
      const proceeds = orderData.amount * orderData.price;
      const netProceeds = proceeds - orderData.fee;
      await updateWallet(
        pairWallet.id,
        pairWallet.balance + netProceeds,
        transaction
      );
    }
  }

  // Save order to database
  await models.exchangeOrder.create({
    ...orderData,
    userId,
    referenceId: order.id,
    fee: orderData.fee,
    feeCurrency
  }, { transaction });
});

// 13. Notify WebSocket watchers
addOrderToTrackedOrders(userId, orderData);
addUserToWatchlist(userId);
```

### WebSocket Implementation

#### 1. Order WebSocket (`backend/api/exchange/order/index.ws.ts`)

**Purpose:** Track user's OPEN orders and notify when status changes

```typescript
class OrderHandler {
  private trackedOrders: { [userId: string]: any[] } = {};
  private watchedUserIds: Set<string> = new Set();

  // Polls exchange every 5 seconds
  async fetchOrdersForUser(userId, userOrders, exchange, provider) {
    while (hasClients("/api/exchange/order") && this.watchedUserIds.has(userId)) {
      // Wait 5 seconds between polls
      await sleep(5000);

      // Fetch open orders from exchange
      const openOrders = await exchange.fetchOpenOrders(symbol);

      // Compare with database orders
      for (const order of userOrders) {
        const updatedOrder = openOrders.find(o => o.id === order.referenceId);

        if (!updatedOrder) {
          // Order not in open orders, fetch individual order
          const fetchedOrder = await exchange.fetchOrder(order.referenceId, symbol);

          if (fetchedOrder.status !== order.status) {
            // Status changed, update database
            await models.exchangeOrder.update({
              status: fetchedOrder.status,
              filled: fetchedOrder.filled,
              remaining: fetchedOrder.remaining
            }, { where: { referenceId: fetchedOrder.id } });

            // If order CLOSED, update wallet
            if (fetchedOrder.status === "CLOSED") {
              await updateWalletBalance(userId, fetchedOrder, provider);
            }

            // Notify WebSocket client
            addOrderToTrackedOrders(userId, fetchedOrder);
          }
        }
      }

      // Flush accumulated orders to client every 1 second
      // via flushOrders()
    }
  }

  private flushOrders() {
    Object.keys(this.trackedOrders).forEach(userId => {
      const orders = this.trackedOrders[userId];
      sendMessageToRoute(
        "/api/exchange/order",
        { userId },
        { stream: "orders", data: orders }
      );
    });
    this.trackedOrders = {};
  }
}
```

#### 2. Ticker WebSocket (`backend/api/exchange/ticker/index.ws.ts`)

**Purpose:** Real-time price updates for all enabled markets

```typescript
class TickerHandler {
  private accumulatedTickers = {};

  async start() {
    while (hasClients("/api/exchange/ticker")) {
      const exchange = await ExchangeManager.startExchange();
      const provider = await ExchangeManager.getProvider();

      // Get all enabled markets
      const symbolsInDB = await models.exchangeMarket.findAll({
        where: { status: true },
        attributes: ["currency", "pair"]
      });
      const symbols = symbolsInDB.map(m => `${m.currency}/${m.pair}`);

      // Fetch tickers based on provider capabilities
      let tickers;
      if (provider === "binance") {
        tickers = await exchange.fetchTickers(symbols);
      } else if (exchange.has["watchTickers"]) {
        tickers = await exchange.watchTickers(symbols);
      } else {
        tickers = await exchange.fetchTickers(symbols);
      }

      // Process and accumulate
      const processed = symbols.reduce((acc, symbol) => {
        if (tickers[symbol]) {
          acc[symbol] = {
            last: tickers[symbol].last,
            baseVolume: tickers[symbol].baseVolume,
            quoteVolume: tickers[symbol].quoteVolume,
            change: tickers[symbol].percentage
          };
        }
        return acc;
      }, {});

      Object.assign(this.accumulatedTickers, processed);

      // Flush every 1 second
      setInterval(() => {
        sendMessageToRoute(
          "/api/exchange/ticker",
          { type: "tickers" },
          { stream: "tickers", data: this.accumulatedTickers }
        );
        this.accumulatedTickers = {};
      }, 1000);

      // Cache in Redis
      await redis.set("exchange:tickers", JSON.stringify(processed));

      await sleep(1000);
    }
  }
}
```

### Frontend Flow

#### 1. Admin Pages

**Exchange Provider Management** (`src/pages/admin/finance/exchange/index.tsx`):
- Lists all exchange providers
- Switch to enable/disable (only ONE active)
- `onlySingleActiveStatus={true}` ensures exclusivity

**Market Management** (`src/pages/admin/finance/exchange/market/index.tsx`):
- "Import" button calls `/api/admin/finance/exchange/market/import`
- DataTable shows all markets with enable/disable switches
- Can mark markets as trending/hot

#### 2. Trading Page (`src/pages/trade/[symbol]/index.tsx`)

**Components:**
- `<Ticker />` - Shows current price, 24h change, volume
- `<Chart />` - TradingView chart
- `<Orderbook />` - Buy/sell orders (orderbook)
- `<Order />` - Place order form
- `<Orders />` - User's orders history
- `<Markets />` - List of available markets
- `<Trades />` - Recent trades

**Market Store** (`src/stores/trade/market.ts`):
```typescript
const useMarketStore = create((set, get) => ({
  market: null,
  marketData: [],

  setMarket: (symbol) => {
    const market = get().marketData.find(m => m.symbol === symbol);
    set({ market });
  },

  // WebSocket subscriptions for real-time data
  subscribeToTicker: () => {
    ws.connect("/api/exchange/ticker");
    ws.on("tickers", (data) => {
      set({ tickers: data });
    });
  }
}));
```

---

## Current TwelveData Implementation

### Architecture

#### 1. Separate WebSocket Server (`backend/integrations/twelvedata/server.ts`)

**Port:** 4002 (ECO_WS_PORT)

**What it does:**
- Connects to TwelveData WebSocket API
- Subscribes to symbols from `ECO_DEFAULT_SYMBOLS` env variable (HARDCODED!)
- Redistributes price data to frontend clients
- Supports watchlist via Redis (`eco:twd:watchlist`)
- Primes equity symbols using REST API every 60 seconds

```typescript
// Hardcoded symbols from .env
const defaults = (process.env.ECO_DEFAULT_SYMBOLS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Subscribe to all defaults
provider.subscribe(defaults);

// Every 60s, refresh from watchlist
setInterval(async () => {
  const wl = await redis.smembers("eco:twd:watchlist");
  const all = [...new Set([...defaults, ...wl])];
  provider.subscribe(all);
}, 60000);
```

#### 2. TwelveData Provider (`backend/integrations/twelvedata/provider.ts`)

**What it does:**
- Connects to `TWD_WS_URL` with `TWD_API_KEY`
- Subscribes/unsubscribes to symbols
- Parses different price formats from TwelveData
- Auto-reconnects on disconnect
- Sends heartbeat every 10 seconds

#### 3. API Endpoints (`backend/api/exchange/tewlvedata/`)

**`/api/exchange/tewlvedata/catalog?kind=forex|indices|stocks`:**
- Fetches available symbols from TwelveData REST API
- Returns array of symbols:
  - Forex: `["EUR/USD", "GBP/USD", ...]`
  - Indices: `["SPX", "NDX", "DJI", ...]`
  - Stocks: `["AAPL:NASDAQ", "TSLA:NASDAQ", ...]`

**`/api/exchange/tewlvedata/defaults`:**
- Returns `ECO_DEFAULT_SYMBOLS` from .env

**`/api/exchange/tewlvedata/watchlist` (GET/POST):**
- Manages watchlist in Redis (`eco:twd:watchlist`)

**`/api/exchange/tewlvedata/candles`:**
- Fetches historical candle data

**`/api/exchange/tewlvedata/ticker`:**
- Fetches current price for symbol

**`/api/exchange/tewlvedata/summary`:**
- Fetches market summary

---

## Problems with Current TwelveData Integration

### 1. **Hardcoded Symbols**
- Symbols are defined in `.env` file (`ECO_DEFAULT_SYMBOLS`)
- No way to dynamically add/remove instruments
- Cannot scale to hundreds/thousands of symbols

### 2. **No Database Tables**
- No `twdProvider` or similar table
- No `twdMarket` table to store instruments
- No `twdOrder` table for trading
- Cannot track which instruments are enabled/disabled

### 3. **No Admin Interface**
- No way to:
  - Enable/disable TwelveData as a provider
  - Import available instruments
  - Enable/disable specific instruments
  - Manage instrument settings (trending, hot, etc.)

### 4. **No Trading Implementation**
- TwelveData is READ-ONLY (price data only)
- No order placement
- No wallet management
- No transaction history

### 5. **Inconsistent with Exchange Provider Pattern**
- Exchange providers use database-driven approach
- TwelveData uses env-driven approach
- Different data flow patterns
- Difficult to maintain and extend

### 6. **Frontend Integration Issues**
- Trading page has partial TWD support but incomplete:
  ```typescript
  const isTwd = (market as any)?.isTwd;
  setExternalTwdMarket(sym);
  ```
- No proper admin pages in `/admin/ext/twd/`
- Forex/Indices/Stocks pages exist but don't work properly

---

## Proposed TwelveData Integration

### Design Goals

1. **Consistent with Exchange Provider Pattern**
2. **Database-Driven** (not env-driven)
3. **Admin Interface** similar to `/admin/finance/exchange`
4. **Support Paper Trading** (simulated orders)
5. **Reuse Existing Components** where possible

### Database Schema

#### Option A: Separate Tables (RECOMMENDED)

**Pros:**
- Clean separation of concerns
- Easy to add TWD-specific fields
- No risk of breaking existing exchange logic

**Cons:**
- Some code duplication

```sql
-- TwelveData Provider
CREATE TABLE twd_provider (
  id UUID PRIMARY KEY,
  name VARCHAR(191) NOT NULL,  -- "twelvedata"
  title VARCHAR(191),           -- "TwelveData"
  status BOOLEAN DEFAULT FALSE, -- Only ONE active
  apiKey VARCHAR(191),         -- Encrypted
  type VARCHAR(191),            -- "forex", "indices", "stocks", "all"
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- TwelveData Markets/Instruments
CREATE TABLE twd_market (
  id UUID PRIMARY KEY,
  symbol VARCHAR(191) NOT NULL UNIQUE, -- "EUR/USD", "AAPL:NASDAQ", "SPX"
  type VARCHAR(50),                     -- "forex", "stocks", "indices"
  name VARCHAR(191),                    -- Full name
  currency VARCHAR(10),                 -- Base currency
  exchange VARCHAR(50),                 -- For stocks: "NASDAQ", "NYSE", etc.
  metadata JSON,                        -- Additional info
  is_trending BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  status BOOLEAN DEFAULT FALSE,         -- Enabled/disabled
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- TwelveData Orders (Paper Trading)
CREATE TABLE twd_order (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol VARCHAR(191) NOT NULL,
  type VARCHAR(20),                     -- "MARKET", "LIMIT"
  side VARCHAR(10),                     -- "BUY", "SELL"
  status VARCHAR(20),                   -- "OPEN", "CLOSED", "CANCELED"
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

  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- TwelveData Wallets (Paper Trading Balances)
-- Note: Could reuse existing wallet table with type="TWD_PAPER"
```

#### Option B: Reuse Exchange Tables

**Pros:**
- No new tables
- Existing code works

**Cons:**
- Risk of breaking exchange logic
- Mixing real trading with paper trading
- Confusing data model

```sql
-- Add to existing exchange table:
ALTER TABLE exchange ADD COLUMN provider_type VARCHAR(50); -- "ccxt" or "twelvedata"

-- Reuse exchange_market table:
-- Add type field to distinguish: "crypto", "forex", "stocks", "indices"
ALTER TABLE exchange_market ADD COLUMN market_type VARCHAR(50);

-- Reuse exchange_order table:
-- Add is_paper_trading BOOLEAN to distinguish real vs simulated
ALTER TABLE exchange_order ADD COLUMN is_paper_trading BOOLEAN DEFAULT FALSE;
```

**RECOMMENDATION:** Use **Option A** (Separate Tables) for cleaner architecture.

### Backend API Structure

**Admin Endpoints:**

```
/api/admin/ext/twd/
  provider/
    index.get.ts              # List providers
    [id]/
      index.get.ts            # Get provider details
      status.put.ts           # Enable/disable provider

  market/
    index.get.ts              # List markets
    import.get.ts             # Import from TwelveData catalog
    [id]/
      index.get.ts            # Get market details
      index.put.ts            # Update market
      index.del.ts            # Delete market
      status.put.ts           # Enable/disable market
```

**User Endpoints:**

```
/api/ext/twd/
  market/
    index.get.ts              # List enabled markets
    [symbol]/
      index.get.ts            # Get market details
      ticker.get.ts           # Get current price
      candles.get.ts          # Get historical data

  order/
    index.get.ts              # List user's orders
    index.post.ts             # Create order (paper trading)
    index.ws.ts               # WebSocket for order updates
    [id]/
      index.get.ts            # Get order details
      index.del.ts            # Cancel order

  ticker/
    index.get.ts              # Get all tickers
    index.ws.ts               # WebSocket for real-time prices
```

### Implementation Plan

#### Phase 1: Database & Models
1. Create migration files for new tables
2. Create Sequelize models:
   - `models/twdProvider.ts`
   - `models/twdMarket.ts`
   - `models/twdOrder.ts`
3. Update `models/init.ts` to include new models
4. Seed initial provider: `TwelveData`

#### Phase 2: Backend Admin APIs
1. **Provider Management:**
   - List providers
   - Get provider details (test API key)
   - Enable/disable provider

2. **Market Import:**
   - Fetch catalog from TwelveData API
   - Parse by type (forex/indices/stocks)
   - Bulk insert into `twd_market` with `status: false`
   - Delete markets no longer available

3. **Market Management:**
   - List markets with filtering by type
   - Enable/disable markets
   - Update market settings (trending, hot)

#### Phase 3: Backend Trading APIs
1. **Market Data:**
   - List enabled markets
   - Get ticker data (current price)
   - Get candles (historical)

2. **Order Management (Paper Trading):**
   - Create order (validate, calculate, save to DB)
   - List orders
   - Cancel order
   - Order execution logic (for paper trading):
     - MARKET orders execute immediately at current price
     - LIMIT orders execute when price reaches target

3. **Wallet Management:**
   - Reuse existing `wallet` table with `type: "TWD_PAPER"`
   - Initialize demo balances for new users
   - Update balances on order execution

#### Phase 4: WebSocket Integration
1. **Modify TwelveData Server:**
   - Remove hardcoded `ECO_DEFAULT_SYMBOLS`
   - Fetch symbols from `twd_market` WHERE `status = true`
   - Subscribe to those symbols
   - Periodically refresh (every 60s)

2. **Order WebSocket:**
   - Similar to exchange order WebSocket
   - Track OPEN orders
   - Execute LIMIT orders when price matches
   - Notify clients of status changes

#### Phase 5: Frontend Admin Pages
1. **Provider Management** (`/admin/ext/twd/index.tsx`):
   - Similar to `/admin/finance/exchange/index.tsx`
   - List providers with enable/disable switch
   - Show API key status (masked)

2. **Market Management** (`/admin/ext/twd/market/index.tsx`):
   - Similar to `/admin/finance/exchange/market/index.tsx`
   - "Import" button with type selection (forex/indices/stocks/all)
   - Filter by type
   - Enable/disable switches
   - Mark as trending/hot

#### Phase 6: Frontend Trading Pages
1. **Update Market List Pages:**
   - `/forex` → fetch from `/api/ext/twd/market?type=forex`
   - `/indices` → fetch from `/api/ext/twd/market?type=indices`
   - `/stocks` → fetch from `/api/ext/twd/market?type=stocks`

2. **Update Trading Page:**
   - Detect TWD markets via database flag
   - Use TWD WebSocket for price data
   - Use TWD order API for trading
   - Show "PAPER TRADING" indicator

3. **Charts:**
   - Fetch candles from TwelveData API
   - Display on TradingView chart

#### Phase 7: Paper Trading Logic
1. **Order Execution Engine:**
   - Background job that monitors OPEN LIMIT orders
   - Compares with current price from WebSocket
   - Executes when price condition is met
   - Updates wallet balances
   - Notifies user via WebSocket

2. **Initial Balance:**
   - Give users demo balance on first TWD trade
   - E.g., $100,000 virtual USD

### Migration Path

**Step 1:** Create database tables and models
**Step 2:** Implement admin backend APIs
**Step 3:** Implement admin frontend pages
**Step 4:** Admin imports markets and enables them
**Step 5:** Implement user backend APIs
**Step 6:** Update TwelveData WebSocket server to use database
**Step 7:** Implement frontend trading pages
**Step 8:** Implement paper trading execution engine
**Step 9:** Test end-to-end

---

## Summary

### Spot Trading (Current - Works)
✅ Database-driven provider and market management
✅ Admin can enable provider and import markets
✅ Users can trade with real wallets via CCXT
✅ WebSocket for real-time prices and order updates
✅ Full frontend integration

### TwelveData (Current - Incomplete)
❌ Hardcoded symbols in .env
❌ No database tables
❌ No admin interface
❌ No trading support
⚠️ WebSocket works but limited to hardcoded symbols
⚠️ Frontend partially implemented

### TwelveData (Proposed - Complete)
✅ Database-driven market management
✅ Admin interface for provider and markets
✅ Paper trading support
✅ WebSocket integration with database
✅ Full frontend integration
✅ Consistent with exchange provider pattern

---

## Next Steps

1. Review this analysis with the team
2. Confirm database schema approach (Option A vs B)
3. Create detailed task breakdown for implementation
4. Begin Phase 1: Database & Models
