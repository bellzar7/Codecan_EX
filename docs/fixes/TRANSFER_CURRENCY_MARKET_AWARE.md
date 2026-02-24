# Transfer Currency API - Market-Aware Implementation

## Overview

The transfer currency API (`GET /api/finance/currency?action=transfer`) now derives available currencies from **actual market data** for FOREX, STOCK, and INDEX wallet types, instead of reusing generic Spot currency lists.

This ensures that the transfer wizard only offers currencies that are actually supported by the target wallet type's trading markets.

---

## Currency Sources by Wallet Type

### Summary Table

| Wallet Type | Data Source | Table | Logic |
|-------------|-------------|-------|-------|
| **FIAT** | Fiat currencies | `currency` | All enabled fiat currencies (USD, EUR, GBP, etc.) |
| **SPOT** | Exchange currencies | `exchangeCurrency` | All enabled cryptocurrencies (BTC, ETH, USDT, etc.) |
| **ECO** | Ecosystem tokens | `ecosystemToken` | All enabled ecosystem tokens |
| **FUTURES** | Ecosystem tokens | `ecosystemToken` | All enabled ecosystem tokens |
| **FOREX** | **FOREX markets** | `twdMarket` (type='forex') | Currencies extracted from actual FOREX markets |
| **STOCK** | **STOCK markets** | `twdMarket` (type='stocks') | Currencies extracted from actual STOCK markets |
| **INDEX** | **INDEX markets** | `twdMarket` (type='indices') | Currencies extracted from actual INDEX markets |

---

## Implementation Details

### Market Currency Extraction

For FOREX, STOCK, and INDEX wallet types, currencies are derived from the `twd_market` table using the following logic:

```typescript
async function getTwdMarketCurrencies(marketType: "forex" | "stocks" | "indices"): Promise<string[]> {
  const markets = await models.twdMarket.findAll({
    where: { type: marketType, status: true },
    attributes: ["symbol", "currency"],
  });

  const currencySet = new Set<string>();

  for (const market of markets) {
    // Add quote currency from currency field
    if (market.currency) {
      currencySet.add(market.currency.toUpperCase());
    }

    // Extract base currency from symbol if it's a pair (contains "/")
    if (market.symbol && market.symbol.includes("/")) {
      const [baseCurrency] = market.symbol.split("/");
      if (baseCurrency) {
        currencySet.add(baseCurrency.toUpperCase());
      }
    }
  }

  return Array.from(currencySet).sort();
}
```

### Market Type Mapping

| Wallet Type | Market Type (twdMarket.type) |
|-------------|------------------------------|
| FOREX | `"forex"` |
| STOCK | `"stocks"` |
| INDEX | `"indices"` |

### Examples

#### FOREX Markets

**Markets in Database:**
```sql
SELECT symbol, currency FROM twd_market WHERE type = 'forex' AND status = true;
```

| symbol | currency |
|--------|----------|
| EUR/USD | USD |
| GBP/JPY | JPY |
| AUD/CAD | CAD |

**Extracted Currencies:** `["AUD", "CAD", "EUR", "GBP", "JPY", "USD"]`

**Why:**
- EUR (base from EUR/USD)
- USD (quote from EUR/USD)
- GBP (base from GBP/JPY)
- JPY (quote from GBP/JPY)
- AUD (base from AUD/CAD)
- CAD (quote from AUD/CAD)

#### STOCK Markets

**Markets in Database:**
```sql
SELECT symbol, currency FROM twd_market WHERE type = 'stocks' AND status = true;
```

| symbol | currency |
|--------|----------|
| AAPL | USD |
| TSLA | USD |
| TSM | TWD |

**Extracted Currencies:** `["TWD", "USD"]`

**Why:**
- USD (quote from AAPL, TSLA)
- TWD (quote from TSM)

#### INDEX Markets

**Markets in Database:**
```sql
SELECT symbol, currency FROM twd_market WHERE type = 'indices' AND status = true;
```

| symbol | currency |
|--------|----------|
| SPX | USD |
| NDX | USD |
| BTC/USD | USD |

**Extracted Currencies:** `["BTC", "USD"]`

**Why:**
- BTC (base from BTC/USD)
- USD (quote from SPX, NDX, BTC/USD)

---

## How the Transfer Wizard Uses This API

### Request Flow

