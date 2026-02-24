-- TWD: Enable Only Valid Major Symbols
-- Run this to enable symbols that TwelveData free tier definitely supports
-- Date: 2025-11-14

-- First, disable all markets
UPDATE twd_market SET status = false;

-- Enable Major Forex Pairs (most liquid, always supported)
UPDATE twd_market SET status = true WHERE symbol IN (
  'EUR/USD',  -- Euro / US Dollar
  'GBP/USD',  -- British Pound / US Dollar
  'USD/JPY',  -- US Dollar / Japanese Yen
  'USD/CHF',  -- US Dollar / Swiss Franc
  'AUD/USD',  -- Australian Dollar / US Dollar
  'USD/CAD',  -- US Dollar / Canadian Dollar
  'NZD/USD',  -- New Zealand Dollar / US Dollar
  'EUR/GBP',  -- Euro / British Pound
  'EUR/JPY',  -- Euro / Japanese Yen
  'GBP/JPY'   -- British Pound / Japanese Yen
);

-- Enable Major US Tech Stocks (FAANG + Microsoft)
UPDATE twd_market SET status = true WHERE symbol IN (
  'AAPL',     -- Apple Inc
  'MSFT',     -- Microsoft Corp
  'GOOGL',    -- Alphabet Inc (Google) Class A
  'AMZN',     -- Amazon.com Inc
  'META',     -- Meta Platforms Inc (Facebook)
  'NVDA',     -- NVIDIA Corp
  'TSLA',     -- Tesla Inc
  'NFLX',     -- Netflix Inc
  'AMD',      -- Advanced Micro Devices
  'INTC'      -- Intel Corp
);

-- Enable Major US Indices
UPDATE twd_market SET status = true WHERE symbol IN (
  'SPX',      -- S&P 500 Index
  'DJI',      -- Dow Jones Industrial Average
  'NDX',      -- NASDAQ 100 Index
  'RUT'       -- Russell 2000 Index
);

-- Verify what's enabled
SELECT
  type,
  COUNT(*) as count,
  GROUP_CONCAT(symbol ORDER BY symbol SEPARATOR ', ') as symbols
FROM twd_market
WHERE status = true
GROUP BY type
ORDER BY type;

-- Expected output:
-- type    | count | symbols
-- --------|-------|--------------------------------------------------
-- forex   | 10    | AUD/USD, EUR/GBP, EUR/JPY, EUR/USD, GBP/JPY, ...
-- stocks  | 10    | AAPL, AMD, AMZN, GOOGL, INTC, META, MSFT, ...
-- indices | 4     | DJI, NDX, RUT, SPX

-- Total: 24 enabled markets
