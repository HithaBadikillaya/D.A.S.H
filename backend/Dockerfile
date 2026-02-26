# Use Node.js 20 slim as base
FROM node:20-slim

# Install system dependencies (primarily FFmpeg)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Expose backend port
EXPOSE 5000

# Start application in dev mode
CMD ["npm", "run", "dev"]
