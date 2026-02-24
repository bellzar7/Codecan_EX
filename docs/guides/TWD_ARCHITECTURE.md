# TWD Paper Trading - Architecture & Flow Specification

**Document Type**: Persistent Planning Document - Single Source of Truth
**Version**: 2.0.0 (Refactored for DB-driven markets)
**Last Updated**: 2025-11-13
**Status**: Active Specification

---

## 🎯 Core Principles

### 1. **Mirror Spot/Futures Architecture**
The TWD paper trading flow MUST fully match the existing Spot/Futures architecture:
- Admin manages providers (TwelveData API credentials)
- Admin imports markets from provider
- Admin enables/disables specific markets
- Users see only enabled markets on frontend
- NO hardcoded ENV/static lists

### 2. **Complete Separation**
TWD paper trading is completely isolated:
- **Wallet Type**: `TWD_PAPER` (separate from SPOT/FUTURES/ECO)
- **Database Tables**: `twd_provider`, `twd_market`, `twd_order`
- **API Namespace**: `/api/ext/twd/*` (user), `/api/admin/ext/twd/*` (admin)
- **Frontend Routes**: `/forex`, `/indices`, `/stocks`, `/trade/[symbol]?isTwd=true`

### 3. **Data Source: TwelveData API via MCP**
ALL market data comes from TwelveData:
- Use MCP TwelveData server to inspect API structure
- Import markets via TwelveData API endpoints
- NO CSV uploads (unless API approach fails)
- NO hardcoded symbol lists in ENV files

---

## 📋 Required Admin Flow

### Step 1: Provider Management
**Location**: Admin → Finance → Providers → TWD Providers

