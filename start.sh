#!/bin/bash
# Render start script that ensures frontend is built before starting backend

set -e

echo "🚀 Starting IPL Auction Game deployment..."
echo ""

# Check if we're running the frontend
if [[ "$PWD" == *"frontend"* ]]; then
  echo "📦 Frontend Service: Building and running..."
  npm run build
  echo "✓ Build complete"
  npm run preview
  
# Otherwise we're running the backend
else
  echo "🔧 Backend Service: Checking frontend dist..."
  
  # Wait for frontend to be ready (max 60 seconds)
  DIST_PATH="1.2/ipl-auction-game/frontend/dist"
  WAIT_TIME=0
  MAX_WAIT=60
  
  while [ ! -d "$DIST_PATH" ] && [ $WAIT_TIME -lt $MAX_WAIT ]; do
    echo "⏳ Waiting for frontend dist... ($WAIT_TIME/${MAX_WAIT}s)"
    sleep 5
    WAIT_TIME=$((WAIT_TIME + 5))
  done
  
  if [ -d "$DIST_PATH" ]; then
    echo "✓ Frontend dist ready"
  else
    echo "⚠️  Frontend dist not found, but starting backend anyway"
  fi
  
  echo "🎯 Backend Service: Starting..."
  cd 1.2/ipl-auction-game/backend
  node server/index.js
fi
