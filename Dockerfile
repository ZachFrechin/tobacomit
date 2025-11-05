# syntax=docker/dockerfile:1

# ----- Builder -----
FROM node:22-alpine AS builder
ENV NODE_ENV=production
WORKDIR /app

# Install dependencies first (better cache)
COPY tobacomit/package*.json ./tobacomit/
RUN --mount=type=cache,target=/root/.npm \
    cd tobacomit \
 && npm ci --omit=dev

# Copy source
COPY tobacomit ./tobacomit

# ----- Runtime -----
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app/tobacomit

# Copy only built app and production deps
COPY --from=builder /app/tobacomit /app/tobacomit

# Ensure runtime log directory exists
RUN mkdir -p /app/tobacomit/logs \
 && chown -R node:node /app/tobacomit/logs

# Create non-root user
RUN addgroup -S app && adduser -S app -G app \
 && chown -R app:app /app
USER app

EXPOSE 3000

# Healthcheck (adjust path if needed)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["npm", "start"]