**Actions**:
1. **Create TWD Provider**
   - Name (e.g., "TwelveData Main")
   - API Key (from https://twelvedata.com)
   - Status (Active/Inactive)
   - Save to `twd_provider` table

2. **Edit TWD Provider**
   - Update name, API key, or status
   - Changes persist to database

3. **Delete TWD Provider**
   - Validation: Cannot delete if markets exist
   - Cascade delete or prevent based on business logic

### Step 2: Market Import
**Location**: Provider Details → Markets Tab

**Actions**:
1. **Click "Import Markets" Button**
   - Backend calls TwelveData API endpoints:
     - `/forex_pairs` for forex
     - `/stocks` for stocks
     - `/etf` or indices endpoints for indices
   - Uses provider's API key
   - Parses response and maps to `twd_market` schema

2. **Import Process**
   - Fetch from TwelveData API
   - Map fields: `symbol`, `type`, `exchange`, `name`, etc.
   - Upsert to `twd_market` (unique key: `symbol + type`)
   - Default `status = false` (disabled)
   - Return imported count

3. **Import Result**
   - Show success message: "Imported X forex pairs, Y stocks, Z indices"
   - Display markets table
   - Allow filtering by type

### Step 3: Market Management
**Location**: Provider Details → Markets Tab

**Actions**:
1. **View Markets Table**
   - Columns: Symbol, Type, Exchange, Name, Status, Actions
   - Filters: Type (Forex/Stocks/Indices), Status (Enabled/Disabled)
   - Search by symbol or name
   - Pagination

2. **Enable/Disable Individual Market**
   - Toggle switch per row
   - Update `twd_market.status` field
   - Changes reflect immediately on frontend

3. **Bulk Operations**
   - Select multiple markets via checkboxes
   - "Enable Selected" button
   - "Disable Selected" button
   - Confirmation dialog

---

## 🌐 Required Frontend Data Flow

### User-Facing Pages

#### `/forex` Page
**Data Source**: `GET /api/ext/twd/market?type=forex`

**Behavior**:
- Fetches only enabled forex markets from `twd_market` table
- WHERE `type = 'forex'` AND `status = true`
- Displays in `TwdMarkets` component
- Shows paper trading banner
- Clicking row navigates to `/trade/[symbol]`

#### `/indices` Page
**Data Source**: `GET /api/ext/twd/market?type=indices`

**Behavior**:
- Same as forex, but `type = 'indices'`

#### `/stocks` Page
**Data Source**: `GET /api/ext/twd/market?type=stocks`

**Behavior**:
- Same as forex, but `type = 'stocks'`

#### `/trade/[symbol]` Page
**Market Detection**:
```typescript
// Check if symbol exists in twd_market
const twdMarket = await db.twdMarket.findOne({
  where: { symbol, status: true }
});

if (twdMarket) {
  // Set isTwd = true
  // Load TWD paper trading flow
  // Show paper trading banner
  // Use TWD_PAPER wallet
} else {
  // Regular crypto market
  // Use SPOT/FUTURES flow
}
```

### Admin Pages

#### Provider List
**Location**: `/admin/finance/providers?type=twd`

**Features**:
- List all TWD providers
- Add new provider button
- Edit/Delete actions
- Status indicators

#### Provider Details
**Location**: `/admin/finance/providers/twd/[id]`

**Tabs**:
1. **Settings** - Edit provider details
2. **Markets** - Manage markets (import, enable/disable)

**Markets Tab Features**:
- Import markets button
- Markets table with filters
- Enable/disable toggles
- Bulk actions

---

## 🗄️ Database Schema

### `twd_provider` Table
```sql
CREATE TABLE twd_provider (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  apiKey VARCHAR(500) NOT NULL ENCRYPTED,
  status BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### `twd_market` Table (Updated Schema)
```sql
CREATE TABLE twd_market (
  id UUID PRIMARY KEY,
  providerId UUID REFERENCES twd_provider(id),
  symbol VARCHAR(50) NOT NULL,
  type ENUM('forex', 'stocks', 'indices', 'etf') NOT NULL,
  exchange VARCHAR(100),
  name VARCHAR(255),
  currency VARCHAR(10),  -- Base currency for forex
  pair VARCHAR(10),      -- Quote currency for forex
  country VARCHAR(50),
  access JSON,           -- TwelveData access info
  status BOOLEAN DEFAULT false,  -- enabled/disabled
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol, type)
);
```

### Field Mapping: TwelveData → twd_market

**Forex Pairs** (from `/forex_pairs`):
```javascript
{
  symbol: response.symbol,              // "EUR/USD"
  type: 'forex',
  currency: response.currency_base,     // "EUR"
  pair: response.currency_quote,        // "USD"
  name: `${currency}/${pair}`,
  exchange: null,  // Forex has no exchange
  status: false    // Disabled by default
}
```

**Stocks** (from `/stocks`):
```javascript
{
  symbol: response.symbol,              // "AAPL"
  type: 'stocks',
  exchange: response.exchange,          // "NASDAQ"
  name: response.name,                  // "Apple Inc."
  currency: response.currency,          // "USD"
  country: response.country,            // "United States"
  access: response.access,              // { global, plan }
  status: false
}
```

**Indices/ETF** (from `/etf` or indices endpoint):
```javascript
{
  symbol: response.symbol,              // "SPX"
  type: 'indices',
  exchange: response.exchange,          // "INDEX"
  name: response.name,                  // "S&P 500 Index"
  currency: response.currency,          // "USD"
  country: response.country,            // "United States"
  status: false
}
```

---

## 🔌 API Endpoints

### Admin Endpoints

#### Provider Management
```
POST   /api/admin/ext/twd/provider          - Create provider
GET    /api/admin/ext/twd/provider          - List providers
GET    /api/admin/ext/twd/provider/:id      - Get provider details
PUT    /api/admin/ext/twd/provider/:id      - Update provider
DELETE /api/admin/ext/twd/provider/:id      - Delete provider
```

#### Market Import & Management
```
POST   /api/admin/ext/twd/provider/:id/import          - Import markets from TwelveData
GET    /api/admin/ext/twd/market                       - List all markets (admin view)
PUT    /api/admin/ext/twd/market/:id                   - Update market (enable/disable)
DELETE /api/admin/ext/twd/market/:id                   - Delete market
POST   /api/admin/ext/twd/market/bulk                  - Bulk enable/disable
```

### Public (User) Endpoints
```
GET    /api/ext/twd/market?type={forex|stocks|indices} - List enabled markets
GET    /api/ext/twd/market/:symbol                     - Get market details
POST   /api/ext/twd/order                              - Create paper order
GET    /api/ext/twd/order                              - List user orders
DELETE /api/ext/twd/order/:id                          - Cancel order
POST   /api/ext/twd/wallet/reset                       - Reset paper balance
```

---

## 🔗 TwelveData API Integration

### MCP Server Configuration
```json
{
  "mcpServers": {
    "twelvedata": {
      "command": "uvx",
      "args": ["mcp-server-twelve-data"]
    }
  }
}
```

### TwelveData Endpoints to Use

**Forex Pairs**:
```
GET https://api.twelvedata.com/forex_pairs
Response: [
  {
    "symbol": "EUR/USD",
    "currency_group": "Major",
    "currency_base": "EUR",
    "currency_quote": "USD"
  },
  ...
]
```

**Stocks**:
```
GET https://api.twelvedata.com/stocks?exchange=NASDAQ
Response: [
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "currency": "USD",
    "exchange": "NASDAQ",
    "mic_code": "XNAS",
    "country": "United States",
    "type": "Common Stock",
    "access": { "global": "Level A", "plan": "Basic" }
  },
  ...
]
```

**Indices/ETF**:
```
GET https://api.twelvedata.com/etf
Response: [
  {
    "symbol": "SPY",
    "name": "SPDR S&P 500 ETF Trust",
    "currency": "USD",
    "exchange": "NYSE ARCA",
    "country": "United States"
  },
  ...
]
```

### Import Implementation Strategy

**Option A: API Import (PREFERRED)**

Backend endpoint: `POST /api/admin/ext/twd/provider/:id/import`

```typescript
async function importMarkets(providerId: string, type: 'forex' | 'stocks' | 'indices') {
  // 1. Get provider and API key
  const provider = await db.twdProvider.findByPk(providerId);
  const apiKey = decrypt(provider.apiKey);

  // 2. Call TwelveData API
  let endpoint;
  if (type === 'forex') endpoint = '/forex_pairs';
  if (type === 'stocks') endpoint = '/stocks';
  if (type === 'indices') endpoint = '/etf';  // or specific indices endpoint

  const response = await fetch(`https://api.twelvedata.com${endpoint}?apikey=${apiKey}`);
  const data = await response.json();

  // 3. Map and upsert to twd_market
  for (const item of data.data) {
    await db.twdMarket.upsert({
      providerId,
      symbol: item.symbol,
      type,
      exchange: item.exchange,
      name: item.name,
      currency: item.currency_base || item.currency,
      pair: item.currency_quote,
      country: item.country,
      access: item.access,
      status: false  // Disabled by default
    });
  }

  return { imported: data.data.length };
}
```

**Option B: CSV Import (FALLBACK)**
- Only if API approach is too complex
- Provide CSV upload in admin UI
- Parse CSV and upsert to `twd_market`
- Same field mapping logic

---

## 🎨 Symbol Mapping Rules

### Forex Symbol Format
**TwelveData**: `EUR/USD`
**Internal Storage**: `EUR/USD` (keep original)
**URL Format**: `/trade/EUR_USD` (replace `/` with `_`)
**Market Detection**: Look up in `twd_market` by symbol

### Stock Symbol Format
**TwelveData**: `AAPL`
**Internal Storage**: `AAPL`
**URL Format**: `/trade/AAPL`
**Market Detection**: Look up in `twd_market` by symbol

### Index Symbol Format
**TwelveData**: `SPX`, `DJI`, etc.
**Internal Storage**: Keep original
**URL Format**: `/trade/SPX`
**Market Detection**: Look up in `twd_market` by symbol

### Conversion Functions
```typescript
// URL to symbol
function urlToSymbol(url: string): string {
  return url.replace('_', '/');  // EUR_USD → EUR/USD
}

