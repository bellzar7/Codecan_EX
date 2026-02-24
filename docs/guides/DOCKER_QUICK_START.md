# Production Docker Quick Start

**TL;DR**: Fast commands to deploy Bicrypto in production.

## 🚀 First Deployment

```bash
# 1. Setup environment
cp .env.example .env  # If needed
nano .env             # Configure DB, Redis, Site URL, etc.
echo "SEED_DATABASE=true" >> .env

# 2. Build and start
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# 3. Watch startup logs
docker compose -f docker-compose.prod.yml logs -f app

# 4. Verify (wait 2-3 minutes for healthchecks)
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3000
curl http://localhost:4000/api/health
docker exec bicrypto-app pm2 list

# 5. Disable seeding (after first successful start)
nano .env  # Change SEED_DATABASE=true → false
docker compose -f docker-compose.prod.yml restart app
```

## 🔄 Update After Code Changes

```bash
# Stop → Pull → Rebuild → Start
docker compose -f docker-compose.prod.yml down
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## 🔍 Common Checks

```bash
# View all containers
docker compose -f docker-compose.prod.yml ps

# View app logs
docker compose -f docker-compose.prod.yml logs -f app

# Check PM2 processes
docker exec bicrypto-app pm2 list
docker exec bicrypto-app pm2 logs backend --lines 50
docker exec bicrypto-app pm2 logs frontend --lines 50
docker exec bicrypto-app pm2 logs eco-ws --lines 50

# Test endpoints
curl http://localhost:3000             # Frontend
curl http://localhost:4000/api/health  # Backend
curl http://localhost:4002             # eco-ws

# Check database
docker exec bicrypto-mysql mysql -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} -e "SHOW TABLES;"

# Check Redis tickers (FOREX prices)
docker exec bicrypto-redis redis-cli KEYS "twd:ticker:*"
```

## 🛠️ Troubleshooting

```bash
# Restart specific service
docker compose -f docker-compose.prod.yml restart app
docker compose -f docker-compose.prod.yml restart mysql

# Restart specific PM2 process (inside app)
docker exec bicrypto-app pm2 restart backend
docker exec bicrypto-app pm2 restart frontend
docker exec bicrypto-app pm2 restart eco-ws

# View all service logs
docker compose -f docker-compose.prod.yml logs --tail=100

# Enter app container
docker exec -it bicrypto-app bash

# Run migrations manually
docker exec bicrypto-app pnpm migrate

# Check migration status
docker exec bicrypto-app pnpm migrate:status
```

## 🗑️ Cleanup

```bash
# Stop containers (keep data)
docker compose -f docker-compose.prod.yml down

# Stop and delete data (⚠️ DANGER!)
docker compose -f docker-compose.prod.yml down -v

# Remove old images
docker image prune -a
```

## 📊 Monitoring

```bash
# Resource usage
docker stats

# PM2 monitoring
docker exec bicrypto-app pm2 monit

# Disk usage
docker system df -v
```

## 🔒 Security

```bash
# After first deployment:
1. Set SEED_DATABASE=false in .env
2. Change default superadmin password
3. Setup reverse proxy (Nginx/Caddy) with SSL
4. Restrict firewall rules (only 80/443 public)
5. Enable Docker secrets for passwords
```

## 📚 Full Documentation

See `PRODUCTION_DOCKER_DEPLOYMENT.md` for complete guide.

## ⚡ What's Running

| Service | Port | Purpose |
|---------|------|---------|
| **frontend** | 3000 | Next.js app (user interface) |
| **backend** | 4000 | uWebSockets.js API server |
| **eco-ws** | 4002 | TwelveData WebSocket (FOREX prices) |
| **mysql** | 3306 | Primary database |
| **redis** | 6379 | Cache + sessions |
| **scylla** | 9042 | Ecosystem trading engine |
| **kafka** | 9092 | Message queue |
| **zookeeper** | 2181 | Kafka coordination |

## ✅ Acceptance Tests

```bash
# 1. Clean deployment works
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
# Wait 3 minutes, then check: curl http://localhost:3000

# 2. Migrations ran
docker compose -f docker-compose.prod.yml logs app | grep "Migrations completed"

# 3. eco-ws running
docker exec bicrypto-app pm2 list | grep eco-ws

# 4. Redis has tickers
docker exec bicrypto-redis redis-cli KEYS "twd:ticker:*"

# 5. No source bind mounts
docker inspect bicrypto-app | grep -A 20 Mounts | grep -E "(backend|src|models)"
# Should return nothing (correct!)

# 6. Code changes require rebuild
echo "// test" >> backend/test.ts
docker compose -f docker-compose.prod.yml restart app
docker exec bicrypto-app cat backend/test.ts | grep "// test"
# Should NOT show the comment (uses built dist/)
```

## 🆘 Emergency

```bash
# Full reset (nuclear option)
docker compose -f docker-compose.prod.yml down -v
docker system prune -a --volumes -f
# Then: rebuild from scratch
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

---

**Quick Reference Card** - Keep this handy! 📌