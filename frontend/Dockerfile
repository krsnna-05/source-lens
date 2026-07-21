# ============================================
# DEVELOPMENT STAGE - Fast, Hot Reload
# ============================================
FROM node:22-alpine AS dev

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install deps (cached)
RUN npm ci

# Copy app
COPY . .

EXPOSE 3000
ENV APP_ENV=dev

CMD ["npm", "run", "dev"]

# ============================================
# BUILD STAGE - Compile Application
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Install deps
RUN npm ci

# Copy app
COPY . .

# Build Next.js
RUN npm run build

# ============================================
# PRODUCTION STAGE - Minimal, Optimized
# ============================================
FROM node:18-alpine AS prod

WORKDIR /app

# Install only production deps
COPY package.json package-lock.json ./

RUN npm ci --only=production

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV APP_ENV=prod NODE_ENV=production

CMD ["npm", "start"]
