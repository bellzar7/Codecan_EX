# QA Checklist - TWD Paper Trading

**Module**: TwelveData Paper Trading Integration
**Version**: 1.0.0
**Date**: 2025-11-12
**Status**: Ready for Testing

---

## 📋 Test Environment Setup

- [ ] Backend server running on port 4000
- [ ] Frontend running on port 3000
- [ ] MySQL database configured and running
- [ ] ScyllaDB configured (for ecosystem)
- [ ] Redis configured and running
- [ ] Kafka configured (optional, for advanced features)
- [ ] TwelveData API key configured in `.env`
- [ ] Initial database migrations applied
- [ ] Test user account created with KYC approved (if trade restrictions enabled)

---

## 🔧 Admin Flow Tests

### TWD Provider Management

- [ ] **Create Provider**
  - Navigate to admin TWD provider management
  - Create new provider with valid TwelveData API key
  - Verify provider appears in list
  - Test with invalid API key (should show error)

- [ ] **Edit Provider**
  - Edit existing provider name/API key
  - Changes persist after save
  - Can toggle provider status (active/inactive)

- [ ] **Delete Provider**
  - Delete provider (should fail if markets exist)
  - Confirm deletion requires confirmation

### TWD Market Management

- [ ] **Import Markets**
  - Import forex markets from TwelveData
  - Import stock markets
  - Import indices markets
  - Verify correct market count imported
  - Check duplicate prevention (reimporting same markets)

- [ ] **Enable/Disable Markets**
  - Enable specific markets
  - Verify only enabled markets appear on frontend
  - Disable markets
  - Verify disabled markets don't appear on frontend

- [ ] **Search/Filter Markets**
  - Search markets by symbol
  - Filter by type (forex/stocks/indices)
  - Filter by status (enabled/disabled)

- [ ] **Bulk Operations**
  - Enable multiple markets at once
  - Disable multiple markets at once

---

## 📊 Market Pages Tests

### `/forex` Page

- [ ] **Page Load**
  - Page loads without errors
  - Shows loading skeleton initially
  - Markets list displays correctly after load
  - Paper trading banner appears with correct text

- [ ] **Market List Display**
  - All enabled forex pairs display
  - Symbol, name, type display correctly
  - Default price values shown (0.00 if no realtime data)

- [ ] **Paper Balance Widget**
  - Balance displays when logged in
  - Balance hidden when logged out
  - Balance formatted correctly ($10,000.00 USD)
  - Updates after reset operation

- [ ] **Reset Balance Button**
  - Button visible only when logged in
  - Clicking shows loading state
  - Success toast appears after reset
  - Balance updates to $10,000.00
  - Error toast appears if reset fails

- [ ] **Search Functionality**
  - Search by symbol works (e.g., "EUR/USD")
  - Search by name works
  - Search is case-insensitive
  - Results update in real-time

- [ ] **Sorting**
  - Sort by symbol (ascending/descending)
  - Sort by name
  - Sort arrows indicate direction

- [ ] **Pagination**
  - Default shows 25 items per page
  - Can change items per page (10, 25, 50, 100)
  - Page navigation works
  - Correct page numbers displayed

- [ ] **Navigation**
  - Clicking market row navigates to `/trade/[symbol]`
  - Symbol converted correctly (EUR/USD → EUR_USD)

- [ ] **Error Handling**
  - Error toast appears if markets fail to load
  - Retry mechanism works
  - Graceful degradation if wallet fetch fails

### `/indices` Page

- [ ] All tests from `/forex` page apply
- [ ] Shows only indices markets (SPX, DJI, etc.)
- [ ] Page title shows "Indices Trading (Paper)"

### `/stocks` Page

- [ ] All tests from `/forex` page apply
- [ ] Shows only stock markets (AAPL, GOOGL, etc.)
- [ ] Page title shows "Stocks Trading (Paper)"

---

## 💹 Trading Page Tests (`/trade/[symbol]`)

### Page Initialization

- [ ] **Market Detection**
  - TWD markets load correctly (EUR/USD, AAPL, SPX)
  - Regular crypto markets still work (BTC/USDT)
  - External TWD market creates `isTwd=true` flag
  - Market data structure correct

