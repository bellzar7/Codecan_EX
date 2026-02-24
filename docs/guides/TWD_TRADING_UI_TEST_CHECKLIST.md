# TWD Trading UI Testing Checklist

This checklist covers testing the TWD trading UI, specifically the Orders and Order History display after the data normalization fix.

## Prerequisites

Before starting tests:
1. ✅ Backend is running: `pm2 status backend` (should show "online")
2. ✅ eco-ws is running: `pm2 status eco-ws` (should show "online")
3. ✅ Frontend is running on http://localhost:3000
4. ✅ User has TWD_PAPER wallet with balance (check `/api/finance/wallet?type=TWD_PAPER`)

---

## Test 1: TWD Market Order - Order History Display

**Objective:** Verify MARKET orders display correctly in Order History without crashes

### Steps:
1. Navigate to TWD market page: `http://localhost:3000/trade/EUR_USD`
2. Verify market loads correctly (chart, orderbook, order form visible)
3. In the order form:
   - Type: MARKET
   - Side: BUY
   - Amount: 1000
4. Click "Buy" button
5. Wait for success notification
6. Click on **"Order History"** tab in the Orders panel

### Expected Results:
✅ Order History tab loads without errors
✅ New MARKET order appears in the table with:
   - Symbol: EUR/USD
   - Type: MARKET
   - Side: BUY
   - Price: Displayed as decimal number (e.g., "1.08450")
   - Amount: Displayed as decimal number (e.g., "1000.00000000")
   - Filled: Same as amount
   - Remaining: 0.00000000
   - Cost: Displayed as decimal number (calculated)
   - Status: CLOSED (green color)
   - Created date/time

❌ **FAILURE CRITERIA:**
- Error: "row.price?.toFixed is not a function"
- Price/Amount/Cost shows as "undefined" or "[object Object]"
- Page crashes or table doesn't render

---

## Test 2: TWD Limit Order - Open Orders Display

**Objective:** Verify LIMIT orders display correctly in Open Orders

### Steps:
1. Still on `http://localhost:3000/trade/EUR_USD`
2. Note the current market price (e.g., 1.08450)
3. In the order form:
   - Type: LIMIT
   - Side: SELL
   - Amount: 500
   - Price: Set higher than current (e.g., 1.10000)
4. Click "Sell" button
5. Wait for success notification
6. Click on **"Open Orders"** tab in the Orders panel

### Expected Results:
✅ Open Orders tab loads without errors
✅ New LIMIT order appears in the table with:
   - Symbol: EUR/USD
   - Type: LIMIT
   - Side: SELL
   - Price: 1.10000 (your specified price)
   - Amount: 500.00000000
   - Filled: 0.00000000
   - Remaining: 500.00000000
   - Cost: Calculated correctly
   - Status: OPEN (yellow/warning color)
   - Actions: Cancel button visible

❌ **FAILURE CRITERIA:**
- Numeric fields show "-" (should show actual numbers)
- Price/Amount/Cost crashes the page
- Order doesn't appear in Open Orders

---

## Test 3: Cancel TWD Limit Order

**Objective:** Verify order cancellation works for TWD

### Steps:
1. In the Open Orders tab (from Test 2)
2. Find the LIMIT order you just created
3. Click the **Cancel** icon/button in the Actions column
4. Confirm cancellation if prompted

### Expected Results:
✅ Order disappears from Open Orders tab
✅ Success notification: "Order canceled successfully"
✅ Wallet balance updated (reserved funds returned)
✅ When switching to Order History tab:
   - Canceled order appears with Status: CANCELED (red/danger color)

❌ **FAILURE CRITERIA:**
- Cancel fails with error
- Order remains in Open Orders
- Wallet balance not updated

---

## Test 4: TWD LIMIT Order Execution (Cron Job)

**Objective:** Verify LIMIT orders execute and move from Open Orders to History

### Steps:
1. Create a LIMIT BUY order that will execute soon:
   - Current price: 1.08450
   - Set LIMIT BUY price: 1.08500 (slightly above current)
   - Amount: 100
2. Wait for market price to drop to or below 1.08500
   - OR manually trigger cron: Check backend logs for cron execution
   - Cron runs every 60 seconds
3. Refresh Open Orders tab after ~1-2 minutes

### Expected Results:
✅ Order disappears from Open Orders
✅ Order appears in Order History with:
   - Status: CLOSED
   - Filled: 100.00000000
   - Remaining: 0.00000000
   - Price: Actual execution price (may differ from limit price)

❌ **FAILURE CRITERIA:**
- Order stays in OPEN status indefinitely
- Backend logs show errors in TWD cron
- Order execution fails silently

---

## Test 5: Regression - SPOT Market Orders

**Objective:** Verify SPOT markets still work (no regression)

### Steps:
1. Navigate to a SPOT market: `http://localhost:3000/trade/BTC_USDT` (or any active SPOT market)
2. Place a MARKET BUY order (small amount)
3. Check Order History tab

### Expected Results:
✅ SPOT order appears correctly in Order History
✅ All numeric fields display properly
✅ No crashes or errors
✅ Order data structure identical to before changes

❌ **FAILURE CRITERIA:**
- SPOT orders crash with same .toFixed error
- SPOT orders display incorrectly
- Any regression in SPOT trading functionality

---

## Test 6: Edge Cases - Missing/Null Values

**Objective:** Verify UI handles missing values gracefully

