# Dockerfile
FROM node:20-bookworm-slim
WORKDIR /app

# 1) Install deps (dev deps included)
COPY package*.json ./
RUN npm ci

# 2) Copy source and build
COPY . .
# sanity: prove tsc exists and prints a version
RUN npx tsc -v
RUN npm run build

# 3) Strip dev deps for runtime image (optional)
RUN npm prune --omit=dev

ENV NODE_ENV=production
# IMPORTANT: no EXPOSE -> treated like a background/worker
CMD ["node", "dist/index.js"]
