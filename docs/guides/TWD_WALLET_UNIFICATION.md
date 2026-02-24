# TWD Wallet Unification with Binance SPOT

## Overview

As of this update, TwelveData (TWD) trading now uses the **same SPOT wallet system as Binance**. This means:

- **No more auto-seeded paper balances** - Users start with 0 balance
- **Real SPOT wallets** - Same wallets used for Binance trading (type: "SPOT")
- **Separate base/quote wallets** - EUR/USD uses EUR wallet and USD wallet
- **Admin-controlled balances** - Admins credit balances through existing tools

---

## Architecture Changes

### Before (Paper Trading)
```
User → TWD_PAPER wallet (single USD wallet)
       ↓
       Auto-seeded with $100,000
       ↓
       All TWD trades debit/credit this single wallet
```

### After (SPOT Wallet Integration)
```
User → SPOT wallets (per currency: USD, EUR, GBP, JPY, etc.)
       ↓
       Created with $0 balance (admin must credit)
       ↓
       TWD trades debit/credit appropriate wallets
       (same as Binance SPOT trading)
```

---

## Wallet Behavior

### Trading EUR/USD

**BUY 1000 EUR at 1.0850 USD:**
1. Check USD SPOT wallet balance >= 1085 USD (cost + fee)
2. Deduct from USD SPOT wallet
3. Credit EUR SPOT wallet with 1000 EUR

**SELL 1000 EUR at 1.0850 USD:**
1. Check EUR SPOT wallet balance >= 1000 EUR
2. Deduct from EUR SPOT wallet
3. Credit USD SPOT wallet with proceeds (minus fee)

This is **identical** to how Binance SPOT trading works for BTC/USDT, ETH/USDT, etc.

---

## Files Modified

### Backend

| File | Change |
|------|--------|
| `backend/api/ext/twd/utils.ts` | Added `getOrCreateSpotWallet()`, `getTwdWalletPair()`, removed auto-seeding |
| `backend/api/ext/twd/order/index.post.ts` | Uses separate base/quote SPOT wallets |
| `backend/api/ext/twd/order/[id]/index.del.ts` | Refunds to correct wallet on cancel |
| `backend/utils/crons/twdOrder.ts` | LIMIT order execution uses SPOT wallets |
| `backend/api/ext/twd/wallet/reset.post.ts` | Deprecated - returns 410 Gone |

### Frontend

| File | Change |
|------|--------|
| `src/components/pages/user/markets/TwdMarkets.tsx` | Fetches SPOT/USD wallet, removed reset button |

---

## Admin Guide: Crediting User Balances

Since TWD now uses the same SPOT wallets, admins can use **existing admin tools** to credit balances.

### Method 1: Database (Direct)

```sql
-- Credit USD to user for TWD forex trading
INSERT INTO wallet (id, userId, type, currency, balance, inOrder, status, createdAt, updatedAt)
VALUES (UUID(), '<USER_ID>', 'SPOT', 'USD', 10000.00, 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE balance = balance + 10000.00;

-- Credit EUR for EUR/USD trading
INSERT INTO wallet (id, userId, type, currency, balance, inOrder, status, createdAt, updatedAt)
VALUES (UUID(), '<USER_ID>', 'SPOT', 'EUR', 5000.00, 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE balance = balance + 5000.00;
```

### Method 2: Admin Panel

1. Go to Admin > Finance > Wallets
2. Find user's SPOT wallets
3. Adjust balance as needed

### Method 3: Admin API

Use the existing wallet adjustment endpoints that work for Binance.

---

## Balance Check Logic (Reused from Binance)

The balance check logic is identical to Binance SPOT:

```typescript
// From backend/api/ext/twd/order/index.post.ts

if (orderSide === "BUY") {
  // BUY: need quote currency
  const totalCost = cost + fee;
  if (quoteWallet.balance < totalCost) {
    throw new Error(`Insufficient ${quoteCurrency} balance...`);
  }
} else {
  // SELL: need base currency
  if (baseWallet.balance < amount) {
    throw new Error(`Insufficient ${baseCurrency} balance...`);
  }
}
```

---

## Wallet Update Logic (Reused from Binance)

