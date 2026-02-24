# Phase 2 Complete: Admin Backend APIs

## ✅ What Was Created

Phase 2 implements the complete admin API layer for TWD provider and market management, following the exact pattern established by the existing exchange admin APIs.

### 1. Permissions (seeders/20240402234643-permissions.js)

Added three new permissions to the permissions seeder:

```javascript
"Access TWD Provider Management",
"Access TWD Market Management",
"Access TWD Order Management",
```

**To apply these permissions:**
```bash
pnpm seed
# Or run the specific seeder
npx sequelize-cli db:seed --seed 20240402234643-permissions.js
```

---

## 2. Provider Management APIs

**Location:** `backend/api/admin/ext/twd/provider/`

### Files Created:

#### `utils.ts`
Shared schemas for TWD provider APIs:
```typescript
export const baseTwdProviderSchema = {
  id: baseStringSchema("ID of the TWD provider"),
  name: baseStringSchema("Name of the TWD provider"),
  title: baseStringSchema("Title of the TWD provider"),
  status: baseBooleanSchema("Status of the TWD provider"),
};
```

#### `index.get.ts`
**GET /api/admin/ext/twd/provider**
- Lists all TWD providers with pagination
- Supports filtering by `name` and `status`
- Permission: `Access TWD Provider Management`
- Mirrors: `backend/api/admin/finance/exchange/provider/index.get.ts`

#### `[id]/index.get.ts`
**GET /api/admin/ext/twd/provider/:id**
- Retrieves provider details by ID
- **Tests TwelveData API connection** by fetching sample data (AAPL stock)
- Returns both provider info and connection status
- Permission: `Access TWD Provider Management`

```typescript
// Response includes:
{
  provider: { id, name, title, status },
  connection: {
    status: true/false,
    message: "API connection successful" | "Error message"
  }
}
```

#### `[id]/status.put.ts`
**PUT /api/admin/ext/twd/provider/:id/status**
- Enables/disables a TWD provider
- **CRITICAL:** Only ONE provider can be active at a time
- Uses database transaction to ensure atomicity
- When enabling a provider, automatically disables all others
- Permission: `Access TWD Provider Management`

```typescript
// Implementation ensures single active provider:
if (status) {
  await models.twdProvider.update(
    { status: false },
    { where: { id: { [Op.ne]: id } }, transaction }
  );
}
```

---

## 3. Market Management APIs

**Location:** `backend/api/admin/ext/twd/market/`

### Files Created:

#### `utils.ts`
Shared schemas for TWD market APIs:
```typescript
export const twdMarketSchema = {
  id: baseStringSchema("ID of the TWD market"),
  symbol: baseStringSchema("Symbol of the TWD market", 191),
  type: { type: "string", enum: ["forex", "stocks", "indices"] },
  name: baseStringSchema("Name of the TWD market", 191),
  currency: baseStringSchema("Base currency of the TWD market", 191),
  pair: baseStringSchema("Quote currency (for forex pairs)", 191), // nullable
  exchange: baseStringSchema("Exchange name (for stocks)", 50), // nullable
  metadata: { type: "object", nullable: true },
  isTrending: baseBooleanSchema("Trending status"), // nullable
  isHot: baseBooleanSchema("Hot status"), // nullable
  status: baseBooleanSchema("Operational status"),
};
```

#### `index.get.ts`
**GET /api/admin/ext/twd/market**
- Lists all TWD markets with pagination
- Supports filtering by `symbol`, `type`, and `status`
- Default sort: `symbol` ascending
- Permission: `Access TWD Market Management`
- Mirrors: `backend/api/admin/finance/exchange/market/index.get.ts`

#### `import.get.ts` ⭐ **MOST IMPORTANT**
**GET /api/admin/ext/twd/market/import**

This endpoint fetches instruments from TwelveData API and saves them to the database.

**How it works:**

1. **Validates Prerequisites:**
   - Checks `TWD_API_KEY` environment variable exists
   - Verifies at least one TWD provider is enabled

2. **Fetches from Three TwelveData Endpoints:**
   ```bash
   GET https://api.twelvedata.com/forex_pairs?apikey={key}
   GET https://api.twelvedata.com/stocks?apikey={key}
   GET https://api.twelvedata.com/indices?apikey={key}
   ```

3. **Normalizes Data:**
   - **Forex:** Creates markets with `type: "forex"`, includes `currency` and `pair`
   - **Stocks:** Creates markets with `type: "stocks"`, includes `currency` and `exchange`
   - **Indices:** Creates markets with `type: "indices"`, includes `currency`

4. **Database Transaction:**
   - Deletes markets no longer available from TwelveData (cleanup)
   - Deletes related orders for removed markets
   - Updates existing markets (preserves `status`, `isTrending`, `isHot`)
   - Creates new markets (all start with `status: false`)

