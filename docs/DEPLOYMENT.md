# 🚀 Deployment Guide for paakpoom.srisin.com

## A. Manual Deployment to CapRover

### Prerequisites
- Access to CapRover at https://captain.thaisafe.org/
- Domain DNS configured: `paakpoom.srisin.com` → Your CapRover server IP
- Video file: `20251216_AppForKhunPoo.mov`

---

### Step 1: Prepare the Deployment Package

```bash
cd /Users/sintusingha/dev/2025/srisin

# Create a clean tar file (excluding videos, git, dev files)
tar -cvf paakpoom-srisin.tar \
    --exclude='videos/*' \
    --exclude='.git' \
    --exclude='nohup.out' \
    --exclude='server.py' \
    --exclude='server.log' \
    --exclude='*.tar' \
    --exclude='.DS_Store' \
    .

# Check the tar file contents
tar -tvf paakpoom-srisin.tar
```

---

### Step 2: Create App in CapRover GUI

1. **Login to CapRover**
   - Go to: https://captain.thaisafe.org/
   - Enter your password

2. **Create New App**
   - Click "Apps" in the left sidebar
   - Enter app name: `paakpoom-srisin` (or just `paakpoom`)
   - ✅ Check "Has Persistent Data" (important for video files!)
   - Click "Create New App"

3. **Configure the App**
   
   **HTTP Settings tab:**
   - Enable HTTPS: ✅ Yes
   - Container HTTP Port: `80`
   - Force HTTPS: ✅ Yes (after SSL is set up)

   **App Configs tab:**
   - Add Persistent Directory for Videos:
     - Path in App: `/usr/share/nginx/html/videos`
     - Label: `videos`
   - Add Persistent Directory for Assets (APK files):
     - Path in App: `/usr/share/nginx/html/assets`
     - Label: `assets`
   - Click "Save & Update"

4. **Add Custom Domain**
   - Go to "HTTP Settings" tab
   - Under "Custom Domain", add: `paakpoom.srisin.com`
   - Click "Connect New Domain"
   - Click "Enable HTTPS" for the domain

---

### Step 3: Deploy the Application

**Option A: Upload via CapRover Web UI**

1. Go to your app → "Deployment" tab
2. Choose "Tar File Upload"
3. Select `paakpoom-srisin.tar`
4. Click "Upload & Deploy"
5. Wait for build to complete (check build logs)

**Option B: Deploy via CapRover CLI**

```bash
# Install CapRover CLI (if not installed)
npm install -g caprover

# Login to CapRover
caprover login
# Enter: https://captain.thaisafe.org
# Enter your password

# Deploy
cd /Users/sintusingha/dev/2025/srisin
caprover deploy -a paakpoom-srisin
```

---

### Step 4: Upload Video Files

After deployment, upload video files to the persistent storage:

**Option A: Via SCP (Recommended)**

```bash
# First, find your CapRover server IP
# Then SSH into the server
ssh root@YOUR_CAPROVER_SERVER_IP

# Find the persistent data path for your app
ls /var/lib/docker/volumes/

# Look for: captain--paakpoom-srisin--videos/_data
# The path is usually:
# /var/lib/docker/volumes/captain--APPNAME--LABEL/_data

# Exit and copy from your Mac
exit

# Upload video from your Mac
scp /Users/sintusingha/dev/2025/srisin/videos/20251216_AppForKhunPoo.mov \
    root@YOUR_CAPROVER_SERVER_IP:/var/lib/docker/volumes/captain--paakpoom-srisin--videos/_data/
```

**Option B: Via SFTP Client**
- Use FileZilla, Cyberduck, or Transmit
- Connect to your server via SFTP
- Navigate to: `/var/lib/docker/volumes/captain--paakpoom-srisin--videos/_data/`
- Upload the video file

---

### Step 5: Verify Deployment

1. Visit: https://paakpoom.srisin.com
2. Check video loads and plays
3. Test video seeking in Chrome and Safari
4. Test on mobile device

---

### Step 6: DNS Configuration (if not done)

Add these DNS records at your domain registrar:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | paakpoom | YOUR_CAPROVER_SERVER_IP | 300 |
| CNAME | paakpoom | captain.thaisafe.org | 300 |

---

## B. CI/CD Best Practices & Deployment Options

### Comparison of Deployment Methods

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Docker (Current)** | Isolated, reproducible, easy rollback | Slightly more complex | Production sites |
| **Static Files** | Simplest, fastest | No isolation, harder rollback | Simple static sites |
| **Git Push** | Automated, versioned | Requires Git setup | Active development |

