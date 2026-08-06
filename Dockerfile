# ===========================
# Stage 1 - Build
# ===========================
FROM node:22-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# ===========================
# Stage 2 - Production
# ===========================
FROM node:22-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Swagger reads these plain-comment doc files directly at runtime (not compiled)
COPY --from=builder /app/src/docs ./src/docs

# If your server reads .env inside the container, uncomment:
# COPY .env ./

# Tell Docker the app listens on port 3000
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]