```typescript
// Transaction with row-level locking (same as Binance)
await sequelize.transaction(async (transaction) => {
  if (orderSide === "BUY") {
    await updateWalletBalance(quoteWallet.id, quoteWallet.balance - totalCost, transaction);
    if (orderType === "MARKET") {
      await updateWalletBalance(baseWallet.id, baseWallet.balance + amount, transaction);
    }
  } else {
    await updateWalletBalance(baseWallet.id, baseWallet.balance - amount, transaction);
    if (orderType === "MARKET") {
      await updateWalletBalance(quoteWallet.id, quoteWallet.balance + proceeds, transaction);
    }
  }
});
```

---

## Removed Features

### Auto-Seeding (REMOVED)
- No more `TWD_DEMO_BALANCE` environment variable
- No automatic $100,000 on first access
- Users must have balance credited by admin

### Reset Balance Endpoint (DEPRECATED)
- `POST /api/ext/twd/wallet/reset` now returns 410 Gone
- Reset button removed from /forex page

---

## Environment Variables

### Still Used
- `TWD_API_KEY` - TwelveData API key
- `TWD_FEE_RATE` - Trading fee rate (default: 0.001 = 0.1%)
- `TWD_DEFAULT_ENABLED_SYMBOLS` - Symbols enabled after import

### No Longer Used
- ~~`TWD_DEMO_BALANCE`~~ - Was used for auto-seeding
- ~~`TWD_DEFAULT_CURRENCY`~~ - Each symbol uses its own currencies now

---

## Testing Checklist

### As Admin
- [ ] Enable TwelveData provider
- [ ] Import TWD markets
- [ ] Credit USD balance to test user (via DB or admin tools)
- [ ] Credit EUR balance to test user (for selling EUR)

### As User
- [ ] Go to /forex - see 0 balance initially
- [ ] After admin credits - see real USD balance
- [ ] Place BUY EUR/USD order - USD decreases, EUR increases
- [ ] Place SELL EUR/USD order - EUR decreases, USD increases
- [ ] Cancel LIMIT order - balance refunded to correct wallet
- [ ] If 0 balance - cannot place orders (no "free money")

### Verify Independence
- [ ] Binance SPOT trading still works
- [ ] TWD trading does NOT affect Binance wallets (different currencies)
- [ ] Admin can credit both Binance currencies (BTC, ETH) and TWD currencies (USD, EUR)

---

## Comparison: Binance SPOT vs TWD

| Feature | Binance SPOT | TWD |
|---------|-------------|-----|
| Wallet Type | SPOT | SPOT |
| Currencies | BTC, ETH, USDT, etc. | USD, EUR, GBP, JPY, etc. |
| Balance Initialization | 0 (admin credits) | 0 (admin credits) |
| Price Source | CCXT/Binance API | TwelveData/eco-ws/Redis |
| Order Execution | External exchange | Internal (simulated) |
| Balance Logic | Debit/credit wallets | Same as Binance |
| Fee Handling | Deducted from received | Same as Binance |
| Admin Tools | Existing | Same as Binance |

---

## Migration Notes

### Existing Users with TWD_PAPER Wallets

If users have existing `TWD_PAPER` wallets from before this update:
- Those wallets are now ignored
- Users need SPOT wallets credited by admin
- Old TWD_PAPER balances are not migrated automatically

### Manual Migration (Optional)

If you want to migrate existing TWD_PAPER balances to SPOT:

```sql
-- Migrate TWD_PAPER USD balance to SPOT USD
INSERT INTO wallet (id, userId, type, currency, balance, inOrder, status, createdAt, updatedAt)
SELECT UUID(), userId, 'SPOT', 'USD', balance, 0, 1, NOW(), NOW()
FROM wallet
WHERE type = 'TWD_PAPER' AND currency = 'USD' AND balance > 0
ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance);
```

---

## Summary

TWD trading now operates with the same wallet behavior as Binance SPOT trading:
- Same wallet type (SPOT)
- Same balance management
- Same admin controls
- No auto-seeding

The only difference is the price source (TwelveData instead of Binance) and the currency types (forex: USD, EUR, GBP vs crypto: BTC, ETH, USDT).
