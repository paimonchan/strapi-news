FROM node:20-alpine AS build
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev python3
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --platform=linuxmusl --arch=x64
COPY . .
ENV NODE_ENV=production
RUN npm rebuild @swc/core
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache vips-dev
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev --platform=linuxmusl --arch=x64
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/config ./config
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/scripts ./scripts

ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]