5. **Returns Import Summary:**
   ```json
   {
     "message": "TWD markets imported and saved successfully!",
     "imported": {
       "forex": 120,
       "stocks": 5000,
       "indices": 50
     }
   }
   ```

**Example Response Data:**
```typescript
// Forex market example
{
  symbol: "EUR/USD",
  type: "forex",
  name: "EUR/USD",
  currency: "EUR",
  pair: "USD",
  exchange: null,
  metadata: { currency_group: "Major", currency_base: "EUR", currency_quote: "USD" },
  status: false
}

// Stock market example
{
  symbol: "AAPL",
  type: "stocks",
  name: "Apple Inc",
  currency: "USD",
  pair: null,
  exchange: "NASDAQ",
  metadata: { country: "United States", type: "Common Stock", mic_code: "XNAS" },
  status: false
}

// Index example
{
  symbol: "SPX",
  type: "indices",
  name: "S&P 500",
  currency: "USD",
  pair: null,
  exchange: "United States",
  metadata: { country: "United States" },
  status: false
}
```

**Permission:** `Access TWD Market Management`

#### `structure.get.ts`
**GET /api/admin/ext/twd/market/structure**
- Returns form structure for editing TWD markets
- Used by frontend form builder
- Includes fields: `isTrending` (boolean), `isHot` (boolean)
- Permission: `Access TWD Market Management`

#### `[id]/index.get.ts`
**GET /api/admin/ext/twd/market/:id**
- Retrieves market details by ID
- Returns full market object with all fields
- Permission: `Access TWD Market Management`

#### `[id]/index.put.ts`
**PUT /api/admin/ext/twd/market/:id**
- Updates a specific TWD market
- Allows updating: `name`, `isTrending`, `isHot`, `metadata`
- Does NOT allow updating: `symbol`, `type`, `currency`, `pair`, `exchange`, `status`
- Permission: `Access TWD Market Management`

```json
// Request body example
{
  "name": "Euro vs US Dollar",
  "isTrending": true,
  "isHot": false,
  "metadata": {
    "description": "Most traded forex pair"
  }
}
```

#### `[id]/index.del.ts`
**DELETE /api/admin/ext/twd/market/:id**
- Deletes a specific TWD market
- **CASCADE:** Also deletes all related `twdOrder` records
- Permission: `Access TWD Market Management`

#### `[id]/status.put.ts`
**PUT /api/admin/ext/twd/market/:id/status**
- Enables/disables a specific TWD market
- When a market is disabled, users cannot trade it
- When enabled, market appears in user trading interface
- Permission: `Access TWD Market Management`

```json
// Request body
{
  "status": true  // true = enable, false = disable
}
```

---

## 📊 API Summary Table

### Provider APIs

| Method | Endpoint | Purpose | Mirrors |
|--------|----------|---------|---------|
| GET | `/api/admin/ext/twd/provider` | List providers | `exchange/provider/index.get.ts` |
| GET | `/api/admin/ext/twd/provider/:id` | Get provider + test connection | `exchange/provider/[id]/index.get.ts` |
| PUT | `/api/admin/ext/twd/provider/:id/status` | Enable/disable provider | `exchange/provider/[id]/status.put.ts` |

### Market APIs

| Method | Endpoint | Purpose | Mirrors |
|--------|----------|---------|---------|
| GET | `/api/admin/ext/twd/market` | List markets | `exchange/market/index.get.ts` |
| GET | `/api/admin/ext/twd/market/import` | Import from TwelveData | `exchange/market/import.get.ts` |
| GET | `/api/admin/ext/twd/market/structure` | Get form structure | `exchange/market/structure.get.ts` |
| GET | `/api/admin/ext/twd/market/:id` | Get market details | New endpoint |
| PUT | `/api/admin/ext/twd/market/:id` | Update market | New endpoint |
| DELETE | `/api/admin/ext/twd/market/:id` | Delete market | New endpoint |
| PUT | `/api/admin/ext/twd/market/:id/status` | Enable/disable market | `exchange/market/[id]/status.put.ts` |

---

## 🔄 Admin Workflow

The admin workflow exactly mirrors the existing exchange pattern:

### Step 1: Enable Provider
```bash
# 1. List providers
GET /api/admin/ext/twd/provider

# 2. Test connection
GET /api/admin/ext/twd/provider/{id}
# Returns connection status

# 3. Enable provider (disables all others automatically)
PUT /api/admin/ext/twd/provider/{id}/status
Body: { "status": true }
```

### Step 2: Import Markets
```bash
# Import all forex, stocks, and indices from TwelveData
GET /api/admin/ext/twd/market/import
# Returns: { "message": "...", "imported": { "forex": 120, "stocks": 5000, "indices": 50 } }
```

