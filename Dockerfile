FROM node:20-bookworm-slim AS build
RUN apt-get update && apt-get install -y build-essential libvips-dev python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
RUN npm install --include=optional
COPY . .
# Install news-fetcher script dependencies separately
RUN cd scripts/news-fetcher && npm install --ignore-scripts
ENV NODE_ENV=production
RUN npm run build
RUN npm prune --omit=dev && npm install --os=linux --cpu=x64 sharp

FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y libvips42 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/config ./config
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/scripts ./scripts
RUN mkdir -p /app/public/uploads && touch /app/favicon.png
ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]
