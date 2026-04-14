# Stage 1: Base image using Bun (since the project uses bun.lock)
FROM oven/bun:1-alpine AS base

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 3: Build the Next.js application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Write env vars from build args (injected by CI via secrets)
ARG STRIPE_SECRET_KEY
ARG STRIPE_WEBHOOK_SECRET
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN if [ -n "$STRIPE_SECRET_KEY" ]; then \
      echo "BACKEND_URL=http://localhost:8080" > /app/.env; \
      echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" >> /app/.env; \
      echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY" >> /app/.env; \
      echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET" >> /app/.env; \
    fi

# Build the project (requires output: 'standalone' in next.config.ts)
RUN bun run build

# Stage 4: Production runner (Using Node alpine for maximum compatibility with the standalone server.js)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy public folder 
COPY --from=builder /app/public ./public

# Setup cache permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy the standalone Next.js build output
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drop to unprivileged user
USER nextjs

EXPOSE 3000
ENV PORT=3000

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
