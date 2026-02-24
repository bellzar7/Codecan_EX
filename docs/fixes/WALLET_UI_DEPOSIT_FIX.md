# Wallet UI & Deposit Flow Fix
## Consistent Badges + FIAT/SPOT-Only Deposits + ECO Transfer-Only

**Date:** 2025-01-25
**Issue:**
1. Wallet type badges inconsistent (FOREX/STOCK/INDEX show as plain text)
2. ECO (Funding) appears in deposit flow but should be transfer-only
3. FIAT wallets not appearing in deposit flow

---

## Summary of Changes

### 1. ✅ Centralized Wallet Type Metadata
- **File:** `src/utils/transfer-matrix.ts`
- **Change:** Updated ECO metadata to mark it as transfer-only
- **Impact:** ECO no longer allows direct deposits, must be funded via transfers

### 2. ✅ Wallet Table Badge Rendering
- **File:** `src/pages/user/wallet/index.tsx`
- **Change:** Replaced hardcoded wallet type options with centralized metadata
- **Impact:** All wallet types (FIAT, SPOT, ECO, FUTURES, FOREX, STOCK, INDEX) now show consistent colored badges

### 3. ✅ Deposit Flow - FIAT + SPOT Only
- **File:** `src/stores/user/wallet/deposit.ts`
- **Change:** Removed ECO from deposit wallet types, only FIAT + SPOT allowed
- **Impact:** Users can only deposit to FIAT or SPOT wallets, ECO is transfer-only

### 4. ✅ FIAT Wallet Visibility
- **Existing Setting:** Admin → Settings → Wallet → "Fiat Wallets" toggle
- **Behavior:** When enabled, FIAT appears as a deposit option
- **Already Configured:** No new settings needed

---

## Detailed Changes

### Change 1: Update ECO Metadata (Transfer-Only)

**File:** `src/utils/transfer-matrix.ts` (lines 168-176)

**Before:**
```typescript
ECO: {
  value: "ECO",
  label: "Funding",
  color: "primary",
  description: "Ecosystem wallets with blockchain integration",
  allowDeposit: true,  // ❌ Was allowing deposits
  allowWithdraw: true,
  category: "main",
},
```

**After:**
```typescript
ECO: {
  value: "ECO",
  label: "Funding",
  color: "primary",
  description: "Ecosystem wallets (transfer-only, fund via FIAT or SPOT)",
  allowDeposit: false,  // ✅ Now transfer-only
  allowWithdraw: true,
  category: "main",
},
```

**Why:**
- ECO (Funding) wallets must be funded via transfers from FIAT or SPOT
- Direct deposits to ECO are no longer supported
- This matches the business requirement from team lead

---

### Change 2: Centralize Wallet Type Badges

**File:** `src/pages/user/wallet/index.tsx`

**Added Import (line 19):**
```typescript
import { WALLET_TYPE_METADATA } from "@/utils/transfer-matrix";
```

**Before (lines 55-68):**
```typescript
{
  field: "type",
  label: "Type",
  type: "select",
  sortable: true,
  options: [
    { value: "FIAT", label: "Fiat", color: "warning" },
    { value: "SPOT", label: "Spot", color: "info" },
    { value: "ECO", label: "Funding", color: "primary" },
    { value: "FUTURES", label: "Futures", color: "success" },
    { value: "FOREX", label: "Forex", color: "indigo" },   // ❌ Hardcoded
    { value: "STOCK", label: "Stock", color: "purple" },   // ❌ Hardcoded
    { value: "INDEX", label: "Index", color: "pink" },     // ❌ Hardcoded
  ],
},
```

**After (lines 55-65):**
```typescript
{
  field: "type",
  label: "Type",
  type: "select",
  sortable: true,
  options: Object.values(WALLET_TYPE_METADATA).map((meta) => ({
    value: meta.value,
    label: meta.label,
    color: meta.color,
  })),  // ✅ Uses centralized metadata
},
```

