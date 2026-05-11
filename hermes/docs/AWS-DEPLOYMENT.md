# 🚀 AWS EC2 Deployment Guide for Hermes

Deploy Hermes on a dedicated AWS EC2 instance with PostgreSQL managed database.

## Architecture

```
┌─────────────────────────────────────────┐
│     AWS Account                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  EC2 Instance                    │  │
│  │  - Ubuntu 22.04 LTS              │  │
│  │  - Docker + Docker Compose       │  │
│  │  - Node.js Backend (port 3001)   │  │
│  │  - React Frontend (port 3000)    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  RDS PostgreSQL                  │  │
│  │  (Optional: use Lightsail DB)    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Route 53 / Domain               │  │
│  │  (Optional: hermes.yourdomain)   │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## Step 1: Launch EC2 Instance

### AWS Console

1. Go to **EC2 Dashboard**
2. Click **Launch Instances**

### Configure Instance

**1. Name & AMI**
- Name: `hermes-phone-agent`
- AMI: Ubuntu 22.04 LTS (Free tier eligible)
- Architecture: 64-bit x86

**2. Instance Type**
- **Development**: `t3.small` (1 vCPU, 2GB RAM) - $11/month
- **Production**: `t3.medium` (2 vCPU, 4GB RAM) - $33/month
- **High Volume**: `t3.large` (2 vCPU, 8GB RAM) - $66/month

> **Tip**: Start with `t3.small`, scale up if needed

**3. Key Pair**
- Click **Create new key pair**
- Name: `hermes-key`
- Type: RSA
- Format: .pem (for Mac/Linux) or .ppk (for PuTTY/Windows)
- ⚠️ **SAVE THIS FILE** - you can't download it again

**4. Network Settings**
- VPC: Default
- Auto-assign public IP: **Enable**
- Security Group: Create new
  - Name: `hermes-sg`
  - Description: Security group for Hermes AI phone agent

**5. Inbound Rules**
Add these firewall rules:

```
Type          Protocol  Port  Source
SSH           TCP       22    0.0.0.0/0        (your IP is safer)
HTTP          TCP       80    0.0.0.0/0
HTTPS         TCP       443   0.0.0.0/0
Custom TCP    TCP       3000  0.0.0.0/0        (frontend, optional)
Custom TCP    TCP       3001  0.0.0.0/0        (API, optional)
```

**6. Storage**
- Size: 30GB (enough for OS, Docker, database)
- Type: gp3 (General Purpose)
- Encrypted: ✅ Yes

**7. Review & Launch**
- Click **Launch Instance**
- Wait for instance to start (2-3 minutes)
- Copy the **Public IPv4 address**

---

## Step 2: Connect via SSH

### On Mac/Linux

```bash
# Navigate to key file
cd ~/Downloads

# Set permissions (required)
chmod 400 hermes-key.pem

# Connect to instance
ssh -i hermes-key.pem ubuntu@YOUR.PUBLIC.IP.HERE

# Example:
ssh -i hermes-key.pem ubuntu@54.123.45.67
```

### On Windows (PowerShell)

```powershell
cd ~\Downloads
ssh -i hermes-key.pem ubuntu@YOUR.PUBLIC.IP.HERE
```

### On Windows (PuTTY)

1. Download PuTTYgen
2. Load `hermes-key.pem` → Save as `.ppk`
3. In PuTTY: Connection → SSH → Auth → Select `.ppk` file
4. Host: `ubuntu@YOUR.PUBLIC.IP`
5. Click Open

**Expected output:**
```
Welcome to Ubuntu 22.04 LTS (GNU/Linux 5.15.0-1234-aws x86_64)
ubuntu@ip-172-31-41-137:~$
```

---

## Step 3: Install Docker

Run this command on your instance:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh && \
sudo sh get-docker.sh && \
sudo usermod -aG docker ubuntu
```

Then **disconnect and reconnect**:
```bash
exit
# Wait 10 seconds
ssh -i hermes-key.pem ubuntu@YOUR.PUBLIC.IP
```

Verify Docker works:
```bash
docker --version
docker ps
```

Expected: `Docker version 24.x.x` and no errors

---

## Step 4: Install PostgreSQL (Option A: EC2-Hosted)

If you want the database ON the EC2 instance:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user
sudo -u postgres psql << EOF
CREATE USER hermes WITH PASSWORD 'your-secure-password-here';
CREATE DATABASE hermes OWNER hermes;
GRANT ALL PRIVILEGES ON DATABASE hermes TO hermes;
EOF

# Test connection
psql -h localhost -U hermes -d hermes
```

**Alternative (Option B): AWS RDS**

If you want managed database:
1. Go to **RDS Dashboard**
2. Create new PostgreSQL database
3. Get endpoint (e.g., `hermes-db.c123456.us-east-1.rds.amazonaws.com`)
4. Use in `DATABASE_URL`

---

## Step 5: Clone & Deploy Hermes

```bash
# Navigate to home
cd ~

# Clone the repo
git clone https://github.com/YOUR-USERNAME/hermes.git
cd hermes

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### Edit `.env` with Your Values

