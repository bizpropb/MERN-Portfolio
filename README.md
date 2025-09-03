# 🌐 DevHub - MERN Portfolio Application

> A full-stack developer portfolio platform showcasing modern web development practices

## 👨‍💻 Author & License

**Created by:** Pascal Bossert (pascalbossertofficial)  
**GitHub:** [@bizpropb](https://github.com/bizpropb?tab=repositories)  
**Originally Created:** July 25th, 2025  
**Signed:** August 17th, 2025  

### 📜 License & Usage Notice

**All Rights Reserved © 2025 Pascal Bossert**

This repository serves as a **personal portfolio showcase** to demonstrate my full-stack development skills to potential employers and recruiters. 

**Please respect the purpose of this project:**
- ✅ Feel free to view, learn from, and fork for educational purposes
- ✅ Use as inspiration for your own projects  
- ❌ **Please do not re-upload or claim this work as your own**
- ❌ **Do not use this exact codebase as your portfolio**

If you're a recruiter or employer reviewing this code, thank you for taking the time to explore my work! This project demonstrates my capabilities with the MERN stack, TypeScript, Docker, and modern development practices.

For any questions or collaboration opportunities, please reach out via GitHub or professional networks.

---

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb&logoColor=white)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

## ✨ What is DevHub?

DevHub is a **modern developer portfolio platform** where developers can showcase their skills, projects, and connect with others in the community. Think of it as a social network for developers with portfolio management, interactive world map, and real-time features.

### 🚀 Key Features

- **👤 Dynamic User Profiles** - Customizable developer portfolios with skills, bio, and projects
- **🗺️ Interactive World Map** - Discover developers globally with Leaflet.js integration  
- **📊 Personal Dashboard** - Track your projects, views, and engagement metrics
- **🎯 Skills Management** - Showcase your technical expertise with visual skill levels
- **📱 Responsive Design** - Seamless experience across desktop and mobile devices
- **🌙 Dark/Light Mode** - User preference theming with system detection
- **🔐 Secure Authentication** - JWT-based auth with password encryption

### 🛠️ Tech Stack Highlights

This project demonstrates proficiency in modern full-stack development:

**Frontend:**
- ⚛️ React 18 with TypeScript for type-safe component development
- 🎨 Tailwind CSS for utility-first responsive styling
- 🗺️ Leaflet.js for interactive mapping functionality
- 🚦 React Router for client-side navigation

**Backend:**
- 🟢 Node.js with Express.js RESTful API architecture
- 🍃 MongoDB with Mongoose ODM for flexible data modeling
- 🔒 JWT authentication with bcrypt password hashing
- 📊 RESTful endpoints with proper HTTP status codes

**DevOps & Tools:**
- 🐳 Docker containerization with multi-stage builds
- 🔧 Development and production environment configurations
- 📦 Automated database seeding and initialization
- 🛠️ Comprehensive development tooling setup

---

## 💼 Portfolio Demo

This application serves as both a **functional platform** and a **comprehensive code demonstration** of modern MERN stack development practices, including Docker containerization, responsive design, and scalable architecture patterns.



```
━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━

███████╗███████╗████████╗██╗   ██╗██████╗ 
██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
███████╗█████╗     ██║   ██║   ██║██████╔╝
╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ 
███████║███████╗   ██║   ╚██████╔╝██║     
╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     
                                          
━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━━━━━⊱⋆⊰━━━━
```


Hit CTRL + SHIFT + V to open the .md-formatter for VS CODE.

## Project Structure

- `/client` - Contains the React frontend application (see [README-CLIENT.md](./client/README.md))
- `/server` - Contains the Express backend API (see [README-SERVER.md](./server/README.md))
- `docker-compose.yml` - Orchestrates the multi-container application
- `/docker` - Contains database initialization scripts:
  - `mongo-init.js` - Sets up initial MongoDB collections and indexes for the portfolio database
- `startup.sh` - A helper script that you should run after starting the compose

## Prerequisites

- Docker Desktop installed
- Node.js (if developing outside containers)
- You need to set the .env files for the server and client (see .env.example)
- Optional: Windows 10 or compatible system (Project was developed on Win 10, VS Code)


## Getting Started

### Install dependencies for client
```bash
cd client
npm install
```

### Install dependencies for server
```bash
cd server
npm install
```

### Running the Application in prod mode
Quick start Application in prod mode (including helper script):
```bash
docker-compose -f compose.yaml -f compose.prod.yaml up -d # Start all containers in detached mode, remove the 'd' if you want to follow the logs
docker run --rm -it -v "${PWD}\startup.sh:/startup.sh:ro" -v "/var/run/docker.sock:/var/run/docker.sock" --network mern-portfolio_app-network alpine:latest sh -c "apk add --no-cache docker-cli && sh /startup.sh"
```

### Running the Application in dev mode

Quick restart
```bash
docker-compose restart
```

Quick start (and rebuild) Application in dev mode (including helper script & seed):
```bash
docker-compose down # Stop all containers and delete them
docker volume rm mern-portfolio_client_node_modules mern-portfolio_server_node_modules # These are cache volumes. I named them to be orderly, but this makes them persistent. Remove them on rebuilds to prevent issues.
docker-compose build --no-cache # Rebuild all containers (with clean cache)
docker-compose up -d # Start all containers in detached mode, remove the 'd' if you want to follow the logs
docker exec -it mern-server npm run seed
docker run --rm -it -v "${PWD}\startup.sh:/startup.sh:ro" -v "/var/run/docker.sock:/var/run/docker.sock" --network mern-portfolio_app-network alpine:latest sh -c "apk add --no-cache docker-cli && sh /startup.sh"
```

### Docker Troubleshooting:
```bash
docker-compose down # Stop all containers and delete them
docker-compose down -v # Stop containers and remove volumes (if needed)
docker container prune # Remove orphaned and stopped containers
docker-compose build --no-cache # Rebuild all containers (with clean cache)
docker system prune --volumes # Remove all orphans
```

```
# If vmmem RAM-Usage spikes in taskmanager just restart docker by rightclicking the tray icon
```
