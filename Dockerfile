FROM node:20-bookworm-slim AS build
RUN apt-get update && apt-get install -y build-essential libvips-dev python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
# Install only Strapi deps for admin build (exclude script-only packages)
RUN node -e " \
  const pkg = require('./package.json'); \
  const exclude = ['cheerio','dotenv','sanitize-html','turndown','xml2js']; \
  exclude.forEach(d => delete pkg.dependencies[d]); \
  require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"
RUN npm install --include=optional
COPY . .
# Restore original package.json before build
COPY package.json ./
ENV NODE_ENV=production
RUN npm run build
# Now install all deps including script packages
RUN npm install --include=optional
RUN npm prune --omit=dev && npm install --os=linux --cpu=x64 sharp

FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y libvips42 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
RUN touch /app/favicon.png
COPY --from=build /app/config ./config
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/types ./types
COPY --from=build /app/scripts ./scripts

ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]
