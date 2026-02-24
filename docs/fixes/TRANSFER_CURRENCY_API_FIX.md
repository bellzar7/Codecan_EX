# Transfer Currency API Fix
## Supporting FOREX, STOCK, INDEX in Transfer Flow

**Date:** 2025-01-25
**Issue:** Frontend transfer wizard fails with "Invalid wallet type" when selecting FOREX/STOCK/INDEX as target wallet type
**Root Cause:** Currency API endpoint doesn't recognize new wallet types (FOREX, STOCK, INDEX)

---

## Problem

When opening `/user/wallet/transfer` and selecting "Transfer Between Wallets", the frontend calls:

```
GET /api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=FOREX
```

**Backend response:**
```json
{
  "statusCode": 400,
  "message": "Invalid wallet type"
}
```

This error occurred because the `handleTransfer` function in `backend/api/finance/currency/index.get.ts` only recognized 4 wallet types:
- FIAT
- SPOT
- ECO
- FUTURES

The new wallet types (FOREX, STOCK, INDEX) were rejected with a generic error.

---

## Solution

Updated `backend/api/finance/currency/index.get.ts` to:

### 1. Accept All 7 Wallet Types ✅

**Added validation:**
```typescript
const validWalletTypes = ["FIAT", "SPOT", "ECO", "FUTURES", "FOREX", "STOCK", "INDEX"];

if (!validWalletTypes.includes(walletType)) {
  throw createError(
    400,
    `Invalid source wallet type: ${walletType}. Must be one of: ${validWalletTypes.join(", ")}`
  );
}

if (!validWalletTypes.includes(targetWalletType)) {
  throw createError(
    400,
    `Invalid target wallet type: ${targetWalletType}. Must be one of: ${validWalletTypes.join(", ")}`
  );
}
```

**Result:** Clear, descriptive error messages instead of generic "Invalid wallet type"

### 2. Explicitly Reject TWD_PAPER ✅

**Added check:**
```typescript
if (walletType === "TWD_PAPER" || targetWalletType === "TWD_PAPER") {
  throw createError(
    400,
    "TWD_PAPER is a deprecated wallet type. Please use SPOT, FOREX, STOCK, or INDEX instead."
  );
}
```

**Result:** TWD_PAPER explicitly blocked with helpful message

### 3. Return Correct Currencies Per Wallet Type ✅

**Currency mapping:**

| Wallet Type | Currency Source | Currencies Available | Example |
|------------|----------------|---------------------|---------|
| FIAT | `currency` table | USD, EUR, GBP, etc. | Fiat currencies |
| SPOT | `exchangeCurrency` table | BTC, ETH, USDT, etc. | Cryptocurrency |
| ECO | `ecosystemToken` table | Custom tokens | Ecosystem tokens |
| FUTURES | `ecosystemToken` table | Custom tokens | Futures contracts |
| **FOREX** | `exchangeCurrency` table | USD, USDT, EUR, etc. | **Forex quote currencies** |
| **STOCK** | `exchangeCurrency` table | USD, USDT, etc. | **Stock quote currencies** |
| **INDEX** | `exchangeCurrency` table | USD, USDT, etc. | **Index quote currencies** |

**Implementation:**
```typescript
switch (targetWalletType) {
  case "FIAT":
    // Use currency table (fiat currencies)
    const fiatCurrencies = await models.currency.findAll({ where: { status: true } });
    break;

  case "SPOT":
  case "FOREX":
  case "STOCK":
  case "INDEX":
    // Use exchangeCurrency table (standard exchange currencies)
    const spotCurrencies = await models.exchangeCurrency.findAll({ where: { status: true } });
    break;

  case "ECO":
  case "FUTURES":
    // Use ecosystemToken table (custom tokens)
    const ecoCurrencies = await models.ecosystemToken.findAll({ where: { status: true } });
    break;
}
```

**Why FOREX/STOCK/INDEX use exchangeCurrency:**
- These wallets hold standard currencies (USD, USDT, etc.)
- They are quote currencies for trading markets
- They are NOT custom ecosystem tokens
- They share the same currency pool as SPOT wallets

---

## How Transfer Wizard Works

### Frontend Flow

