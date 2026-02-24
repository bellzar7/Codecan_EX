# TwelveData Import Troubleshooting Guide

**Last Updated**: 2025-11-14
**Version**: 2.0

---

## Quick Diagnosis

If import fails with **500 error**, follow these steps in order:

### Step 1: Check Backend Logs

```bash
pm2 logs backend --lines 100 | grep "TWD Import"
```

Look for the error messages. All import steps now have detailed logging:

**Expected Success Log**:
```
[TWD Import] Starting market import...
[TWD Import] API Key present: true
[TWD Import] API Key length: 32
[TWD Import] Provider check passed, proceeding with API calls...
[TWD Import] Fetching forex pairs from: https://api.twelvedata.com/forex_pairs
[TWD Import] Forex response status: 200 OK
[TWD Import] Processed 50 forex pairs
[TWD Import] Fetching stocks from: https://api.twelvedata.com/stocks
[TWD Import] Stocks response status: 200 OK
[TWD Import] Processed 5000 stocks
[TWD Import] Fetching indices from: https://api.twelvedata.com/indices
[TWD Import] Indices response status: 200 OK
[TWD Import] Processed 100 indices
[TWD Import] Total markets to import: 5150
[TWD Import] Starting database transaction...
[TWD Import] Upserting 5150 markets...
[TWD Import] Transaction complete: { created: 5150, updated: 0, deleted: 0 }
[TWD Import] Import successful!
```

---

## Common Errors and Solutions

### Error 1: "TWD_API_KEY is not configured"

**Log Message**:
```
[TWD Import] API Key present: false
[TWD Import] ERROR: TWD_API_KEY is not configured in .env file
```

**Cause**: API key missing from `.env` file

**Solution**:
```bash
# Check if key exists
cat .env | grep TWD_API_KEY

# If missing, add it:
echo "TWD_API_KEY=your_actual_key_here" >> .env

# Restart backend
pm2 restart backend
```

**Verify**: API key should be 32 characters
```bash
cat .env | grep TWD_API_KEY | wc -c
# Should output: ~47 (TWD_API_KEY= + 32 chars + newline)
```

---

### Error 2: "TwelveData provider not found in database"

**Log Message**:
```
[TWD Import] Provider found: false
[TWD Import] ERROR: TwelveData provider not found in database
```

**Cause**: Backend hasn't initialized the TWD provider yet

**Solution**:
```bash
# Restart backend to trigger initialization
pm2 restart backend

# Check logs for initialization
pm2 logs backend --lines 50 | grep TWD

# Should see:
# [TWD] Created TwelveData exchange provider entry
```

**Manual Fix** (if restart doesn't work):
```sql
INSERT INTO exchange (
  id,
  name,
  title,
  productId,
  type,
  status,
  licenseStatus,
  version
) VALUES (
  UUID(),
  'twelvedata',
  'TwelveData Paper Trading',
  'twelvedata',
  'twd',
  0,
  1,
  '1.0.0'
);
```

---

### Error 3: "TwelveData provider is disabled"

**Log Message**:
```
[TWD Import] Provider found: true
[TWD Import] Provider status: false
[TWD Import] ERROR: TwelveData provider is disabled. Please enable it first.
```

**Cause**: Provider exists but is not enabled

**Solution 1** (via UI):
1. Go to `/admin/finance/exchange/provider/twelvedata`
2. Click **"Enable"** button
3. Status should change to "Active" (green)
4. Try import again

**Solution 2** (via Database):
```sql
UPDATE exchange SET status = 1 WHERE productId = 'twelvedata';
```

**Verify**:
```sql
SELECT name, status FROM exchange WHERE productId = 'twelvedata';
-- Should show: twelvedata | 1
```

---

### Error 4: TwelveData API Returns 401/403

**Log Message**:
```
[TWD Import] Forex response status: 401 Unauthorized
[TWD Import] Forex API error: 401 {"status":"error","message":"Invalid API key"}
```

**Causes**:
1. API key is invalid
2. API key expired
3. API key hasn't been activated

**Solution**:
1. Log in to TwelveData dashboard: https://twelvedata.com/account
2. Go to API section
3. Check API key status:
   - Is it active?
   - Is it the same as in your `.env` file?
   - Has it expired?
4. If needed, regenerate API key
5. Update `.env` file with new key
6. Restart backend

**Test API Key Manually**:
```bash
# Run the test script
ts-node -r dotenv/config -r module-alias/register backend/utils/twd/test-api.ts

# Or test directly with curl:
curl "https://api.twelvedata.com/forex_pairs?apikey=YOUR_KEY"
```

---

### Error 5: TwelveData API Rate Limit

**Log Message**:
```
[TWD Import] Forex response status: 429 Too Many Requests
[TWD Import] Forex API error: 429 {"status":"error","message":"Rate limit exceeded"}
```

**Cause**: Free tier limits:
- 800 calls/day
- 8 calls/minute

**Solution**:
1. Wait for rate limit to reset (usually 1 minute)
2. Import markets less frequently (once per week recommended)
3. Upgrade TwelveData plan if needed

**Check Usage**:
- Log in to TwelveData dashboard
- View API usage statistics
- Check how many calls you've made today

---

### Error 6: "No markets were fetched from TwelveData API"

**Log Message**:
```
[TWD Import] Total markets to import: 0
[TWD Import] ERROR: No markets were fetched from TwelveData API. Please check your API key and connection.
```

**Causes**:
1. All 3 API endpoints failed (forex, stocks, indices)
2. Network connectivity issue
3. TwelveData API is down
4. API responses have unexpected format

**Diagnosis**:
Check the logs above this error:
```
[TWD Import] Forex response status: ?
[TWD Import] Stocks response status: ?
[TWD Import] Indices response status: ?
```

**Solutions**:

**If all show non-200 status**:
- Check internet connection
- Try manual curl test:
  ```bash
  curl https://api.twelvedata.com/forex_pairs?apikey=YOUR_KEY
  ```

**If responses are 200 but count is 0**:
- TwelveData might have changed their API format
- Check first item structure:
  ```
  [TWD Import] Forex data structure: { hasData: true, isArray: true, count: 50, firstItem: {...} }
  ```
- Verify `firstItem` has expected fields (symbol, currency_base, currency_quote)

**If TwelveData is down**:
- Check https://status.twelvedata.com
- Wait and try again later

---

### Error 7: Database Transaction Failed

**Log Message**:
```
[TWD Import] Starting database transaction...
[TWD Import] FATAL ERROR: SequelizeDatabaseError: ...
```

**Causes**:
1. Database connection lost
2. Constraint violation
3. Deadlock (as seen in your logs)

**Solution 1** (Connection):
```bash
# Check MySQL is running
systemctl status mysql

# Check connection
mysql -u root -p -e "SELECT 1;"
```

**Solution 2** (Constraint Violation):
- Check error message for which constraint failed
- Usually: duplicate symbol, missing required field
- May need to clean up existing data:
  ```sql
  DELETE FROM twd_market WHERE symbol = 'DUPLICATE_SYMBOL';
  ```

**Solution 3** (Deadlock):
The deadlock you're seeing with `ALTER TABLE user...` is unrelated to import but can interfere.

**Fix the Deadlock Issue**:

The problem is in your database sync trying to alter the `user` table on every startup. Let me check that:
