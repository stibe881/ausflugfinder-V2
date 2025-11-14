# Diagnose Current Issues

## Issue 1: Logout Hanging (Still Not Fixed)
The logout mutation is still hanging indefinitely.

**What to check on docker01:**

1. Verify latest code is deployed:
```bash
cd ~/ausflug-manager
git log --oneline -5
# Should show commit 08af23f as HEAD

# Check if it's in the running container
docker-compose exec app git log --oneline -1
```

2. Check server logs while testing logout:
```bash
docker-compose logs app -f
# Then click logout in browser and watch for:
# [Auth Logout] Starting logout...
# [Auth Logout] Cookie cleared, returning success response
```

3. If logs don't show, the old code is still running:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
sleep 20
docker-compose logs app | grep "Server running"
```

## Issue 2: Cluster Broken Images (Still Not Fixed)

The Canvas PNG generation should be working, but let me verify the code:

```bash
docker-compose exec app cat dist/pages/Explore.js | grep -A 5 "generateCircleImage"
# Should show Canvas code, not SVG code
```

If it shows SVG code, the build didn't include the latest changes.

## Root Cause Analysis

Both issues suggest the **Docker build didn't actually update with the latest code**. 

When you ran `docker-compose build --no-cache`, it might have:
1. Used cached npm packages (pnpm-lock.yaml)
2. Failed silently during TypeScript compilation
3. Bundled old source files

**What to verify:**

```bash
# Check what's actually in the container
docker-compose exec app ls -la dist/
docker-compose exec app head -20 dist/index.js

# Check if server started successfully
docker-compose logs app | head -30

# Look for any compilation errors
docker-compose logs app | grep -i "error\|fail\|warn"
```

## Full Redeploy Steps

If old code is still running, do a complete rebuild:

```bash
cd ~/ausflug-manager

# 1. Stop everything
docker-compose down
docker volume prune -f
docker system prune -af

# 2. Clean cache
rm -rf node_modules
rm -rf dist
pnpm install --frozen-lockfile

# 3. Rebuild
docker-compose build --no-cache --progress=plain

# 4. Start
docker-compose up -d

# 5. Verify
sleep 30
docker-compose ps
docker-compose logs app | tail -50
```

## Browser Console Check

After verifying server is up-to-date:

1. Open browser DevTools Console
2. Click logout
3. Look for these logs:
   - `[Auth] Starting logout...`
   - `[Auth] Logout completed...` OR `[Auth] Logout error...`
   - `[Auth] Clearing auth state...`
4. The page should redirect to /login after 10 seconds max

If you see "Unable to transform response" error, the server is responding but response format is still wrong.

