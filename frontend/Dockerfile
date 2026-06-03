# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

# VITE_API_URL is baked into the JS bundle at build time.
# Pass it via --build-arg (docker build) or buildArgs (railway.toml).
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# envsubst (from gettext) substitutes $PORT in nginx.conf at container start
RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx.conf uses ${PORT} — envsubst replaces it at runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Default port; Railway overrides this with its own $PORT
ENV PORT=80

EXPOSE 80

# Substitute only ${PORT} (leave nginx vars like $uri untouched), then start nginx
CMD ["/bin/sh", "-c", \
  "envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf \
   && nginx -g 'daemon off;'"]
