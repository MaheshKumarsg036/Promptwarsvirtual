# Use a lightweight Node.js image
FROM node:20-slim as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Use Nginx to serve the static content
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port and start
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
