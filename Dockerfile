# Build stage
FROM node:20-slim as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app

# Install a simple static file server
RUN npm install -g sirv-cli

# Copy only the built assets from the build stage
COPY --from=build /app/dist ./dist

# Use the PORT environment variable provided by Cloud Run
# Default to 8080 if not provided
ENV PORT 8080

# Serve the 'dist' folder on the specified port
CMD ["sh", "-c", "sirv dist --port $PORT --host 0.0.0.0"]