### Step 3: Manage Markets
```bash
# List all imported markets
GET /api/admin/ext/twd/market?type=forex&status=false

# Enable specific markets
PUT /api/admin/ext/twd/market/{id}/status
Body: { "status": true }

# Mark as trending/hot
PUT /api/admin/ext/twd/market/{id}
Body: { "isTrending": true, "isHot": false }
```

### Step 4: Users Can Trade
Once markets are enabled (`status: true`), they will appear in user trading interfaces.

---

## 🔐 Security & Validation

### Environment Variables Required:
```bash
TWD_API_KEY=your_twelvedata_api_key
TWD_BASE_URL=https://api.twelvedata.com  # Optional, defaults to this
TWD_WS_URL=wss://ws.twelvedata.com/v1    # For WebSocket (Phase 5)
```

### Permission Checks:
- All endpoints require authentication (`requiresAuth: true`)
- Provider APIs require: `Access TWD Provider Management`
- Market APIs require: `Access TWD Market Management`

### Business Rules Enforced:
1. **Single Active Provider:** Only ONE TWD provider can have `status: true`
2. **Provider Required for Import:** Cannot import markets unless a provider is enabled
3. **Cascade Deletes:** Deleting a market removes all related orders
4. **Status Preservation:** Re-importing markets preserves their enabled/disabled status

---

## 🎯 Differences from Exchange Pattern

| Feature | Exchange | TWD |
|---------|----------|-----|
| Provider | Uses CCXT library | Uses TwelveData API |
| Market Types | Spot (crypto pairs) | Forex, Stocks, Indices |
| Symbol Format | `BTC/USDT` | `EUR/USD`, `AAPL`, `SPX` |
| Import Source | CCXT `exchange.loadMarkets()` | TwelveData REST API |
| Market Fields | `currency`, `pair` | `currency`, `pair`, `exchange`, `type` |
| Trading Mode | Real trading | **Paper trading only** |

---

## ✅ Verification Checklist

Before proceeding to Phase 3, verify:

- [ ] Permissions seeder updated and run (`pnpm seed`)
- [ ] Super Admin role has new TWD permissions
- [ ] Provider APIs return 200 OK
- [ ] Provider enable/disable works (only one active)
- [ ] Provider connection test works (tests TwelveData API)
- [ ] Market import fetches forex, stocks, and indices
- [ ] Markets saved to database with correct types
- [ ] Market enable/disable works
- [ ] Market update works (isTrending, isHot)
- [ ] Market delete cascades to orders
- [ ] All endpoints require proper permissions

---

## 🧪 Testing Commands

```bash
# 1. Test provider list
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/admin/ext/twd/provider

# 2. Test provider connection
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/admin/ext/twd/provider/{id}

# 3. Enable provider
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": true}' \
  http://localhost:3000/api/admin/ext/twd/provider/{id}/status

# 4. Import markets
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/admin/ext/twd/market/import

# 5. List markets
curl -H "Authorization: Bearer {token}" \
  "http://localhost:3000/api/admin/ext/twd/market?type=forex&perPage=10"

# 6. Enable market
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": true}' \
  http://localhost:3000/api/admin/ext/twd/market/{id}/status
```

---

## 🚀 Ready for Phase 3

Phase 2 is complete. The admin can now:
1. ✅ Enable TwelveData provider
2. ✅ Import forex, stocks, and indices from TwelveData API
3. ✅ Enable/disable specific markets
4. ✅ Mark markets as trending or hot
5. ✅ Manage market metadata

**Next Phase:** User Backend APIs
- Market data endpoints (GET markets for users)
- Order creation (paper trading)
- Order management (view/cancel orders)
- Wallet initialization with demo balance

---

## 📝 Notes

- All APIs follow the exact pattern of existing exchange APIs
- Database-driven market management (no hardcoded symbols)
- Transaction safety for critical operations (provider status, market import)
- Proper error handling with meaningful messages
- OpenAPI metadata for automatic documentation generation
- Permission-based access control
- Paranoid mode for soft deletes

**Files Modified:**
- `seeders/20240402234643-permissions.js` (added 3 permissions)

**Files Created:**
- `backend/api/admin/ext/twd/provider/utils.ts`
- `backend/api/admin/ext/twd/provider/index.get.ts`
- `backend/api/admin/ext/twd/provider/[id]/index.get.ts`
- `backend/api/admin/ext/twd/provider/[id]/status.put.ts`
- `backend/api/admin/ext/twd/market/utils.ts`
- `backend/api/admin/ext/twd/market/index.get.ts`
- `backend/api/admin/ext/twd/market/import.get.ts`
- `backend/api/admin/ext/twd/market/structure.get.ts`
- `backend/api/admin/ext/twd/market/[id]/index.get.ts`
- `backend/api/admin/ext/twd/market/[id]/index.put.ts`
- `backend/api/admin/ext/twd/market/[id]/index.del.ts`
- `backend/api/admin/ext/twd/market/[id]/status.put.ts`

**Total:** 12 new API files + 1 seeder update
