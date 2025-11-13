FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Copy application files
COPY . .

# Build argument to force rebuild when needed
ARG CACHE_BUST=1
RUN echo "Building with cache bust: $CACHE_BUST"

# Build arguments for Vite environment variables
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_APP_ID
ARG VITE_APP_TITLE
ARG VITE_APP_LOGO

# Set environment variables for build
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_APP_ID=$VITE_APP_ID
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_LOGO=$VITE_APP_LOGO

# Remove any cached build artifacts to ensure fresh build
RUN rm -rf dist .turbo

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
