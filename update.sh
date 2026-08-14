#!/usr/bin/env bash
# Pulls the latest code on the VPS, rebuilds the microservices, rebuilds the frontend,
# and reloads nginx. See docs/deploy-vps.md for the one-time setup this assumes.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

echo "==> Pulling latest changes"
git pull

echo "==> Rebuilding and restarting microservices"
cd "$REPO_DIR/backend/microservices"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo "==> Building frontend"
cd "$REPO_DIR/frontend"
npm ci
npm run build

echo "==> Reloading nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "==> Pruning dangling Docker images"
docker image prune -f

echo "==> Done. Service status:"
cd "$REPO_DIR/backend/microservices"
docker compose ps
