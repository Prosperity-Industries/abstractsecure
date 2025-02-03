# **Step 1: Build the Webpack Bundle**
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package files first for efficient caching
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy the entire project
COPY . .

# Run Webpack build
RUN npm run build

# **Step 2: Create a lightweight production image**
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server # Ensure the server files are included

# Expose application port
EXPOSE 3000

# Start the backend server
CMD ["node", "server/main.js"]
