# Hosting Guide — SQLite on AWS EC2 or Fly.io

## What persists where

| Data | EC2 | Fly.io |
|------|-----|--------|
| SQLite `dev.db` | `prisma/dev.db` on server disk | `/data/dev.db` on volume |
| Uploads | `uploads/` folder | `/data/uploads/` |
| Code | `~/bolinjcha-mandal` | Docker image |

---

# Option A — AWS EC2 (12 months free tier)

**Cost:** ~₹0 for 12 months (t2.micro), then ~₹700–1200/month  
**Best for:** Learning AWS, full control, SQLite without Docker

## Step 1 — AWS account & EC2

1. Go to [aws.amazon.com](https://aws.amazon.com) → Create account (student email OK).
2. Console → **EC2** → **Launch instance**
3. Settings:
   - **Name:** `bolinjcha-mandal`
   - **AMI:** Ubuntu Server 22.04 LTS
   - **Instance type:** `t2.micro` (Free tier eligible)
   - **Key pair:** Create new → download `.pem` file (keep safe!)
   - **Security group:** Allow SSH (22), HTTP (80), HTTPS (443) from anywhere
   - **Storage:** 20–30 GB
4. Launch → note **Public IPv4 address** (e.g. `3.110.x.x`)

## Step 2 — Connect via SSH

```bash
chmod 400 ~/Downloads/your-key.pem
ssh -i ~/Downloads/your-key.pem ubuntu@YOUR_EC2_IP
```

## Step 3 — Push code to GitHub (on your laptop)

```bash
cd bolinjcha-mandal
git init
git add .
git commit -m "Initial commit"
# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/bolinjcha-mandal.git
git push -u origin main
```

## Step 4 — On EC2 server

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/bolinjcha-mandal.git
cd bolinjcha-mandal

# Environment
cp .env.example .env
nano .env
```

Edit `.env`:

```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="paste-a-long-random-string-here"
NEXT_PUBLIC_APP_NAME="Bolinjcha Vighnaharta Sarvajanik Utsav Mandal"
```

```bash
# Run setup script
chmod +x deploy/ec2-setup.sh
./deploy/ec2-setup.sh
```

## Step 5 — Nginx (port 80, no :3000 in URL)

```bash
sudo cp deploy/nginx-mandal.conf /etc/nginx/sites-available/mandal
sudo nano /etc/nginx/sites-available/mandal
# Change server_name to your EC2 IP or domain

sudo ln -sf /etc/nginx/sites-available/mandal /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Open **http://YOUR_EC2_IP** in browser.

## Step 6 — Free HTTPS (with domain)

If you have a domain (e.g. `bolinjcha.in`):

1. DNS A record → point to EC2 IP
2. On server:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d bolinjcha.in -d www.bolinjcha.in
```

## Step 7 — Updates after code changes

```bash
cd ~/bolinjcha-mandal
git pull
npm ci
npx prisma db push
npm run build
pm2 restart bolinjcha-mandal
```

## Backup (important!)

Weekly on server:

```bash
cp ~/bolinjcha-mandal/prisma/dev.db ~/backup-$(date +%F).db
# Download to laptop:
# scp -i key.pem ubuntu@IP:~/backup-*.db ./
```

---

# Option B — Fly.io (~₹0–400/month)

**Cost:** Free allowance for small apps; ~$5–7/month if you exceed  
**Best for:** No server management, automatic HTTPS, SQLite on volume

## Step 1 — Install Fly CLI (your laptop)

```bash
curl -L https://fly.io/install.sh | sh
# Add to PATH if prompted, then:
fly auth login
```

## Step 2 — Create app & volume

`fly.toml` uses **`sin` (Singapore)** — works on the free tier without a card. Mumbai (`bom`) needs a payment method on Fly.

```bash
cd bolinjcha-mandal

# Option A — skip fly launch (fewer prompts, recommended)
fly apps create bolinjcha-mandal
fly volumes create mandal_data --size 1 --region sin

# Option B — or use launch (must pick a region when asked, e.g. sin)
# fly launch --no-deploy --region sin
# Say NO to PostgreSQL, YES to Dockerfile
# fly volumes create mandal_data --size 1 --region sin
```

**Important:** volume region must match `primary_region` in `fly.toml` (`sin`).

## Step 3 — Set secrets

```bash
fly secrets set JWT_SECRET="your-long-random-secret-here"
fly secrets set NEXT_PUBLIC_APP_NAME="Bolinjcha Vighnaharta Sarvajanik Utsav Mandal"
```

`DATABASE_URL` and `DATA_DIR` are already in `fly.toml`.

## Step 4 — Deploy

```bash
fly deploy
```

## Step 5 — Initialize database (first time)

```bash
fly ssh console -C "npx prisma db push"
fly ssh console -C "npx tsx prisma/seed.ts"
```

## Step 6 — Open app

```bash
fly open
```

URL will be like: `https://bolinjcha-mandal.fly.dev`

## Custom domain on Fly

```bash
fly certs add bolinjcha.in
# Add DNS records Fly shows you at your domain registrar
```

## Updates

```bash
git pull
fly deploy
```

## Backup Fly SQLite

```bash
fly ssh sftp get /data/dev.db ./dev-backup.db
```

---

# Security checklist (both options)

- [ ] Change `JWT_SECRET` to random 32+ characters
- [ ] Change admin password after first login
- [ ] Never commit `.env` to GitHub
- [ ] Enable HTTPS before sharing with mandal members
- [ ] Backup `dev.db` weekly

---

# Which to choose?

| | EC2 | Fly.io |
|---|-----|--------|
| Difficulty | Medium (Linux/SSH) | Easy |
| Free period | 12 months | Ongoing small free tier |
| SQLite | Native file | Volume mount |
| HTTPS | Manual (certbot) | Automatic |
| Student learning | AWS skills | DevOps/Docker |

**Recommendation:** Try **Fly.io** first (fewer steps). Use **EC2** if you want AWS on your resume.
