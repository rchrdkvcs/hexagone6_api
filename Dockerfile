FROM node:latest AS base

# Install pnpm
WORKDIR /app
RUN npm install -g pnpm

# All deps stage
FROM base AS deps
WORKDIR /app
ADD package.json pnpm-lock.yaml ./
RUN pnpm install

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
ADD package.json pnpm-lock.yaml ./
RUN pnpm install --production

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN node ace build --ignore-ts-errors

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
EXPOSE 3000
CMD ["node", "./bin/server.js"]
