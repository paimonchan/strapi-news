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

# Fix Rollup/SWC Linux binaries
RUN npm config set fetch-retry-maxtimeout 600000 -g && \
    npm install --platform=linux --arch=x64 && \
    npm install @swc/core-linux-x64-gnu @rollup/rollup-linux-x64-gnu

# Copy source files
COPY . .

# Build the Strapi application
# Di Strapi v5, ini menghasilkan folder dist/
RUN npm run build

# Stage 2: Runtime
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y \
    libvips42 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Salin package.json dan node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

# Salin folder dist (ini berisi server dan seringkali aset admin di Strapi v5)
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/favicon.png ./favicon.png

# Salin folder config asli (dibutuhkan Strapi untuk mendeteksi struktur proyek)
COPY --from=build /app/config ./config

RUN mkdir -p /app/public/uploads

ENV NODE_ENV=production
EXPOSE 1337

# Jalankan strapi start
CMD ["npm", "run", "start"]
