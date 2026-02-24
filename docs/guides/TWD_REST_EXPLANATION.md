# TWD_DISABLE_REST Flag Explanation

## The Core Issue

**TwelveData WebSocket API only provides CURRENT PRICE** - it does NOT provide:
- 24h open price
- 24h high/low
- 24h volume
- 24h change/changePercent

These stats REQUIRE REST API calls to TwelveData's `/quote` or `/time_series` endpoints.

## Current Behavior with TWD_DISABLE_REST=true

When you set `TWD_DISABLE_REST=true`:

### ✅ What WORKS:
- WebSocket connection subscribes to symbols
- Real-time price updates via WebSocket
- Redis ticker has current `price` field updated
- `/api/ext/twd/ticker` returns ticker with current price

### ❌ What DOESN'T work:
- `change` stays ~0 (because we don't have 24h open price to calculate from)
- `changePercent` stays ~0
- `volume` stays 0
- `high` and `low` are set to current price (not real 24h high/low)
- `/forex` page shows -0.00% for Change
- Trading page header shows 0 for 24h stats

## Why This Happens

Redis ticker structure in `server.ts:312-323`:
```typescript
tickerData = {
  symbol: ev.symbol,
  price: ev.price,          // ✅ From WebSocket
  open: ev.price,           // ❌ Wrong - set to current price, not 24h open
  high: ev.price,           // ❌ Wrong - set to current price
  low: ev.price,            // ❌ Wrong - set to current price
  volume: 0,                // ❌ Not available from WebSocket
  change: 0,                // ❌ Can't calculate without real open
  changePercent: 0,         // ❌ Can't calculate without real open
  lastUpdate: ev.ts,
};
```

The WebSocket price event handler then updates:
```typescript
tickerData.price = ev.price;
tickerData.lastUpdate = ev.ts;

// Update high/low from current price stream
if (ev.price > tickerData.high) tickerData.high = ev.price;
if (ev.price < tickerData.low) tickerData.low = ev.price;

// Recalculate change from open
if (tickerData.open && tickerData.open !== 0) {
  tickerData.change = ev.price - tickerData.open;
  tickerData.changePercent = ((tickerData.change / tickerData.open) * 100);
}
```

**Problem:** Since `tickerData.open` is set to the first price received (not the 24h open), the change calculation is meaningless.

## Solution: Enable Quote Priming

Set `TWD_DISABLE_REST=false` (or remove the line entirely) in your `.env`:

```bash
TWD_MAX_SYMBOLS=3
# TWD_DISABLE_REST=false  # or just comment it out
```

### What This Enables:

1. **Initial priming on startup:**
   - Calls TwelveData `/quote` endpoint for each subscribed symbol
   - Gets real 24h open, high, low, volume, previous_close
   - Stores proper ticker data in Redis
   - Logs: `[eco-ws] 📊 Primed ticker with quote data: EUR/USD`

2. **Periodic refresh every 60 seconds:**
   - Updates 24h stats from quote endpoint
   - Keeps volume and change current

3. **WebSocket price updates:**
   - Continuously updates current price
   - Recalculates change% from the REAL 24h open (from quote)
   - Updates high/low if current price exceeds them

### API Credit Cost:

- Quote endpoint: **1 credit per request**
- With 3 symbols: 3 credits per 60 seconds = **~4,300 credits per day**
- TwelveData free tier: **800 credits per day**

**This WILL burn your free tier credits!**

## Alternative: Use Candles Only (No Background Priming)

If you want to keep `TWD_DISABLE_REST=true`:

### What you get:
- ✅ Real-time price from WebSocket (no credits used)
- ✅ Charts work via `/api/ext/twd/candles` (uses credits only when user opens chart)
- ❌ Change/Volume show 0 on `/forex` page
- ❌ Trading page header shows 0 for 24h stats

### What you need to accept:
- `/forex` will show "0.00%" for Change column
- 24h Volume will be 0
- This is a **known limitation** when using WebSocket-only mode

## Recommendation

For development/testing: Set `TWD_DISABLE_REST=false` to see full functionality.

For production with free tier: Either:
1. Keep `TWD_DISABLE_REST=true` and accept limited stats
2. Upgrade to TwelveData paid plan for sufficient credits
3. Only enable REST during market hours / specific times

## Candles Endpoint Behavior

The `/api/ext/twd/candles` endpoint is **NOT** blocked by `TWD_DISABLE_REST`.

This endpoint:
- Always works when client explicitly requests it
- Uses TwelveData REST API (costs credits)
- Caches for 60 seconds to minimize credit usage
- Only called when user opens trading page with chart

**TWD_DISABLE_REST only blocks background/automatic REST calls, not explicit client requests.**

## Testing With REST Enabled

To test full functionality:

1. Update `.env`:
```bash
TWD_DISABLE_REST=false
```

2. Restart eco-ws:
```bash
pm2 restart eco-ws
pm2 logs eco-ws --lines 50
```

3. Watch for priming logs:
```
[eco-ws] Initial priming of tickers with 24h data...
[eco-ws] 📊 Primed ticker with quote data: EUR/USD { price: 1.0845, change: '0.00', changePercent: '0.23', volume: 0 }
```

4. Check Redis:
```bash
redis-cli GET "twd:ticker:EUR/USD" | jq
```

Should now have real `open`, `high`, `low`, `change`, `changePercent` values.

5. Check `/forex` page - should show non-zero Change%

## Summary

| Feature | WebSocket Only (REST=true) | With Quote Priming (REST=false) |
|---------|---------------------------|----------------------------------|
| Real-time price | ✅ | ✅ |
| 24h Change % | ❌ (shows ~0%) | ✅ |
| 24h Volume | ❌ (shows 0) | ✅ |
| 24h High/Low | ⚠️ (from WS stream only) | ✅ (real 24h) |
| Charts | ✅ (on-demand) | ✅ (on-demand) |
| API Credits Used | ~0/day (WS only) | ~4,300/day (exceeds free tier) |

**Your choice depends on your priority: full stats vs. credit conservation.**
