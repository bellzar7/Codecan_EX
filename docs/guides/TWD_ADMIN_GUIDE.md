# TwelveData Paper Trading - Admin Guide

**Version**: 2.0.0 (Integrated into Finance → Exchange)
**Date**: 2025-11-14
**For**: Platform Administrators

---

## 📋 Overview

This guide explains how to manage TwelveData Paper Trading through the Finance → Exchange admin panel. Users can practice trading forex pairs, stocks, and indices using virtual funds with real market data.

### What Changed in v2.0

**Before (v1.0 - ENV-based)**:
- Markets loaded from hardcoded ENV variables
- Admin couldn't control which markets appear
- Required code changes to add/remove markets

**After (v2.0 - Integrated with Exchange Management)**:
- TWD appears alongside Spot/Futures providers
- Markets imported from TwelveData API via UI
- Admin controls which markets are enabled/disabled
- WebSocket automatically subscribes to enabled markets only
- Same UX as other exchange providers

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
1. TwelveData API account: https://twelvedata.com
2. API Key from your TwelveData dashboard
3. Admin access to your platform

### Step 1: Configure API Key
Add to your `.env` file:
```env
TWD_API_KEY=your_twelvedata_api_key_here
TWD_BASE_URL=https://api.twelvedata.com
TWD_WS_URL=wss://ws.twelvedata.com/v1/quotes/price
```

Restart backend:
```bash
pm2 restart backend
# or
pnpm dev:backend
```

### Step 2: Access TWD Provider
1. Log in as admin
2. Navigate to: **Admin → Finance → Exchange**
   - URL: `http://localhost:3000/admin/finance/exchange`
3. You'll see a list of exchange providers (Binance, KuCoin, TwelveData, etc.)
4. Click on **"TwelveData Paper Trading"** row
   - This opens: `/admin/finance/exchange/provider/twelvedata`

### Step 3: Enable Provider
1. On the TwelveData provider detail page
2. At the top right, you'll see a **green "Enable"** button (or red "Disable" if already enabled)
3. Click **"Enable"**
4. Status tag should change to "Active" (green)

### Step 4: Import Markets
1. Still on the provider detail page
2. Scroll to the **"Import Markets from TwelveData"** card
3. Click the **"Import Markets"** button
4. The system will:
   - Fetch forex pairs from `/forex_pairs` endpoint
   - Fetch stocks from `/stocks` endpoint
   - Fetch indices from `/indices` endpoint
   - Store all markets in database with `status = false` (disabled by default)
5. Success message appears: "Markets imported successfully! (X forex, Y stocks, Z indices)"
6. Markets now appear in the table below

### Step 5: Enable Markets
1. Scroll down to the **"TwelveData Markets"** table
2. You'll see columns:
   - **Symbol**: EUR/USD, AAPL, SPX, etc.
   - **Type**: forex, stocks, indices (use dropdown to filter)
   - **Name**: Full market name
   - **Exchange**: Stock exchange or country
   - **Status**: Toggle switch (red = disabled, green = enabled)
3. **To enable a single market**:
   - Find the market (use search or filter by type)
   - Click the status toggle → Changes to green
   - Market is immediately available to users
4. **To enable multiple markets**:
   - Filter by type (e.g., "forex")
   - Enable 10-15 major pairs (see recommendations below)
   - Repeat for stocks and indices

### Step 6: Verify User Can Trade
1. Log out from admin panel
2. Log in as regular user
3. Navigate to:
   - `/forex` - Should show enabled forex pairs
   - `/stocks` - Should show enabled stocks
   - `/indices` - Should show enabled indices
4. Click a market → Should navigate to trading page
5. Trading page should show:
   - "Paper Trading Mode" banner
   - Real-time prices from TwelveData
   - Paper wallet balance (default $10,000 USD)
   - Market/Limit order forms

**Done!** Users can now practice trading.

---

## 📖 Detailed Admin Flow

### Navigation Path

