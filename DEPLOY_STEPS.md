# Deployment Steps for Server

## What's New
3 commits have been pushed to fix the issues:

1. **c2f287f** - Auto-logout hook fixes (useCallback, proper dependencies)
2. **7b33339** - Cluster marker fixes (Canvas PNG generation)
3. **f0c984e** - Server error handler and debug logging

## Deploy to docker01

SSH into docker01 and run:

```bash
cd ~/ausflug-manager
git status  # Check current state
git log --oneline -5  # See recent commits
```

If the latest commit is NOT `f0c984e`, then run:

```bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

Wait 30 seconds for the app to start, then check:

```bash
docker-compose ps  # All services should show "Up"
docker-compose logs app | grep "Server running"  # Should show the server started
```

## Check for Errors

After deployment, test logout and check logs:

```bash
# Option 1: View all recent logs
docker-compose logs app | tail -100

# Option 2: Search for specific logs
docker-compose logs app | grep "Auth Logout"
docker-compose logs app | grep "Error Handler"

# Option 3: Follow logs in real-time while testing
docker-compose logs app --follow
# (then test logout in browser, watch for debug output)
```

## If Still Getting 500 Error

1. Check if server started:
   ```bash
   docker-compose ps
   ```

2. Check for startup errors:
   ```bash
   docker-compose logs app | head -50
   ```

3. Verify the code was actually updated:
   ```bash
   git log --oneline -5
   git show HEAD --stat  # Show files changed in latest commit
   ```

4. If code hasn't updated, manually check git:
   ```bash
   git remote -v
   git fetch origin
   git log origin/main --oneline -5
   ```

