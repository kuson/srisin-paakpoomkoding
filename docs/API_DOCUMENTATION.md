# Srisin Content Management API Documentation

## Overview

The Srisin Content Management API allows you to programmatically create, read, update, and delete content on the Srisin Family Website. It supports uploading media files (images, videos, documents) and managing content with rich text.

## Base URL

```
http://localhost:5000
```

## Authentication

All API requests (except GET /api/content) require authentication using a Bearer token.

### Setting Up Authentication

1. Set the `API_TOKEN` environment variable:
   ```bash
   export API_TOKEN="your-secret-token-here"
   ```

2. Include the token in your request headers:
   ```
   Authorization: Bearer your-secret-token-here
   ```

### Environment Variables

Create a `.env` file in the project root:

```env
API_TOKEN=your-secret-api-token-here
ADMIN_PASSWORD=your-admin-password
SECRET_KEY=your-flask-secret-key
DEBUG=True
HOST=127.0.0.1
PORT=5000
```

---

## API Endpoints

### 1. Get All Content

Retrieve all published content.

**Endpoint:** `GET /api/content`

**Authentication:** Not required

**Response:**
```json
[
  {
    "id": 1,
    "title": "Welcome to Srisin",
    "body": "<p>Hello world!</p>",
    "tag": "Story",
    "date": "December 2025",
    "media": [
      {
        "url": "/uploads/image_20251220_123456_abc123.jpg",
        "type": "image",
        "filename": "image_20251220_123456_abc123.jpg"
      }
    ],
    "created_at": "2025-12-20T12:34:56.789"
  }
]
```

---

### 2. Create Content

Create new content with optional media.

**Endpoint:** `POST /api/content`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer your-token-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My New Post",
  "body": "<p>This is the content body with <strong>HTML</strong> formatting.</p>",
  "tag": "Story",
  "date": "December 2025",
  "media": [
    {
      "url": "/uploads/photo.jpg",
      "type": "image",
      "filename": "photo.jpg"
    }
  ]
}
```

**Fields:**
- `title` (string, required): Content title
- `body` (string, required): Content body (supports HTML)
- `tag` (string, optional): Category tag (default: "Story")
- `date` (string, optional): Display date (default: current month/year)
- `media` (array, optional): Array of media objects (can be empty or references to uploaded files)

**Media Object:**
- `url` (string): Path to the media file (e.g., "/uploads/filename.jpg")
- `type` (string): Media type ("image", "video", or "file")
- `filename` (string): Original filename

**Response:**
```json
{
  "success": true,
  "content": {
    "id": 2,
    "title": "My New Post",
    "body": "<p>This is the content body...</p>",
    "tag": "Story",
    "date": "December 2025",
    "media": [...],
    "created_at": "2025-12-20T12:34:56.789"
  }
}
```

---

### 3. Update Content

Update existing content.

**Endpoint:** `PUT /api/content/<content_id>`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer your-token-here
Content-Type: application/json
```

**Request Body:** Same as Create Content

**Response:**
```json
{
  "success": true,
  "content": {
    "id": 2,
    "title": "Updated Title",
    ...
    "updated_at": "2025-12-20T13:00:00.000"
  }
}
```

---

### 4. Delete Content

Delete content by ID.

**Endpoint:** `DELETE /api/content/<content_id>`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer your-token-here
```

**Response:**
```json
{
  "success": true
}
```

---

### 5. Upload File

Upload a media file (image, video, or document).

**Endpoint:** `POST /api/upload`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer your-token-here
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The file to upload

**Supported File Types:**
- Images: png, jpg, jpeg, gif
- Videos: mp4, mov, avi
- Documents: pdf, doc, docx, txt, zip

**Max File Size:** 50MB

**Response:**
```json
{
  "success": true,
  "filename": "photo_20251220_123456_abc123.jpg",
  "url": "/uploads/photo_20251220_123456_abc123.jpg",
  "type": "image"
}
```

---

## Common Workflows

### Workflow 1: Create Text-Only Content

```python
import requests

url = "http://localhost:5000/api/content"
headers = {
    "Authorization": "Bearer your-token-here",
    "Content-Type": "application/json"
}
data = {
    "title": "Text Only Post",
    "body": "<p>This is a simple text post.</p>",
    "tag": "Note",
    "date": "December 2025"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
```

### Workflow 2: Upload Files Then Create Content

```python
import requests

# Step 1: Upload files
headers = {"Authorization": "Bearer your-token-here"}

# Upload image
with open("photo.jpg", "rb") as f:
    files = {"file": f}
    response = requests.post("http://localhost:5000/api/upload", headers=headers, files=files)
    image_data = response.json()

# Upload video
with open("video.mp4", "rb") as f:
    files = {"file": f}
    response = requests.post("http://localhost:5000/api/upload", headers=headers, files=files)
    video_data = response.json()

# Step 2: Create content with uploaded files
headers["Content-Type"] = "application/json"
data = {
    "title": "My Media Post",
    "body": "<p>Check out these files!</p>",
    "tag": "Family",
    "media": [
        {
            "url": image_data["url"],
            "type": image_data["type"],
            "filename": image_data["filename"]
        },
        {
            "url": video_data["url"],
            "type": video_data["type"],
            "filename": video_data["filename"]
        }
    ]
}

response = requests.post("http://localhost:5000/api/content", headers=headers, json=data)
print(response.json())
```

### Workflow 3: Create Content with Existing Media

If you already know the URLs of uploaded files, you can reference them directly:

```python
import requests

url = "http://localhost:5000/api/content"
headers = {
    "Authorization": "Bearer your-token-here",
    "Content-Type": "application/json"
}
data = {
    "title": "Using Existing Media",
    "body": "<p>Referencing previously uploaded files.</p>",
    "media": [
        {
            "url": "/uploads/existing_image.jpg",
            "type": "image",
            "filename": "existing_image.jpg"
        }
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Content not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "No file provided"
}
```

---

## Rate Limiting

Currently, there are no rate limits. For production use, consider implementing rate limiting.

## Security Notes

1. **Never commit your API token to version control**
2. Use HTTPS in production
3. Set strong tokens with high entropy
4. Rotate tokens regularly
5. Consider implementing rate limiting and IP whitelisting for production

---

## Testing

See the provided test scripts:
- `scripts/test_api_create_content.py` - Create test content
- `scripts/test_api_delete_content.py` - Delete test content

## Support

For issues or questions, please open an issue on the GitHub repository.