- [ ] **Paper Trading Indicator**
  - Warning banner appears for TWD markets
  - Banner shows "Paper Trading Mode - All trades use virtual funds"
  - Banner does NOT appear for regular crypto markets
  - Banner is responsive on mobile/desktop

- [ ] **Layout & Components**
  - Ticker displays correctly
  - Orderbook shows (may be empty for TWD)
  - Chart loads and displays
  - Order form displays
  - Markets sidebar displays
  - Trades list displays
  - Orders list displays at bottom

### Wallet & Balance

- [ ] **Balance Display**
  - TWD_PAPER balance displays in order form
  - Balance shows in USD
  - Balance updates after trades
  - Balance precision correct (2 decimals)

- [ ] **Balance Validation**
  - Cannot place BUY order exceeding balance
  - Error message clear about insufficient funds
  - Shows current balance vs required amount

### Order Placement - MARKET Orders

- [ ] **BUY MARKET Order**
  - Can enter amount
  - Price shows "Market" (disabled input)
  - Percentage slider works (25%, 50%, 75%, 100%)
  - Click "Buy" button
  - Loading state appears
  - Order executes immediately
  - Balance deducted (cost + fee)
  - Success feedback (toast or visual)
  - Order appears in "Order History" tab
  - Order status is "CLOSED"

- [ ] **SELL MARKET Order**
  - Can enter amount
  - Price shows "Market"
  - Click "Sell" button
  - Order executes immediately
  - Balance increased (proceeds - fee)
  - Order appears in history

- [ ] **MARKET Order Edge Cases**
  - Cannot submit with zero amount
  - Cannot submit with negative amount
  - Amount validation shows errors
  - Button disabled when amount invalid

### Order Placement - LIMIT Orders

- [ ] **BUY LIMIT Order**
  - Can enter amount
  - Can enter limit price
  - "Best Ask" button sets price to current ask
  - Percentage slider works
  - Click "Buy" button
  - Order created with status "OPEN"
  - Balance reserved (cost + fee deducted)
  - Order appears in "Open Orders" tab
  - Order shows price, amount, remaining, status

- [ ] **SELL LIMIT Order**
  - Can enter amount
  - Can enter limit price
  - "Best Bid" button sets price
  - Order created successfully
  - Order appears in "Open Orders"

- [ ] **LIMIT Order Edge Cases**
  - Cannot submit with zero price
  - Cannot submit with zero amount
  - Validation prevents invalid inputs
  - Price precision respected

### Order Management

- [ ] **View Open Orders**
  - Open orders tab shows OPEN and ACTIVE orders only
  - Columns display: Date, Type, Side, Price, Amount, Filled, Remaining, Cost, Status
  - Side colored (BUY=green, SELL=red)
  - Status colored appropriately

- [ ] **Cancel Order**
  - Cancel button appears for OPEN orders
  - Click cancel shows loading state
  - Order removed from open orders immediately
  - Balance refunded for BUY orders
  - Order status updated to "CANCELED" in database
  - Can view canceled order in history

- [ ] **Order History**
  - History tab shows CLOSED, CANCELED, REJECTED orders
  - All columns display correctly
  - Can search/filter history
  - Pagination works

- [ ] **Order Updates**
  - LIMIT orders execute when price reached (cron job)
  - Order status updates from OPEN → CLOSED
  - Filled/remaining amounts update
  - Balance updated after execution

### Real-time Updates

- [ ] **Price Updates (WebSocket)**
  - Ticker updates with live prices
  - Chart updates in real-time
  - Ask/Bid prices update
  - No console errors related to WebSocket

- [ ] **Order Updates (WebSocket)**
  - Open orders update when filled
  - New orders appear automatically
  - Order status changes reflect immediately

### Compact Order Input (Mobile)

- [ ] **Mobile Order Form**
  - Compact order input shows on mobile
  - BUY/SELL toggle works
  - All functionality from desktop works
  - Layout is usable on small screens

### Error Handling

- [ ] **Network Errors**
  - Lost connection shows error
  - Retry mechanism works
  - User notified of issues

