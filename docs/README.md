# 📚 Srisin Family Website Documentation

> A beautiful family website for srisin.com featuring a warm greeting for Paak and Poom, a YouTube-like video player, and space for family stories.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Local Development](#local-development)
6. [CapRover Deployment](#caprover-deployment)
7. [Customization Guide](#customization-guide)
8. [Adding New Content](#adding-new-content)
9. [Video Player Features](#video-player-features)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

This website is designed for the Srisin family, specifically created with love for nephews **Paak** and **Poom**. It features:

- A warm, welcoming hero section with "Hello Paak and Poom!"
- A custom YouTube-like video player
- Content sections for family stories and messages
- Responsive design for all devices
- Easy deployment to CapRover

**Domain**: srisin.com

---

## 📁 File Structure

```
srisin/
├── index.html                      # Main HTML page
├── css/
│   └── style.css                   # Custom styles
├── js/
│   └── player.js                   # Video player functionality
├── videos/
│   └── 20251216_AppForKhunPoo.mov  # Video files
├── assets/
│   ├── Dad_Medicine_Reminder_v2.apk  # Android app download
│   └── README.md                   # Assets documentation
├── docs/
│   ├── README.md                   # This documentation
│   └── DEPLOYMENT.md               # Deployment guide
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD
├── Dockerfile                      # Docker configuration
├── captain-definition              # CapRover configuration
├── nginx.conf                      # Nginx web server config
├── server.py                       # Local dev server with range support
└── .gitignore                      # Git ignore rules
```

---

## ✨ Features

### 🏠 Hero Section
- Large, welcoming greeting for Paak and Poom
- **Medicine Reminder app download** - Download APK directly from the site
- Animated emoji decorations
- Gradient background with smooth wave transition
- Call-to-action button to videos section

### 🎬 Video Player
- **YouTube-like controls**: Play/pause, skip, volume, fullscreen
- **Progress bar**: Click or drag to seek
- **Picture-in-Picture**: Watch while browsing
- **Keyboard shortcuts**: Full keyboard control
- **Mobile support**: Touch gestures
- **Thumbnail playlist**: Ready for multiple videos

### 📝 Content Section
- Card-based layout for stories
- Special message section for Paak & Poom
- Placeholder cards ready for your content
- Thai language support

### 📱 Responsive Design
- Mobile-first approach
- Works on phones, tablets, and desktops
- Touch-friendly controls

---

## 🛠 Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Bootstrap | 5.3.2 | CSS framework |
| Bootstrap Icons | 1.11.1 | Icon library |
| Nginx | Alpine | Web server |
| Docker | Latest | Containerization |
| GitHub Actions | v4 | CI/CD automation |

---

## 💻 Local Development

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Local web server (like Live Server VS Code extension)

### Running Locally

**Option 1: Direct File**
```bash
# Simply open index.html in your browser
open index.html
```

**Option 2: Using Python HTTP Server**
```bash
cd /path/to/srisin
python3 -m http.server 8080
# Visit http://localhost:8080
```

**Option 3: Using VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

**Option 4: Using Docker**
```bash
cd /path/to/srisin
docker build -t srisin-website .
docker run -p 8080:80 srisin-website
# Visit http://localhost:8080
```

---

## 🚀 CapRover Deployment

### Method 1: Git-based Deployment (Recommended)

1. **Initialize Git Repository**
   ```bash
   cd /path/to/srisin
   git init
   git add .
   git commit -m "Initial commit: Srisin family website"
   ```

2. **Add CapRover Remote**
   ```bash
   git remote add caprover captain@<YOUR-CAPROVER-IP>:<APP-NAME>
   ```

3. **Deploy**
   ```bash
   git push caprover master
   ```

### Method 2: Tar File Upload

1. **Create tar file**
   ```bash
   cd /path/to/srisin
   tar -cvf srisin-website.tar .
   ```

2. **Upload via CapRover Dashboard**
   - Go to your CapRover dashboard
   - Navigate to your app
   - Upload the tar file in the "Deploy" section

### Method 3: CapRover CLI

1. **Install CapRover CLI**
   ```bash
   npm install -g caprover
   ```

2. **Login and Deploy**
   ```bash
   caprover login
   caprover deploy
   ```

### Post-Deployment Checklist

- [ ] Enable HTTPS in CapRover for srisin.com
- [ ] Configure custom domain (srisin.com)
- [ ] Test video playback
- [ ] Verify mobile responsiveness

---

## 🎨 Customization Guide

### Changing Colors

Edit `css/style.css` and modify the CSS variables at the top:

```css
:root {
    --primary-color: #5b8dee;      /* Main blue color */
    --secondary-color: #ff7eb3;    /* Pink accent */
    --accent-color: #ffd166;       /* Yellow accent */
    --gradient-start: #667eea;     /* Hero gradient start */
    --gradient-end: #764ba2;       /* Hero gradient end */
}
```

### Changing the Greeting

Edit `index.html` lines 55-57:

```html
<h1 class="display-2 fw-bold text-gradient mb-4">
    Hello Paak and Poom! 👋
</h1>
```

### Adding a Video Poster Image

1. Add an image to `assets/video-poster.jpg`
2. The video player will automatically use it

---

## ➕ Adding New Content

### Adding a New Video

1. **Add video file** to `videos/` folder

2. **Add thumbnail** in `index.html` (after line ~115):
   ```html
   <div class="col-md-4 col-sm-6">
       <div class="video-thumbnail" data-video="videos/your-new-video.mp4">
           <div class="thumbnail-placeholder">
               <i class="bi bi-play-circle"></i>
           </div>
           <div class="thumbnail-info">
               <span class="thumbnail-title">Video Title</span>
               <span class="thumbnail-date">Date</span>
           </div>
       </div>
   </div>
   ```

### Adding a New Story Card

Add in the content section (~line 140):

```html
<div class="col-lg-6">
    <div class="content-card">
        <div class="card-header-custom">
            <span class="card-date">
                <i class="bi bi-calendar3 me-1"></i>Your Date
            </span>
            <span class="card-tag">
                <i class="bi bi-heart-fill me-1"></i>Category
            </span>
        </div>
        <h4 class="card-title">Your Title</h4>
        <p class="card-text">
            Your content goes here...
        </p>
    </div>
</div>
```

---

## 🎮 Video Player Features

### Controls

| Control | Function |
|---------|----------|
| ▶️ Play/Pause | Click video or big play button |
| ⏪ Skip Back | Go back 10 seconds |
| ⏩ Skip Forward | Go forward 10 seconds |
| 🔊 Volume | Click to mute, hover to adjust |
| 📺 Fullscreen | Enter/exit fullscreen mode |
| 🖼️ PiP | Picture-in-Picture mode |
| Progress Bar | Click/drag to seek |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Play/Pause |
| `F` | Toggle Fullscreen |
| `M` | Mute/Unmute |
| `←` / `J` | Skip back 10 seconds |
| `→` / `L` | Skip forward 10 seconds |
| `↑` | Volume up |
| `↓` | Volume down |
| `0-9` | Jump to 0%-90% of video |
| Double-click | Toggle fullscreen |

---

## 🔧 Troubleshooting

### Video Not Playing

1. **Check file format**: MOV files should work, but MP4 is more compatible
2. **Convert video if needed**:
   ```bash
   ffmpeg -i video.mov -c:v libx264 -c:a aac video.mp4
   ```
3. **Check browser console** for errors (F12 → Console)

### Deployment Issues

1. **Check captain-definition**: Ensure JSON is valid
2. **Check Dockerfile**: All COPY paths must exist
3. **CapRover logs**: Check build logs in CapRover dashboard

### Styling Issues

1. **Clear browser cache**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Check CSS paths**: Ensure `css/style.css` path is correct

### Mobile Issues

1. **Test on real device**: Simulators may behave differently
2. **Check viewport meta tag**: Should be present in `<head>`

---

## 📞 Support

If you need help with this website:

1. Check this documentation first
2. Look at the browser console for errors
3. Verify all files are in the correct locations

---

## 📄 License

This website is created for the Srisin family. All rights reserved.

---

**Made with ❤️ for Paak & Poom**

*Last updated: December 19, 2025*
