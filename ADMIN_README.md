# Admin Module - Srisin Family Website

This admin module allows you to create and manage content for the Srisin family website with a password-protected interface.

## Features

- **Rich Text Editor**: Format your content with TinyMCE WYSIWYG editor
- **Media Upload**: Support for photos, videos, and file attachments
- **Content Management**: Create, edit, and delete content
- **Session Security**: 30-minute session timeout with password protection
- **Responsive Design**: Clean Bootstrap white styling

## Setup

1. **Install Python dependencies**:
   ```bash
   pip3 install -r requirements.txt
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your secure password:
   ```
   ADMIN_PASSWORD=your_secure_password_here
   SECRET_KEY=your_secret_key_here_change_this
   ```

3. **Start the admin server**:
   ```bash
   python3 admin_server.py
   ```

4. **Access the admin panel**:
   - Navigate to: http://localhost:5000/admin
   - Enter your configured password
   - Start creating content!

## Usage

### Creating Content

1. Log into the admin panel at `/admin`
2. Fill in the content form:
   - **Title**: The heading for your content card
   - **Content**: Rich text body with formatting options
   - **Tag**: Category label (e.g., "Family", "Story", "Update")
   - **Date**: Display date (e.g., "December 2025")
   - **Media Files**: Upload images, videos, or documents

3. Click "Save Content" to publish

### Managing Content

- **Edit**: Click the pencil icon next to any content item
- **Delete**: Click the trash icon to remove content
- **Refresh**: Click the refresh button to reload the content list

### File Support

**Images**: JPG, PNG, GIF  
**Videos**: MP4, MOV, AVI  
**Documents**: PDF, DOC, DOCX, TXT, ZIP

Maximum file size: 50MB per file

## Content Display

Published content automatically appears in the "Family Stories" section of the main website (index.html) as beautiful cards with:

- Title and formatted body text
- Image galleries
- Inline video players
- Downloadable file attachments
- Tag badges and dates

## Security

- Password protection via `.env` configuration
- Session-based authentication
- 30-minute session timeout
- Never commit `.env` file to git
- All uploads stored in `uploads/` directory (excluded from git)
- XSS protection with content escaping
- File upload validation and secure naming

**Production Recommendations:**
- Set `DEBUG=False` in `.env` for production
- Use `HOST=127.0.0.1` (localhost only) or configure firewall rules
- Always set a strong `SECRET_KEY` (minimum 32 characters)
- Get a free TinyMCE API key at https://www.tiny.cloud/get-tiny/
- Consider using a production WSGI server (e.g., gunicorn, uwsgi)

## Troubleshooting

**Can't access admin panel**: Check that `admin_server.py` is running

**Login fails**: Verify `ADMIN_PASSWORD` is set correctly in `.env`

**Uploads fail**: Check file size (max 50MB) and file type

**Content not appearing**: Check browser console for errors and ensure `content-loader.js` is loaded

## Architecture

- **Backend**: Flask (Python) with REST API
- **Frontend**: Bootstrap 5 with TinyMCE editor
- **Storage**: JSON file-based content storage
- **Uploads**: Local filesystem storage

## Port Configuration

- **Admin Server**: Port 5000 (Flask)
- **Static Site**: Port 8000 (server.py)

Both can run simultaneously on different ports.
