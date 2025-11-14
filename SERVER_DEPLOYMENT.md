# Server Deployment Instructions

## Current Issue
The server is returning a 500 error with HTML response on the `/api/trpc/auth.logout` endpoint, preventing login/logout functionality from working.

## Root Causes
1. Client-side auto-logout hook has been fixed (commit c2f287f)
2. Cluster marker images have been fixed with Canvas PNG generation (commit 7b33339)
3. **Server needs to be rebuilt and restarted with these changes**

## Steps to Deploy

On the Docker server (docker01), run:

```bash
cd ~/ausflug-manager
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

Then verify:
```bash
docker-compose logs app | tail -50  # Check for any startup errors
docker-compose ps  # Verify all services are running
```

## Testing After Deployment

1. **Test login**: Go to https://ausflugfinder.ch/login and log in
2. **Test logout**: Click logout button on Profile page - should work without 500 error
3. **Test cluster markers**: Check map view - cluster markers should show colored circles, not broken images
4. **Test PWA install**: Should see install prompt on supported browsers
5. **Test auto-logout**: Leave app idle for 15 minutes - should see logout warning dialog

## If Issues Persist

Check server logs:
```bash
docker-compose logs app -f  # Follow real-time logs
```

Look for error messages related to:
- Cookie clearing
- tRPC serialization
- Authentication middleware

