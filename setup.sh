#!/bin/bash

# Cashback App Setup Script

echo "🚀 Setting up Cashback App..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start services
echo "📦 Building and starting services..."
cd infra
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec api npm run migrate

echo "✅ Setup complete!"
echo ""
echo "🌐 Services are running:"
echo "  - API: http://localhost:3000"
echo "  - Web App: http://localhost:3001"
echo "  - Database: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "📚 To view logs: docker-compose -f infra/docker-compose.yml logs"
echo "🛑 To stop services: docker-compose -f infra/docker-compose.yml down"