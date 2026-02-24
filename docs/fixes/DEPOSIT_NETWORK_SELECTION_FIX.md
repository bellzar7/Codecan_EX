# Deposit Network Selection UI Implementation

## Problem
The deposit page was missing a UI component for network selection (TRC20, ERC20, BEP20, etc.) after selecting a cryptocurrency. The `selectedDepositMethod` existed in the code but had no user interface to set it.

## Solution
Enabled the existing [`SelectNetwork`](src/components/pages/user/wallet/deposit/SelectNetwork/SelectNetwork.tsx) component that was commented out and fixed the step flow for SPOT wallet deposits.

## Changes Made

### 1. Main Deposit Page ([`src/pages/user/wallet/deposit/index.tsx`](src/pages/user/wallet/deposit/index.tsx))

#### Added Import
```tsx
import { SelectNetwork } from "@/components/pages/user/wallet/deposit/SelectNetwork";
```

#### Fixed Step Flow for SPOT Wallet
**Before (broken flow):**
- Step 1: Select Wallet Type (SPOT)
- Step 2: Select Currency (USDT)
- Step 3: Show Deposit Address ❌ (skipped network selection!)
- Step 4: Deposit Confirmed

**After (correct flow):**
- Step 1: Select Wallet Type (SPOT)
- Step 2: Select Currency (USDT)
- Step 3: **Select Network (TRC20/ERC20/BEP20)** ✅ (added)
- Step 4: Show Deposit Address
- Step 5: Deposit Confirmed

#### Code Changes
```tsx
{/* Network selection for SPOT wallet */}
{step === 3 && selectedWalletType.value === "SPOT" && (
  <SelectNetwork />
)}

{/* Deposit address for SPOT wallet after network selection */}
{step === 4 && selectedWalletType.value === "SPOT" && (
  <DepositAddress />
)}

{((step === 5 && selectedWalletType.value === "SPOT") ||
  (step === 5 && selectedWalletType.value === "FIAT")) && (
  <DepositConfirmed />
)}
```

#### Updated WebSocket Monitoring
Fixed WebSocket initialization to work with the new step 4:
```tsx
useEffect(() => {
  if (
    selectedWalletType.value !== "FIAT" &&
    step === 4 &&
    selectedWalletType.value === "SPOT" &&
    profile?.id &&
    depositAddress.address
  ) {
    // WebSocket setup...
  }
}, [selectedWalletType.value, step, profile?.id, depositAddress.address]);
```

### 2. SelectNetwork Component ([`src/components/pages/user/wallet/deposit/SelectNetwork/SelectNetwork.tsx`](src/components/pages/user/wallet/deposit/SelectNetwork/SelectNetwork.tsx))

#### Fixed Step Transition
Changed from `setStep(3)` to `setStep(4)` when continuing after network selection:
```tsx
onClick={() => {
  console.log('[SelectNetwork] Continue to deposit address:', {
    currency: selectedCurrency,
    network: selectedDepositMethod
  });
  fetchDepositAddress();
  setStep(4); // Changed from 3 to 4
}}
```

### 3. Debug Logging Added

Added comprehensive logging throughout the deposit flow:

#### [`SelectCurrency`](src/components/pages/user/wallet/deposit/SelectCurrency/SelectCurrency.tsx)
```tsx
console.log('[SelectCurrency] Fetching deposit methods for:', {
  walletType: selectedWalletType.value,
  currency: selectedCurrency
});
```

#### [`SelectNetwork`](src/components/pages/user/wallet/deposit/SelectNetwork/SelectNetwork.tsx)
```tsx
console.log('[SelectNetwork] Network selected:', {
  network: item.chain,
  contractType: item.contractType,
  currency: selectedCurrency,
  limits: item.limits
});
```

#### [`Deposit Store`](src/stores/user/wallet/deposit.ts)
```tsx
console.log("[DepositStore] Deposit methods loaded:", {
  count: methodsData?.length || 0,
  methods: methodsData?.map((m: any) => m.chain) || []
});

console.log("[DepositStore] SPOT deposit address received:", {
  address: addressData.address,
  currency: selectedCurrency,
  network: selectedDepositMethod
});
```

## User Flow

