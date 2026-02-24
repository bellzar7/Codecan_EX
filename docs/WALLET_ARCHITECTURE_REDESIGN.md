# Wallet & Balance Architecture Redesign

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Trading Modules Mapping](#trading-modules-mapping)
3. [Balance Flow Analysis](#balance-flow-analysis)
4. [Identified Problems](#identified-problems)
5. [Proposed Architecture](#proposed-architecture)
6. [Migration Plan](#migration-plan)

---

## Current Architecture Analysis

### Wallet Model Structure

**Location**: `models/wallet.ts`

```typescript
type: "FIAT" | "SPOT" | "ECO" | "FUTURES" | "TWD_PAPER"
currency: string
balance: number
inOrder: number (nullable)
address: JSON (for ECO multi-chain data)
status: boolean
```

**Unique Constraint**: `(userId, currency, type)`

### Related Models

#### walletPnl (`models/walletPnl.ts`)
Tracks aggregate profit/loss:
```typescript
balances: {
  FIAT: number
  SPOT: number
  ECO: number
}
```
**Gap**: No FOREX, STOCK, INDEX tracking.

#### walletData (`models/walletData.ts`)
Blockchain address data for ECO:
```typescript
walletId, currency, chain, balance, index, data
```

#### transaction (`models/transaction.ts`)
All balance movements with types:
- Standard: `DEPOSIT`, `WITHDRAW`, `INCOMING_TRANSFER`, `OUTGOING_TRANSFER`
- Trading: `EXCHANGE_ORDER`, `BINARY_ORDER`
- Forex-specific: `FOREX_DEPOSIT`, `FOREX_WITHDRAW`, `FOREX_INVESTMENT`, `FOREX_INVESTMENT_ROI`
- P2P: `P2P_OFFER_TRANSFER`, `P2P_TRADE`

**Important**: `FOREX_*` transaction types exist but no dedicated wallet type for live forex trading.

### Trading Order Models

#### exchangeOrder (`models/exchangeOrder.ts`)
- SPOT/Binance/CCXT orders
- Fields: symbol, type (MARKET/LIMIT), side (BUY/SELL), status, price, amount, filled, cost, fee

#### twdOrder (`models/twdOrder.ts`)
- TwelveData orders (forex, stocks, indices)
- Same structure as exchangeOrder
- **Current State**: Uses SPOT wallets after recent unification

#### twdMarket (`models/twdMarket.ts`)
```typescript
type: "forex" | "stocks" | "indices"
symbol, currency, pair, exchange, status
```
**Key Finding**: Supports all three asset types but no differentiated wallet handling.

### Ecosystem (ECO) Architecture

**Special Case**: ECO wallets use a private ledger system:
- `ecosystemPrivateLedger` - Per-chain balance tracking
- `ecosystemUtxo` - UTXO-based transactions
- `wallet.address` - JSON field storing multi-chain balances:
  ```json
  {
    "chain1": { "address": "0x...", "network": "...", "balance": 100 },
    "chain2": { "address": "0x...", "network": "...", "balance": 50 }
  }
  ```

---

## Trading Modules Mapping

### Module 1: SPOT Trading (Binance/CCXT)

**Wallet Type**: `SPOT`

**Order Table**: `exchangeOrder`

**Balance Locking**:
- Place order → Deduct from `balance`, add to `inOrder`
- Fill order → Deduct from `inOrder`, credit result to `balance`
- Cancel order → Refund from `inOrder` to `balance`

**Flows Supported**:
- ✅ Deposit (crypto via blockchain, processed by backend)
- ✅ Withdraw (crypto via CCXT)
- ✅ Transfer (SPOT ↔ FIAT, SPOT ↔ ECO, SPOT ↔ FUTURES)
- ✅ P2P (indirect - users trade FIAT, may fund from SPOT)
- ✅ Trading (live orderbook, WebSocket updates)

**Implementation**:
- `backend/api/exchange/order/index.post.ts` - Places orders via CCXT
- `backend/utils/exchange.ts` - ExchangeManager handles CCXT integration
- Balances updated in transaction with row-level locking

---

### Module 2: ECO Trading (Ecosystem)

**Wallet Type**: `ECO`

**Special Architecture**:
- ScyllaDB for high-performance matching engine
- Private ledger tracks per-chain balances
- `wallet.address` JSON field + `ecosystemPrivateLedger` table

**Balance Locking**: Same as SPOT but with ledger updates per chain

**Flows Supported**:
- ✅ Deposit (via ecosystem blockchain)
- ✅ Withdraw (via ecosystem blockchain with UTXO)
- ✅ Transfer (ECO ↔ FIAT, ECO ↔ SPOT, ECO ↔ FUTURES)
  - Requires chain-level ledger updates during transfer
- ❌ P2P (not integrated)
- ✅ Trading (ScyllaDB matching engine)

**Implementation**:
- `backend/utils/eco/` - Ecosystem engine, ScyllaDB client, matching
- Transfer flow: `backend/api/finance/transfer/index.post.ts` lines 410-535

---

### Module 3: FOREX/TWD Trading (TwelveData)

**Current State**: Recently unified to use `SPOT` wallets

**Markets**: `twdMarket` table with `type: "forex" | "stocks" | "indices"`

**Order Table**: `twdOrder`

**Data Source**: TwelveData API → eco-ws bridge → Redis → REST endpoints

**Balance Flow** (after recent unification):
```
User → Admin credits SPOT/USD and SPOT/EUR
User → Places TWD forex order (EUR/USD)
System → Locks USD from SPOT/USD wallet (if BUY side)
System → Executes via ticker-based synthetic matching
System → Updates SPOT/EUR and SPOT/USD balances
```

**Flows Supported**:
- ❌ Direct Deposit (uses SPOT deposit workflow)
- ❌ Direct Withdraw (uses SPOT withdraw workflow)
- ⚠️ Transfer (via SPOT → but no dedicated funding mechanism)
- ❌ P2P (no P2P for forex instruments)
- ✅ Trading (ticker-based, no real orderbook)

**Implementation**:
- `backend/api/ext/twd/order/index.post.ts` - Order creation
- `backend/api/ext/twd/utils.ts` - `getOrCreateSpotWallet()`, `getTwdWalletPair()`
- `backend/utils/crons/twdOrder.ts` - LIMIT order execution

**Problems**:
1. Uses SPOT wallets → Cannot differentiate forex balance from crypto balance
2. No way to track forex-specific PnL separately
3. Cannot implement margin/leverage for forex (would affect SPOT balance)
4. STOCKS and INDICES use same logic as FOREX (all via SPOT wallets)

---

### Module 4: FUTURES

**Wallet Type**: `FUTURES`

**Status**: Partially implemented

**Balance Flow**:
- Can transfer FUTURES ↔ SPOT/ECO
- Appears designed for derivatives/margin trading
- No direct deposit/withdraw

**Flows Supported**:
- ❌ Direct Deposit
- ❌ Direct Withdraw
- ✅ Transfer (FUTURES ↔ SPOT, FUTURES ↔ ECO)
- ❌ P2P
- ⚠️ Trading (infrastructure exists but no active matching engine)

---

### Module 5: FIAT System

**Wallet Type**: `FIAT`

**Purpose**: Fiat currency balances for P2P and funding

**Flows Supported**:
- ✅ Deposit (via Stripe, PayPal, bank transfer)
- ✅ Withdraw (fiat payment processors)
- ✅ Transfer (FIAT ↔ SPOT, FIAT ↔ ECO)
- ✅ P2P (primary wallet type for P2P trades)
- ❌ Trading (not directly tradable, must transfer to SPOT/ECO)

---

### Module 6: Forex Investment (Legacy)

**Models**: `forexInvestment`, `forexAccount`, `forexPlan`

**Type**: **Investment/Subscription Model** (NOT live trading)

**How It Works**:
- User invests fixed amount in forex investment plan
- Admin/system determines profit/loss outcome
- Returns principal + profit via `FOREX_INVESTMENT_ROI` transaction

**Separate From**: TWD live forex trading

**Transaction Types**: `FOREX_INVESTMENT`, `FOREX_INVESTMENT_ROI`

**Wallet Used**: Likely FIAT (based on transaction flow)

---

## Balance Flow Analysis

### Flow 1: Crypto Deposit (SPOT)

```
User → Generates deposit address
User → Sends crypto to address
Backend → Detects deposit (blockchain monitoring)
Backend → Creates transaction (type: DEPOSIT, status: COMPLETED)
Backend → Updates wallet.balance (SPOT)
User → Sees increased balance
```

**Files**:
- `backend/api/finance/deposit/spot/index.post.ts`
- Transaction uses SPOT wallet type

---

### Flow 2: Crypto Withdraw (SPOT)

```
User → Submits withdraw request (amount, address, network)
Backend → Validates balance (wallet.balance >= amount + fee)
Backend → Creates transaction (type: WITHDRAW, status: PENDING)
Backend → Deducts from wallet.balance
Backend → Calls CCXT withdrawCurrency()
Exchange → Processes withdrawal
Backend cron → Updates transaction status to COMPLETED
```

**Files**:
- `backend/api/finance/withdraw/spot/index.post.ts`
- Uses CCXT integration

---

### Flow 3: Internal Transfer (Wallet to Wallet)

```
User → Selects fromType, toType, currency, amount
Backend → Validates:
  - fromWallet exists and balance >= amount
  - Transfer path is valid (per validTransfers map)
Backend → Transaction:
  - Deduct from fromWallet.balance
  - Add to toWallet.balance (create if needed)
  - If ECO involved: Update ecosystemPrivateLedger per chain
  - Create OUTGOING_TRANSFER and INCOMING_TRANSFER transactions
Backend → Returns success
```

**Valid Transfer Paths** (from `backend/api/finance/transfer/index.post.ts:243-248`):
```typescript
FIAT    → SPOT, ECO
SPOT    → FIAT, ECO, FUTURES
ECO     → FIAT, SPOT, FUTURES
FUTURES → ECO, SPOT
```

**Gap**: No explicit transfer path for FOREX/STOCKS/INDICES funding.

**Files**:
- `backend/api/finance/transfer/index.post.ts`

---

### Flow 4: P2P Trade

```
Seller → Creates P2P offer (FIAT currency, amount, price)
Buyer → Accepts offer
Backend → Creates p2pTrade (status: PENDING)
Backend → Locks seller's FIAT balance via p2pEscrow
Buyer → Marks payment as sent (status: PAID)
Seller → Confirms payment received
Backend → Transaction:
  - Release from escrow
  - Create P2P_OFFER_TRANSFER (seller → buyer)
  - Create P2P_TRADE transactions
  - Update FIAT wallet balances
Backend → Trade complete (status: COMPLETED)
```

**Wallet Type**: Exclusively `FIAT`

**Gap**: Cannot use forex/stock trading balances in P2P.

**Files**:
- `backend/api/ext/p2p/trade/`
- `models/p2pOffer.ts`, `models/p2pTrade.ts`, `models/p2pEscrow.ts`

---

### Flow 5: SPOT Trading (Exchange Order)

```
User → Places order (BUY/SELL, LIMIT/MARKET, amount, price)
Backend → Validates:
  - Market exists and active
  - Amount/price within limits
  - Sufficient balance
Backend → Get wallets:
  - BUY: quote currency (e.g., USDT)
  - SELL: base currency (e.g., BTC)
Backend → Transaction with row lock:
  - Calculate cost = amount × price (or fetch market price if MARKET)
  - Calculate fee
  - If BUY: Deduct (cost + fee) from quote wallet → inOrder
  - If SELL: Deduct amount from base wallet → inOrder
  - Create exchangeOrder (status: OPEN)
  - If MARKET: Execute immediately via CCXT
Backend → CCXT createOrder() or fills locally
Exchange/System → Fills order
Backend cron/websocket → Updates order (status: CLOSED, filled amount)
Backend → Transaction:
  - Deduct from inOrder
  - Credit received currency to balance
  - Update exchangeOrder
```

**Files**:
- `backend/api/exchange/order/index.post.ts` (order creation)
- `backend/api/exchange/order/index.ws.ts` (WebSocket updates)
- Uses `SPOT` wallets exclusively

---

### Flow 6: TWD/FOREX Trading (TwelveData)

**After Recent Unification** (using SPOT wallets):

```
Admin → Credits user SPOT/USD wallet (e.g., 10000 USD)
Admin → Credits user SPOT/EUR wallet (e.g., 0 EUR)
User → Places TWD order: BUY EUR/USD, amount=100, price=1.10
Backend → Validates:
  - twdMarket exists and active
  - Sufficient balance in SPOT/USD wallet
Backend → Transaction with row lock:
  - Calculate cost = 100 × 1.10 = 110 USD + fee
  - Deduct 110 USD from SPOT/USD wallet.balance → wallet.inOrder
  - Create twdOrder (status: OPEN)
  - If MARKET: Execute immediately based on ticker
Backend → Execution:
  - Fetch current ticker price from Redis (/api/ext/twd/ticker)
  - Calculate filled amount at ticker price
  - Deduct from SPOT/USD.inOrder
  - Credit SPOT/EUR.balance
  - Update twdOrder (status: CLOSED)
Backend cron → Processes LIMIT orders when ticker price reached
```

**Files**:
- `backend/api/ext/twd/order/index.post.ts`
- `backend/api/ext/twd/utils.ts` - `getTwdWalletPair()` returns SPOT wallets
- `backend/utils/crons/twdOrder.ts` - LIMIT order execution

**Problem**: All TWD trading (forex, stocks, indices) uses SPOT wallets. Cannot:
- Track forex PnL separately from crypto PnL
- Implement margin for forex without affecting SPOT balance
- Differentiate stock/index balance from forex/crypto

---

## Identified Problems

### Problem 1: TWD Unified with SPOT Creates Confusion

**Issue**: TwelveData markets (forex, stocks, indices) all use `SPOT` wallets.

**Why This Is Bad**:
- User's SPOT/USD shows combined balance of:
  - Real USDT from crypto deposits
  - Virtual USD for forex trading
  - Stock trading balance
- Cannot track PnL separately for each asset class
- If user deposits real BTC to SPOT wallet, it mixes with forex instruments
- Cannot implement leverage/margin for forex (would affect crypto balance)

**Example Scenario**:
```
User deposits 1000 USDT → SPOT/USDT balance: 1000
Admin credits 5000 USD for forex → SPOT/USD balance: 5000
User trades EUR/USD → Uses SPOT/USD
User trades BTC/USDT → Uses SPOT/BTC and SPOT/USDT
Problem: SPOT/USDT includes both real crypto and synthetic USD
```

---

### Problem 2: No Dedicated Wallet Types for FOREX/STOCKS/INDICES

**Issue**: `twdMarket.type` supports "forex", "stocks", "indices" but wallet model doesn't.

**Current State**:
- Wallet enum: `FIAT | SPOT | ECO | FUTURES | TWD_PAPER`
- `TWD_PAPER` deprecated
- No `FOREX`, `STOCK`, `INDEX` types

**Why This Matters**:
- Cannot query "show me all forex positions"
- Cannot implement different fee structures per asset class
- Cannot apply leverage rules per asset type
- PnL tracking (`walletPnl`) doesn't track FOREX/STOCKS/INDICES

---

### Problem 3: Inconsistent Transfer/Funding Paths

**Issue**: No explicit funding mechanism for FOREX/STOCKS/INDICES.

**Current State**:
```typescript
// Valid transfers:
FIAT    → SPOT, ECO
SPOT    → FIAT, ECO, FUTURES
ECO     → FIAT, SPOT, FUTURES
FUTURES → ECO, SPOT
```

**Missing**:
- How do users fund FOREX trading? (Currently: admin manually credits SPOT wallets)
- How do users fund STOCKS trading?
- How do users fund INDICES trading?
- Should users transfer FIAT → FOREX? SPOT → FOREX?

**Expected Realistic Behavior**:
```
User deposits fiat/crypto → SPOT or FIAT wallet
User transfers FIAT/SPOT → FOREX wallet (internal transfer)
User trades forex using FOREX wallet
User closes position → Profit/loss → FOREX wallet
User transfers FOREX → FIAT/SPOT (to withdraw or trade crypto)
```

---

### Problem 4: P2P Cannot Use Trading Balances

**Issue**: P2P exclusively uses `FIAT` wallets.

**Gap**: User with forex profits cannot directly use those funds in P2P.

**Workaround**: User must transfer FOREX → FIAT first (but that path doesn't exist).

---

### Problem 5: Transaction Types Exist But Wallet Types Don't

**Issue**: `transaction.type` includes `FOREX_DEPOSIT`, `FOREX_WITHDRAW`, `FOREX_INVESTMENT`, `FOREX_INVESTMENT_ROI`.

**Problem**: No `FOREX` wallet type to match these transaction types.

**Current Usage**: These types used for legacy forex investment system, not live trading.

---

### Problem 6: walletPnl Doesn't Track New Asset Classes

**Current**: `walletPnl.balances` only tracks `FIAT`, `SPOT`, `ECO`.

**Missing**: `FOREX`, `STOCK`, `INDEX`, `FUTURES`.

---

## Proposed Architecture

### Design Principles

1. **Explicit Separation**: Each trading module has dedicated wallet type
2. **Realistic Exchange Behavior**:
   - Crypto/Fiat are deposit/withdrawable
   - Forex/Stocks/Indices are internal (funded via transfer)
3. **Consistent Transfer Rules**: Clear funding paths for all modules
4. **PnL Tracking**: Separate tracking per asset class
5. **Backward Compatibility**: Don't break existing SPOT/ECO/FIAT flows

---

### Wallet Type Redesign

**New Wallet Enum**:
```typescript
type WalletType =
  | "FIAT"      // Fiat currencies (USD, EUR, etc.) - Real money
  | "SPOT"      // Crypto spot trading (BTC, ETH, etc.) - Real crypto
  | "ECO"       // Ecosystem trading (native blockchain)
  | "FUTURES"   // Crypto futures/derivatives
  | "FOREX"     // Forex trading (EUR/USD, GBP/JPY, etc.) - Synthetic
  | "STOCK"     // Stock trading (AAPL, TSLA, etc.) - Synthetic
  | "INDEX"     // Index trading (SPX, NASDAQ, etc.) - Synthetic
```

**Remove**: `TWD_PAPER` (fully deprecated)

---

### Wallet Type Characteristics

| Wallet Type | Deposit | Withdraw | Transfer From | Transfer To | P2P | Trading |
|-------------|---------|----------|---------------|-------------|-----|---------|
| **FIAT**    | ✅ (Bank, Card) | ✅ (Bank) | — | SPOT, ECO, FOREX, STOCK, INDEX | ✅ | ❌ |
| **SPOT**    | ✅ (Blockchain) | ✅ (Blockchain) | FIAT, ECO, FUTURES | FIAT, ECO, FUTURES, FOREX, STOCK, INDEX | ⚠️ Via FIAT | ✅ |
| **ECO**     | ✅ (Blockchain) | ✅ (Blockchain) | FIAT, SPOT, FUTURES | FIAT, SPOT, FUTURES | ❌ | ✅ |
| **FUTURES** | ❌ | ❌ | SPOT, ECO | SPOT, ECO | ❌ | ✅ |
| **FOREX**   | ❌ | ❌ | FIAT, SPOT | FIAT, SPOT | ❌ | ✅ |
| **STOCK**   | ❌ | ❌ | FIAT, SPOT | FIAT, SPOT | ❌ | ✅ |
| **INDEX**   | ❌ | ❌ | FIAT, SPOT | FIAT, SPOT | ❌ | ✅ |

---

### Module Definitions

#### SPOT Module

**Wallet Type**: `SPOT`

**Purpose**: Crypto spot trading (BTC/USDT, ETH/USDT, etc.)

**Flows**:
- ✅ Deposit: Blockchain deposits via CCXT
- ✅ Withdraw: Blockchain withdrawals via CCXT
- ✅ Transfer:
  - IN: FIAT, ECO, FUTURES
  - OUT: FIAT, ECO, FUTURES, FOREX, STOCK, INDEX
- ✅ P2P: Indirect (user converts SPOT → FIAT first)
- ✅ Trading: CCXT integration, WebSocket orderbook

**Implementation**: No changes needed (already correct).

---

#### FOREX Module

**Wallet Type**: `FOREX` (NEW)

**Purpose**: Forex trading (EUR/USD, GBP/JPY, etc.) via TwelveData

**Flows**:
- ❌ Deposit: Cannot deposit forex directly
- ❌ Withdraw: Cannot withdraw forex directly
- ✅ Transfer:
  - IN: FIAT, SPOT (funding mechanism)
  - OUT: FIAT, SPOT (profit withdrawal)
- ❌ P2P: Not supported
- ✅ Trading: TwelveData ticker-based execution

**Funding Flow**:
```
User → Transfer FIAT/USD to FOREX/USD
User → Transfer SPOT/EUR to FOREX/EUR
User → Place forex order using FOREX wallets
System → Executes order, updates FOREX/USD and FOREX/EUR
User → Transfer FOREX/USD back to FIAT/USD (to withdraw or use in P2P)
```

**Key Change**: Use `FOREX` wallet type instead of `SPOT` for all TWD forex markets.

---

#### STOCK Module

**Wallet Type**: `STOCK` (NEW)

**Purpose**: Stock trading (AAPL, TSLA, AMD, etc.) via TwelveData

**Flows**: Same as FOREX module

**Funding**:
```
User → Transfer FIAT/USD to STOCK/USD
User → Buy AAPL (creates STOCK/AAPL wallet)
User → Sell AAPL → Profit to STOCK/USD
User → Transfer STOCK/USD to FIAT/USD
```

**Key Difference from FOREX**:
- Forex is currency pairs (EUR/USD)
- Stocks are single instruments (AAPL denominated in USD)

---

#### INDEX Module

**Wallet Type**: `INDEX` (NEW)

**Purpose**: Index trading (SPX, NASDAQ, etc.) via TwelveData

**Flows**: Same as FOREX/STOCK modules

**Examples**:
- SPX (S&P 500 Index)
- NASDAQ (NASDAQ Composite)
- User trades fractional positions, settled in USD

---

#### ECO Module

**No changes needed** - Already well-architected with private ledger system.

---

#### FUTURES Module

**Wallet Type**: `FUTURES` (exists, needs full implementation)

**Purpose**: Crypto derivatives (BTC perpetual, ETH futures, etc.)

**Flows**: Transfer-funded from SPOT/ECO, settled back to SPOT/ECO.

---

#### FIAT Module

**No changes needed** - Already correct for P2P and funding.

---

### Updated Transfer Matrix

**New Valid Transfer Paths**:
```typescript
const validTransfers = {
  FIAT:    ["SPOT", "ECO", "FOREX", "STOCK", "INDEX"],
  SPOT:    ["FIAT", "ECO", "FUTURES", "FOREX", "STOCK", "INDEX"],
  ECO:     ["FIAT", "SPOT", "FUTURES"],
  FUTURES: ["SPOT", "ECO"],
  FOREX:   ["FIAT", "SPOT"],
  STOCK:   ["FIAT", "SPOT"],
  INDEX:   ["FIAT", "SPOT"],
}
```

**Key Addition**: FIAT/SPOT can transfer to/from FOREX/STOCK/INDEX.

---

### Updated walletPnl Schema

**Old**:
```typescript
balances: {
  FIAT: number
  SPOT: number
  ECO: number
}
```

**New**:
```typescript
balances: {
  FIAT: number
  SPOT: number
  ECO: number
  FUTURES: number
  FOREX: number
  STOCK: number
  INDEX: number
}
```

---

### TWD Market → Wallet Type Mapping

**Implementation**:
```typescript
// Map twdMarket.type to wallet type
function getWalletTypeForTwdMarket(marketType: string): string {
  switch (marketType) {
    case "forex": return "FOREX"
    case "stocks": return "STOCK"
    case "indices": return "INDEX"
    default: throw new Error(`Unknown TWD market type: ${marketType}`)
  }
}
```

**Usage**: When creating TWD orders, use this mapping to determine wallet type.

---

## Migration Plan

### Phase 1: Database Schema Updates

**Objective**: Update wallet enum and add new wallet types.

#### Step 1.1: Update Wallet Model Enum

**File**: `models/wallet.ts`

**Change**:
```typescript
// OLD:
type: DataTypes.ENUM("FIAT", "SPOT", "ECO", "FUTURES", "TWD_PAPER")

// NEW:
type: DataTypes.ENUM("FIAT", "SPOT", "ECO", "FUTURES", "FOREX", "STOCK", "INDEX")
```

**Migration SQL**:
```sql
-- Add new enum values
ALTER TABLE wallet
  MODIFY COLUMN type ENUM(
    'FIAT', 'SPOT', 'ECO', 'FUTURES',
    'FOREX', 'STOCK', 'INDEX',
    'TWD_PAPER'  -- Keep temporarily for migration
  ) NOT NULL;

-- Later, after data migration, remove TWD_PAPER
ALTER TABLE wallet
  MODIFY COLUMN type ENUM(
    'FIAT', 'SPOT', 'ECO', 'FUTURES',
    'FOREX', 'STOCK', 'INDEX'
  ) NOT NULL;
```

**Risk**: Low - Additive change, doesn't break existing data.

---

#### Step 1.2: Update walletPnl Model

**File**: `models/walletPnl.ts`

**Change**:
```typescript
// OLD:
balances: {
  FIAT: number
  SPOT: number
  ECO: number
}

// NEW:
balances: {
  FIAT: number
  SPOT: number
  ECO: number
  FUTURES: number
  FOREX: number
  STOCK: number
  INDEX: number
}
```

**Migration**: Update existing records to include new fields (default 0).

**Risk**: Low - JSON field, easy to backfill.

---

#### Step 1.3: Data Migration - TWD_PAPER to Type-Specific Wallets

**Objective**: Convert any existing `TWD_PAPER` wallets to appropriate type.

**Script**:
```sql
-- Find all TWD_PAPER wallets
SELECT w.*, tm.type AS marketType
FROM wallet w
JOIN twd_order o ON o.userId = w.userId
JOIN twd_market tm ON tm.symbol = o.symbol
WHERE w.type = 'TWD_PAPER';

-- Migrate based on market type
-- (Handle manually or via script to determine forex vs stocks vs indices)
```

**Decision Logic**:
- If currency matches forex pair (EUR, USD, GBP, etc.) → `FOREX`
- If currency matches stock ticker (AAPL, TSLA, etc.) → `STOCK`
- If currency matches index (SPX, NDX, etc.) → `INDEX`

**Risk**: Medium - Requires careful mapping and testing.

---

### Phase 2: Core Wallet Utilities Update

**Objective**: Update wallet creation and retrieval utilities to support new types.

#### Step 2.1: Update backend/api/ext/twd/utils.ts

**Current**:
```typescript
export async function getOrCreateSpotWallet(userId: string, currency: string) {
  let wallet = await models.wallet.findOne({
    where: { userId, type: "SPOT", currency: currency.toUpperCase() },
  });
  if (!wallet) {
    wallet = await models.wallet.create({
      userId, type: "SPOT", currency: currency.toUpperCase(),
      balance: 0, inOrder: 0,
    });
  }
  return wallet;
}

export async function getTwdWalletPair(userId: string, symbol: string) {
  const [baseCurrency, quoteCurrency] = symbol.split("/");
  const baseWallet = await getOrCreateSpotWallet(userId, baseCurrency);
  const quoteWallet = await getOrCreateSpotWallet(userId, quoteCurrency);
  return { baseWallet, quoteWallet, baseCurrency, quoteCurrency };
}
```

**NEW**:
```typescript
export async function getOrCreateTwdWallet(
  userId: string,
  currency: string,
  marketType: "forex" | "stocks" | "indices"
) {
  // Map market type to wallet type
  const walletTypeMap = {
    forex: "FOREX",
    stocks: "STOCK",
    indices: "INDEX",
  };
  const walletType = walletTypeMap[marketType];

  let wallet = await models.wallet.findOne({
    where: { userId, type: walletType, currency: currency.toUpperCase() },
  });

  if (!wallet) {
    wallet = await models.wallet.create({
      userId,
      type: walletType,
      currency: currency.toUpperCase(),
      balance: 0,
      inOrder: 0,
    });
  }
  return wallet;
}

export async function getTwdWalletPair(
  userId: string,
  symbol: string,
  marketType: "forex" | "stocks" | "indices"
) {
  const [baseCurrency, quoteCurrency] = symbol.split("/");
  const baseWallet = await getOrCreateTwdWallet(userId, baseCurrency, marketType);
  const quoteWallet = await getOrCreateTwdWallet(userId, quoteCurrency, marketType);
  return { baseWallet, quoteWallet, baseCurrency, quoteCurrency };
}
```

**Files to Update**:
- `backend/api/ext/twd/utils.ts`

**Risk**: Low - Well-isolated utility function.

---

#### Step 2.2: Update TWD Order Creation

**File**: `backend/api/ext/twd/order/index.post.ts`

**Change**: Pass `marketType` to `getTwdWalletPair()`.

**Current**:
```typescript
const { baseWallet, quoteWallet, baseCurrency, quoteCurrency } =
  await getTwdWalletPair(user.id, symbol);
```

**NEW**:
```typescript
// Fetch market to get type
const market = await models.twdMarket.findOne({ where: { symbol, status: true } });
if (!market) throw new Error("Market not found");

const { baseWallet, quoteWallet, baseCurrency, quoteCurrency } =
  await getTwdWalletPair(user.id, symbol, market.type);
```

**Risk**: Low - Requires market lookup, minimal performance impact.

---

#### Step 2.3: Update TWD Order Cancellation

**File**: `backend/api/ext/twd/order/[id]/index.del.ts`

**Change**: Use correct wallet type when refunding.

**Current**:
```typescript
const wallet = await models.wallet.findOne({
  where: { userId: user.id, type: "SPOT", currency: refundCurrency },
});
```

**NEW**:
```typescript
// Get market type
const market = await models.twdMarket.findOne({ where: { symbol: order.symbol } });
const walletType = market.type === "forex" ? "FOREX"
                 : market.type === "stocks" ? "STOCK"
                 : "INDEX";

const wallet = await models.wallet.findOne({
  where: { userId: user.id, type: walletType, currency: refundCurrency },
});
```

**Risk**: Low - Same pattern as order creation.

---

#### Step 2.4: Update TWD Cron (LIMIT Order Execution)

**File**: `backend/utils/crons/twdOrder.ts`

**Change**: Use correct wallet type for LIMIT order fills.

**Pattern**: Same as order creation - fetch market type, use appropriate wallet.

**Risk**: Low - Isolated cron job.

---

### Phase 3: Transfer System Update

**Objective**: Allow FIAT/SPOT ↔ FOREX/STOCK/INDEX transfers.

#### Step 3.1: Update Transfer Valid Paths

**File**: `backend/api/finance/transfer/index.post.ts`

**Change** (lines 243-248):
```typescript
// OLD:
const validTransfers = {
  FIAT: ["SPOT", "ECO"],
  SPOT: ["FIAT", "ECO", "FUTURES"],
  ECO: ["FIAT", "SPOT", "FUTURES"],
  FUTURES: ["ECO", "SPOT"],
};

// NEW:
const validTransfers = {
  FIAT: ["SPOT", "ECO", "FOREX", "STOCK", "INDEX"],
  SPOT: ["FIAT", "ECO", "FUTURES", "FOREX", "STOCK", "INDEX"],
  ECO: ["FIAT", "SPOT", "FUTURES"],
  FUTURES: ["SPOT", "ECO"],
  FOREX: ["FIAT", "SPOT"],
  STOCK: ["FIAT", "SPOT"],
  INDEX: ["FIAT", "SPOT"],
};
```

**Risk**: Low - Purely additive, doesn't affect existing transfers.

---

#### Step 3.2: Handle FOREX/STOCK/INDEX Transfers

**File**: `backend/api/finance/transfer/index.post.ts`

**Change**: Extend `handleNonClientTransfer()` to handle new wallet types.

**Logic**:
- FOREX/STOCK/INDEX wallets use simple balance fields (no ledger like ECO)
- Transfer flow same as FIAT ↔ SPOT

**Implementation**:
```typescript
// In handleNonClientTransfer(), add:
if (
  ["FOREX", "STOCK", "INDEX"].includes(fromWallet.type) ||
  ["FOREX", "STOCK", "INDEX"].includes(toWallet.type)
) {
  // Simple balance update (no ledger)
  await updateWalletBalances(
    fromWallet, toWallet, parsedAmount, targetReceiveAmount,
    currencyData.precision, t
  );
  return;
}
```

**Risk**: Low - Simple balance arithmetic, no complex logic.

---

### Phase 4: Frontend Updates

**Objective**: Update UI to show correct wallet types and allow funding.

#### Step 4.1: Update Wallet Display

**Files**:
- `src/pages/user/wallet.tsx` (or equivalent)
- Wallet list components

**Change**: Show FOREX, STOCK, INDEX wallets separately from SPOT.

**UI**:
```
Wallets
├─ Fiat (USD, EUR, ...)
├─ Spot (BTC, ETH, USDT, ...)
├─ Ecosystem (ECO tokens)
├─ Futures (Derivatives)
├─ Forex (EUR/USD, GBP/JPY, ...)
├─ Stocks (AAPL, TSLA, AMD, ...)
└─ Indices (SPX, NASDAQ, ...)
```

**Risk**: Low - UI change, no data logic.

---

#### Step 4.2: Update Transfer UI

**File**: `src/components/pages/user/wallet/Transfer.tsx` (or equivalent)

**Change**: Add FOREX/STOCK/INDEX to wallet type dropdown.

**Valid Paths**: Show only valid transfer pairs per matrix above.

**Risk**: Low - Dropdown update.

---

#### Step 4.3: Update Order Form

**Files**:
- `src/stores/trade/order/index.ts` - `fetchWallets()`
- Trading UI components

**Change**: When on TWD market, fetch wallet based on market type:
```typescript
fetchWallets: async (isEco: boolean, currency: string, pair: string, isTwd?: boolean, marketType?: string) => {
  let walletType = "SPOT";

  if (isTwd && marketType) {
    walletType = marketType === "forex" ? "FOREX"
               : marketType === "stocks" ? "STOCK"
               : "INDEX";
  } else if (isEco) {
    walletType = "ECO";
  }

  const { data, error } = await $fetch({
    url: "/api/finance/wallet/symbol",
    silent: true,
    params: { type: walletType, currency, pair },
  });

  // ... rest of logic
}
```

**Risk**: Medium - Requires testing across all market types.

---

### Phase 5: PnL Tracking Update

**Objective**: Track PnL for FOREX/STOCK/INDEX separately.

#### Step 5.1: Update walletPnl Tracking

**Files**: Any service that updates `walletPnl` records.

**Change**: Include FUTURES, FOREX, STOCK, INDEX in PnL calculations.

**Implementation**: Backfill existing `walletPnl` records:
```sql
UPDATE wallet_pnl
SET balances = JSON_SET(
  balances,
  '$.FUTURES', 0,
  '$.FOREX', 0,
  '$.STOCK', 0,
  '$.INDEX', 0
);
```

**Risk**: Low - JSON update, backward compatible.

---

### Phase 6: Testing & Validation

#### Step 6.1: Unit Tests

**Create Tests For**:
1. `getOrCreateTwdWallet()` - Creates correct wallet type
2. `getTwdWalletPair()` - Returns correct wallet types per market
3. Transfer validation - Rejects invalid paths, allows valid paths
4. Order creation - Uses correct wallet types
5. Order cancellation - Refunds to correct wallet

---

#### Step 6.2: Integration Tests

**Test Scenarios**:
1. **Forex Trading Flow**:
   - Transfer FIAT/USD → FOREX/USD
   - Place forex order (EUR/USD)
   - Order executes → FOREX/EUR and FOREX/USD updated
   - Transfer FOREX/USD → FIAT/USD

2. **Stock Trading Flow**:
   - Transfer SPOT/USD → STOCK/USD
   - Buy AAPL stock
   - Sell AAPL stock
   - Transfer STOCK/USD → SPOT/USD

3. **Index Trading Flow**: Similar to stocks

4. **Mixed Scenario**:
   - User has SPOT, FIAT, FOREX, STOCK wallets
   - Perform various transfers
   - Trade on each platform
   - Verify balances and PnL

---

#### Step 6.3: Backward Compatibility Tests

**Verify**:
1. Existing SPOT trading still works
2. Existing ECO trading still works
3. Existing P2P still works
4. Existing FIAT deposits/withdrawals still work
5. Existing SPOT deposits/withdrawals still work
6. Existing transfers (FIAT ↔ SPOT, etc.) still work

---

### Phase 7: Deployment

#### Step 7.1: Pre-Deployment Checklist

- [ ] Database migration tested on staging
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Backward compatibility verified
- [ ] Frontend tested across all wallet types
- [ ] Transfer matrix tested (all valid paths)
- [ ] TWD order creation tested (forex, stocks, indices)
- [ ] Cron job tested (LIMIT order execution)

---

#### Step 7.2: Deployment Steps

1. **Database Migration** (Maintenance Window):
   ```sql
   -- Backup database
   -- Add new enum values
   -- Backfill walletPnl records
   -- Test rollback script
   ```

2. **Backend Deployment**:
   - Deploy updated models
   - Deploy updated TWD utils
   - Deploy updated transfer logic
   - Deploy updated cron

3. **Frontend Deployment**:
   - Deploy updated wallet UI
   - Deploy updated transfer UI
   - Deploy updated trading UI

4. **Verification**:
   - Test forex trade end-to-end
   - Test stock trade end-to-end
   - Test transfer FIAT → FOREX → FIAT
   - Monitor error logs for 24 hours

---

#### Step 7.3: Post-Deployment

1. **Monitor**:
   - Error rates
   - TWD order creation success rate
   - Transfer completion rate
   - User complaints

2. **Data Cleanup**:
   - After 30 days, if no issues:
   ```sql
   -- Remove TWD_PAPER from enum
   ALTER TABLE wallet
     MODIFY COLUMN type ENUM(
       'FIAT', 'SPOT', 'ECO', 'FUTURES',
       'FOREX', 'STOCK', 'INDEX'
     ) NOT NULL;
   ```

3. **Documentation**:
   - Update API docs (Swagger)
   - Update user guides
   - Update admin documentation

---

## Summary of Changes

### Database
- Add `FOREX`, `STOCK`, `INDEX` to wallet type enum
- Remove `TWD_PAPER` (after migration)
- Update `walletPnl` schema to track new types

### Backend
- `backend/api/ext/twd/utils.ts` - New `getOrCreateTwdWallet()` logic
- `backend/api/ext/twd/order/index.post.ts` - Use market type for wallet selection
- `backend/api/ext/twd/order/[id]/index.del.ts` - Cancel to correct wallet type
- `backend/utils/crons/twdOrder.ts` - Execute to correct wallet type
- `backend/api/finance/transfer/index.post.ts` - Add FOREX/STOCK/INDEX transfer paths

### Frontend
- Wallet list UI - Show new wallet types
- Transfer UI - Add new transfer options
- Trading UI - Fetch correct wallet type per market

### Documentation
- Update Swagger/OpenAPI with new wallet types
- Update user guides with funding flows
- Update admin docs with wallet management

---

## Backward Compatibility Notes

**Preserved Flows**:
- ✅ SPOT trading continues to work (unchanged)
- ✅ ECO trading continues to work (unchanged)
- ✅ FIAT deposits/withdrawals continue to work (unchanged)
- ✅ P2P continues to work (unchanged)
- ✅ Existing transfers (FIAT ↔ SPOT, etc.) continue to work (unchanged)

**Breaking Changes**:
- ❌ TWD orders will use new wallet types (migration needed for existing TWD users)
- ❌ Admins must credit new wallet types (FOREX/STOCK/INDEX) instead of SPOT for TWD

**Migration Path for Existing TWD Users**:
1. Identify users with open TWD orders or non-zero TWD_PAPER balances
2. Create equivalent FOREX/STOCK/INDEX wallets
3. Transfer balances from TWD_PAPER → new wallet type
4. Update open orders to reference new wallets
5. Notify users of wallet type change

---

## Questions & Decisions

### Q1: Should FOREX/STOCK/INDEX wallets support leverage?

**Recommendation**: Yes, but as a future enhancement.

**Approach**:
- Add `leverage` field to wallet model (nullable)
- For FOREX wallets, allow 1:10, 1:50, 1:100 leverage
- For STOCK wallets, allow 1:5 leverage (CFD-style)
- Leverage affects `inOrder` locking (margin requirement)

**Not in initial migration** - Implement after base architecture stable.

---

### Q2: Should users be able to withdraw FOREX/STOCK/INDEX positions directly?

**Recommendation**: No - These are synthetic instruments.

**Rationale**:
- Forex positions have no real asset (it's a contract)
- Stock positions via TWD are CFDs, not real shares
- User can close position → profit to FOREX/USD → transfer to FIAT/USD → withdraw

**Exception**: If in future you support real stock custody, add STOCK ↔ external transfer.

---

### Q3: How to handle forex positions across multiple currency pairs?

**Example**: User has FOREX/USD, FOREX/EUR, FOREX/GBP.

**Approach**:
- Each currency has separate wallet (current model)
- User can transfer between FOREX/USD ↔ FIAT/USD ↔ FIAT/EUR ↔ FOREX/EUR
- No direct FOREX/USD → FOREX/EUR conversion (must go through FIAT or SPOT)

**Future Enhancement**: Add FOREX cross-currency transfers.

---

### Q4: Should P2P support FOREX/STOCK balances?

**Recommendation**: No, keep P2P as FIAT-only.

**Rationale**:
- P2P is for real money/asset transfers
- FOREX/STOCK are synthetic trading balances
- User workflow: FOREX/USD → FIAT/USD → P2P

**Future Enhancement**: If there's demand, allow FOREX → P2P conversion.

---

## Appendix: File Change Checklist

### Models
- [ ] `models/wallet.ts` - Update type enum
- [ ] `models/walletPnl.ts` - Update balances schema

### Backend - TWD
- [ ] `backend/api/ext/twd/utils.ts` - New wallet creation logic
- [ ] `backend/api/ext/twd/order/index.post.ts` - Use market type
- [ ] `backend/api/ext/twd/order/[id]/index.del.ts` - Cancel logic
- [ ] `backend/utils/crons/twdOrder.ts` - LIMIT execution

### Backend - Transfer
- [ ] `backend/api/finance/transfer/index.post.ts` - Valid paths, handle new types

### Backend - Wallet
- [ ] `backend/api/finance/wallet/utils.ts` - Support new types (if needed)

### Frontend - Wallet
- [ ] Wallet list component - Display new types
- [ ] Transfer component - New transfer options

### Frontend - Trading
- [ ] Order store (`src/stores/trade/order/index.ts`) - Fetch correct wallet type
- [ ] Trading page - Pass market type to order store

### Database
- [ ] Migration script - Add enum values, backfill walletPnl
- [ ] Rollback script - Remove enum values, restore TWD_PAPER

### Documentation
- [ ] Update Swagger/OpenAPI
- [ ] Update README or user guides
- [ ] Update this architecture doc with final decisions

---

**Document Version**: 1.0
**Date**: 2025-01-25
**Status**: Proposed - Awaiting Review & Implementation