1. **User selects source wallet type** (e.g., FIAT)
2. **User selects target wallet type** (e.g., FOREX)
3. **Frontend makes request:**
   ```
   GET /api/finance/currency?action=transfer&walletType=FIAT&targetWalletType=FOREX
   ```
4. **Backend responds with:**
   ```json
   {
     "from": [
       { "value": "USD", "label": "USD - 1000" },
       { "value": "EUR", "label": "EUR - 500" }
     ],
     "to": [
       { "value": "AUD", "label": "AUD" },
       { "value": "CAD", "label": "CAD" },
       { "value": "EUR", "label": "EUR" },
       { "value": "GBP", "label": "GBP" },
       { "value": "JPY", "label": "JPY" },
       { "value": "USD", "label": "USD" }
     ]
   }
   ```

### Frontend Store

The transfer wizard is implemented in:
- **Store:** `src/stores/user/wallet/transfer.ts`
- **Page:** `/user/wallet/transfer`

**Key Store Method:**
```typescript
fetchCurrencies: async () => {
  const { selectedWalletType, selectedTargetWalletType, transferType } = get();

  const targetWalletType = transferType.value === "client"
    ? selectedWalletType
    : selectedTargetWalletType;

  const { data, error } = await $fetch({
    url: `${endpoint}/currency?action=transfer&walletType=${selectedWalletType.value}&targetWalletType=${targetWalletType.value}`,
    silent: true,
  });

  if (!error) {
    set((state) => {
      state.currencies = data; // { from: [...], to: [...] }
      state.step = 4;
    });
  }
}
```

---

## Transfer Matrix Rules

The transfer currency API respects the existing transfer matrix rules defined in `src/utils/transfer-matrix.ts`:

```typescript
export const TRANSFER_MATRIX: Record<
  TransferableWalletType,
  TransferableWalletType[]
> = {
  FIAT: ["SPOT", "ECO", "FOREX", "STOCK", "INDEX"],
  SPOT: ["FIAT", "ECO", "FUTURES", "FOREX", "STOCK", "INDEX"],
  ECO: ["FIAT", "SPOT", "FUTURES"],
  FUTURES: ["SPOT", "ECO"],
  FOREX: ["FIAT", "SPOT"],
  STOCK: ["FIAT", "SPOT"],
  INDEX: ["FIAT", "SPOT"],
};
```

**The API only determines WHICH currencies are available** for allowed wallet type pairs. It does NOT change WHICH wallet types can transfer to each other.

---

## No Hardcoded Lists

### ❌ Before (Generic Assumption)

```typescript
case "FOREX":
case "STOCK":
case "INDEX":
  // WRONG: Assumes all FOREX/STOCK/INDEX use Spot currencies
  const spotCurrencies = await models.exchangeCurrency.findAll({
    where: { status: true },
  });
  targetCurrencies = spotCurrencies.map(/* ... */);
  break;
```

**Problem:** Returns BTC, ETH, USDT, etc. for FOREX transfers even if no FOREX markets use these currencies.

### ✅ After (Market-Aware)

```typescript
case "FOREX":
  // CORRECT: Derives currencies from actual FOREX markets
  const forexCurrencies = await getTwdMarketCurrencies("forex");
  targetCurrencies = forexCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));
  break;
```

**Benefit:** Only returns currencies that actually exist in FOREX markets (e.g., EUR, USD, GBP, JPY).

---

## Troubleshooting

### Issue: Currency Missing from Transfer "To" List

**Example:** "I want to transfer FIAT → FOREX but EUR is not in the target currency list."

**Diagnosis:**

1. **Check if EUR exists in any FOREX market:**
   ```sql
   SELECT * FROM twd_market
   WHERE type = 'forex'
     AND status = true
     AND (symbol LIKE 'EUR/%' OR currency = 'EUR');
   ```

2. **If no results:**
   - EUR is not used in any enabled FOREX market
   - You need to add a FOREX market that uses EUR (e.g., EUR/USD)

3. **If results exist but EUR still missing:**
   - Check that market `status = true` (enabled)
   - Verify the market symbol format (should be "BASE/QUOTE" for pairs)

### Issue: Wrong Currencies Returned

**Example:** "FOREX transfer shows BTC, ETH, etc. (Spot currencies) instead of FOREX currencies."

**Diagnosis:**

