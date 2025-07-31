FROM oven/bun:canary-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install
COPY . .
RUN bun run build

FROM oven/bun:canary-alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile || bun install --production
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=3000
USER bun
EXPOSE 3000
CMD ["bun", "run", "start"]