### Complete SPOT Deposit Flow
1. ✅ User selects **SPOT** wallet type
2. ✅ User selects **USDT** currency
3. ✅ System fetches available networks via [`fetchDepositMethods()`](src/stores/user/wallet/deposit.ts:341)
4. ✅ **[NEW]** User sees network options (TRC20, ERC20, BEP20, etc.)
5. ✅ **[NEW]** User selects **TRC20** network
6. ✅ System fetches deposit address via [`fetchDepositAddress()`](src/stores/user/wallet/deposit.ts:382)
7. ✅ Custom deposit address is displayed (e.g., `TK5F8mcAHAcgetuhr25ypfQUEqDEUZMEtP`)
8. ✅ User deposits and transaction is monitored via WebSocket

## Data Flow

### Store Structure ([`src/stores/user/wallet/deposit.ts`](src/stores/user/wallet/deposit.ts))
```typescript
type DepositStore = {
  step: number;                          // Current step (1-5)
  selectedWalletType: WalletType;        // SPOT, FIAT, ECO
  selectedCurrency: string;              // USDT, BTC, ETH, etc.
  depositMethods: any[];                 // Available networks/methods
  selectedDepositMethod: any | null;     // Selected network (TRC20, ERC20, etc.)
  depositAddress: any;                   // Generated deposit address
  // ... other fields
}
```

### API Endpoints Used
1. **Fetch Deposit Methods**
   ```
   GET /api/finance/currency/{walletType}/{currency}?action=deposit
   ```
   Returns available networks for the selected currency.

2. **Fetch Deposit Address**
   ```
   GET /api/finance/currency/{walletType}/{currency}/{network}
   ```
   Returns the deposit address for the selected network.

## Testing Checklist

To verify the fix is working:

- [ ] Navigate to `/user/wallet/deposit`
- [ ] Select **SPOT** wallet type
- [ ] Select **USDT** currency
- [ ] **Verify**: Network selection screen appears (step 3)
- [ ] **Verify**: Networks are listed (TRC20, ERC20, BEP20, etc.)
- [ ] **Verify**: Min/Max limits are shown for each network
- [ ] Select **TRC20** network
- [ ] **Verify**: Deposit address screen appears (step 4)
- [ ] **Verify**: Custom address is displayed
- [ ] Check browser console for debug logs:
  - `[SelectCurrency] Fetching deposit methods for:`
  - `[DepositStore] Deposit methods loaded:`
  - `[SelectNetwork] Network selected:`
  - `[DepositStore] Fetching deposit address:`
  - `[DepositStore] SPOT deposit address received:`

## Files Modified

1. [`src/pages/user/wallet/deposit/index.tsx`](src/pages/user/wallet/deposit/index.tsx)
   - Added `SelectNetwork` import
   - Enabled network selection step for SPOT wallet
   - Fixed step numbers (4→5 for deposit confirmed)
   - Updated WebSocket monitoring logic

2. [`src/components/pages/user/wallet/deposit/SelectNetwork/SelectNetwork.tsx`](src/components/pages/user/wallet/deposit/SelectNetwork/SelectNetwork.tsx)
   - Fixed step transition from 3 to 4
   - Added debug logging

3. [`src/components/pages/user/wallet/deposit/SelectCurrency/SelectCurrency.tsx`](src/components/pages/user/wallet/deposit/SelectCurrency/SelectCurrency.tsx)
   - Added debug logging

4. [`src/stores/user/wallet/deposit.ts`](src/stores/user/wallet/deposit.ts)
   - Enhanced debug logging in `fetchDepositMethods()`
   - Enhanced debug logging in `fetchDepositAddress()`

## Related Components

- [`SelectWalletType`](src/components/pages/user/wallet/deposit/SelectWalletType/) - Step 1
- [`SelectCurrency`](src/components/pages/user/wallet/deposit/SelectCurrency/) - Step 2
- [`SelectNetwork`](src/components/pages/user/wallet/deposit/SelectNetwork/) - Step 3 (SPOT)
- [`SelectFiatDepositMethod`](src/components/pages/user/wallet/deposit/SelectFiatDepositMethod/) - Step 3 (FIAT)
- [`DepositAddress`](src/components/pages/user/wallet/deposit/DepositAddress/) - Step 4 (SPOT)
- [`FiatDepositAmount`](src/components/pages/user/wallet/deposit/FiatDepositAmount/) - Step 4 (FIAT)
- [`DepositConfirmed`](src/components/pages/user/wallet/deposit/DepositConfirmed/) - Step 5

## Notes

- The `SelectNetwork` component was already implemented but was commented out
- The fix primarily involved uncommenting and integrating the existing component
- FIAT wallet flow remains unchanged (uses different steps)
- ECO wallet type may need similar treatment in the future
- All existing TypeScript/Biome warnings are pre-existing and not introduced by these changes
