# Stage 1: Build application assets and server bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies (including build devDependencies)
RUN npm ci

# Copy application source files
COPY . .

# Build Vite frontend and bundled Express server
RUN npm run build

# Stage 2: Lean production runtime container
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package manifests for production install
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled artifacts and configuration
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Cloud Run default port
EXPOSE 8080

# Run production server
CMD ["node", "dist/server.cjs"]
