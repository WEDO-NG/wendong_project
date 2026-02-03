FROM node:18-alpine AS builder

RUN apk add --no-cache openssl ca-certificates

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @wendong/business-core build
RUN pnpm --filter @wendong/adapters build
RUN pnpm --filter server-node prisma generate
RUN pnpm --filter server-node build
RUN pnpm --filter server-node --prod deploy /prod/server-node --legacy
RUN cp -r apps/server-node/prisma /prod/server-node/prisma
RUN pnpm --filter server-node exec prisma generate --schema=/prod/server-node/prisma/schema.prisma
RUN cp -r apps/server-node/models /prod/server-node/models
RUN cp -r doc /prod/server-node/doc
RUN cp README.md /prod/server-node/README.md
RUN mkdir -p /prod/server-node/data/vector-store

FROM node:18-alpine AS runner

RUN apk add --no-cache openssl ca-certificates

WORKDIR /app
COPY --from=builder /prod/server-node .

EXPOSE 3001
CMD ["node", "dist/server.js"]
