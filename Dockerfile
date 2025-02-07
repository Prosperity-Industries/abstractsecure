# **Step 1: Build the Webpack Bundle**
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package files first for efficient caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Run Webpack build
RUN npm run build

# **Step 2: Create a lightweight production image**
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy the public folder to the Docker image
COPY public/ /app/public/

# Copy only necessary files from the build stage
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist 
COPY --from=build /app/server ./server 

# Set environment variable to ensure the app uses the correct port
ENV PORT=8080

# Expose application port
EXPOSE 8080

# Start the backend server
CMD ["npm", "run", "start"]
