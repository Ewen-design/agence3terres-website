# Secure Dockerfile for Svelte (Vite) static site served by Caddy
# ── Build stage ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY website/package.json website/package-lock.json ./website/
WORKDIR /app/website
RUN npm ci

# Copy source and build
COPY website .
RUN npm run build

# ── Production stage ─────────────────────────────────────────────
FROM caddy:2-alpine AS production

# Copy Caddyfile
COPY docker/Caddyfile /etc/caddy/Caddyfile

# Copy built static files
COPY --from=builder /app/website/dist /srv

# Caddy stores data/config in /data and /config — both writable by default
# Static files are read-only
RUN chmod -R 755 /srv

EXPOSE 80

# Caddy runs as non-root (UID 1000) by default in the official image
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
