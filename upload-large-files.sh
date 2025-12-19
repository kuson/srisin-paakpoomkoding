#!/bin/bash
# ===================================================================
# Upload Large Files to CapRover Persistent Storage
# ===================================================================
# This script uploads videos and assets to CapRover using rsync,
# which only copies files if they don't exist or have changed.
#
# Usage: ./upload-large-files.sh
# ===================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Upload Large Files to CapRover Persistent Storage${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Configuration - update these values
SERVER_IP="${CAPROVER_SERVER_IP:-your-server-ip}"
SSH_USER="${CAPROVER_SSH_USER:-ubuntu}"
APP_NAME="${CAPROVER_APP_NAME:-paakpoom-srisin}"

# Check if configuration is set
if [ "$SERVER_IP" = "your-server-ip" ]; then
    echo -e "${RED}ERROR: Please set your server configuration!${NC}"
    echo ""
    echo "You can either:"
    echo "  1. Edit this script and update the Configuration section"
    echo "  2. Set environment variables:"
    echo "     export CAPROVER_SERVER_IP=your.server.ip"
    echo "     export CAPROVER_SSH_USER=ubuntu"
    echo "     export CAPROVER_APP_NAME=paakpoom-srisin"
    echo ""
    exit 1
fi

# Paths
VIDEOS_LOCAL="./videos/"
ASSETS_LOCAL="./assets/"
VIDEOS_REMOTE="/var/lib/docker/volumes/captain--${APP_NAME}--videos/_data/"
ASSETS_REMOTE="/var/lib/docker/volumes/captain--${APP_NAME}--assets/_data/"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Server: $SSH_USER@$SERVER_IP"
echo "  App: $APP_NAME"
echo ""

# Function to upload with rsync
upload_rsync() {
    local source=$1
    local destination=$2
    local description=$3
    
    echo -e "${YELLOW}Uploading $description...${NC}"
    
    if [ ! -d "$source" ]; then
        echo -e "${RED}  ✗ Directory $source does not exist locally${NC}"
        return 1
    fi
    
    # rsync options:
    # -a: archive mode (preserves permissions, times, etc.)
    # -v: verbose
    # -z: compress during transfer
    # -P: show progress and keep partial files
    # --checksum: use checksums to detect changes (more thorough than timestamp)
    rsync -avzP --checksum "$source" "${SSH_USER}@${SERVER_IP}:${destination}"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ $description uploaded successfully${NC}"
    else
        echo -e "${RED}  ✗ Failed to upload $description${NC}"
        return 1
    fi
    echo ""
}

# Upload videos
if [ -d "$VIDEOS_LOCAL" ]; then
    upload_rsync "$VIDEOS_LOCAL" "$VIDEOS_REMOTE" "Videos"
else
    echo -e "${YELLOW}No videos directory found, skipping...${NC}"
    echo ""
fi

# Upload assets (APK files)
if [ -d "$ASSETS_LOCAL" ]; then
    upload_rsync "$ASSETS_LOCAL" "$ASSETS_REMOTE" "Assets (APK files)"
else
    echo -e "${YELLOW}No assets directory found, skipping...${NC}"
    echo ""
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Upload Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Your large files are now on the server and will persist across deployments."
echo "rsync only copied files that were new or changed, saving bandwidth!"
echo ""