// Symbol to URL
function symbolToUrl(symbol: string): string {
  return symbol.replace('/', '_');  // EUR/USD → EUR_USD
}
```

---

## 🔄 Complete User Flow

### Admin Setup Flow
1. **Admin logs in**
2. **Navigate to**: Admin → Finance → Providers
3. **Click**: "Add TWD Provider"
4. **Fill form**:
   - Name: "TwelveData Main"
   - API Key: `{key from twelvedata.com}`
   - Status: Active
5. **Click**: "Save"
6. **Navigate to**: Provider details page
7. **Click**: "Markets" tab
8. **Click**: "Import Forex Markets"
   - Backend calls TwelveData `/forex_pairs`
   - Imports 50+ forex pairs
   - Success message: "Imported 53 forex pairs"
9. **Click**: "Import Stocks"
   - Backend calls TwelveData `/stocks`
   - Imports 1000+ stocks
   - Success message: "Imported 1247 stocks"
10. **Click**: "Import Indices"
    - Backend calls TwelveData `/etf` or indices
    - Success message: "Imported 45 indices"
11. **Filter**: Type = Forex
12. **Select**: EUR/USD, GBP/USD, USD/JPY (15 total)
13. **Click**: "Enable Selected"
14. **Repeat** for stocks and indices

### User Trading Flow
1. **User logs in**
2. **Navigate to**: `/forex`
3. **Sees**: Only the 15 enabled forex pairs (from step 11-13 above)
4. **Clicks**: EUR/USD row
5. **Navigates to**: `/trade/EUR_USD`
6. **Sees**:
   - Paper Trading warning banner
   - TWD_PAPER balance ($10,000 USD)
   - Live price from TwelveData (via WebSocket)
   - Order form (MARKET & LIMIT)
7. **Places**: MARKET BUY order for 1.0 EUR
8. **Order executes**:
   - Fetches current price from TwelveData
   - Creates record in `twd_order`
   - Deducts from `TWD_PAPER` wallet
   - Status: CLOSED (immediate execution)
9. **Sees**: Order in "Order History" tab
10. **Places**: LIMIT SELL order at 1.1000
11. **Order created**:
    - Status: OPEN
    - Balance reserved
12. **Cron job** (every 1 minute):
    - Checks OPEN LIMIT orders
    - Fetches current price from TwelveData
    - Executes if price condition met
    - Updates order status to CLOSED
13. **User clicks**: "Reset Balance" on `/forex` page
14. **Balance resets** to $10,000 USD

---

## 🚫 What NOT to Do

### ❌ DO NOT Use ENV for Market Lists
```typescript
// ❌ WRONG - Do not do this
const FOREX_PAIRS = process.env.TWD_FOREX_PAIRS.split(',');
```

```typescript
// ✅ CORRECT - Fetch from database
const markets = await db.twdMarket.findAll({
  where: { type: 'forex', status: true }
});
```

### ❌ DO NOT Hardcode Symbols in Frontend
```typescript
// ❌ WRONG
const markets = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
```

```typescript
// ✅ CORRECT
const { data } = await $fetch({ url: '/api/ext/twd/market?type=forex' });
```

### ❌ DO NOT Bypass Admin Enable/Disable
```typescript
// ❌ WRONG - Show all markets
const markets = await db.twdMarket.findAll({ where: { type } });
```

```typescript
// ✅ CORRECT - Only show enabled
const markets = await db.twdMarket.findAll({
  where: { type, status: true }
});
```

---

## 📊 Migration from Current Implementation

### Current State (Problems)
- ✅ Database tables exist (`twd_provider`, `twd_market`, `twd_order`)
- ✅ Backend APIs exist (order placement, wallet, etc.)
- ✅ Frontend pages exist (`/forex`, `/indices`, `/stocks`)
- ❌ Markets still loaded from ENV/hardcoded lists
- ❌ No admin UI for provider management
- ❌ No admin UI for market import
- ❌ No admin UI for enable/disable markets

### Required Changes

**Backend**:
1. Create admin provider CRUD endpoints
2. Create market import endpoint (TwelveData API integration)
3. Create market enable/disable endpoints
4. Update public market endpoint to filter by `status = true`

**Frontend**:
1. Create admin provider management pages
2. Create admin market management pages
3. Update `/forex`, `/indices`, `/stocks` to fetch from API (not ENV)
4. Keep all existing TWD order logic unchanged

**Database**:
1. Add `providerId` foreign key to `twd_market` (if not exists)
2. Ensure `status` field exists on `twd_market`
3. Add indexes on `type`, `status`, `symbol`

---

## ✅ Verification Checklist

After implementation, verify:

### Admin Flow
- [ ] Can create TWD provider with API key
- [ ] Can edit provider details
- [ ] Can delete provider (with validation)
- [ ] Can import forex markets from TwelveData API
- [ ] Can import stocks from TwelveData API
- [ ] Can import indices from TwelveData API
- [ ] Markets are stored in `twd_market` table
- [ ] Can view imported markets in table
- [ ] Can filter markets by type
- [ ] Can search markets by symbol/name
- [ ] Can enable individual market
- [ ] Can disable individual market
- [ ] Can bulk enable selected markets
- [ ] Can bulk disable selected markets

### User Flow
- [ ] `/forex` shows only enabled forex markets
- [ ] `/forex` shows NO markets if none enabled
- [ ] `/indices` shows only enabled indices
- [ ] `/stocks` shows only enabled stocks
- [ ] Markets list fetches from `/api/ext/twd/market?type=X`
- [ ] Clicking market navigates to `/trade/[symbol]`
- [ ] Trade page detects TWD market (from DB lookup)
- [ ] Trade page shows paper trading banner
- [ ] Trade page loads TWD_PAPER balance
- [ ] Can place MARKET orders
- [ ] Can place LIMIT orders
- [ ] Orders stored in `twd_order`
- [ ] Balance updates after orders
- [ ] Cron executes LIMIT orders
- [ ] Can cancel OPEN orders
- [ ] Can reset balance to $10,000

### Data Integrity
- [ ] No ENV-based market lists used
- [ ] All markets come from `twd_market` table
- [ ] Market import uses TwelveData API (not hardcoded)
- [ ] Enabling/disabling market reflects immediately
- [ ] TWD markets don't interfere with SPOT/FUTURES
- [ ] TWD_PAPER wallet separate from other wallets

---

## 🎯 Success Criteria

Implementation is complete when:

1. ✅ Admin can manage TWD providers (CRUD)
2. ✅ Admin can import markets from TwelveData API
3. ✅ Admin can enable/disable markets
4. ✅ Frontend loads ONLY enabled markets from database
5. ✅ NO hardcoded market lists in ENV or code
6. ✅ Complete flow works: Admin import → Enable → User trades
7. ✅ All existing TWD order logic still works
8. ✅ Paper trading isolated from real trading

---

**End of Architecture Specification**

This document is the **single source of truth** for TWD Paper Trading implementation.
All code changes, features, and decisions must reference this specification.
