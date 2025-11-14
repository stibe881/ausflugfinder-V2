# Check Deployment Status on docker01

The error changed from "HTML response" to "Unable to transform response". This suggests:
1. ✅ Docker build may have completed
2. ✅ Server is returning JSON now (not HTML)
3. ❌ But the response format is invalid for tRPC

Run these commands on docker01 to diagnose:

## 1. Check if services are running

```bash
cd ~/ausflug-manager
docker-compose ps
```

Expected output: app and db should both show "Up"

## 2. Check recent server logs

```bash
docker-compose logs app | tail -100
```

Look for:
- `[Auth Logout] Clearing session cookie` - our debug log
- `[Error Handler]` - our error handler
- Any TypeScript compilation errors
- `Server running on` - successful startup

## 3. Check if it's the NEW code

```bash
# Inside the running container
docker-compose exec app cat server/_core/index.ts | grep -A 5 "Global error handler"

# Should show our new error handler code
```

## 4. Test the endpoint directly

```bash
# Try calling logout endpoint
curl -X POST https://ausflugfinder.ch/api/trpc/auth.logout?batch=1 \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v

# Should return JSON (either success or error), not HTML
```

## 5. If build didn't complete

If you see old code or the build failed, run:

```bash
docker-compose down
docker system prune -af --volumes
docker-compose build --no-cache
docker-compose up -d

# Wait 30 seconds for startup
sleep 30
docker-compose logs app | grep "Server running"
```

## Expected Result After Fix

The logout response should be valid JSON like:
```json
{
  "result": {
    "data": {
      "success": true
    }
  }
}
```

Or if there's an error:
```json
{
  "error": {
    "message": "...",
    "code": "..."
  }
}
```

NOT HTML or "Unable to transform response" error.