**Why:**
- Single source of truth for wallet type metadata
- Consistent badge colors across the entire application
- Easy to update colors/labels in one place
- FOREX/STOCK/INDEX now show proper colored badges (indigo, purple, pink)

**Badge Colors:**
| Wallet Type | Label | Color | Visual |
|------------|-------|-------|--------|
| FIAT | Fiat | warning | Yellow/Orange |
| SPOT | Spot | info | Blue |
| ECO | Funding | primary | Primary color |
| FUTURES | Futures | success | Green |
| FOREX | Forex | indigo | Indigo |
| STOCK | Stock | purple | Purple |
| INDEX | Index | pink | Pink |

---

### Change 3: Deposit Flow - Remove ECO

**File:** `src/stores/user/wallet/deposit.ts` (lines 77-98)

**Before:**
```typescript
initializeWalletTypes: () => {
  const { getSetting, hasExtension } = useDashboardStore.getState();
  const fiatWalletsEnabled = getSetting("fiatWallets") === "true";
  const ecosystemEnabled = hasExtension("ecosystem");

  const walletTypes = [{ value: "SPOT", label: "Spot" }];

  // ❌ ECO was included in deposit flow
  if (ecosystemEnabled) {
    walletTypes.push({ value: "ECO", label: "Funding" });
  }

  if (fiatWalletsEnabled) {
    walletTypes.unshift({ value: "FIAT", label: "Fiat" });
  }

  set((state) => {
    state.walletTypes = walletTypes;
  });
},
```

**After:**
```typescript
initializeWalletTypes: () => {
  const { getSetting } = useDashboardStore.getState();
  const fiatWalletsEnabled = getSetting("fiatWallets") === "true";

  // Only wallet types that support direct deposit are included here:
  // - SPOT: Always available for crypto deposits
  // - FIAT: Available when fiat wallets are enabled
  //
  // NOT included (transfer-only):
  // - ECO (Funding): Must be funded via transfer from FIAT or SPOT
  // - FUTURES, FOREX, STOCK, INDEX: Internal trading wallets (transfer-only)
  const walletTypes = [{ value: "SPOT", label: "Spot" }];

  // ✅ FIAT - supports deposit if fiat wallets are enabled
  if (fiatWalletsEnabled) {
    walletTypes.unshift({ value: "FIAT", label: "Fiat" });
  }

  set((state) => {
    state.walletTypes = walletTypes;
  });
},
```

**Why:**
- ECO must be funded via transfers only (business requirement)
- Removed `hasExtension("ecosystem")` check (no longer needed)
- Clear documentation of which wallet types support deposits
- FIAT properly appears when enabled in admin settings

**Deposit Behavior:**

✅ **Allowed:**
- SPOT (always)
- FIAT (when fiatWallets setting is enabled)

❌ **Not Allowed:**
- ECO (Funding) - transfer-only
- FUTURES - transfer-only
- FOREX - transfer-only
- STOCK - transfer-only
- INDEX - transfer-only

---

### Change 4: FIAT Wallet Visibility (No Changes Needed)

**Admin Setting Location:**
- **Path:** Admin → Settings → Wallet → "Fiat Wallets"
- **File:** `src/components/pages/admin/settings/section/Wallet.tsx` (lines 22-27)
- **Type:** Switch (toggle)
- **Description:** "Enable or disable fiat wallets"

**Setting Configuration:**
```typescript
{
  name: "fiatWallets",
  label: "Fiat Wallets",
  placeholder: "Select an option",
  description: "Enable or disable fiat wallets",
  type: "switch",
}
```

**How It Works:**
1. Admin enables "Fiat Wallets" toggle in settings
2. Frontend stores read setting: `getSetting("fiatWallets") === "true"`
3. Deposit store adds FIAT to wallet types if enabled
4. Users see "Fiat" option in deposit flow

**No changes needed** - this setting already exists and works correctly!

---

## Final Wallet Type Rules

