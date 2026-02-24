# QA Checklist - TWD Paper Trading (DB-Driven Architecture)

**Version**: 2.0.0 (Refactored)
**Date**: 2025-11-13
**Purpose**: Verify complete Admin → User flow using database-driven markets

---

## 🎯 Testing Scope

This checklist verifies:
1. ✅ Markets loaded from database (NOT ENV)
2. ✅ Admin can import markets from TwelveData API
3. ✅ Admin can enable/disable markets
4. ✅ Users see ONLY enabled markets
5. ✅ WebSocket subscribes to enabled markets only
6. ✅ Complete trading flow works end-to-end

---

## 📋 Pre-Test Setup

### Environment Configuration
- [ ] `.env` has `TWD_API_KEY` configured
- [ ] `.env` has `TWD_BASE_URL=https://api.twelvedata.com`
- [ ] `.env` has `TWD_WS_URL=wss://ws.twelvedata.com/v1/quotes/price`
- [ ] `.env` does NOT have `ECO_DEFAULT_SYMBOLS` (or it's ignored)

### Database State
- [ ] `twd_provider` table exists
- [ ] `twd_market` table exists
- [ ] `twd_order` table exists
- [ ] `wallet` table supports `type='TWD_PAPER'`

### Servers Running
- [ ] Backend server running: `pm2 status backend` shows "online"
- [ ] Frontend server running: `pm2 status frontend` shows "online"
- [ ] WebSocket server running: `pm2 status eco-ws` shows "online"

### Test Accounts
- [ ] Admin account exists (with admin role)
- [ ] User account exists (regular user)

---

## 🔧 Phase 1: Admin - Provider Management

### Test 1.1: View Providers
**Steps**:
1. Log in as admin
2. Navigate to: Admin → Finance → Providers (or similar path)
3. Look for TWD Provider in list

**Expected**:
- [ ] TWD Provider appears in providers list
- [ ] Status field shows current state (Active/Inactive)
- [ ] Can see provider details

### Test 1.2: Enable Provider
**Steps**:
1. Find TWD Provider in list
2. Click status toggle to enable
3. Verify status changes to "Active"

**Expected**:
- [ ] Status toggle works
- [ ] Status changes to "Active" (green indicator)
- [ ] Changes persist (refresh page, still active)

**Verification**:
```sql
SELECT * FROM twd_provider WHERE status = true;
-- Should return 1 row
```

### Test 1.3: Disable Provider
**Steps**:
1. Click status toggle to disable
2. Verify status changes to "Inactive"

**Expected**:
- [ ] Status changes to "Inactive"
- [ ] Persists after refresh

**Note**: Re-enable provider before continuing

---

## 📊 Phase 2: Admin - Market Import

### Test 2.1: Import Markets (First Time)
**Steps**:
1. Navigate to provider details or markets page
2. Click "Import Markets" button
3. Wait for import to complete

**Expected**:
- [ ] Import starts (loading indicator)
- [ ] Success message appears: "Imported X forex, Y stocks, Z indices"
- [ ] No error messages

**Verify Counts**:
```sql
SELECT type, COUNT(*) as count FROM twd_market GROUP BY type;
-- Expected:
-- forex: 50-100
-- stocks: 1000+
-- indices: 50-100
```

### Test 2.2: Verify Imported Markets
**Steps**:
1. Navigate to: Admin → Finance → TWD Markets
2. View markets table

**Expected**:
- [ ] Table shows imported markets
- [ ] Columns: Symbol, Type, Exchange, Name, Status
- [ ] Status = "Disabled" for all (newly imported)
- [ ] Can filter by type (Forex/Stocks/Indices)
- [ ] Can search by symbol

### Test 2.3: Re-Import Markets
**Steps**:
1. Click "Import Markets" again
2. Wait for completion

**Expected**:
- [ ] Import completes successfully
- [ ] Count similar to first import
- [ ] Existing markets updated (not duplicated)
- [ ] Enabled/disabled status preserved

**Verify No Duplicates**:
```sql
SELECT symbol, COUNT(*) as dupes
FROM twd_market
GROUP BY symbol
HAVING dupes > 1;
-- Should return 0 rows
```

---

## ✅ Phase 3: Admin - Enable/Disable Markets

### Test 3.1: Enable Individual Market
**Steps**:
1. Go to TWD Markets page
2. Find a forex market (e.g., EUR/USD)
3. Click status toggle to enable

**Expected**:
- [ ] Status changes to "Enabled" (green)
- [ ] Change persists after refresh

**Verify**:
```sql
SELECT * FROM twd_market WHERE symbol = 'EUR/USD';
-- status should be true
```

### Test 3.2: Disable Individual Market
**Steps**:
1. Find enabled market
2. Click status toggle to disable

**Expected**:
- [ ] Status changes to "Disabled" (grey/red)
- [ ] Change persists

### Test 3.3: Bulk Enable Markets
**Steps**:
1. Filter markets by type: "Forex"
2. Select 10-15 forex pairs (checkboxes)
3. Click "Enable Selected" button
4. Confirm action

**Expected**:
- [ ] All selected markets enabled
- [ ] Success message: "Enabled X markets"
- [ ] Status updated in table

**Verify**:
```sql
SELECT COUNT(*) FROM twd_market
WHERE type = 'forex' AND status = true;
-- Should match selected count
```

### Test 3.4: Enable Stocks and Indices
**Steps**:
1. Filter by "Stocks"
2. Enable 15-20 popular stocks (AAPL, GOOGL, MSFT, etc.)
3. Filter by "Indices"
4. Enable 5-10 indices (SPX, DJI, NASDAQ, etc.)

**Expected**:
- [ ] Bulk operations work for all types
- [ ] Status updates correctly

**Final Count**:
```sql
SELECT type, COUNT(*) as enabled_count
FROM twd_market
WHERE status = true
GROUP BY type;

-- Example target:
-- forex: 15
-- stocks: 20
-- indices: 10
```

---

## 🌐 Phase 4: User - View Markets

### Test 4.1: Forex Page Shows Enabled Markets
**Steps**:
1. Log out from admin
2. Log in as regular user
3. Navigate to `/forex`

**Expected**:
- [ ] Page loads without errors
- [ ] Shows ONLY enabled forex markets
- [ ] Count matches what admin enabled (~15 pairs)
- [ ] Paper trading banner visible
- [ ] Paper balance displays: $10,000.00 USD

**Verify**:
- [ ] EUR/USD appears (if enabled)
- [ ] Disabled pairs do NOT appear
- [ ] Can search markets
- [ ] Can sort by symbol/name

### Test 4.2: Stocks Page Shows Enabled Markets
**Steps**:
1. Navigate to `/stocks`

**Expected**:
- [ ] Shows ONLY enabled stocks (~20)
- [ ] AAPL appears (if enabled)
- [ ] Disabled stocks NOT visible

### Test 4.3: Indices Page Shows Enabled Markets
**Steps**:
1. Navigate to `/indices`

**Expected**:
- [ ] Shows ONLY enabled indices (~10)
- [ ] SPX appears (if enabled)

### Test 4.4: Empty State (No Enabled Markets)
**Steps**:
1. Admin disables ALL markets
2. User refreshes `/forex` page

**Expected**:
- [ ] Page shows empty state message
- [ ] No markets in table
- [ ] No errors

---

## 💹 Phase 5: User - Trading Flow

### Test 5.1: Navigate to Trading Page
**Steps**:
1. On `/forex` page
2. Click EUR/USD row

**Expected**:
- [ ] Navigates to `/trade/EUR_USD`
- [ ] Paper trading warning banner appears
- [ ] Chart loads
- [ ] Order form displays
- [ ] Balance shows in order form

### Test 5.2: Market Detection (TWD vs Crypto)
**Steps**:
1. Navigate to `/trade/EUR_USD` (TWD market)
2. Note the warning banner
3. Navigate to `/trade/BTC_USDT` (crypto market)

**Expected**:
- [ ] `/trade/EUR_USD`: Shows paper trading banner (isTwd=true)
- [ ] `/trade/BTC_USDT`: NO paper trading banner (regular SPOT)

### Test 5.3: Place MARKET Buy Order
**Steps**:
1. On `/trade/EUR_USD`
2. Select "Market" tab
3. Enter amount: 1.0
4. Click "Buy EUR"

**Expected**:
- [ ] Order executes immediately
- [ ] Success notification
- [ ] Balance decreases (cost + fee)
- [ ] Order appears in "Order History"
- [ ] Order status: CLOSED

**Verify**:
```sql
SELECT * FROM twd_order
WHERE symbol = 'EUR/USD' AND side = 'BUY'
ORDER BY createdAt DESC LIMIT 1;
-- Should show recent CLOSED order
```

### Test 5.4: Place LIMIT Sell Order
**Steps**:
1. Select "Limit" tab
2. Enter amount: 0.5
3. Enter price: 1.1000 (above current market)
4. Click "Sell EUR"

**Expected**:
- [ ] Order created
- [ ] Status: OPEN
- [ ] Appears in "Open Orders" tab
- [ ] Balance NOT immediately changed (reserved)

**Verify**:
```sql
SELECT * FROM twd_order
WHERE symbol = 'EUR/USD' AND side = 'SELL' AND status = 'OPEN'
ORDER BY createdAt DESC LIMIT 1;
```

### Test 5.5: Cancel LIMIT Order
**Steps**:
1. In "Open Orders" tab
2. Find SELL order from 5.4
3. Click "Cancel" button
4. Confirm

**Expected**:
- [ ] Order removed from "Open Orders"
- [ ] Appears in "Order History" with status: CANCELED
- [ ] Balance refunded (if BUY order)

### Test 5.6: LIMIT Order Execution (Cron)
**Steps**:
1. Check current EUR/USD price (e.g., 1.0850)
2. Place LIMIT BUY at 1.0900 (above current - will execute soon)
3. Wait 1-2 minutes for cron job

**Expected**:
- [ ] Cron job runs (check logs: `pm2 logs backend`)
- [ ] Order status changes: OPEN → CLOSED
- [ ] Order moves to "Order History"
- [ ] Balance updated

**Note**: For faster testing, temporarily lower limit price to current market price

---

## 🔄 Phase 6: WebSocket & Real-Time Prices

### Test 6.1: WebSocket Subscription at Startup
**Steps**:
1. Restart WebSocket server: `pm2 restart eco-ws`
2. Check logs: `pm2 logs eco-ws --lines 50`

**Expected**:
- [ ] Log shows: "subscribed to enabled TWD markets from DB: EUR/USD,GBP/USD,AAPL,..."
- [ ] List matches enabled markets in database
- [ ] NO symbols from disabled markets

### Test 6.2: Real-Time Price Updates
**Steps**:
1. Navigate to `/trade/EUR_USD`
2. Open browser DevTools → Network → WS tab
3. Watch for WebSocket messages

**Expected**:
- [ ] WebSocket connection established
- [ ] Messages with price updates flowing
- [ ] Chart updates in real-time
- [ ] Ticker updates

### Test 6.3: Enable New Market → Auto-Subscribe
**Steps**:
1. Admin enables new market (e.g., GBP/USD)
2. Wait 60 seconds (WebSocket refresh interval)
3. Check WebSocket logs

**Expected**:
- [ ] Within 60s, WebSocket subscribes to GBP/USD
- [ ] Logs show: "subscribed...GBP/USD..."
- [ ] User can now trade GBP/USD with real-time prices

### Test 6.4: Disable Market → Auto-Unsubscribe
**Steps**:
1. Admin disables EUR/USD
2. Wait 60 seconds
3. Check WebSocket logs

**Expected**:
- [ ] WebSocket unsubscribes from EUR/USD
- [ ] EUR/USD removed from subscription list
- [ ] Users cannot access `/trade/EUR_USD` anymore

---

## 💳 Phase 7: Wallet Management

### Test 7.1: Check Paper Balance
**Steps**:
1. Navigate to `/forex`
2. Check banner at top

**Expected**:
- [ ] Shows: "Paper Balance: $X,XXX.XX USD"
- [ ] Balance matches wallet in database

**Verify**:
```sql
SELECT balance FROM wallet
WHERE type = 'TWD_PAPER' AND userId = '{user_id}';
```

### Test 7.2: Reset Balance
**Steps**:
1. On `/forex` page
2. Click "Reset Balance" button
3. Confirm

**Expected**:
- [ ] Success notification
- [ ] Balance resets to $10,000.00
- [ ] Displays immediately in banner

**Verify**:
```sql
SELECT balance FROM wallet
WHERE type = 'TWD_PAPER' AND userId = '{user_id}';
-- Should be 10000.00
```

### Test 7.3: Balance Updates After Trades
**Steps**:
1. Note initial balance (e.g., $10,000.00)
2. Place MARKET BUY: 1.0 EUR/USD @ 1.0850
3. Check balance

**Expected**:
- [ ] Balance decreases by cost + fee
- [ ] Example: $10,000.00 → $9,998.91
- [ ] Updates in order form "Avbl" field
- [ ] Updates in banner (after refresh)

---

## 🚫 Phase 8: Negative Tests

### Test 8.1: Try to Trade Disabled Market
**Steps**:
1. Admin disables EUR/USD
2. User tries to navigate to `/trade/EUR_USD`

**Expected**:
- [ ] Error message or redirect
- [ ] Market not found
- [ ] Cannot place orders

### Test 8.2: Import with Invalid API Key
**Steps**:
1. Change `.env`: `TWD_API_KEY=invalid_key_123`
2. Restart backend
3. Try to import markets

**Expected**:
- [ ] Error message: "API key error" or "Unauthorized"
- [ ] No markets imported
- [ ] Existing markets unchanged

**Cleanup**: Restore valid API key, restart backend

### Test 8.3: Insufficient Balance
**Steps**:
1. Reset balance to $10,000
2. Try to place order for $15,000 worth

**Expected**:
- [ ] Error: "Insufficient balance"
- [ ] Order NOT created
- [ ] Balance unchanged

### Test 8.4: Invalid Order Parameters
**Steps**:
1. Try to place order with amount = 0
2. Try to place LIMIT order with price = 0

**Expected**:
- [ ] Validation errors
- [ ] Orders NOT created

---

## 📊 Phase 9: Data Integrity

### Test 9.1: No ENV-Based Markets
**Check Code**:
1. Search codebase for `ECO_DEFAULT_SYMBOLS`
2. Verify it's only in old/backup files

**Expected**:
- [ ] WebSocket server uses `getEnabledTwdSymbols()` from DB
- [ ] Defaults API uses DB query
- [ ] Frontend uses API endpoints
- [ ] NO hardcoded symbol arrays

### Test 9.2: Database Consistency
**Verify**:
```sql
-- All markets have valid type
SELECT COUNT(*) FROM twd_market
WHERE type NOT IN ('forex', 'stocks', 'indices');
-- Should be 0

-- All orders reference existing markets
SELECT COUNT(*) FROM twd_order o
LEFT JOIN twd_market m ON o.symbol = m.symbol
WHERE m.id IS NULL;
-- Should be 0

-- All TWD_PAPER wallets belong to users
SELECT COUNT(*) FROM wallet w
LEFT JOIN user u ON w.userId = u.id
WHERE w.type = 'TWD_PAPER' AND u.id IS NULL;
-- Should be 0
```

### Test 9.3: Separation from Other Trading
**Verify**:
1. Place TWD order
2. Check SPOT wallet unchanged
3. Check FUTURES wallet unchanged

**Expected**:
- [ ] TWD_PAPER wallet isolated
- [ ] No interference with other trading types

---

## ✅ Phase 10: Final Verification

### Admin Checklist
- [ ] Provider can be enabled/disabled
- [ ] Markets can be imported from TwelveData API
- [ ] Import preserves enabled/disabled status on re-import
- [ ] Individual markets can be enabled/disabled
- [ ] Bulk enable/disable works
- [ ] Admin UI responsive and usable

### User Checklist
- [ ] `/forex` shows only enabled forex markets
- [ ] `/stocks` shows only enabled stocks
- [ ] `/indices` shows only enabled indices
- [ ] Clicking market navigates to trading page
- [ ] Paper trading banner visible
- [ ] Can place MARKET orders
- [ ] Can place LIMIT orders
- [ ] Can cancel LIMIT orders
- [ ] Balance updates correctly
- [ ] Reset balance works
- [ ] WebSocket provides real-time prices

### System Checklist
- [ ] No ENV-based symbol lists used
- [ ] WebSocket subscribes to enabled markets only
- [ ] Cron executes LIMIT orders correctly
- [ ] No performance degradation
- [ ] Logs show no errors
- [ ] Database queries optimized (indexed)

---

## 📈 Performance Benchmarks

### Target Metrics
- [ ] `/api/ext/twd/market?type=forex` responds < 500ms
- [ ] Market import completes < 30 seconds
- [ ] WebSocket subscribes to 50 symbols < 5 seconds
- [ ] Order placement completes < 1 second
- [ ] Page loads < 3 seconds

---

## 🐛 Known Issues to Watch For

**If these occur, report immediately**:
- ❌ Disabled markets appearing on user pages
- ❌ WebSocket subscribing to disabled markets
- ❌ ENV symbols appearing in WebSocket logs
- ❌ Duplicate markets in database
- ❌ Balance going negative
- ❌ Orders not executing when price reached

---

## 📝 Test Results Summary

### Statistics
- **Total Tests**: 50+
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___
- **Skipped**: ___

### Critical Findings
_List P0 issues here_

### Recommendations
_List improvements or enhancements_

---

## ✅ Sign-Off

**QA Lead**: _____________ (Name, Date)
**Approved By**: _____________ (Name, Date)

**Status**: ☐ Approved  ☐ Needs Fixes  ☐ Blocked

---

**Document Version**: 2.0.0
**Last Updated**: 2025-11-13
**Next Review**: After production deployment
