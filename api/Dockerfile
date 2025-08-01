FROM oven/bun:canary-alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
USER bun
EXPOSE 3000
CMD ["bun", "src/index.ts"]