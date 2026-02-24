# TWD Paper Trading - User Guide

**Version**: 2.0.0
**Date**: 2025-11-13
**For**: Platform Users

---

## 🎯 What is Paper Trading?

**Paper Trading** is a risk-free way to practice trading using **virtual money**. All trades use simulated funds - no real money is involved.

### Benefits

✅ **Learn Trading**: Practice strategies without financial risk
✅ **Test Strategies**: Try different approaches before real trading
✅ **No Financial Risk**: Use virtual $10,000 USD balance
✅ **Real Market Data**: Live prices from TwelveData API
✅ **Full Trading Experience**: MARKET & LIMIT orders, charts, order history

### What You Can Trade

- **Forex**: Currency pairs (EUR/USD, GBP/JPY, etc.)
- **Stocks**: Company shares (AAPL, GOOGL, TSLA, etc.)
- **Indices**: Market indices (S&P 500, Dow Jones, etc.)

---

## 🚀 Getting Started (2 Minutes)

### Step 1: Navigate to Markets

From the main navigation, click:
- **"Forex"** → See available forex pairs
- **"Stocks"** → See available stocks
- **"Indices"** → See available indices

Or visit directly:
- `/forex`
- `/stocks`
- `/indices`

### Step 2: Check Your Paper Balance

At the top of the page, you'll see a **blue info banner**:

```
ℹ️ Paper Trading Mode: This is a demo trading environment.
   Paper Balance: $10,000.00 USD  [🔄 Reset Balance]
```

This is your virtual money for practice trading.

### Step 3: Browse Markets

You'll see a table with available markets:
- **Symbol**: Trading symbol (EUR/USD, AAPL, etc.)
- **Name**: Full name of instrument
- **Type**: Forex, Stocks, or Indices
- **Price**: Current market price (updates in real-time)

**Actions**:
- **Search**: Type in search box to find specific markets
- **Sort**: Click column headers to sort
- **Filter**: Use toolbar filters

### Step 4: Start Trading

1. **Click** on any market row in the table
2. You'll navigate to the **trading page**: `/trade/[symbol]`
3. You'll see a **yellow warning banner**:
   ```
   ⚠️ Paper Trading Mode - All trades use virtual funds
   ```

---

## 📈 Trading Page Overview

The trading page has several sections:

### Top Banner
- **Paper Trading Warning**: Reminds you this is demo mode
- **Symbol Info**: Current symbol, price, 24h change

### Chart
- **Real-time Price Chart**: Live updates from TwelveData
- **Time Frames**: 1m, 5m, 15m, 1h, 4h, 1d, etc.
- **Indicators**: Technical analysis tools

### Order Form (Left Panel)

Two tabs:
- **Market**: Execute immediately at current price
- **Limit**: Execute when price reaches your target

### Order Book & Trades (Center/Right)

- **Order Book**: Bid/Ask prices
- **Recent Trades**: Latest executed trades

### Your Orders (Bottom)

Two tabs:
- **Open Orders**: Your pending LIMIT orders
- **Order History**: All completed/canceled orders

---

## 💰 Placing Orders

### MARKET Orders (Instant Execution)

**What is it?**
Order executes immediately at the current market price.

**How to place**:
1. Select **"Market"** tab in order form
2. Enter **amount** (how much to buy/sell)
3. Choose **BUY** or **SELL**
4. Click **"Buy [Symbol]"** or **"Sell [Symbol]"** button
5. Order executes instantly

**Example**:
```
Market: EUR/USD
Current Price: 1.0850
Action: BUY
Amount: 1.0 EUR
Cost: 1.0850 USD + fee
```

**Result**:
- Your paper balance decreases by cost + fee
- Order appears in "Order History" with status: CLOSED

### LIMIT Orders (Execute at Target Price)

**What is it?**
Order waits until market reaches your specified price, then executes.

**How to place**:
1. Select **"Limit"** tab in order form
2. Enter **amount** (how much to buy/sell)
3. Enter **price** (your target price)
   - Use **"Best Ask"** button to fill current ask price
   - Or type custom price
4. Choose **BUY** or **SELL**
5. Click **"Buy [Symbol]"** or **"Sell [Symbol]"** button
6. Order created with status: OPEN

**Example**:
```
Market: AAPL
Current Price: 175.50
Action: BUY
Amount: 10 shares
Limit Price: 170.00  (below current - waiting for dip)
```

**Result**:
- Your paper balance decreases by (amount × price + fee)
- Order appears in "Open Orders" tab
- When price reaches 170.00, order auto-executes
- Then moves to "Order History" with status: CLOSED

**Tips**:
- **BUY Limit**: Set price below current (buy cheaper)
- **SELL Limit**: Set price above current (sell higher)

### Order Sizes

Use the **percentage slider** for quick sizing:
- **25%**: Use 1/4 of available balance
- **50%**: Use half of available balance
- **75%**: Use 3/4 of available balance
- **100%**: Use all available balance

---

## 📊 Managing Orders

### View Open Orders

1. Scroll to bottom of trading page
2. Click **"Open Orders"** tab
3. See all your pending LIMIT orders

**Columns**:
- Date: When order was placed
- Type: LIMIT
- Side: BUY or SELL
- Price: Your target price
- Amount: Quantity
- Filled: How much executed (0 for pending)
- Remaining: How much still waiting
- Status: OPEN
- Actions: Cancel button

### Cancel Order

**How**:
1. Find order in "Open Orders" tab
2. Click **"Cancel"** button (X icon)
3. Confirm cancellation

**Result**:
- Order status changes to CANCELED
- Reserved balance refunded to your account
- Order moves to "Order History"

### View Order History

1. Click **"Order History"** tab
2. See all completed/canceled orders

