# Deployment & Configuration Guide

## Security: Environment Variables

### 🔒 Docker Deployment

Before running the application with Docker, you must configure the environment variables:

1. **Copy the example file:**
   ```bash
   cp .env.docker.example .env.docker
   ```

2. **Edit `.env.docker` with your actual values:**
   ```bash
   # Replace these with your actual values
   DATABASE_URL=mysql://your_user:your_password@your_host:3306/your_db
   JWT_SECRET=your-super-secret-key-at-least-32-characters-long
   VITE_APP_ID=your-app-id
   VITE_APP_TITLE=Your App Title
   ```

3. **Never commit `.env.docker` to version control!**
   - The file is already in `.gitignore`
   - Keep this file secure and not in the repository

4. **Run the application:**
   ```bash
   docker-compose up -d
   ```

### ⚙️ Development (Local)

For local development, create a `.env.local` file:

```bash
cp .env.docker.example .env.local
```

Then configure it with your local database and development settings.

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | ✅ | Secret for JWT token signing (min 32 chars) | `aB3xY9mK2pQ8vL5nR7tW4sU6dF1gH0j9k2m5n8p0r3t5u7v9w1x3z5a7b9c1d3` |
| `NODE_ENV` | ❌ | Environment (production/development) | `production` |
| `VITE_APP_ID` | ❌ | Application ID | `ausflug-manager` |
| `VITE_APP_TITLE` | ❌ | Application Title (UI) | `Ausflug Manager` |
| `VITE_APP_LOGO` | ❌ | App logo URL | `https://...` |
| `VITE_ANALYTICS_ENDPOINT` | ❌ | Analytics API endpoint | `https://...` |
| `VITE_ANALYTICS_WEBSITE_ID` | ❌ | Analytics website ID | `abc123` |

## Security Best Practices

✅ **Do:**
- Store secrets in `.env.docker` (not committed to git)
- Use strong JWT secrets (32+ characters, random)
- Rotate secrets regularly
- Use environment-specific secrets

❌ **Don't:**
- Commit `.env.docker` to git
- Use default/weak secrets in production
- Share secrets via email or chat
- Store secrets in code or configuration files

## Generating a Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Database Setup

Ensure your MySQL database is configured with:
- Valid host and port
- User with appropriate permissions
- Database created and accessible

Example MySQL user setup:
```sql
CREATE USER 'ausflugfinder'@'localhost' IDENTIFIED BY 'your_secure_password';
CREATE DATABASE ausflugfinder_v2;
GRANT ALL PRIVILEGES ON ausflugfinder_v2.* TO 'ausflugfinder'@'localhost';
FLUSH PRIVILEGES;
```