```
Admin Panel
  └─ Finance
      └─ Exchange
          ├─ Provider List (/admin/finance/exchange)
          │   ├─ Binance
          │   ├─ KuCoin
          │   └─ TwelveData Paper Trading ← Click here
          │
          └─ Provider Detail (/admin/finance/exchange/provider/twelvedata)
              ├─ Provider Status (Enable/Disable)
              ├─ Import Markets Button
              └─ Markets Table
                  ├─ Filter by Type
                  ├─ Search by Symbol
                  └─ Enable/Disable Toggle
```

### Provider Detail Page Features

**Header Section**:
- Provider name: "TwelveData Paper Trading"
- Version tag
- Status tag (Active/Inactive)
- Enable/Disable button

**About Section**:
- Description of TwelveData integration
- Paper trading explanation

**Import Markets Section**:
- "Import Markets" button
- Import status messages
- Counts by type (forex, stocks, indices)

**Markets Table**:
- Sortable columns
- Type filter dropdown
- Symbol search
- Status toggles
- Edit/Delete actions

**Quick Links**:
- View Forex Markets (user page)
- View Stocks (user page)
- View Indices (user page)

---

## 🔧 Market Management

### Import Process

**What Happens When You Click "Import Markets"**:
1. Backend calls TwelveData API:
   ```
   GET https://api.twelvedata.com/forex_pairs?apikey=XXX
   GET https://api.twelvedata.com/stocks?apikey=XXX
   GET https://api.twelvedata.com/indices?apikey=XXX
   ```
2. Parses response data
3. For each market:
   - **If NEW**: Creates entry with `status = false`
   - **If EXISTS**: Updates name/metadata but preserves status
4. **Deletes** markets that no longer exist in TwelveData API
5. Returns counts: `{forex: 50, stocks: 5000, indices: 100}`

**Database Table**: `twd_market`

**Fields**:
- `id` (UUID)
- `symbol` (EUR/USD, AAPL, SPX)
- `type` (forex, stocks, indices)
- `name` (Full name)
- `currency` (Base currency)
- `pair` (Quote currency for forex)
- `exchange` (Stock exchange or country)
- `metadata` (JSON with additional data)
- `status` (boolean - enabled/disabled)
- `isTrending` (boolean)
- `isHot` (boolean)

### Filtering Markets

**By Type**:
- Click the **Type** column dropdown
- Select: Forex, Stocks, or Indices
- Table updates to show only selected type

**By Symbol**:
- Use search box at top of table
- Type: "EUR" → Shows EUR/USD, EUR/GBP, EUR/JPY, etc.
- Type: "AAPL" → Shows Apple stock

**By Status**:
- Click **Status** column filter
- Select: Enabled or Disabled
- Shows only markets matching that status

### Bulk Operations

**Enable Multiple Markets**:
1. Select checkboxes next to markets (if supported by DataTable)
2. Click "Enable Selected" button
3. All selected markets enabled at once

**Disable Multiple Markets**:
1. Select checkboxes
2. Click "Disable Selected" button

(Note: Check if your DataTable component supports bulk operations)

---

## 📊 Recommended Market Setup

### Forex Pairs (15 Recommended)

**Majors** (8):
- EUR/USD
- GBP/USD
- USD/JPY
- USD/CHF
- AUD/USD
- USD/CAD
- NZD/USD

**Crosses** (7):
- EUR/GBP
- EUR/JPY
- GBP/JPY
- AUD/JPY
- EUR/CHF
- GBP/AUD
- EUR/AUD

### Stocks (20 Recommended)

**Tech** (7):
- AAPL (Apple)
- MSFT (Microsoft)
- GOOGL (Alphabet)
- AMZN (Amazon)
- META (Meta)
- TSLA (Tesla)
- NVDA (Nvidia)

**Finance** (5):
- JPM (JPMorgan Chase)
- BAC (Bank of America)
- WFC (Wells Fargo)
- GS (Goldman Sachs)
- V (Visa)