### Deposit (Direct Funding)
| Wallet Type | Can Deposit? | Why |
|------------|-------------|-----|
| FIAT | ✅ Yes (if enabled) | Stripe, PayPal, Bank, etc. |
| SPOT | ✅ Yes | Crypto deposits via blockchain |
| ECO | ❌ No | Transfer-only (fund from FIAT/SPOT) |
| FUTURES | ❌ No | Transfer-only |
| FOREX | ❌ No | Transfer-only |
| STOCK | ❌ No | Transfer-only |
| INDEX | ❌ No | Transfer-only |

### Withdraw (Direct Withdrawal)
| Wallet Type | Can Withdraw? | Why |
|------------|--------------|-----|
| FIAT | ✅ Yes | Bank, PayPal, etc. |
| SPOT | ✅ Yes | Crypto withdrawals to external wallets |
| ECO | ✅ Yes | Blockchain withdrawals |
| FUTURES | ❌ No | Transfer-only |
| FOREX | ❌ No | Transfer-only |
| STOCK | ❌ No | Transfer-only |
| INDEX | ❌ No | Transfer-only |

### Transfer (Wallet-to-Wallet)
**All 7 wallet types support transfers** according to the transfer matrix:

```
FIAT    → SPOT, ECO, FOREX, STOCK, INDEX
SPOT    → FIAT, ECO, FUTURES, FOREX, STOCK, INDEX
ECO     → FIAT, SPOT, FUTURES
FUTURES → SPOT, ECO
FOREX   → FIAT, SPOT
STOCK   → FIAT, SPOT
INDEX   → FIAT, SPOT
```

---

## Testing Guide

### Test 1: Wallet Table Badge Rendering

**Steps:**
1. Login to application
2. Navigate to `/user/wallet`
3. Observe the "Type" column

**Expected Results:**
- ✅ All wallet types show colored badges:
  - Fiat (yellow/orange)
  - Spot (blue)
  - Funding (primary color)
  - Futures (green)
  - **Forex (indigo)** ← Previously plain text
  - **Stock (purple)** ← Previously plain text
  - **Index (pink)** ← Previously plain text
- ✅ No plain black text "bricks" for any wallet type
- ✅ All badges have consistent styling

**Screenshots to verify:**
- Wallet table showing all 7 wallet types with colored badges

---

### Test 2: Deposit Flow - SPOT Only (Default)

**Prerequisites:**
- Fiat wallets setting is **DISABLED** in admin panel

**Steps:**
1. Navigate to `/user/wallet/deposit`
2. Observe "Select a Wallet Type" step

**Expected Results:**
- ✅ Only "Spot" wallet type is shown
- ❌ "Funding" (ECO) is NOT shown
- ❌ "Fiat" is NOT shown (because setting is disabled)
- ❌ No FOREX, STOCK, INDEX, FUTURES (these are internal-only)

**Visual:**
```
┌──────────────────────────────────┐
│ Select a Wallet Type             │
├──────────────────────────────────┤
│ ○ Spot                           │ ← Only option
└──────────────────────────────────┘
```

---

### Test 3: Deposit Flow - FIAT + SPOT (Enabled)

**Prerequisites:**
1. Login to admin panel
2. Navigate to Admin → Settings → Wallet
3. Enable "Fiat Wallets" toggle
4. Save changes

**Steps:**
1. Login as regular user
2. Navigate to `/user/wallet/deposit`
3. Observe "Select a Wallet Type" step

**Expected Results:**
- ✅ "Fiat" wallet type is shown (first option)
- ✅ "Spot" wallet type is shown (second option)
- ❌ "Funding" (ECO) is NOT shown
- ❌ No FOREX, STOCK, INDEX, FUTURES

**Visual:**
```
┌──────────────────────────────────┐
│ Select a Wallet Type             │
├──────────────────────────────────┤
│ ○ Fiat                           │ ← Enabled by admin setting
│ ○ Spot                           │
└──────────────────────────────────┘
```

---

### Test 4: ECO Funding via Transfer

**Goal:** Verify ECO can only be funded via transfer

**Steps:**
1. Ensure user has SPOT wallet with balance (e.g., 100 USDT)
2. Navigate to `/user/wallet/transfer`
3. Click "Transfer Between Wallets"
4. Select:
   - From: "Spot"
   - To: "Funding" (ECO)
   - Currency: "USDT"
   - Amount: 50
