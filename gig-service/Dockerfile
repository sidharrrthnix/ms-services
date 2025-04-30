# 🏗️ Build Stage - Compile TypeScript & Install Dependencies
FROM node:21-alpine3.18 AS builder
WORKDIR /app

# Copy package files and authentication for private packages
COPY .npmrc ./
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the full source code
COPY . .

# Compile TypeScript
RUN npm run build

# 📌 Runtime Stage - Minimal Production Environment
FROM node:21-alpine3.18
WORKDIR /app

# Install runtime dependencies (minimal footprint)
RUN apk add --no-cache curl

# Install PM2 in the runtime stage
RUN npm install -g pm2

# Copy only required files for production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

# Set environment variables for production
ENV NODE_ENV=production

# Expose application port
EXPOSE 4004

# Start the application using PM2
CMD ["pm2-runtime", "start", "build/src/app.js", "--attach"]