**Statuses**:
- **CLOSED**: Successfully executed
- **CANCELED**: You canceled it
- **REJECTED**: System rejected (rare)

---

## 💳 Paper Wallet Management

### Check Balance

Your paper balance is shown:
1. On market pages (`/forex`, `/stocks`, `/indices`) - top banner
2. On trading page - order form ("Avbl: X.XX USD")

### How Balance Changes

**BUY Order**:
```
Before: $10,000.00
BUY 1.0 EUR/USD @ 1.0850
Cost: 1.0850 USD
Fee: 0.0011 USD (0.1%)
After: $9,998.91
```

**SELL Order**:
```
Before: $9,998.91
SELL 1.0 EUR/USD @ 1.0900
Proceeds: 1.0900 USD
Fee: 0.0011 USD
After: $10,000.80 (made profit!)
```

### Reset Balance

**When to use**:
- Want to start fresh
- Ran out of virtual funds
- Testing different strategies

**How**:
1. Go to `/forex`, `/stocks`, or `/indices` page
2. Find **"Reset Balance"** button in top banner
3. Click button
4. Balance resets to $10,000.00 USD
5. Success message appears

**Note**: This does NOT cancel your open orders. Cancel them first if desired.

---

## 📚 Trading Strategies to Practice

### 1. Day Trading

**Goal**: Profit from small price movements within one day

**Practice**:
1. Pick volatile stock (e.g., TSLA)
2. Buy when price dips
3. Sell when price rises
4. Close all positions before end of day

### 2. Swing Trading

**Goal**: Hold positions for days/weeks to catch larger moves

**Practice**:
1. Analyze charts for trends
2. Place LIMIT orders at support/resistance levels
3. Wait for execution
4. Set LIMIT sell orders at profit targets

### 3. Scalping

**Goal**: Many small trades for tiny profits each

**Practice**:
1. Use MARKET orders for instant execution
2. Enter and exit quickly (seconds to minutes)
3. Focus on liquid markets (EUR/USD, SPX)
4. Small amounts, many trades

### 4. Position Trading

**Goal**: Long-term holds based on fundamentals

**Practice**:
1. Research company/economy
2. Place large LIMIT buy orders
3. Hold for weeks/months
4. Monitor performance

---

## ⚠️ Important Reminders

### This is NOT Real Trading

❌ **No real money** is used
❌ **No real execution** on exchanges
❌ **No impact** on real markets
❌ **Cannot withdraw** virtual funds

✅ **Prices are real** (from TwelveData)
✅ **Order types work** like real trading
✅ **Practice strategies** safely

### When Ready for Real Trading

Once you're confident with paper trading:
1. Navigate to **real trading pages**: `/trade` (for crypto SPOT)
2. Use **real wallets** (SPOT, FUTURES)
3. **Deposit real funds**
4. Start with **small amounts**
5. Use **risk management** (stop losses, position sizing)

---

## 🔧 Troubleshooting

### Problem: No markets showing on /forex page

**Cause**: Admin hasn't enabled any markets yet

**Solution**:
- Contact admin to enable markets
- Or wait for admin to set up

---

### Problem: "Market not found" error

**Cause**: Trying to trade disabled market

**Solution**:
- Go back to market list pages
- Only trade markets listed there

---

### Problem: Order won't execute (LIMIT order)

**Cause**: Price hasn't reached your limit price yet

**What to do**:
- **Wait**: Order will execute when price reaches limit
- **Cancel**: Cancel and place new order at different price
- **Check**: View "Open Orders" to see status

---

### Problem: Balance not updating after trade

**Cause**: Page not refreshed or temporary glitch

**Solution**:
1. Refresh page (F5)
2. Navigate away and back
3. Check "Order History" - order might have failed

---

### Problem: No real-time prices (chart not updating)

**Cause**: WebSocket connection issue

**Solution**:
1. Refresh page
2. Check internet connection
3. Try different browser
4. Contact support if persists

---

## 📊 Understanding Fees

### Fee Structure

**Rate**: 0.1% of trade value (default)

**Example**:
```
Trade: BUY 10 AAPL @ 175.00
Cost: 10 × 175.00 = 1,750.00 USD
Fee: 1,750.00 × 0.001 = 1.75 USD
Total Deducted: 1,751.75 USD
```

**Note**: Fees are for realism - in paper trading, they're virtual too!

---

## 📞 Getting Help

**Have Questions?**
- Check this User Guide
- Read Admin Guide (if you're admin)
- Contact platform support

**Found a Bug?**
- Report via support ticket
- Include: Symbol, order type, error message

**Feature Request?**
- Suggest improvements to platform team

---

## ✅ Quick Reference

### Order Types

| Type | Execution | Use When |
|------|-----------|----------|
| MARKET | Immediate | Want to trade now, price doesn't matter much |
| LIMIT | When price reached | Want specific price, willing to wait |

### Order Sides

| Side | Action | Example |
|------|--------|---------|
| BUY | Purchase asset | Buy EUR, sell USD (in EUR/USD) |
| SELL | Sell asset | Sell EUR, buy USD (in EUR/USD) |

### Order Status

| Status | Meaning |
|--------|---------|
| OPEN | Waiting for price to reach limit |
| CLOSED | Successfully executed |
| CANCELED | You canceled it |

### Pages

| Page | Purpose |
|------|---------|
| `/forex` | Browse forex pairs |
| `/stocks` | Browse stocks |
| `/indices` | Browse indices |
| `/trade/[symbol]` | Trade specific market |

---

**Happy Paper Trading!** 🎉

Practice safely, learn strategies, and build confidence before real trading.

---

**Document Version**: 2.0.0
**Last Updated**: 2025-11-13
**For Questions**: Contact Platform Support
