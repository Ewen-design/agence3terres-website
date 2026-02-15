# Robust, secure Dockerfile for Svelte (Vite) production build
# Use official Node image for build stage
FROM node:20-alpine AS builder

WORKDIR /app


# Install dependencies (including devDependencies for build)
COPY website/package.json website/package-lock.json ./website/
WORKDIR /app/website
RUN npm ci

# Copy source code
COPY website .

# Build the app
RUN npm run build

# Use a minimal web server for static files
FROM nginx:1.25-alpine AS production

# Remove default nginx config for security
RUN rm /etc/nginx/conf.d/default.conf

# Create custom main nginx.conf with pid and cache paths in /tmp for non-root user
RUN printf 'pid /tmp/nginx.pid;\ninclude /etc/nginx/modules-enabled/*.conf;\nevents { worker_connections 1024; }\nhttp { client_body_temp_path /tmp/client_body; proxy_temp_path /tmp/proxy; fastcgi_temp_path /tmp/fastcgi; uwsgi_temp_path /tmp/uwsgi; scgi_temp_path /tmp/scgi; include /etc/nginx/mime.types; default_type application/octet-stream; include /etc/nginx/conf.d/*.conf; }' > /etc/nginx/nginx.conf

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/svelte.conf

# Copy built files
COPY --from=builder /app/website/dist /usr/share/nginx/html

# Set permissions for security
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Use non-root user for nginx
USER 101

CMD ["nginx", "-g", "daemon off;"]
