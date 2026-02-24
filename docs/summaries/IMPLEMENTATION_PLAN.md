# TwelveData Implementation Plan

## Approved Architecture

✅ **MySQL-only** architecture
✅ **Separate wallet type**: `TWD_PAPER`
✅ **Demo balance**: $100,000 USD (configurable)
✅ **New tables**: `twd_provider`, `twd_market`, `twd_order`

## Implementation Phases

### Phase 1: Database Layer

**1.1 Create Migrations**
- `migrations/YYYYMMDD_create_twd_provider.js`
- `migrations/YYYYMMDD_create_twd_market.js`
- `migrations/YYYYMMDD_create_twd_order.js`
- `migrations/YYYYMMDD_add_twd_paper_wallet_type.js`

**1.2 Create Models**
- `models/twdProvider.ts`
- `models/twdMarket.ts`
- `models/twdOrder.ts`
- Update `models/wallet.ts` to add `TWD_PAPER` type

**1.3 Seed Initial Data**
- Create TwelveData provider entry

### Phase 2: Backend Admin APIs

**2.1 Provider Management**
```
/api/admin/ext/twd/provider/
  index.get.ts          # List providers
  [id]/
    index.get.ts        # Get provider details + test API connection
    status.put.ts       # Enable/disable provider
```

**2.2 Market Import**
```
/api/admin/ext/twd/market/
  index.get.ts          # List markets (with filtering)
  import.get.ts         # Import from TwelveData catalog
  structure.get.ts      # Get market schema
  [id]/
    index.get.ts        # Get market details
    index.put.ts        # Update market
    index.del.ts        # Delete market
    status.put.ts       # Enable/disable market
  utils.ts              # Shared utilities
```

### Phase 3: Backend User APIs

**3.1 Market Data**
```
/api/ext/twd/market/
  index.get.ts          # List enabled markets
  [symbol]/
    index.get.ts        # Get market details
    ticker.get.ts       # Get current price
    candles.get.ts      # Get historical candles
```

**3.2 Order Management**
```
/api/ext/twd/order/
  index.get.ts          # List user orders
  index.post.ts         # Create order (paper trading)
  index.ws.ts           # WebSocket for order updates
  [id]/
    index.get.ts        # Get order details
    index.del.ts        # Cancel order
  utils.ts              # Order utilities
```

**3.3 Wallet Initialization**
- Auto-create `TWD_PAPER` wallet on first trade
- Initialize with demo balance from env

### Phase 4: Order Execution Engine

**4.1 Cron Job**
```
backend/utils/crons/twdOrderExecution.ts
- Run every 5 seconds
- Fetch all OPEN LIMIT orders
- Get current prices from TwelveData
- Execute when price condition met
- Update order status
- Update wallet balances
```

**4.2 Execution Utilities**
```
backend/utils/twd/
  execution.ts          # Order execution logic
  pricing.ts            # Fetch prices from TwelveData
  wallet.ts             # Wallet operations
```

### Phase 5: WebSocket Integration

**5.1 Modify TwelveData Server**
```typescript
// backend/integrations/twelvedata/server.ts

// Remove hardcoded symbols
- const defaults = process.env.ECO_DEFAULT_SYMBOLS.split(",");

// Load from database
+ async function getEnabledSymbols() {
+   const markets = await models.twdMarket.findAll({
+     where: { status: true }
+   });
+   return markets.map(m => m.symbol);
+ }

// Subscribe on startup
+ const symbols = await getEnabledSymbols();
+ provider.subscribe(symbols);

// Refresh every 60s
+ setInterval(async () => {
+   const symbols = await getEnabledSymbols();
+   provider.subscribe(symbols);
+ }, 60000);
```

### Phase 6: Frontend Admin Pages

**6.1 Provider Management**
```
src/pages/admin/ext/twd/index.tsx
- List TwelveData providers
- Enable/disable switch
- View API key status
```

