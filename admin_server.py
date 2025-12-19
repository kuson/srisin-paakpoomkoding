#!/usr/bin/env python3
"""
Admin Server for Srisin Family Website
Flask-based content management system with session authentication
"""

import os
import json
import secrets
from datetime import datetime, timedelta
from pathlib import Path
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

# Directory configuration
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
UPLOAD_DIR = BASE_DIR / 'uploads'
TEMPLATES_DIR = BASE_DIR / 'templates'

# Create directories if they don't exist
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)
TEMPLATES_DIR.mkdir(exist_ok=True)

CONTENT_FILE = DATA_DIR / 'content.json'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'pdf', 'doc', 'docx', 'txt', 'zip'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_content():
    """Load content from JSON file"""
    if CONTENT_FILE.exists():
        with open(CONTENT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_content(content):
    """Save content to JSON file"""
    with open(CONTENT_FILE, 'w', encoding='utf-8') as f:
        json.dump(content, f, indent=2, ensure_ascii=False)

def check_auth():
    """Check if user is authenticated"""
    return session.get('authenticated', False)

@app.route('/')
def index():
    """Redirect to main site"""
    return redirect('/index.html')

@app.route('/index.html')
def main_site():
    """Serve the main site"""
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory(BASE_DIR, path)

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(UPLOAD_DIR, filename)

@app.route('/admin')
def admin():
    """Admin login/dashboard page"""
    if not check_auth():
        return render_template('login.html')
    return render_template('admin.html')

@app.route('/api/login', methods=['POST'])
def login():
    """Handle login"""
    data = request.get_json()
    password = data.get('password', '')
    admin_password = os.getenv('ADMIN_PASSWORD')
    
    if not admin_password:
        return jsonify({'success': False, 'message': 'Admin password not configured'}), 500
    
    if password == admin_password:
        session['authenticated'] = True
        session.permanent = True
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Invalid password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """Handle logout"""
    session.clear()
    return jsonify({'success': True})

@app.route('/api/content', methods=['GET'])
def get_content():
    """Get all content"""
    content = load_content()
    return jsonify(content)

@app.route('/api/content', methods=['POST'])
def create_content():
    """Create new content"""
    if not check_auth():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    data = request.get_json()
    content = load_content()
    
    # Generate unique ID
    new_id = max([c.get('id', 0) for c in content], default=0) + 1
    
    new_content = {
        'id': new_id,
        'title': data.get('title', ''),
        'body': data.get('body', ''),
        'tag': data.get('tag', 'Story'),
        'date': data.get('date', datetime.now().strftime('%B %Y')),
        'media': data.get('media', []),
        'created_at': datetime.now().isoformat()
    }
    
    content.insert(0, new_content)  # Add to beginning
    save_content(content)
    
    return jsonify({'success': True, 'content': new_content})

@app.route('/api/content/<int:content_id>', methods=['PUT'])
def update_content(content_id):
    """Update existing content"""
    if not check_auth():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    data = request.get_json()
    content = load_content()
    
    for i, c in enumerate(content):
        if c['id'] == content_id:
            content[i].update({
                'title': data.get('title', c['title']),
                'body': data.get('body', c['body']),
                'tag': data.get('tag', c['tag']),
                'date': data.get('date', c['date']),
                'media': data.get('media', c['media']),
                'updated_at': datetime.now().isoformat()
            })
            save_content(content)
            return jsonify({'success': True, 'content': content[i]})
    
    return jsonify({'success': False, 'message': 'Content not found'}), 404

@app.route('/api/content/<int:content_id>', methods=['DELETE'])
def delete_content(content_id):
    """Delete content"""
    if not check_auth():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    content = load_content()
    content = [c for c in content if c['id'] != content_id]
    save_content(content)
    
    return jsonify({'success': True})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file uploads"""
    if not check_auth():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'}), 400
    
    file = request.files['file']
    
    if not file.filename or file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'File type not allowed'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        # Add timestamp and random suffix to avoid conflicts
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        random_suffix = secrets.token_hex(4)
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{timestamp}_{random_suffix}{ext}"
        
        filepath = UPLOAD_DIR / filename
        file.save(filepath)
        
        # Determine file type
        ext = ext.lower()
        if ext in ['.jpg', '.jpeg', '.png', '.gif']:
            file_type = 'image'
        elif ext in ['.mp4', '.mov', '.avi']:
            file_type = 'video'
        else:
            file_type = 'file'
        
        return jsonify({
            'success': True,
            'filename': filename,
            'url': f'/uploads/{filename}',
            'type': file_type
        })
    
    return jsonify({'success': False, 'message': 'File type not allowed'}), 400

if __name__ == '__main__':
    # Get configuration from environment with safe defaults
    debug_mode = os.getenv('DEBUG', 'True').lower() == 'true'
    host = os.getenv('HOST', '127.0.0.1')  # Default to localhost for security
    port = int(os.getenv('PORT', '5000'))
    
    print("🚀 Srisin Admin Server")
    print(f"📡 Server running at http://{host}:{port}")
    print(f"🔐 Admin panel at http://{host}:{port}/admin")
    if debug_mode:
        print("⚠️  Running in DEBUG mode - not suitable for production!")
    print("\n⌨️  Press Ctrl+C to stop\n")
    
    app.run(host=host, port=port, debug=debug_mode)
