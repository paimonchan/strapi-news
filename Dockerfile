FROM node:20-bookworm-slim AS build
RUN apt-get update && apt-get install -y build-essential libvips-dev python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
# Ensure correct SWC bindings are installed for this platform
RUN node -e "try{require('@swc/core')}catch(e){console.log('SWC missing, installing...');}" && \
    npm ls @swc/core 2>&1 | head -5 && \
    node -e "console.log(process.platform, process.arch)"
RUN npm install --no-save @swc/core-linux-x64-gnu 2>/dev/null || true
RUN npm install --no-save @swc/core-linux-arm64-gnu 2>/dev/null || true
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y libvips42 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev
RUN npm install --no-save @swc/core-linux-x64-gnu 2>/dev/null || true
RUN npm install --no-save @swc/core-linux-arm64-gnu 2>/dev/null || true
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/config ./config
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/scripts ./scripts

ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]
