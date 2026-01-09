# syntax=docker/dockerfile:1

# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Configure pnpm mirror for faster downloads
RUN pnpm config set registry https://registry.npmmirror.com

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build-only

# Production stage
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /harbor-frontend

# run
EXPOSE 80 443
