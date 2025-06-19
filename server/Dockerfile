# Multi-stage build for Node.js TypeScript server
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma/ ./prisma/
# Copy source files for Swagger documentation
COPY src/ ./src/

# Expose ports
EXPOSE 4000 5555

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo '# Run Prisma migrations' >> /app/start.sh && \
    echo 'npx prisma migrate deploy' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start Prisma Studio in background' >> /app/start.sh && \
    echo 'npx prisma studio --hostname 0.0.0.0 --port 5555 &' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Wait for Prisma Studio to start' >> /app/start.sh && \
    echo 'sleep 3' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# Start the main server' >> /app/start.sh && \
    echo 'node dist/app.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 express

# Change ownership of the app directory
RUN chown -R express:nodejs /app

USER express

# Start the server and Prisma Studio
CMD ["/app/start.sh"]