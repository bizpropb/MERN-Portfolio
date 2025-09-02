FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Development stage
FROM base AS development
COPY . .
EXPOSE 5001
VOLUME ["/app/node_modules"]
CMD ["npm", "run", "dev"]

# Production stage  
FROM base AS production
COPY . .
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]