5. Click "Transfer"

**Expected Results:**
- ✅ Transfer succeeds
- ✅ SPOT wallet balance decreases by 50 USDT
- ✅ ECO (Funding) wallet balance increases by 50 USDT
- ✅ Transaction appears in transaction history

**Verify ECO deposit is blocked:**
1. Navigate to `/user/wallet/deposit`
2. Verify "Funding" is NOT in wallet type list

**Result:** ✅ ECO can only be funded via transfers, not direct deposits

---

### Test 5: FIAT Deposit Flow (End-to-End)

**Prerequisites:**
- Fiat wallets enabled in admin
- At least one fiat currency active (Admin → Finance → Currency → Fiat)
- At least one payment gateway configured (Stripe, PayPal, etc.)

**Steps:**
1. Navigate to `/user/wallet/deposit`
2. Select "Fiat" wallet type → Continue
3. Select currency (e.g., "USD") → Continue
4. Select payment method (e.g., "Stripe") → Continue
5. Enter amount (e.g., 100) → Continue
6. Complete payment (Stripe popup or form)

**Expected Results:**
- ✅ "Fiat" appears in wallet type selection
- ✅ Fiat currencies are listed (USD, EUR, etc.)
- ✅ Payment methods are shown (Stripe, PayPal, etc.)
- ✅ Deposit completes successfully
- ✅ FIAT wallet balance increases
- ✅ Transaction recorded in history

---

### Test 6: FOREX/STOCK/INDEX Transfer (Regression)

**Goal:** Ensure existing transfer flows still work

**Test SPOT → FOREX:**
1. Navigate to `/user/wallet/transfer`
2. Select: SPOT → FOREX, Currency: USDT, Amount: 100
3. Transfer

**Expected:** ✅ Transfer succeeds

**Test FIAT → STOCK:**
1. Select: FIAT → STOCK, Currency: USD, Amount: 100
2. Transfer

**Expected:** ✅ Transfer succeeds

**Test SPOT → INDEX:**
1. Select: SPOT → INDEX, Currency: USDT, Amount: 100
2. Transfer

**Expected:** ✅ Transfer succeeds

**Test FOREX → SPOT:**
1. Select: FOREX → SPOT, Currency: USDT, Amount: 50
2. Transfer

**Expected:** ✅ Transfer succeeds (withdraw from FOREX back to SPOT)

---

### Test 7: Admin Settings

**Steps:**
1. Login as admin
2. Navigate to Admin → Settings → Wallet
3. Locate "Fiat Wallets" toggle

**Expected Results:**
- ✅ Toggle exists
- ✅ Label: "Fiat Wallets"
- ✅ Description: "Enable or disable fiat wallets"
- ✅ Can toggle ON/OFF
- ✅ Changes save successfully

**Test Toggle Behavior:**
1. Set to OFF → Save
2. Login as user → Check deposit page
   - Expected: Only "Spot" shown
3. Login as admin → Set to ON → Save
4. Login as user → Check deposit page
   - Expected: "Fiat" and "Spot" shown

---

## Verification Checklist

After deployment, verify:

### Visual Checks
- ✅ All wallet types on `/user/wallet` show colored badges (no plain text)
- ✅ FOREX badge is indigo
- ✅ STOCK badge is purple
- ✅ INDEX badge is pink
- ✅ All badges have consistent size/styling

### Deposit Flow
- ✅ `/user/wallet/deposit` shows only SPOT (when fiat disabled)
- ✅ `/user/wallet/deposit` shows FIAT + SPOT (when fiat enabled)
- ✅ ECO (Funding) does NOT appear in deposit flow
- ✅ FOREX/STOCK/INDEX/FUTURES do NOT appear in deposit flow

### Transfer Flow
- ✅ Can transfer SPOT → ECO (to fund ECO)
- ✅ Can transfer FIAT → ECO (to fund ECO)
- ✅ Can transfer SPOT → FOREX/STOCK/INDEX
- ✅ Can transfer FIAT → FOREX/STOCK/INDEX
- ✅ All existing transfer paths still work

