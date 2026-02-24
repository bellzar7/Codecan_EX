# FAQ videoUrl Column Fix

## Problem
The FAQ API endpoint (`/api/ext/faq`) is failing with error:
```
Unknown column 'faqs.videoUrl' in 'field list'
```

## Root Cause
The `videoUrl` column exists in the model definition ([`models/faq.ts`](models/faq.ts:57-60)) but is missing from the database table `faq`.

## Solution

### QUICK FIX (Production - Immediate)

Connect to the database and run this SQL command:

```bash
# Connect to database
docker compose -p bicrypto -f docker-compose.hardened.yml exec mysql \
  mysql -uroot -proot -D mydatabase
```

Then execute:
```sql
ALTER TABLE faq ADD COLUMN videoUrl LONGTEXT NULL;
```

Verify the column was added:
```sql
DESCRIBE faq;
```

### PROPER FIX (Migration - For tracking)

A migration file has been created: [`migrations/20260102000002-add-videoUrl-to-faq.js`](migrations/20260102000002-add-videoUrl-to-faq.js)

To apply it properly on the server:

```bash
# Navigate to project directory
cd /home/cloud/codecanyon_4_6_3_new

# Run migration
npm run migrate
# OR
npx sequelize-cli db:migrate
```

## Verification

After applying the fix, test the FAQ endpoint:

```bash
curl http://localhost:3000/api/ext/faq
```

The error should be resolved and FAQs should load successfully.

## Notes

- The `videoUrl` column is optional (nullable) as defined in the model
- This column stores video URLs for FAQ entries (type: LONGTEXT)
- The migration can be rolled back if needed using: `npx sequelize-cli db:migrate:undo`