```
User Action: Click "Transfer Between Wallets"
     ↓
Step 1: Select Transfer Type
     ↓
Step 2: Select Source Wallet Type (from)
     ↓
     Frontend calls: GET /api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=FOREX
     ↓
     Backend returns: { from: [...], to: [...] }
     ↓
Step 3: Select Currency from "from" list
     ↓
Step 4: Enter amount and confirm
     ↓
     Frontend calls: POST /api/finance/transfer
     ↓
     Backend validates via transfer matrix
     ↓
     Transfer completed
```

### API Call Breakdown

**Step 2 → Step 3: Get Available Currencies**

When user selects source and target wallet types, frontend calls:

```http
GET /api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=FOREX
```

**Backend response:**
```json
{
  "from": [
    { "value": "BTC", "label": "BTC - 0.5" },
    { "value": "ETH", "label": "ETH - 2.3" },
    { "value": "USDT", "label": "USDT - 1000" }
  ],
  "to": [
    { "value": "USD", "label": "USD - US Dollar" },
    { "value": "USDT", "label": "USDT - Tether USD" },
    { "value": "EUR", "label": "EUR - Euro" }
  ]
}
```

**What this means:**
- `from`: Currencies user currently has in SPOT wallet (with balances)
- `to`: Currencies available in FOREX wallet (from exchangeCurrency table)
- User can select any currency from `from` list to transfer

**Step 4: Execute Transfer**

When user submits transfer:

```http
POST /api/finance/transfer
Body: {
  "from": "SPOT",
  "to": "FOREX",
  "currency": "USDT",
  "amount": 100
}
```

**Backend validation:**
1. Check transfer matrix: `isValidTransferPath("SPOT", "FOREX")` → ✅ Allowed
2. Check user has SPOT wallet with USDT and balance ≥ 100
3. Check user has (or create) FOREX wallet with USDT
4. Execute transfer: Deduct from SPOT, add to FOREX
5. Create transaction record

---

## What Changed

### File: `backend/api/finance/currency/index.get.ts`

**Function:** `handleTransfer` (lines 161-253)

**Changes:**

1. **Added wallet type validation** (lines 162-177)
   - Validates source and target wallet types
   - Provides descriptive error messages
   - Accepts all 7 wallet types: FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX

2. **Added TWD_PAPER rejection** (lines 179-185)
   - Explicitly rejects TWD_PAPER with helpful message
   - Suggests alternatives: SPOT, FOREX, STOCK, INDEX

3. **Extended currency mapping** (lines 214-230)
   - Added FOREX, STOCK, INDEX to SPOT case
   - All four types use `exchangeCurrency` table
   - Returns USD, USDT, BTC, ETH, and other exchange currencies

4. **Improved error messages** (lines 246-249)
   - Changed from generic "Invalid wallet type" to specific error
   - Includes unsupported wallet type name in error message

---

## What Was NOT Changed

### Deposit Flow ✅
**File:** `backend/api/finance/currency/index.get.ts` → `handleDeposit`

**Behavior:** Still only accepts FIAT, SPOT, ECO (lines 77-81)

**Reason:** FOREX, STOCK, INDEX are internal-only and MUST NOT support direct deposits

**Wallet type mapping:**
```typescript
const walletTypeToModel = {
  FIAT: async (where) => models.currency.findAll({ where }),
  SPOT: async (where) => models.exchangeCurrency.findAll({ where }),
  ECO: async (where) => models.ecosystemToken.findAll({ where }),
  // FOREX, STOCK, INDEX intentionally excluded
};
```

### Withdraw Flow ✅
**File:** `backend/api/finance/currency/index.get.ts` → `handleWithdraw`

**Behavior:** Accepts any wallet type with balance > 0 (lines 143-159)

**Note:** This is correct. The function returns available currencies, but actual withdraw validation happens in withdraw endpoint which already blocks FOREX/STOCK/INDEX.

### Transfer Matrix ✅
**File:** `backend/api/finance/transfer/matrix.ts`

**Behavior:** No changes needed

**Reason:** Matrix already supports all 7 wallet types and correctly defines allowed transfers

### Transfer POST Handler ✅
**File:** `backend/api/finance/transfer/index.post.ts`

**Behavior:** No changes needed

**Reason:** Already updated in previous phase to use centralized transfer matrix

---

## Testing Guide

### Prerequisites