- [ ] **Invalid Symbols**
  - Non-existent market shows error
  - Disabled market not tradeable

- [ ] **Server Errors**
  - 500 errors show user-friendly message
  - Logs captured for debugging

---

## ⚙️ Backend API Tests

### TWD Market API

- [ ] **GET `/api/ext/twd/market`**
  - Returns all markets when no filter
  - Filter by type: `?type=forex` works
  - Filter by type: `?type=stocks` works
  - Filter by type: `?type=indices` works
  - Only returns enabled markets
  - Returns correct fields (id, symbol, currency, pair, type, name, etc.)

- [ ] **GET `/api/ext/twd/market/:symbol`**
  - Returns single market by symbol
  - Returns 404 for non-existent market
  - Returns disabled markets (for admin use)

### TWD Order API

- [ ] **POST `/api/ext/twd/order`**
  - Creates MARKET order successfully
  - Creates LIMIT order successfully
  - Validates required fields
  - Validates order type (MARKET/LIMIT only)
  - Validates side (BUY/SELL only)
  - Validates amount > 0
  - Validates price > 0 for LIMIT orders
  - Checks market exists and enabled
  - Checks sufficient balance
  - Returns proper error messages
  - Executes in transaction (atomicity)

- [ ] **GET `/api/ext/twd/order`**
  - Returns user's orders only (security)
  - Filter by status: `?status=OPEN` works
  - Filter by status: `?status=CLOSED` works
  - Returns correct fields
  - Pagination works (if implemented)

- [ ] **DELETE `/api/ext/twd/order/:id`**
  - Cancels order successfully
  - Only owner can cancel (security)
  - Only OPEN orders can be canceled
  - Balance refunded correctly
  - Returns 404 for non-existent order
  - Returns error for already closed order

### TWD Wallet API

- [ ] **GET `/api/finance/wallet?type=TWD_PAPER`**
  - Returns TWD_PAPER wallet
  - Creates wallet if doesn't exist (initial balance $10,000)
  - Returns correct balance
  - Only returns authenticated user's wallet (security)

- [ ] **POST `/api/ext/twd/wallet/reset`**
  - Resets balance to $10,000
  - Resets inOrder to 0
  - Requires authentication
  - Returns updated balance
  - Creates wallet if doesn't exist

---

## 🤖 Cron Job Tests

### `processTwdLimitOrders` Cron

- [ ] **Cron Registration**
  - Cron job registered on server start
  - Logs show cron is running
  - Runs at specified interval (e.g., every 1 minute)

- [ ] **Order Processing**
  - Creates TWD LIMIT BUY order at price above current market
  - Wait for cron to run
  - Order should NOT execute yet (price not reached)
  - Change market conditions or lower limit price
  - Wait for cron to run
  - Order executes when price condition met
  - Order status changes OPEN → CLOSED
  - Balance updated correctly
  - Filled/remaining updated

- [ ] **Error Handling**
  - Cron doesn't crash on errors
  - Failed orders logged
  - Processing continues for other orders

---

## 🔒 Security Tests

### Authentication

- [ ] **Protected Routes**
  - Cannot place orders without login
  - Cannot view orders without login
  - Cannot reset wallet without login
  - Login redirects work correctly

- [ ] **Authorization**
  - User A cannot see User B's orders
  - User A cannot cancel User B's orders
  - User A cannot access User B's wallet

### Data Validation

- [ ] **Input Sanitization**
  - SQL injection prevented (symbol, amount, price)
  - XSS prevented in user inputs
  - Type validation enforced

### Rate Limiting

- [ ] **API Rate Limits**
  - Rate limiting applied to order creation
  - Prevents spam/abuse
  - Error message clear

---

## 🌐 Cross-Browser Tests

- [ ] **Chrome/Edge** - All functionality works
- [ ] **Firefox** - All functionality works
- [ ] **Safari** - All functionality works (Mac/iOS)
- [ ] **Mobile Chrome** - Responsive layout, all features work
- [ ] **Mobile Safari** - iOS testing complete

---

## 📱 Responsive Design Tests

