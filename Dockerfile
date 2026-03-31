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

# Paksa instalasi binary rollup dan swc untuk linux x64 (fix error sebelumnya)
RUN npm config set fetch-retry-maxtimeout 600000 -g && \
    npm install --platform=linux --arch=x64 && \
    npm install @swc/core-linux-x64-gnu @rollup/rollup-linux-x64-gnu

# Copy source files
COPY . .

# Build the Strapi application
# Langkah ini krusial untuk menghasilkan folder /app/dist yang berisi .js
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
COPY --from=build /app/favicon.png ./favicon.png

# Ensure necessary directories exist for media uploads
RUN mkdir -p /app/public/uploads

ENV NODE_ENV=production
EXPOSE 1337

# Menggunakan 'start' yang akan menjalankan Strapi dari folder 'dist'
CMD ["npm", "run", "start"]
