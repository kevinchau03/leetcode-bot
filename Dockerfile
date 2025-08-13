# Dockerfile
FROM node:20-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and build
COPY . .
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
# IMPORTANT: no EXPOSE -> Railway treats it like a background/worker process
CMD ["node", "dist/index.js"]
