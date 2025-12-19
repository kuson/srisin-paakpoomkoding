# Uploading Large Files to CapRover

Since videos and APK files are large and excluded from Git, they need to be uploaded manually to CapRover's persistent storage.

## Quick Start

1. **Set your server configuration** (one-time setup):
   ```bash
   export CAPROVER_SERVER_IP="your.server.ip"
   export CAPROVER_SSH_USER="ubuntu"
   export CAPROVER_APP_NAME="paakpoom-srisin"
   ```

2. **Run the upload script**:
   ```bash
   ./upload-large-files.sh
   ```

## What It Does

The `upload-large-files.sh` script uses **rsync** which:
- ✅ Only uploads files that are new or have changed
- ✅ Compresses data during transfer
- ✅ Shows progress for large files
- ✅ Uses checksums to detect changes (more reliable than timestamps)
- ✅ Saves bandwidth by not re-uploading unchanged files

## One-Time Setup

### Option 1: Environment Variables (Recommended)

Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
# CapRover Configuration
export CAPROVER_SERVER_IP="123.456.789.0"  # Your server IP
export CAPROVER_SSH_USER="ubuntu"
export CAPROVER_APP_NAME="paakpoom-srisin"
```

Then reload: `source ~/.zshrc`

### Option 2: Edit the Script

Open `upload-large-files.sh` and update these lines:

```bash
SERVER_IP="${CAPROVER_SERVER_IP:-your.server.ip}"  # Change your.server.ip
SSH_USER="${CAPROVER_SSH_USER:-ubuntu}"            # Change if different  
APP_NAME="${CAPROVER_APP_NAME:-paakpoom-srisin}"   # Change if different
```

## Upload Locations

Files are uploaded to these persistent storage locations on your server:

- **Videos**: `/var/lib/docker/volumes/captain--paakpoom-srisin--videos/_data/`
- **Assets**: `/var/lib/docker/volumes/captain--paakpoom-srisin--assets/_data/`

## When to Upload

You only need to run this script when:
- 📹 Adding a new video
- 📱 Updating the APK file
- 🔄 Changing existing video/asset files

The files **persist across deployments**, so you don't need to upload them every time you deploy code changes.

## Manual Upload (Alternative)

If you prefer to upload manually:

```bash
# Upload videos
rsync -avzP --checksum ./videos/ ubuntu@YOUR_SERVER_IP:/var/lib/docker/volumes/captain--paakpoom-srisin--videos/_data/

# Upload assets
rsync -avzP --checksum ./assets/ ubuntu@YOUR_SERVER_IP:/var/lib/docker/volumes/captain--paakpoom-srisin--assets/_data/
```

## Troubleshooting

### SSH Permission Denied

Make sure your SSH key is added to the server:
```bash
ssh-copy-id ubuntu@YOUR_SERVER_IP
```

### Can't Find Files on Server

SSH into the server and verify:
```bash
ssh ubuntu@YOUR_SERVER_IP
ls -lh /var/lib/docker/volumes/captain--paakpoom-srisin--videos/_data/
ls -lh /var/lib/docker/volumes/captain--paakpoom-srisin--assets/_data/
```

### Permission Issues

If you get permission errors, you may need to use sudo:
```bash
ssh ubuntu@YOUR_SERVER_IP "sudo mkdir -p /var/lib/docker/volumes/captain--paakpoom-srisin--videos/_data/"
ssh ubuntu@YOUR_SERVER_IP "sudo chown -R ubuntu:ubuntu /var/lib/docker/volumes/captain--paakpoom-srisin--videos/"
```

---

**Benefits of This Approach:**
- 🚀 Fast deployments (no large files in Git)
- 💾 Saves GitHub storage
- 🔄 Efficient rsync only transfers changes
- 📦 Persistent storage survives deployments