**6.2 Market Management**
```
src/pages/admin/ext/twd/market/index.tsx
- Import button with type selector (forex/indices/stocks/all)
- DataTable with filtering by type
- Enable/disable switches
- Mark as trending/hot
- Delete markets
```

### Phase 7: Frontend Trading Pages

**7.1 Update Market List Pages**
```typescript
// src/pages/forex/index.tsx
const { data } = useFetch("/api/ext/twd/market?type=forex&status=true");

// src/pages/indices/index.tsx
const { data } = useFetch("/api/ext/twd/market?type=indices&status=true");

// src/pages/stocks/index.tsx
const { data } = useFetch("/api/ext/twd/market?type=stocks&status=true");
```

**7.2 Update Trading Page**
```typescript
// src/pages/trade/[symbol]/index.tsx
// Already has TWD detection logic
// Just need to:
// 1. Connect order form to /api/ext/twd/order
// 2. Show "PAPER TRADING" indicator
// 3. Use TWD WebSocket for prices
```

**7.3 Wallet Display**
- Show TWD_PAPER wallets separately
- Display demo balance indicator

### Phase 8: Testing

**8.1 Backend Testing**
- Admin enables provider
- Admin imports markets (forex, indices, stocks)
- Admin enables specific markets
- User creates orders
- Orders execute automatically
- Balances update correctly

**8.2 Frontend Testing**
- Admin interface works
- Market pages load correctly
- Trading page shows TWD markets
- Charts display correctly
- Orders create successfully

**8.3 WebSocket Testing**
- Prices stream correctly
- Order updates work
- No hardcoded symbols remain

## Environment Variables

Add to `.env`:
```bash
# TwelveData
TWD_DEMO_BALANCE=100000
TWD_DEFAULT_CURRENCY=USD
```

## Implementation Order

1. ✅ Phase 1: Database Layer (migrations, models)
2. ✅ Phase 2: Admin APIs (provider, market import)
3. ✅ Phase 3: User APIs (markets, orders)
4. ✅ Phase 4: Execution Engine
5. ✅ Phase 5: WebSocket Update
6. ✅ Phase 6: Admin Frontend
7. ✅ Phase 7: Trading Frontend
8. ✅ Phase 8: Testing

## Key Patterns to Follow

### 1. Provider Management (Same as Exchange)
```typescript
// Only ONE provider active at a time
if (status) {
  await models.twdProvider.update(
    { status: false },
    { where: { id: { [Op.ne]: id } } }
  );
}
```

### 2. Market Import (Same as Exchange)
```typescript
// Fetch from external API
const symbols = await fetchTwdCatalog(type);

// Bulk insert with status: false
await models.twdMarket.bulkCreate(
  symbols.map(s => ({
    symbol: s,
    type,
    status: false,
    ...parseSymbol(s)
  }))
);
```

### 3. Order Creation (Same as Exchange)
```typescript
// 1. Validate market
// 2. Check wallet balance
// 3. Create order
// 4. Update wallet (deduct)
// 5. If MARKET, execute immediately
// 6. Return order
```

### 4. Wallet Operations (Same as Spot)
```typescript
const wallet = await models.wallet.findOne({
  where: { userId, currency, type: "TWD_PAPER" }
});

if (!wallet) {
  wallet = await models.wallet.create({
    userId,
    type: "TWD_PAPER",
    currency,
    balance: process.env.TWD_DEMO_BALANCE || 100000
  });
}
```

## Success Criteria

✅ Admin can enable TwelveData provider
✅ Admin can import forex/indices/stocks from TwelveData
✅ Admin can enable specific instruments
✅ Users see enabled instruments on /forex, /indices, /stocks
✅ Users can place MARKET and LIMIT orders
✅ MARKET orders execute immediately
✅ LIMIT orders execute when price reaches target
✅ Wallets update correctly on order execution
✅ WebSocket streams prices for enabled markets only
✅ No hardcoded symbols in .env
✅ Charts display correctly on trade pages
✅ "PAPER TRADING" indicator shown
✅ All operations follow existing patterns

## Let's Begin! 🚀
