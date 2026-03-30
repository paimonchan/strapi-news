FROM node:20-bookworm-slim AS build

# Install build dependencies
# We need build-essential, python3, and libvips-dev for sharp and native modules
RUN apt-get update && apt-get install -y \
    build-essential \
    libvips-dev \
    python3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set production environment early for build optimization
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copy manifests first for better caching
COPY package.json package-lock.json ./

# Install dependencies cleanly
# --include=optional is critical for @swc/core and sharp binary selection
RUN npm install --include=optional

# Copy source files
COPY . .

# Install dependencies for external scripts separately
RUN cd scripts/news-fetcher && npm install

# Build the Strapi application
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
COPY --from=build /app/config ./config
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/favicon.png ./favicon.png

# Ensure necessary directories exist for media uploads
RUN mkdir -p /app/public/uploads

ENV NODE_ENV=production
EXPOSE 1337

CMD ["npm", "run", "start"]