1. **Check backend logs** for the API response
2. **Verify the request includes correct targetWalletType:**
   ```
   GET /api/finance/currency?action=transfer&walletType=FIAT&targetWalletType=FOREX
   ```
3. **Ensure backend code** uses `getTwdMarketCurrencies("forex")` not `exchangeCurrency` table

### Issue: Empty "To" List for FOREX/STOCK/INDEX

**Example:** "Transfer to FOREX shows no target currencies."

**Diagnosis:**

1. **Check if any markets exist for that type:**
   ```sql
   SELECT COUNT(*) FROM twd_market WHERE type = 'forex' AND status = true;
   ```

2. **If count = 0:**
   - No FOREX markets are enabled
   - Import FOREX markets from TwelveData: `GET /api/admin/ext/twd/market/import`
   - Or manually create FOREX markets in admin panel

3. **If markets exist but currencies are NULL:**
   - Ensure market records have valid `currency` and `symbol` values
   - Re-import markets to fix data

---

## Testing Guide

### Test 1: FIAT → FOREX Transfer

**Setup:**
1. Enable FOREX markets: Import EUR/USD, GBP/JPY from TwelveData
2. Create FIAT wallet with USD balance
3. Navigate to `/user/wallet/transfer`

**Steps:**
1. Select "Transfer Between Wallets"
2. Select source: **FIAT**
3. Select target: **FOREX**
4. Click Continue

**Expected Request:**
```
GET /api/finance/currency?action=transfer&walletType=FIAT&targetWalletType=FOREX
```

**Expected Response:**
```json
{
  "from": [
    { "value": "USD", "label": "USD - 1000" }
  ],
  "to": [
    { "value": "EUR", "label": "EUR" },
    { "value": "GBP", "label": "GBP" },
    { "value": "JPY", "label": "JPY" },
    { "value": "USD", "label": "USD" }
  ]
}
```

**Why:**
- `from`: User has USD FIAT wallet
- `to`: EUR, USD (from EUR/USD), GBP, JPY (from GBP/JPY)

---

### Test 2: SPOT → STOCK Transfer

**Setup:**
1. Enable STOCK markets: Import AAPL, TSLA (both use USD)
2. Create SPOT wallet with BTC balance

**Steps:**
1. Select source: **SPOT**
2. Select target: **STOCK**

**Expected Request:**
```
GET /api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=STOCK
```

**Expected Response:**
```json
{
  "from": [
    { "value": "BTC", "label": "BTC - 0.5" }
  ],
  "to": [
    { "value": "USD", "label": "USD" }
  ]
}
```

**Why:**
- `from`: User has BTC SPOT wallet
- `to`: Only USD (AAPL and TSLA markets use USD)

---

### Test 3: FIAT → INDEX Transfer with BTC Index

**Setup:**
1. Enable INDEX markets: Import BTC/USD index
2. Create FIAT wallet with USD balance

**Steps:**
1. Select source: **FIAT**
2. Select target: **INDEX**

**Expected Response:**
```json
{
  "from": [
    { "value": "USD", "label": "USD - 500" }
  ],
  "to": [
    { "value": "BTC", "label": "BTC" },
    { "value": "USD", "label": "USD" }
  ]
}
```

**Why:**
- `to`: BTC (base from BTC/USD), USD (quote from BTC/USD)

---

### Test 4: Reverse Transfer (FOREX → FIAT)

**Setup:**
1. User has FOREX/EUR wallet with balance
2. FOREX markets: EUR/USD enabled

**Steps:**
1. Select source: **FOREX**
2. Select target: **FIAT**

**Expected Response:**
```json
{
  "from": [
    { "value": "EUR", "label": "EUR - 100" }
  ],
  "to": [
    { "value": "EUR", "label": "EUR - Euro" },
    { "value": "USD", "label": "USD - US Dollar" }
  ]
}
```

**Why:**
- `from`: User's FOREX wallets with balance > 0
- `to`: All enabled FIAT currencies from `currency` table

---

## File Changes Summary

### Modified Files

1. **`backend/api/finance/currency/index.get.ts`** (lines 161-309)
   - Added `getTwdMarketCurrencies()` helper function
   - Updated `handleTransfer()` to use market-aware currency extraction for FOREX, STOCK, INDEX
   - Added detailed inline comments explaining each wallet type's currency source

### Key Functions

