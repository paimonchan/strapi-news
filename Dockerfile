FROM node:20-bookworm AS build

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libvips-dev \
    python3 \
    ca-certificates \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set production environment early
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copy manifest
COPY package.json ./

# Clean installation for Linux x64
RUN npm config set fetch-retry-maxtimeout 600000 -g && \
    npm install --platform=linux --arch=x64 && \
    npm install @swc/core-linux-x64-gnu @rollup/rollup-linux-x64-gnu

# Copy source files
COPY . .

# Install dependencies for external scripts separately
RUN cd scripts/news-fetcher && npm install

# Build the Strapi application
# This will generate the /app/dist folder containing compiled JS files
RUN npm run build

# Remove development dependencies after build
RUN npm prune --omit=dev

# Stage 2: Runtime
FROM node:20-bookworm-slim

# Install runtime dependencies ONLY
RUN apt-get update && apt-get install -y \
    libvips42 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy ONLY production artifacts
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/favicon.png ./favicon.png

# IMPORTANT: Do NOT copy the original 'config' folder (which has .ts files)
# Strapi will automatically use the compiled config from 'dist/config'
# But we copy it just in case Strapi needs other assets, 
# however, the compiled dist takes precedence.
COPY --from=build /app/config ./config

# Ensure necessary directories exist for media uploads
RUN mkdir -p /app/public/uploads

ENV NODE_ENV=production
EXPOSE 1337

# Use 'start' which runs from the 'dist' folder
CMD ["npm", "run", "start"]