### Recommended CI/CD Workflow

Given your tools (GitHub, Oracle OCI Free Tier), here's the best setup:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   GitHub    │────▶│  CapRover   │────▶│  Website    │
│   (Code)    │     │   Actions   │     │   Server    │     │   Live!     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      │              CI/CD Automation        │
      │                                       │
      └───────────────────────────────────────┘
                  Video files uploaded
                  separately (large files)
```

### Setting Up GitHub Actions CI/CD

1. **Create GitHub Repository**
   ```bash
   cd /Users/sintusingha/dev/2025/srisin
   git remote add origin https://github.com/YOUR_USERNAME/paakpoom-srisin.git
   git push -u origin main
   ```

2. **Add GitHub Actions Workflow**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to CapRover
   
   on:
     push:
       branches: [main, master]
     workflow_dispatch:  # Allow manual trigger
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
         - name: Checkout code
           uses: actions/checkout@v4
         
         - name: Deploy to CapRover
           uses: caprover/deploy-from-github@v1.1.2
           with:
             server: '${{ secrets.CAPROVER_SERVER }}'
             app: '${{ secrets.CAPROVER_APP }}'
             token: '${{ secrets.CAPROVER_TOKEN }}'

         - name: Sync videos
           uses: appleboy/scp-action@v0.1.7
           with:
             host: ${{ secrets.SERVER_IP }}
             username: ubuntu
             key: ${{ secrets.SERVER_SSH_KEY }}
             source: "videos/*"
             target: "/var/lib/docker/volumes/captain--${{ secrets.CAPROVER_APP }}--videos/_data/"

         - name: Sync assets
           uses: appleboy/scp-action@v0.1.7
           with:
             host: ${{ secrets.SERVER_IP }}
             username: ubuntu
             key: ${{ secrets.SERVER_SSH_KEY }}
             source: "assets/*.apk"
             target: "/var/lib/docker/volumes/captain--${{ secrets.CAPROVER_APP }}--assets/_data/"
   ```

3. **Add GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets → Actions
   - Add:
     - `CAPROVER_SERVER`: `https://captain.thaisafe.org`
     - `CAPROVER_APP`: `paakpoom-srisin`
     - `CAPROVER_TOKEN`: (get from CapRover → Apps → Your App → Deployment → API Token)
     - `SERVER_IP`: Your CapRover server IP address
     - `SERVER_SSH_KEY`: Private SSH key for accessing the server

### Alternative: Oracle OCI Setup

Your Oracle OCI Free Tier (4 OCPU, 24GB RAM) is excellent for hosting! Options:

1. **CapRover on OCI** (Recommended)
   - Install CapRover on your OCI instance
   - Use same workflow as above
   - Free forever with Free Tier

2. **Direct Nginx on OCI**
   - Simpler but less features
   - Manual deployments via SCP/rsync

3. **OCI Container Registry + OKE**
   - Enterprise-grade but complex
   - Overkill for a family website

### Recommended Architecture for Your Setup

```
Oracle OCI Free Tier (4 OCPU, 24GB)
├── CapRover (Docker management)
│   ├── paakpoom.srisin.com (This website)
│   ├── other-apps...
│   └── SSL via Let's Encrypt (auto)
│
└── Persistent Storage
    └── /videos (large files)

GitHub
├── Source code repository
├── GitHub Actions (CI/CD)
└── GitHub Copilot (development)
```

### Quick Commands Reference

```bash
# Create deployment package
tar -cvf paakpoom-srisin.tar --exclude='videos/*' --exclude='.git' --exclude='nohup.out' --exclude='server.py' .



# Deploy via CLI
caprover deploy -a paakpoom-srisin

# Check app status
curl -I https://paakpoom.srisin.com

# View logs
# (In CapRover GUI → App → Logs)
```

---

## Troubleshooting

### Video Not Playing
- Check persistent storage is mounted correctly
- Verify video file exists: SSH into server and check
- Check nginx logs in CapRover

### 502 Bad Gateway
- Check build logs for errors
- Verify Dockerfile syntax
- Ensure port 80 is exposed

### SSL Certificate Issues
- Wait 5 minutes for Let's Encrypt
- Verify DNS is pointing to server
- Check CapRover → Apps → Your App → Enable HTTPS

### APK Download Not Working
- Check assets persistent storage is mounted correctly
- Verify APK file exists in the correct path on server
- Ensure Dockerfile includes assets folder in the build

---

*Last updated: December 19, 2025*
