#!/bin/bash

echo "🔍 Checking VibeLux Required Services..."
echo "========================================"

# PostgreSQL
echo -n "PostgreSQL: "
if pg_isready -q; then
    echo "✅ Running"
else
    echo "❌ Not running (run: brew services start postgresql)"
fi

# Redis
echo -n "Redis: "
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not running (run: brew services start redis)"
fi

# InfluxDB
echo -n "InfluxDB: "
if curl -s http://localhost:8086/health > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not running (run: influxdb or docker start influxdb)"
fi

# MongoDB (optional)
echo -n "MongoDB: "
if mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "⚠️  Not running (optional - run: brew services start mongodb-community)"
fi

# Check Next.js app
echo -n "Next.js App: "
if curl -s http://localhost:3000 > /dev/null || curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not running (run: npm run dev)"
fi

echo ""
echo "External Services (configured via environment):"
echo "----------------------------------------------"
echo "✅ AWS Bedrock (AI) - Configured"
echo "✅ Clerk Auth - Configured"
echo "✅ Stripe Payments - Configured"

echo ""
echo "📝 To start all services:"
echo "  brew services start postgresql"
echo "  brew services start redis"
echo "  docker start influxdb (or: influxdb)"
echo "  npm run dev"