#### `getTwdMarketCurrencies(marketType)`

**Purpose:** Extract unique currencies from markets of a given type

**Parameters:**
- `marketType`: "forex" | "stocks" | "indices"

**Returns:** `string[]` - Sorted array of unique currency codes

**Logic:**
1. Query `twdMarket` table filtered by `type` and `status=true`
2. Extract quote currency from `currency` field
3. Extract base currency from `symbol` field (if symbol contains "/")
4. Deduplicate using Set
5. Sort alphabetically

**Example:**
```typescript
const forexCurrencies = await getTwdMarketCurrencies("forex");
// Returns: ["AUD", "CAD", "EUR", "GBP", "JPY", "USD"]
```

---

## Integration with TWD System

This change integrates with the existing TwelveData (TWD) trading architecture:

- **Market Definition:** `models/twdMarket.ts` - Defines FOREX, STOCK, INDEX markets
- **Wallet Utilities:** `backend/api/ext/twd/utils.ts` - Maps market types to wallet types
- **Market Import:** `GET /api/admin/ext/twd/market/import` - Imports markets from TwelveData API
- **Order Placement:** Uses correct wallet type based on market type (FOREX markets → FOREX wallets)

### Wallet Type Mapping (from `backend/api/ext/twd/utils.ts`)

```typescript
export function getTwdWalletType(marketType: "forex" | "stocks" | "indices"): "FOREX" | "STOCK" | "INDEX" {
  switch (marketType) {
    case "forex":
      return "FOREX";
    case "stocks":
      return "STOCK";
    case "indices":
      return "INDEX";
  }
}
```

---

## Benefits

### ✅ Accuracy
- Transfer currency lists match actual available markets
- No misleading options (e.g., BTC in FOREX if no BTC FOREX pairs exist)

### ✅ Flexibility
- Supports any currency configuration based on imported markets
- No hardcoded assumptions about USD-only or specific symbols

### ✅ Consistency
- FOREX, STOCK, INDEX wallets only show currencies they can actually hold
- Aligns with wallet creation logic in `backend/api/ext/twd/utils.ts`

### ✅ Maintainability
- Single source of truth: `twd_market` table
- Adding new markets automatically updates transfer currency lists
- No manual configuration required

---

## Migration Notes

### Existing Behavior (Before This Change)

- FOREX/STOCK/INDEX transfers showed **all Spot currencies** (BTC, ETH, USDT, etc.)
- This was incorrect because these wallet types don't necessarily support all Spot currencies

### New Behavior (After This Change)

- FOREX transfers only show **currencies from FOREX markets** (EUR, USD, JPY, etc.)
- STOCK transfers only show **currencies from STOCK markets** (USD, TWD, etc.)
- INDEX transfers only show **currencies from INDEX markets** (USD, BTC, etc.)

### Impact on Existing Users

**No breaking changes** - only UI changes:
- Users may see **fewer options** in the target currency dropdown (which is correct)
- If a user previously could select BTC for FOREX transfer, they now won't see it (unless a BTC FOREX market exists)

**Data migration:** None required - existing wallets and balances are unchanged

---

## Related Documentation

- **Wallet Architecture:** `docs/WALLET_ARCHITECTURE_REDESIGN.md`
- **TWD Trading:** `TWD_TRADING_ARCHITECTURE.md`
- **Transfer Matrix:** `src/utils/transfer-matrix.ts`
- **TWD Market Import:** `TWD_IMPORT_FIX_FINAL.md`

---

## Changelog

### 2025-12-03 - Market-Aware Currency Lists

**Changed:**
- FOREX, STOCK, INDEX wallet types now derive target currencies from actual market data instead of reusing Spot currency lists

**Added:**
- `getTwdMarketCurrencies()` helper function to extract currencies from `twd_market` table
- Comprehensive inline documentation in `backend/api/finance/currency/index.get.ts`

**Fixed:**
- Transfer wizard showing incorrect currencies for FOREX/STOCK/INDEX target wallets

---

## Future Enhancements

### Potential Improvements

1. **Currency Metadata:** Include currency name/description in TWD market currencies (currently only shows code)
2. **Caching:** Cache market currency lists in Redis to reduce DB queries
3. **Market Status Sync:** Real-time updates when markets are enabled/disabled
4. **Validation:** Prevent transfers to currencies with no active markets (even if wallet exists)
