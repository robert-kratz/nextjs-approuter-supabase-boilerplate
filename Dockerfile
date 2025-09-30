# 1) Base deps
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
# Optional: falls during build Drizzle Artefakte gebraucht werden
# RUN npm run db:generate
RUN npm run build

# 3) Runtime (standalone)
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Next standalone output enthält Server + benötigte node_modules
COPY --from=builder /app/.next/standalone ./
# Statische Assets
COPY --from=builder /app/.next/static ./.next/static
# Public Assets
COPY --from=builder /app/public ./public
# E-Mail Templates wenn du sie zur Laufzeit brauchst
COPY --from=builder /app/templates ./templates

# Falls deine App den Port via process.env.PORT nutzt
ENV PORT=3000
EXPOSE 3000

# Der standalone bundle enthält einen server.js im Root
CMD ["node", "server.js"]