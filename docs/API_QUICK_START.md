# API Quick Start Guide

This guide will help you quickly set up and start using the Srisin Content Management API.

## Prerequisites

- Python 3.7+
- pip (Python package installer)

## Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd /path/to/srisin
pip install -r scripts/requirements.txt
```

### Step 2: Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Generate a strong API token:
```bash
# On macOS/Linux
openssl rand -hex 32

# Or using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

3. Edit `.env` and set your values:
```env
API_TOKEN=your-generated-token-here
ADMIN_PASSWORD=your-admin-password
SECRET_KEY=another-random-string
```

### Step 3: Start the Server

```bash
python admin_server.py
```

You should see:
```
🚀 Srisin Admin Server
📡 Server running at http://127.0.0.1:5000
🔐 Admin panel at http://127.0.0.1:5000/admin
⚠️  Running in DEBUG mode - not suitable for production!
```

## Test the API (2 minutes)

### Run the Test Scripts

In a new terminal:

```bash
# Set your API token
export API_TOKEN="your-token-from-dotenv-file"

# Create test content
python scripts/test_api_create_content.py
```

This will:
- Generate test images and videos
- Upload them to the server
- Create 4 different types of content
- Save content IDs for cleanup

Expected output:
```
🚀 Srisin API Content Creation Test
...
✅ Successfully created 4 test content items
```

### View the Content

1. Open http://localhost:5000 in your browser
2. Scroll to "Dev Blog and Family Stories"
3. You should see your 4 test posts!

### Clean Up

```bash
python scripts/test_api_delete_content.py
```

Enter `yes` when prompted. This will delete all test content.

## Create Your Own Content

### Simple Example

Create a file `create_post.py`:

```python
import os
import requests

API_TOKEN = os.getenv("API_TOKEN")
BASE_URL = "http://localhost:5000"

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# Create a simple post
data = {
    "title": "My First API Post",
    "body": "<p>Hello from the API! 🚀</p>",
    "tag": "Story",
    "date": "December 2025"
}

response = requests.post(f"{BASE_URL}/api/content", headers=headers, json=data)
print(response.json())
```

Run it:
```bash
export API_TOKEN="your-token"
python create_post.py
```

### Upload Files Example

```python
import os
import requests

API_TOKEN = os.getenv("API_TOKEN")
BASE_URL = "http://localhost:5000"

headers = {"Authorization": f"Bearer {API_TOKEN}"}

# Upload an image
with open("photo.jpg", "rb") as f:
    files = {"file": f}
    response = requests.post(f"{BASE_URL}/api/upload", headers=headers, files=files)
    image = response.json()

# Create post with the image
headers["Content-Type"] = "application/json"
data = {
    "title": "Check out this photo!",
    "body": "<p>Look at this amazing picture!</p>",
    "media": [{
        "url": image["url"],
        "type": image["type"],
        "filename": image["filename"]
    }]
}

response = requests.post(f"{BASE_URL}/api/content", headers=headers, json=data)
print(response.json())
```

## Next Steps

- Read the full [API Documentation](API_DOCUMENTATION.md)
- Check out [scripts/README.md](../scripts/README.md) for more examples
- Review the [HTML Snippet Template](HTML_SNIPPET_TEMPLATE.md) for rich content

## Troubleshooting

### "API_TOKEN environment variable not set"
```bash
export API_TOKEN="your-token-from-env-file"
```

### "Connection refused"
Make sure the server is running:
```bash
python admin_server.py
```

### "Unauthorized" (401)
- Check your API token is correct
- Make sure it matches the one in `.env`
- Verify the header format: `Authorization: Bearer your-token`

### Can't see content on website
- Check the server logs
- Verify content was created: `curl http://localhost:5000/api/content`
- Hard refresh the browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## Security Checklist

- [ ] Generated a strong random API_TOKEN
- [ ] Added `.env` to `.gitignore`
- [ ] Never committed API tokens to git
- [ ] Set DEBUG=False for production
- [ ] Using HTTPS in production
- [ ] Set strong ADMIN_PASSWORD

## Support

For issues or questions:
1. Check the [API Documentation](API_DOCUMENTATION.md)
2. Review server logs for errors
3. Open an issue on GitHub

Happy coding! 🎉
