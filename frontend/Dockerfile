# Use Node.js 20 base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Expose Vite port
EXPOSE 5173

# Start Vite with --host to allow external access (important for Docker)
CMD ["npm", "run", "dev", "--", "--host"]
