# Multi-stage build for security and smaller image size
FROM node:20-alpine AS base

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm install && npm cache clean --force

# Copy service code
COPY . .

# Expose port 3240
EXPOSE 3240

# Start with nodemon for development
CMD ["npm", "run", "dev"]

# Builder stage for production
FROM base AS builder

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS production

# Install wget for health checks
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S kraken -u 1001

# Create app directory
WORKDIR /usr/src/app

# Copy dependencies from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy package.json for metadata
COPY --chown=kraken:nodejs package*.json ./

# Copy service code
COPY --chown=kraken:nodejs . .

# Switch to non-root user
USER kraken

# Expose port 3240
EXPOSE 3240

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3240/health || exit 1

# Start the application
CMD ["node", "index.js"]