**Consumer** (5):
- WMT (Walmart)
- KO (Coca-Cola)
- MCD (McDonald's)
- NKE (Nike)
- DIS (Disney)

**Other** (3):
- XOM (Exxon Mobil)
- JNJ (Johnson & Johnson)
- PG (Procter & Gamble)

### Indices (10 Recommended)

**US** (5):
- SPX (S&P 500)
- DJI (Dow Jones)
- IXIC (NASDAQ)
- NDX (NASDAQ 100)
- RUT (Russell 2000)

**International** (5):
- FTSE (UK)
- DAX (Germany)
- CAC (France)
- N225 (Japan Nikkei)
- HSI (Hong Kong Hang Seng)

---

## 🔌 WebSocket Integration

### How WebSocket Subscriptions Work

**Before (ENV-based)**:
```javascript
// Subscribed to hardcoded list from .env
const symbols = process.env.ECO_DEFAULT_SYMBOLS.split(',');
provider.subscribe(symbols); // All markets, enabled or not
```

**After (DB-driven)**:
```javascript
// Subscribes only to enabled markets
const markets = await twdMarket.findAll({ where: { status: true } });
const symbols = markets.map(m => m.symbol);
provider.subscribe(symbols); // Only enabled markets
```

### Refresh Interval

WebSocket re-queries enabled markets every **60 seconds**:
- Automatically picks up newly enabled markets
- Unsubscribes from disabled markets
- No manual restart needed

### Monitoring

**View WebSocket logs**:
```bash
# Development
pnpm dev:eco:ws

# Production
pm2 logs eco-ws --lines 50
```

**Expected output**:
```
[eco-ws] subscribed to enabled TWD markets from DB: EUR/USD,GBP/USD,USD/JPY,AAPL,SPX
[eco-ws] Received price update: EUR/USD = 1.0845
[eco-ws] Received price update: AAPL = 178.25
```

**Troubleshooting**:
- If market prices don't update, check eco-ws logs
- Verify market symbol matches TwelveData format
- Ensure TWD_API_KEY is valid

---

## 🛠️ Troubleshooting

### Provider Not Appearing

**Problem**: TwelveData provider doesn't show on `/admin/finance/exchange`

**Solution**:
1. Restart backend:
   ```bash
   pm2 restart backend
   ```
2. Check server logs:
   ```bash
   pm2 logs backend --lines 50
   ```
3. Look for:
   ```
   [TWD] Created TwelveData exchange provider entry
   ```
4. If missing, manually check database:
   ```sql
   SELECT * FROM exchange WHERE productId = 'twelvedata';
   ```
5. If entry doesn't exist, run:
   ```bash
   pnpm seed  # If you have a seeder
   ```

### Import Button Disabled

**Problem**: "Import Markets" button is grayed out

**Solution**:
1. Provider must be **enabled** first
2. Click "Enable" button at top right
3. Import button should become active

### Import Fails

**Problem**: Import returns error or 0 markets

**Solutions**:

**1. API Key Missing**:
```bash
# Check .env file
cat .env | grep TWD_API_KEY
```
If missing, add:
```env
TWD_API_KEY=your_api_key_here
```
Restart backend:
```bash
pm2 restart backend
```

**2. API Key Invalid**:
- Log in to TwelveData dashboard
- Verify API key is active
- Check usage limits (free tier has limits)
- Regenerate API key if needed

**3. Network Issue**:
- Check server has internet access
- Verify firewall allows outbound HTTPS to `api.twelvedata.com`
- Test manually:
  ```bash
  curl "https://api.twelvedata.com/forex_pairs?apikey=YOUR_KEY"
  ```

**4. TwelveData API Down**:
- Check TwelveData status page
- Try again in a few minutes

### Markets Don't Appear for Users

**Problem**: User goes to `/forex` but sees empty list

**Solutions**:

**1. Markets Not Enabled**:
- Go back to provider detail page
- Check markets table
- Ensure status toggles are green (enabled)

**2. Cache Issue**:
- Clear Redis cache:
  ```bash
  redis-cli FLUSHDB
  ```
- Refresh user page

**3. Wrong URL**:
- Forex pairs: `/forex`
- Stocks: `/stocks`
- Indices: `/indices`
- NOT: `/trade` (that's for specific market)

### WebSocket Not Subscribing

**Problem**: eco-ws logs show empty subscription list

**Solution**:
1. Check enabled markets:
   ```sql
   SELECT symbol FROM twd_market WHERE status = true;
   ```
2. If empty, enable markets via admin UI
3. Wait 60 seconds for WebSocket refresh
4. Or restart eco-ws:
   ```bash
   pm2 restart eco-ws
   ```

### User Can't Place Orders

**Problem**: User sees "Insufficient balance" or order fails

**Solutions**:

**1. Paper Wallet Not Created**:
- Check user has TWD_PAPER wallet:
  ```sql
  SELECT * FROM wallet WHERE userId = 'USER_ID' AND type = 'TWD_PAPER';
  ```
- If missing, wallet should be auto-created on first visit

**2. Zero Balance**:
- Paper wallets start with $10,000 USD
- Check wallet balance:
  ```sql
  SELECT balance FROM wallet WHERE userId = 'USER_ID' AND type = 'TWD_PAPER' AND currency = 'USD';
  ```
- If zero, check if user reset or lost funds trading

**3. Market Not Enabled**:
- Verify market is enabled in admin
- Check WebSocket is subscribed to that symbol

---

## 🔐 Security & Performance

### API Key Protection

**DO**:
- Store API key in `.env` file (not in code)
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate API key periodically

**DON'T**:
- Commit API key to git
- Expose API key in frontend code
- Share API key publicly

### Rate Limiting

**TwelveData Free Tier**:
- 800 API calls/day
- 8 calls/minute

**Recommendations**:
- Import markets once per week (not daily)
- WebSocket uses single connection (efficient)
- Cache market data in Redis

### Database Performance

**Indexes**:
- `twd_market.symbol` (for quick lookups)
- `twd_market.status` (for filtering enabled markets)
- `twd_market.type` (for type filters)

**Cleanup**:
- Delete old orders periodically
- Archive inactive users' paper wallets

---

## 📝 Best Practices

### Market Selection

**Start Small**:
- Enable 10-15 forex pairs
- Enable 20-30 stocks
- Enable 5-10 indices

**Monitor Usage**:
- Check which markets users trade most
- Disable low-volume markets
- Add popular markets based on demand

### Regular Maintenance

**Weekly**:
- Check TwelveData API usage
- Review enabled markets
- Check WebSocket connection status

**Monthly**:
- Re-import markets (TwelveData adds/removes symbols)
- Rotate API key
- Review user feedback

**Quarterly**:
- Audit paper trading performance
- Update recommended markets list
- Clear old test data

---

## 📞 Support

**Documentation**:
- TWD_ARCHITECTURE.md - Technical architecture
- TWD_USER_GUIDE.md - User-facing guide
- QA_TWD_Flow.md - Testing checklist
- TWD_IMPLEMENTATION_CHANGES.md - Changelog

**Logs to Check**:
```bash
pm2 logs backend --lines 100
pm2 logs eco-ws --lines 100
pm2 logs frontend --lines 100
```

**Database Queries**:
```sql
-- Check provider status
SELECT * FROM exchange WHERE productId = 'twelvedata';

-- Count enabled markets
SELECT type, COUNT(*) FROM twd_market WHERE status = true GROUP BY type;

-- List enabled forex pairs
SELECT symbol FROM twd_market WHERE type = 'forex' AND status = true;

-- Check recent orders
SELECT * FROM twd_order ORDER BY createdAt DESC LIMIT 10;
```

---

**Last Updated**: 2025-11-14
**Document Version**: 2.0.0
**Platform Version**: Bicrypto 4.6.3
