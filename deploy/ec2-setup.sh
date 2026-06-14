#!/bin/bash
# Run on a fresh Ubuntu 22.04 EC2 instance (as ubuntu user)
set -e

echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs git nginx

echo "=== Installing PM2 ==="
sudo npm install -g pm2

APP_DIR="$HOME/bolinjcha-mandal"
if [ ! -d "$APP_DIR" ]; then
  echo "Clone your repo first, e.g.:"
  echo "  git clone https://github.com/YOUR_USER/bolinjcha-mandal.git $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "Create .env file first! Copy from .env.example"
  exit 1
fi

echo "=== Installing dependencies ==="
npm ci
npx prisma generate
npx prisma db push
npm run db:seed
npm run build

mkdir -p uploads

echo "=== Starting with PM2 ==="
pm2 delete bolinjcha-mandal 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | tail -1 | bash || true

echo "=== Done! App on http://YOUR_EC2_IP:3000 ==="
echo "Next: configure Nginx (deploy/nginx-mandal.conf) and certbot for HTTPS"
