# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# 2. Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built backend artifacts from the builder stage
COPY --from=builder /app/dist ./dist

#  Tell Docker to copy from the new public folder!
COPY public ./public

# Create uploads directory (used for storing images)
RUN mkdir -p uploads && chown -R node:node uploads

# Expose port and define default command
EXPOSE 3000
USER node
CMD ["node", "dist/main"]