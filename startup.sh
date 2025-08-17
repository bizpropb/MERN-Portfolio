#!/bin/sh

clear
echo ""
echo "===================================================================================="
echo " startup.sh - startup complete! "
echo "===================================================================================="
echo ""

# Check service status
echo "Service Status:"

# MongoDB
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "mern-mongodb.*Up"; then
    echo "   ✔️ MongoDB Admin UI:       http://localhost:8081 (mongo-express - automatic login via url in .env)"
else
    echo "   ❌ MongoDB:                Not running"
fi

# PostgreSQL  
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "pern-postgresql.*Up"; then
    echo "   ✔️ Postgre SQL Admin UI:   http://localhost:8082 (pgAdmin - user: .env / password: .env)"
else
    echo "   ❌ PostgreSQL:             Not running"   
fi

# Server
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "mern-server.*Up"; then
    echo "   ✔️ Swagger Server API:     http://localhost:5000/api-docs"
    echo "   ✔️ Test API:               http://localhost:5000/api/test"
else
    echo "   ❌ Server:                 Not running"
fi


# Client
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "mern-client.*Up"; then
    echo "   ✔️ Client App:             http://localhost:3000"
else
    echo "   ❌ Client:                 Not running"
fi
echo "   >>⚠️  Ports aren't auto-synced with compose.yaml, when in doubt look there."

echo ""
echo "🔧 Quick Commands:"
echo "   docker ps -a                       # List all containers (check if something broke)"
echo "   docker logs mern-server             # View server logs (change name to any container)"
echo "   docker-compose logs -f             # Follow the logs (display and update logs in realtime)"
echo "   netstat -ano | findstr :5000       # Check if port (5000) is in use"  
echo "   >>⚠️  compose.prod container will try to auto-restart and claim ports - Keep in mind when 'npm run dev'"
echo ""
echo "🔧 Advanced Commands:"
echo "   docker-compose down                    # Stop container to ensure clean shutdown"
echo "   docker-compose down -v                 # -v, in case you want to remove the volumes too"
echo "   docker container prune                 # Remove orphaned and stopped containers for clean-up"
echo "   docker-compose build --no-cache        # Rebuild containers if needed (without cache)"
echo "   docker-compose restart                 # Quick restart (is configured to hot reload)"
echo "===================================================================================="