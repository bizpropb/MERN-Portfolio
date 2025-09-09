# syntax=docker/dockerfile:1
FROM node:20-alpine AS development
WORKDIR /app

# No COPY, no npm install here. Everything comes from bind mount.
EXPOSE 3001
CMD ["sh", "-c", "npm install && npm run dev"]