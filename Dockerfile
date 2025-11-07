FROM node:20-alpine

WORKDIR /app

# Install build dependencies required for native node modules (like argon2)
# These must be installed before npm/pnpm install so they're available during dependency compilation
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install pnpm and dependencies
RUN npm install -g pnpm@10.4.1 && pnpm install

# Copy application files
COPY . .

# Build argument to force rebuild when needed
ARG CACHE_BUST=1
RUN echo "Building with cache bust: $CACHE_BUST"

# Remove any cached build artifacts to ensure fresh build
RUN rm -rf dist .turbo

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
