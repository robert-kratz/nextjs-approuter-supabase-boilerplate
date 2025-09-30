# 1) Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2) Builder
FROM node:20-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# sichere leere Ordner, falls nicht vorhanden
RUN mkdir -p public templates
# build erzeugt .next/standalone dank next.config.mjs
RUN npm run build

# 3) Runner
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Kopiere Standalone Bundle
COPY --from=builder /app/.next/standalone ./
# Statische Assets
COPY --from=builder /app/.next/static ./.next/static
# Public Assets (kann leer sein)
COPY --from=builder /app/public ./public
# Templates für E-Mails (kann leer sein)
COPY --from=builder /app/templates ./templates

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]