### Steps:
1. Open browser DevTools → Console
2. Navigate to TWD Order History
3. Check if any orders have missing/null values
4. If no orders, manually check by inspecting API response

### Expected Results:
✅ Missing numeric values display as "-" (not "undefined" or crash)
✅ Table renders without JavaScript errors
✅ safeToFixed() function handles:
   - `null` values → "-"
   - `undefined` values → "-"
   - `0` values → "0.00000000"
   - String numbers → Converted and displayed correctly

❌ **FAILURE CRITERIA:**
- Console shows errors: "Cannot read property 'toFixed' of null"
- Missing values cause table to break
- Incorrect data type conversion

---

## Test 7: Order Pagination and Sorting

**Objective:** Verify table interactions work with normalized data

### Steps:
1. Create multiple TWD orders (at least 10)
2. In Order History tab:
   - Test sorting by clicking Price column header
   - Test sorting by clicking Amount column header
   - Test pagination if you have >10 orders

### Expected Results:
✅ Sorting by numeric columns works correctly:
   - Price sorts numerically (not alphabetically)
   - Amount sorts numerically
   - Cost sorts numerically
✅ Pagination works without errors
✅ All orders display correct formatted values

❌ **FAILURE CRITERIA:**
- Sorting treats numbers as strings (e.g., "10" before "2")
- Pagination crashes
- Sorted data loses formatting

---

## Test 8: Multiple TWD Markets

**Objective:** Verify order display works across different TWD symbols

### Steps:
1. Place order on EUR/USD
2. Navigate to another TWD market (e.g., GBP/USD)
3. Place order on GBP/USD
4. Go back to EUR/USD
5. Check Order History shows only EUR/USD orders (filtered by symbol)
6. Check overall order history (if available) shows all TWD orders

### Expected Results:
✅ Each market shows its own orders correctly
✅ Symbol column displays correct symbol
✅ Filtering by symbol works
✅ All numeric fields formatted correctly across all symbols

---

## Test 9: Real-time WebSocket Updates (Future)

**Status:** ⚠️ Currently NOT implemented for TWD

### Current Behavior:
- TWD orders require manual tab refresh to update
- No real-time status updates like SPOT/ECO markets

### Future Test Steps:
Once WebSocket support is added for TWD:
1. Open TWD market in two browser tabs
2. Place LIMIT order in Tab 1
3. Order should appear in Tab 2 automatically (no refresh)
4. Cancel order in Tab 1
5. Order should disappear from Tab 2 automatically

---

## Validation Checklist Summary

After completing all tests, verify:

✅ **Data Normalization:**
- [ ] All TWD order endpoints return numeric fields as JavaScript numbers
- [ ] No more DECIMAL string issues
- [ ] safeToFixed() handles edge cases

✅ **UI Display:**
- [ ] Order History displays TWD orders correctly
- [ ] Open Orders displays TWD orders correctly
- [ ] No crashes or "toFixed is not a function" errors
- [ ] Numeric values formatted to correct precision

✅ **Functionality:**
- [ ] MARKET orders execute and appear in History immediately
- [ ] LIMIT orders appear in Open Orders
- [ ] Order cancellation works
- [ ] Cron job processes LIMIT orders
- [ ] LIMIT orders move from Open Orders to History when filled

✅ **Regression:**
- [ ] SPOT market orders still work correctly
- [ ] ECO market orders still work correctly (if applicable)
- [ ] No breaking changes to existing functionality

✅ **Edge Cases:**
- [ ] Missing/null values display as "-"
- [ ] Zero values display correctly
- [ ] Sorting and pagination work
- [ ] Multiple markets don't interfere with each other

---

## Troubleshooting

### Issue: "Price not available" error when placing order
**Solution:** Check eco-ws is running and connected:
```bash
pm2 logs eco-ws --lines 20
# Should see: "Price event received: { symbol: 'EUR/USD', price: ... }"
```

### Issue: Orders not appearing in table
**Solution:** Check browser DevTools → Network tab:
- Verify `/api/ext/twd/order?status=OPEN` returns 200
- Check response data is array of orders
- Verify orders have normalized numeric fields

### Issue: LIMIT orders not executing
**Solution:** Check backend logs:
```bash
pm2 logs backend | grep "TWD Cron"
# Should see: "Processing N LIMIT orders for EUR/USD at price X.XXXXX"
```

### Issue: Numbers still appearing as strings
**Solution:** Backend not restarted after fix:
```bash
pm2 restart backend
```

---

## Success Criteria

All tests pass with:
- ✅ No runtime errors in browser console
- ✅ All numeric fields display correctly formatted
- ✅ SPOT/ECO markets unchanged (no regression)
- ✅ TWD trading has same UX as SPOT trading
- ✅ Orders flow correctly: placement → Open Orders → execution → Order History

---

## Automated Testing (Future Enhancement)

Consider adding Jest/Cypress tests for:
- Order data normalization functions
- safeToFixed() edge cases
- Order table rendering with various data types
- Order placement and display flow

Example test cases:
```typescript
describe('safeToFixed', () => {
  it('should format numbers correctly', () => {
    expect(safeToFixed(1.23456, 2)).toBe('1.23');
  });

  it('should handle string numbers', () => {
    expect(safeToFixed('1.23456', 2)).toBe('1.23');
  });

  it('should handle null values', () => {
    expect(safeToFixed(null, 2)).toBe('-');
  });
});
```

---

**Test Date:** _____________

**Tested By:** _____________

**Environment:** Development / Staging / Production

**Result:** PASS / FAIL

**Notes:**
