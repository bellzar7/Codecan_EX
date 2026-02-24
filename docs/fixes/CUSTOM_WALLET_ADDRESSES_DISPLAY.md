# Custom Wallet Addresses Display Feature

## Overview
Added visibility of custom deposit addresses in the Admin Finance Wallet list. Custom addresses that are added through CRM → Users → Edit (in the `customAddressWalletsPairFields` field) are now displayed in the Finance → Wallets page.

## Changes Made

### 1. Backend API Update
**File**: [`backend/api/admin/finance/wallet/index.get.ts`](backend/api/admin/finance/wallet/index.get.ts)

Added `customAddressWalletsPairFields` to the user attributes in the wallet list API:

```typescript
includeModels: [
  {
    model: models.user,
    as: "user",
    attributes: [
      "firstName",
      "lastName",
      "email",
      "avatar",
      "customAddressWalletsPairFields", // ← Added
    ],
  },
],
```

### 2. Frontend DataTable Update
**File**: [`src/pages/admin/finance/wallet/index.tsx`](src/pages/admin/finance/wallet/index.tsx)

Added two new columns to the wallet list:

#### Column 1: Has Custom Address (Boolean Filter)
- **Type**: Boolean indicator
- **Purpose**: Quick filter to show only users with custom addresses
- **Filterable**: Yes
- **Sortable**: No

```typescript
{
  field: "hasCustomAddress",
  label: "Has Custom Address",
  type: "boolean",
  sortable: false,
  getValue: (item) => {
    const addresses = item.user?.customAddressWalletsPairFields || [];
    return addresses && addresses.length > 0;
  },
}
```

#### Column 2: Custom Addresses (Full Display)
- **Type**: Text
- **Purpose**: Display all custom addresses with currency/network info
- **Format**: `CURRENCY/NETWORK: ADDRESS`
- **Multiple addresses**: Comma-separated

```typescript
{
  field: "customAddresses",
  label: "Custom Addresses",
  type: "text",
  sortable: false,
  getValue: (item) => {
    const addresses = item.user?.customAddressWalletsPairFields || [];
    if (!addresses || addresses.length === 0) {
      return "-";
    }
    return addresses
      .map(
        (a: { currency: string; network: string; address: string }) =>
          `${a.currency}/${a.network}: ${a.address}`
      )
      .join(", ");
  },
}
```

## Data Structure

The `customAddressWalletsPairFields` field contains an array of custom address objects:

```json
[
  {
    "address": "TK5F8mcAHAcgetuhr25ypfQUEqDEUZMEtP",
    "currency": "USDT",
    "network": "TRC20"
  },
  {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "currency": "USDT",
    "network": "ERC20"
  }
]
```

## Display Format

### Example 1: User with custom addresses
- **Has Custom Address**: ✓ (Green checkmark)
- **Custom Addresses**: `USDT/TRC20: TK5F8mcAHAcgetuhr25ypfQUEqDEUZMEtP, USDT/ERC20: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### Example 2: User without custom addresses
- **Has Custom Address**: ✗ (Red cross)
- **Custom Addresses**: `-`

## Usage

### For Admins:

1. **View Custom Addresses**:
   - Navigate to `/admin/finance/wallet`
   - Look at the "Custom Addresses" column to see all custom deposit addresses
   - The "Has Custom Address" column shows a quick boolean indicator

2. **Filter Users with Custom Addresses**:
   - Click on the "Has Custom Address" column header
   - Filter by `true` to see only users with custom addresses
   - Filter by `false` to see only users without custom addresses

3. **Managing Custom Addresses**:
   - Custom addresses are still managed through CRM → Users → Edit
   - Find the user in the wallet list
   - Click the user's name to navigate to their profile
   - Edit the `customAddressWalletsPairFields` field

## Benefits

1. **Visibility**: Admins can now see which users have custom deposit addresses without checking each user individually
2. **Filtering**: Easy to filter and identify users with custom addresses
3. **Audit**: Quick overview of custom address assignments
4. **Troubleshooting**: Easier to debug deposit issues related to custom addresses

## Testing Checklist

- [ ] Backend API returns `customAddressWalletsPairFields` in user data
- [ ] "Has Custom Address" column shows correct boolean value
- [ ] "Custom Addresses" column displays addresses in correct format
- [ ] Boolean filter works correctly
- [ ] Display shows `-` for users without custom addresses
- [ ] Multiple addresses are comma-separated and readable
- [ ] Performance is acceptable with large datasets

## Related Files

- [`backend/api/admin/finance/wallet/index.get.ts`](backend/api/admin/finance/wallet/index.get.ts) - Backend API endpoint
- [`src/pages/admin/finance/wallet/index.tsx`](src/pages/admin/finance/wallet/index.tsx) - Frontend wallet list page
- [`models/user.ts`](models/user.ts) - User model with `customAddressWalletsPairFields` definition

## Future Enhancements

Potential improvements for future consideration:

1. Add tooltip on hover to show full address details
2. Add copy-to-clipboard button for addresses
3. Add link to jump directly to user's custom address edit form
4. Add custom address count in the boolean column
5. Add search/filter by specific currency or network
6. Add validation warnings for invalid addresses
7. Add last modified timestamp for custom addresses