- [ ] **Desktop (1920x1080)**
  - Layout looks good
  - All elements accessible
  - No horizontal scroll

- [ ] **Laptop (1366x768)**
  - Layout adjusts properly
  - Readable text
  - Functional UI

- [ ] **Tablet (768x1024)**
  - Markets list readable
  - Order form usable
  - Navigation works

- [ ] **Mobile (375x667)**
  - Compact order input shown
  - Markets list scrollable
  - Text readable
  - Buttons accessible
  - No overlapping elements

---

## 🚀 Performance Tests

- [ ] **Page Load Time**
  - Markets page loads < 2 seconds
  - Trading page loads < 3 seconds

- [ ] **Order Execution Speed**
  - MARKET orders execute < 1 second
  - LIMIT orders created < 500ms

- [ ] **WebSocket Performance**
  - Real-time updates have minimal lag
  - No memory leaks after extended use
  - CPU usage reasonable

- [ ] **Large Dataset Handling**
  - 100+ markets load and paginate properly
  - 100+ orders display without lag
  - Sorting/filtering remains fast

---

## ♿ Accessibility Tests

- [ ] **Keyboard Navigation**
  - Can tab through all interactive elements
  - Can submit forms with Enter key
  - Focus indicators visible

- [ ] **Screen Reader**
  - Buttons have proper labels
  - Form inputs have labels
  - Error messages announced

- [ ] **Color Contrast**
  - Text readable in light mode
  - Text readable in dark mode
  - Meets WCAG AA standards

---

## 🐛 Edge Cases & Error Scenarios

### Network Issues

- [ ] **Slow Connection**
  - Loading states display
  - Timeouts handled gracefully
  - User notified of issues

- [ ] **Offline Mode**
  - Clear error message
  - Can't place orders offline
  - Reconnection handled

### Concurrent Operations

- [ ] **Multiple Tabs**
  - State syncs across tabs (WebSocket)
  - No conflicts in order placement

- [ ] **Rapid Clicks**
  - Double-submit prevention works
  - Loading states prevent duplicates

### Data Integrity

- [ ] **Negative Balance Prevention**
  - Cannot overdraw balance
  - Validation catches edge cases

- [ ] **Order Amount Edge Cases**
  - Very small amounts (0.0001) work
  - Very large amounts validated
  - Decimal precision maintained

- [ ] **Price Edge Cases**
  - Very high prices handled
  - Very low prices handled
  - Zero price rejected for LIMIT

### Browser Edge Cases

- [ ] **Cookies Disabled**
  - Auth still works (if token-based)
  - Graceful degradation

- [ ] **JavaScript Disabled**
  - Shows message to enable JS
  - No silent failures

- [ ] **Ad Blockers**
  - Site functionality not broken
  - WebSocket not blocked

---

## 🔄 Regression Tests

### Existing Functionality

- [ ] **Regular Crypto Trading (SPOT)**
  - BTC/USDT trading still works
  - No interference from TWD code
  - Wallets separate (SPOT ≠ TWD_PAPER)

- [ ] **Ecosystem Trading (ECO)**
  - ECO markets still work
  - No conflicts with TWD markets

- [ ] **Futures Trading**
  - Futures functionality unaffected

- [ ] **Other Platform Features**
  - Deposits/withdrawals work
  - User profile works
  - KYC flow works
  - Admin panel accessible

---

## 📋 Test Results Summary

### Statistics

- **Total Test Cases**: 250+
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___
- **Skipped**: ___

### Critical Issues (P0)

_List any P0 issues discovered during testing_

### Major Issues (P1)

_List any P1 issues discovered during testing_

### Minor Issues (P2)

_List any P2 issues discovered during testing_

---

## ✅ Sign-Off

- [ ] **QA Lead Approval**: _____________ (Name, Date)
- [ ] **Product Owner Approval**: _____________ (Name, Date)
- [ ] **Technical Lead Approval**: _____________ (Name, Date)

---

## 📝 Notes

_Add any additional notes, observations, or recommendations here_

---

**Document Version**: 1.0
**Last Updated**: 2025-11-12
**Prepared By**: Development Team