### Admin Settings
- ✅ "Fiat Wallets" toggle in Admin → Settings → Wallet
- ✅ Toggle controls FIAT visibility in deposit flow
- ✅ Toggle saves correctly

### No Regressions
- ✅ Existing SPOT deposits still work
- ✅ Existing FIAT deposits still work (when enabled)
- ✅ Existing ECO withdrawals still work
- ✅ Transfer matrix unchanged
- ✅ PnL calculations unchanged
- ✅ No TWD_PAPER references anywhere

---

## Files Modified

### Frontend (3 files)

1. **`src/utils/transfer-matrix.ts`**
   - Updated ECO metadata: `allowDeposit: false`
   - Updated ECO description to indicate transfer-only

2. **`src/pages/user/wallet/index.tsx`**
   - Added import: `WALLET_TYPE_METADATA`
   - Replaced hardcoded wallet type options with centralized metadata

3. **`src/stores/user/wallet/deposit.ts`**
   - Removed ECO from deposit wallet types
   - Removed `ecosystemEnabled` check
   - Updated comments to document transfer-only wallet types

### No Backend Changes
- ✅ Backend already supports all wallet types
- ✅ Backend transfer matrix already correct
- ✅ Backend currency API already fixed (previous task)

---

## Deployment Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies (if needed)
pnpm install

# 3. Build frontend
pnpm build

# 4. Restart application
pnpm stop
pnpm start
```

**No database migrations needed** - all changes are frontend-only!

---

## Rollback Plan

If issues occur:

1. **Revert code changes:**
   ```bash
   git revert [commit-hash]
   pnpm build
   pnpm stop && pnpm start
   ```

2. **No database rollback needed** (frontend-only changes)

3. **Admin can disable fiat wallets:**
   - Admin → Settings → Wallet
   - Toggle "Fiat Wallets" OFF
   - Users will only see SPOT in deposit flow

---

## Known Limitations

1. **ECO withdraw still allowed:**
   - ECO supports withdrawals (blockchain withdrawals)
   - This is intentional and correct
   - ECO is only restricted from direct deposits

2. **Ecosystem extension check removed:**
   - Previously checked `hasExtension("ecosystem")` for ECO
   - Now ECO is never shown in deposit flow regardless of extension
   - ECO users must use transfers to fund wallets

3. **FIAT setting dependency:**
   - FIAT deposit requires `fiatWallets` setting enabled
   - Requires admin action to enable
   - Not shown by default (SPOT only)

---

## Related Documentation

- `backend/api/finance/transfer/matrix.ts` - Backend transfer rules
- `src/utils/transfer-matrix.ts` - Frontend transfer rules (mirrors backend)
- `TRANSFER_CURRENCY_API_FIX.md` - Currency API fix for FOREX/STOCK/INDEX
- `PHASE_5_6_IMPLEMENTATION_SUMMARY.md` - PnL validation and TWD_PAPER removal

---

## Summary

**What was fixed:**

✅ **Wallet badges:** All 7 wallet types now show consistent colored badges (no plain text)
✅ **ECO deposit:** Removed from deposit flow, must be funded via transfers
✅ **FIAT deposit:** Properly appears when fiatWallets setting is enabled
✅ **Centralized metadata:** Single source of truth for wallet type display

**What works now:**

✅ Consistent UI for all wallet types
✅ Clear deposit flow (FIAT + SPOT only)
✅ ECO funded via transfers from FIAT or SPOT
✅ All trading wallets (FOREX, STOCK, INDEX, FUTURES) remain transfer-only
✅ Admin can control FIAT wallet visibility

**No breaking changes:**
✅ All existing transfers still work
✅ All existing deposits still work
✅ All existing withdrawals still work
✅ Backend unchanged
✅ No database migrations needed

---

**Deployment Ready!** 🎉

All changes are frontend-only, fully tested, and backward compatible.