1. **Start application:**
```bash
pnpm dev
# OR for production
pnpm start
```

2. **Login to application:**
- Create test user or use existing account
- Ensure user has wallets with balances:
  - SPOT wallet with BTC, ETH, or USDT
  - FIAT wallet with USD (optional)

### Test 1: Currency API - SPOT → FOREX

**Request:**
```bash
curl -X GET 'http://localhost:4000/api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=FOREX' \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "from": [
    { "value": "BTC", "label": "BTC - 0.5" },
    { "value": "USDT", "label": "USDT - 1000" }
  ],
  "to": [
    { "value": "USD", "label": "USD - US Dollar" },
    { "value": "USDT", "label": "USDT - Tether USD" }
  ]
}
```

**Status:** ✅ 200 OK (previously 400 error)

### Test 2: Currency API - SPOT → STOCK

**Request:**
```bash
curl -X GET 'http://localhost:4000/api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=STOCK' \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "from": [
    { "value": "USDT", "label": "USDT - 1000" }
  ],
  "to": [
    { "value": "USD", "label": "USD - US Dollar" },
    { "value": "USDT", "label": "USDT - Tether USD" }
  ]
}
```

**Status:** ✅ 200 OK (previously 400 error)

### Test 3: Currency API - SPOT → INDEX

**Request:**
```bash
curl -X GET 'http://localhost:4000/api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=INDEX' \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "from": [
    { "value": "USDT", "label": "USDT - 1000" }
  ],
  "to": [
    { "value": "USD", "label": "USD - US Dollar" },
    { "value": "USDT", "label": "USDT - Tether USD" }
  ]
}
```

**Status:** ✅ 200 OK (previously 400 error)

### Test 4: Currency API - FIAT → FOREX

**Request:**
```bash
curl -X GET 'http://localhost:4000/api/finance/currency?action=transfer&walletType=FIAT&targetWalletType=FOREX' \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "from": [
    { "value": "USD", "label": "USD - 1000" }
  ],
  "to": [
    { "value": "USD", "label": "USD - US Dollar" },
    { "value": "USDT", "label": "USDT - Tether USD" }
  ]
}
```

**Status:** ✅ 200 OK

### Test 5: TWD_PAPER Rejection

**Request:**
```bash
curl -X GET 'http://localhost:4000/api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=TWD_PAPER' \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "TWD_PAPER is a deprecated wallet type. Please use SPOT, FOREX, STOCK, or INDEX instead."
}
```

**Status:** ✅ 400 Bad Request (with descriptive message)

### Test 6: Invalid Wallet Type

**Request:**
```bash
curl -X GET 'http://localhost:4000/api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=INVALID' \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid target wallet type: INVALID. Must be one of: FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX"
}
```

**Status:** ✅ 400 Bad Request (with descriptive message)

### Test 7: Frontend Transfer Wizard

**Manual UI Test:**

1. **Open transfer page:**
   - Navigate to `/user/wallet/transfer`
   - Click "Transfer Between Wallets"

2. **Select source wallet type:**
   - Select "Spot" from dropdown
   - Click "Continue"

   **Expected:** ✅ No error, proceeds to next step

3. **Select target wallet type:**
   - Select "Forex" (or "Stock" or "Index") from dropdown
   - Click "Continue"

   **Expected:** ✅ Currency dropdown is populated with available currencies

4. **Select currency and amount:**
   - Select currency from dropdown (e.g., "USDT")
   - Enter amount (e.g., 100)
   - Click "Transfer"

   **Expected:** ✅ Transfer executes successfully

5. **Verify transfer:**
   - Check SPOT wallet: Balance should decrease by 100 USDT
   - Check FOREX wallet: Balance should increase by 100 USDT

   **Expected:** ✅ Balances updated correctly

### Test 8: Deposit Flow Still Restricted

**Request:**
```bash
curl -X GET 'http://localhost:4000/api/finance/currency?action=deposit&walletType=FOREX' \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid wallet type"
}
```

**Status:** ✅ 400 Bad Request (FOREX not allowed for deposits)

**Reason:** Deposit flow correctly restricted to FIAT, SPOT, ECO only

### Test 9: Complete Transfer Flow

**End-to-end test:**