```env
# Database (adjust to your setup)
DATABASE_URL=postgresql://hermes:your-secure-password@localhost:5432/hermes
# Or for RDS:
# DATABASE_URL=postgresql://hermes:password@hermes-db.c123456.us-east-1.rds.amazonaws.com:5432/hermes

# Claude API Key (get from https://console.anthropic.com)
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Generate with: openssl rand -hex 32
JWT_SECRET=your-random-32-character-hex-string

# Organization name
ORGANIZATION=hermes-production

# Environment
NODE_ENV=production

# Phone (configure after deployment)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# n8n (if you use n8n)
N8N_URL=http://localhost:5678
```

**Save** (Ctrl+O, Enter, Ctrl+X in nano)

---

## Step 6: Start Hermes

```bash
# Make sure you're in ~/hermes
cd ~/hermes

# Start containers
docker-compose up -d

# Check status
docker ps

# View logs
docker logs hermes_backend_1
docker logs hermes_frontend_1
docker logs hermes_db_1
```

Expected output: 3 containers running

---

## Step 7: Access Hermes

### Frontend
Open browser: `http://YOUR.PUBLIC.IP:3000`

### API Health Check
```bash
curl http://YOUR.PUBLIC.IP:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "organization": "hermes-production",
  "timestamp": "2026-05-03T..."
}
```

---

## Step 8: Setup Domain (Optional)

If you have a domain (`hermes.yourdomain.com`):

### Option A: Route 53

1. **AWS Route 53** → Create hosted zone
2. Add DNS records:
   ```
   A record: hermes  → YOUR.PUBLIC.IP
   ```
3. Update your domain registrar nameservers

### Option B: Nginx Reverse Proxy

SSH into your instance:

```bash
# Install nginx
sudo apt install -y nginx

# Create config
sudo tee /etc/nginx/sites-available/hermes > /dev/null << 'EOF'
server {
    listen 80;
    server_name hermes.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/hermes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 9: Setup HTTPS (SSL Certificate)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot certonly --nginx -d hermes.yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Step 10: Monitor & Maintain

### Check Container Status

```bash
# All containers
docker ps

# Show specific logs
docker logs -f hermes_backend_1

# Stop everything
docker-compose down

# Restart everything
docker-compose up -d
```

### View Database

```bash
psql -U hermes -d hermes -c "SELECT * FROM agents;"
```

### Update Hermes

```bash
cd ~/hermes
git pull origin master
docker-compose down
docker-compose up -d --build
```

### Auto-Restart on Reboot

```bash
# Make containers restart automatically
docker update --restart=always hermes_backend_1
docker update --restart=always hermes_frontend_1
docker update --restart=always hermes_db_1
```

---

## Configuration After Deployment

### Add Twilio

1. Create account: https://www.twilio.com/console
2. Get credentials:
   - ACCOUNT_SID
   - AUTH_TOKEN
   - Phone number
3. Update `.env`:
   ```bash
   nano .env
   # Add Twilio credentials
   docker-compose restart hermes_backend_1
   ```

### Connect n8n

1. Deploy n8n (separate instance or docker)
2. Create webhooks for:
   - CRM lookup
   - Email history
   - Booking
3. Add webhook URLs to agent config in UI

---

## Cost Estimate (Monthly)

| Service | Instance | Price |
|---------|----------|-------|
| **EC2** | t3.small | $11 |
| **EC2** | t3.medium | $33 |
| **EC2** | t3.large | $66 |
| **Data Transfer** | 10GB out | $0.90 |
| **RDS PostgreSQL** (optional) | db.t3.micro | $15 |
| **Route 53** (optional) | Hosted zone | $0.50 |
| **Total (t3.small + no RDS)** | — | **~$12/month** |
| **Total (t3.medium + RDS)** | — | **~$49/month** |

Plus Twilio/Retell costs (~$0.50-2/call)

---

## Troubleshooting

### Can't SSH In
```bash
# Check security group allows SSH (port 22)
# Verify key file permissions
chmod 400 hermes-key.pem

# Verify public IP is correct
# Wait 30 seconds after instance creation
```

### Docker Command Not Found
```bash
# Log out and back in
exit
ssh -i hermes-key.pem ubuntu@YOUR.IP
```

### Port Already in Use
```bash
# Check what's using ports
sudo netstat -tuln | grep 3000
sudo netstat -tuln | grep 3001

# Kill process (if needed)
sudo kill -9 PID
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps
docker logs hermes_db_1

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Frontend Can't Reach API
```bash
# Check API is responding
curl http://localhost:3001/api/health

# Update proxy if needed in frontend/vite.config.ts
```

---

## Security Hardening (Production)

1. **SSH Key Only** - Disable password auth
   ```bash
   sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
   sudo systemctl restart ssh
   ```

2. **Firewall** - Restrict to your IPs
   ```bash
   # SSH only from your IP
   # HTTP/HTTPS open
   # Close 3000/3001 ports
   ```

3. **Environment Variables** - Use AWS Secrets Manager
   ```bash
   # Don't store API keys in .env file
   # Use docker-compose.override.yml for secrets
   ```

4. **Backups** - Enable EBS snapshots
   ```bash
   # AWS Console → Snapshots → Create schedule
   ```

5. **Updates** - Keep system patched
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

---

## Next Steps

1. ✅ Launch EC2 instance
2. ✅ Install Docker
3. ✅ Deploy Hermes
4. ✅ Add domain (optional)
5. ✅ Setup Twilio
6. ✅ Create first agent
7. ✅ Make test call
8. ✅ Monitor and scale

**You're ready to deploy! 🚀**
