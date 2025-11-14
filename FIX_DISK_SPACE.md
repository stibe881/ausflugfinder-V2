# Fix Docker Disk Space Issue on docker01

The Docker build failed because there's no space left on the device. Follow these steps:

## Step 1: Clean Docker System

SSH into docker01 and run:

```bash
# Stop the running containers first
docker-compose down

# Remove all unused Docker resources (images, containers, volumes, networks)
docker system prune -af --volumes

# Check available disk space
df -h
```

This should free up several GB of space.

## Step 2: Rebuild and Deploy

```bash
# Make sure you're in the right directory
cd ~/ausflug-manager

# Rebuild the image
docker-compose build --no-cache

# Start services
docker-compose up -d

# Verify everything started
docker-compose ps

# Check logs for any errors
docker-compose logs app | tail -100
```

## If Still Running Out of Space

If the prune command doesn't free enough space, you may need to:

```bash
# Remove all Docker images (warning: this removes ALL images)
docker rmi $(docker images -q)

# Or remove specific old images
docker images
docker rmi <image_id>

# Check disk usage
docker system df

# Or at the filesystem level
du -sh /var/lib/docker/*
du -sh /

# Free more space by clearing old logs
find /var/lib/docker/containers -name "*.log" -delete
```

## Expected Output

After successful deployment:

```
$ docker-compose ps
NAME                      IMAGE                       STATUS
ausflug-manager-app       ausflug-manager-app:latest  Up 2 seconds
ausflug-manager-db        mariadb:11                  Up 5 seconds

$ docker-compose logs app | tail -20
... [Server running on http://localhost:3000/]
```

Then test:
- Login: https://ausflugfinder.ch/login
- Logout: Click profile button, then logout
- Should NOT see 500 error anymore
- Cluster markers should show colored circles