```bash
# 1. Get available currencies
curl -X GET 'http://localhost:4000/api/finance/currency?action=transfer&walletType=SPOT&targetWalletType=FOREX' \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Response: { "from": [...], "to": [...] }

# 2. Execute transfer
curl -X POST 'http://localhost:4000/api/finance/transfer' \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "SPOT",
    "to": "FOREX",
    "currency": "USDT",
    "amount": 100
  }'

# Response: { "message": "Transfer successful", ... }

# 3. Verify wallets
curl -X GET 'http://localhost:4000/api/finance/wallet' \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Response: Should show updated balances
```

**Expected:** ✅ All steps succeed, balances updated correctly

---

## Verification Checklist

After deployment, verify:

- ✅ `/user/wallet/transfer` page loads without errors
- ✅ Can select FOREX/STOCK/INDEX as target wallet type
- ✅ Currency dropdown populates correctly for each wallet type
- ✅ Can successfully transfer SPOT → FOREX
- ✅ Can successfully transfer SPOT → STOCK
- ✅ Can successfully transfer SPOT → INDEX
- ✅ Can successfully transfer FIAT → FOREX/STOCK/INDEX
- ✅ TWD_PAPER is rejected with clear error message
- ✅ Invalid wallet types show descriptive error messages
- ✅ Deposit flow still blocks FOREX/STOCK/INDEX
- ✅ Withdraw flow still blocks FOREX/STOCK/INDEX (via withdraw endpoint)
- ✅ Transfer matrix validation still enforced
- ✅ No breaking changes to existing transfers (FIAT ↔ SPOT, etc.)

---

## Summary of Changes

**Files Modified:** 1
- `backend/api/finance/currency/index.get.ts`

**Functions Updated:** 1
- `handleTransfer` (lines 161-253)

**Lines Changed:** ~95 lines

**Breaking Changes:** None

**Backward Compatibility:** ✅ Fully compatible

**Deployment Required:** Yes (backend restart needed)

**Database Migration:** No

**Frontend Changes:** No (frontend already supports all wallet types)

---

## Related Documentation

- `backend/api/finance/transfer/matrix.ts` - Transfer matrix validation rules
- `backend/api/finance/transfer/index.post.ts` - Transfer POST handler
- `PHASE_5_6_DEPLOYMENT_CHECKLIST.md` - Full deployment guide
- `PHASE_5_6_IMPLEMENTATION_SUMMARY.md` - Complete Phase 5+6 documentation

---

## Troubleshooting

### Issue: "No SPOT wallets found to transfer from"

**Cause:** User has no SPOT wallets with balance > 0

**Solution:**
1. Create SPOT wallet with currency (deposit or receive)
2. Ensure balance > 0
3. Retry transfer

### Issue: Currency dropdown is empty

**Cause:** No currencies configured in database

**Solution:**
1. Check `exchangeCurrency` table has active currencies
2. Run: `SELECT * FROM exchangeCurrency WHERE status = 1;`
3. Add currencies if missing

### Issue: Transfer fails with "Invalid transfer path"

**Cause:** Transfer matrix doesn't allow this transfer

**Solution:**
1. Check transfer matrix in `backend/api/finance/transfer/matrix.ts`
2. Verify the transfer path is allowed
3. Example: FOREX → FIAT is NOT allowed, must go FOREX → SPOT → FIAT

### Issue: "TWD_PAPER is a deprecated wallet type"

**Cause:** Code or database still references TWD_PAPER

**Solution:**
1. Run Phase 5+6 migrations to remove TWD_PAPER
2. Check database: `SELECT COUNT(*) FROM wallet WHERE type = 'TWD_PAPER';`
3. Should be 0 (all migrated to SPOT)

---

## Next Steps

1. **Deploy fix:**
   - Restart backend: `pnpm stop && pnpm start`
   - No database migration needed

2. **Test in production:**
   - Follow testing guide above
   - Verify all transfer flows work

3. **Monitor logs:**
   - Check for any currency API errors
   - Monitor transfer success rate

4. **User feedback:**
   - Collect feedback on transfer UX
   - Monitor support tickets for transfer issues

---

**Fix Complete!** 🎉

The transfer currency API now fully supports all 7 wallet types. Users can transfer funds from SPOT/FIAT to FOREX/STOCK/INDEX wallets without errors.
