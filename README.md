# MERN Stack Application

This is a full-stack MERN (MongoDB, Express, React, Node.js) application with Docker containerization.
Yet it also contains a postgresql database for demonstration.

Hit CTRL + SHIFT + V to open the .md-formatter for VS CODE.

## Project Structure

- `/client` - Contains the React frontend application (see [README-CLIENT.md](./client/README.md))
- `/server` - Contains the Express backend API (see [README-SERVER.md](./server/README.md))
- `docker-compose.yml` - Orchestrates the multi-container application
- `/docker` - Contains database initialization scripts:
  - `mongo-init.js` - Sets up initial MongoDB collections and indexes for the portfolio database
  - `postgres-init.sql` - Creates initial PostgreSQL tables and sample data for the portfolio database
- `startup.sh` - A helper script that you should run after starting the compose

## Prerequisites

- Docker Desktop installed
- Node.js (if developing outside containers)
- You need to set the .env files for the server and client (see .env.example)
- Optional: Windows 10 or compatible system (Project was developed on Win 10, VS Code)


## Getting Started

### Running the Application

Start Application:
```bash
docker-compose up -d # Start all containers in detached mode, remove the 'd' if you want to follow the logs
```

Start helper script:
```bash
docker run -it -v ${PWD}/startup.sh:/startup.sh:ro -v /var/run/docker.sock:/var/run/docker.sock --network mern-portfolio_app-network alpine:latest sh -c "apk add --no-cache docker-cli && sh /startup.sh"
```

Docker Troubleshooting:
```bash
docker-compose down # Stop all containers and deleted them
docker-compose down -v # Stop containers and remove volumes (if needed)
docker-compose build --no-cache # Rebuild all containers (with clean cache)
```