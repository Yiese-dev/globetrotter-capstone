# Deploying to a VPS (Microservices + Nginx + Docker)

Deploys **Phase 2 (`backend/microservices/`)** to a VPS behind Nginx on the domain
`peniel-go.duckdns.org`, with the API Gateway published only on `127.0.0.1:7000` (never
directly on the public interface — Nginx is the only thing the internet talks to).

```
Internet ──443/80──▶ Nginx ──▶ 127.0.0.1:7000 ──▶ api-gateway container ──▶ user/itinerary/recommendation
                       │
                       └──▶ frontend/dist (static files)
```

## 0. Prerequisites

- A VPS (Ubuntu 22.04/24.04 assumed below) with a public IP.
- The DuckDNS domain `peniel-go.duckdns.org` pointed at that IP: log into
  [duckdns.org](https://www.duckdns.org), set the domain's IP to the VPS's public IP. If the
  VPS has a static IP this is a one-time step; if not, install DuckDNS's cron updater on the
  VPS (their site gives you a one-liner `duck.sh` + cron entry).
- SSH access to the VPS with a sudo-capable user.

## 1. Install Docker, Nginx, Certbot

```bash
sudo apt update && sudo apt upgrade -y

# Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker   # or log out/in

# Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # 80 + 443
sudo ufw enable
```

Note there's no `ufw` rule for port 7000 — it's bound to `127.0.0.1` only (see step 3), so it
isn't reachable from outside the box regardless.

## 2. Clone the repo

```bash
git clone <your-repo-url> /root/peniel-go
cd /root/peniel-go
```

Nginx runs as `www-data` and `/root` is `700` by default, so it can't traverse into it to
serve the built frontend — grant traversal (not listing) on the home dir itself:

```bash
sudo chmod o+x /root
```

This only opens *execute* (traverse-into) on `/root` itself; it doesn't make `/root`'s
contents listable or readable, and everything under `/root/peniel-go` keeps normal `755`
permissions from git.

If you use a different path, update `root` in
[`deploy/nginx/peniel-go.duckdns.org.conf`](../deploy/nginx/peniel-go.duckdns.org.conf) and
`REPO_DIR` resolution in [`update.sh`](../update.sh) (it self-locates via its own path, so
this only matters if you move things around later).

## 3. Configure and start the microservices

```bash
cd /root/peniel-go/backend/microservices
cp .env.example .env
```

Edit `.env` and set a real secret (don't ship `change-me-in-production`):

```bash
openssl rand -hex 32   # paste the output as JWT_SECRET in .env
```

[`docker-compose.prod.yml`](../backend/microservices/docker-compose.prod.yml) is a
production overlay on top of the base `docker-compose.yml` — it does two things the dev
compose file intentionally doesn't:

- publishes the gateway as `127.0.0.1:7000:8080` instead of `8080:8080` (loopback-only, so
  Nginx is the sole path in from the internet)
- sets `PENIELGO_CORS_ORIGINS` on all four services to `https://peniel-go.duckdns.org`
  instead of `http://localhost:5173`

Bring it up:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose ps           # all four should report healthy
curl http://127.0.0.1:7000/health
```

## 4. Build the frontend

The frontend is a static SPA — Nginx serves the built files directly, it doesn't run in a
container.

```bash
cd /root/peniel-go/frontend
cat > .env.production.local <<'EOF'
VITE_API_BASE_URL=https://peniel-go.duckdns.org/api/v1
EOF

npm ci
npm run build   # outputs to frontend/dist
```

Because Nginx will serve the frontend and proxy `/api/v1/` from the *same* origin
(`https://peniel-go.duckdns.org`), the browser never makes a cross-origin request — the
`PENIELGO_CORS_ORIGINS` values from step 3 are a defense-in-depth backstop, not something
the app depends on at runtime.

## 5. Configure Nginx

```bash
sudo cp /root/peniel-go/deploy/nginx/peniel-go.duckdns.org.conf \
        /etc/nginx/sites-available/peniel-go.duckdns.org
sudo ln -s /etc/nginx/sites-available/peniel-go.duckdns.org /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # avoid the default server clashing
sudo nginx -t
sudo systemctl reload nginx
```

At this point `http://peniel-go.duckdns.org` should serve the app and
`http://peniel-go.duckdns.org/api/v1/health` should proxy through to the gateway.

## 6. HTTPS via Certbot

```bash
sudo certbot --nginx -d peniel-go.duckdns.org
```

Certbot edits the Nginx config in place to add the HTTPS server block, redirect HTTP → HTTPS,
and installs a systemd timer for auto-renewal. Verify the timer and do a dry run:

```bash
systemctl status certbot.timer
sudo certbot renew --dry-run
```

Visit `https://peniel-go.duckdns.org` — should load over TLS with a valid cert.

## 7. Redeploying later

[`update.sh`](../update.sh) at the repo root does the full redeploy: `git pull`, rebuild +
restart the microservices, rebuild the frontend, reload Nginx.

```bash
cd /root/peniel-go
./update.sh
```

Run it from the VPS after merging changes to `main`. It doesn't touch the named Docker
volumes (`user_data`, `itinerary_data`, `recommendation_data`), so the JSON data stores
persist across redeploys — only `docker compose down -v` would wipe them.

## Troubleshooting

- **502 from Nginx** — a service isn't healthy yet: `docker compose -f docker-compose.yml -f
  docker-compose.prod.yml ps` and `docker compose logs api-gateway`.
- **CORS errors in the browser console** — the frontend is calling a different origin than
  `PENIELGO_CORS_ORIGINS` allows; confirm `VITE_API_BASE_URL` was baked in at build time
  (`grep VITE_API_BASE_URL frontend/dist/assets/*.js`) and that it's `https://peniel-go.duckdns.org/api/v1`, not `localhost`.
- **Certbot fails the HTTP-01 challenge** — DuckDNS record isn't pointing at this VPS yet, or
  port 80 isn't reachable (check `ufw status`, and that no other process holds port 80).
