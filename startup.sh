#!/bin/sh

clear
echo "===================================================================================="
echo " startup.sh - STARTUP COMPLETE "
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
    echo "   ✔️ Server API:             http://localhost:5000/api/test"
else
    echo "   ❌ Server:                 Not running"
fi

# Client
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "mern-client.*Up"; then
    echo "   ✔️ Client App:             http://localhost:3000"
else
    echo "   ❌ Client:                 Not running"
fi
echo "  If a link doesn't connect, check the docker-compose.yml to find the correct port and fix it"
echo "  Ports here may be out of sync with docker-compose.yml"

echo ""
echo ""
echo "🔧 Quick Commands:"
echo "   docker-compose logs -f        # Follow the logs (display and update logs in realtime)"
echo "===================================================================================="


