# API Test Scripts

This directory contains Python scripts for testing the Srisin Content Management API.

## Scripts

### 1. `test_api_create_content.py`
Creates four types of test content:
- Text-only post
- Text + Image post
- Text + Image + Video post
- Title + Video only post

### 2. `test_api_delete_content.py`
Deletes test content created by the creation script.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install requests pillow
```

### 2. Set Environment Variables

Create a `.env` file in the project root or export variables:

```bash
export API_TOKEN="your-secret-api-token-here"
export API_BASE_URL="http://localhost:5000"  # Optional, defaults to localhost:5000
```

### 3. Start the Server

Make sure the admin server is running:

```bash
python admin_server.py
```

## Usage

### Create Test Content

```bash
# Navigate to project root
cd /path/to/srisin

# Run the creation script
python scripts/test_api_create_content.py
```

**Output:**
```
🚀 Srisin API Content Creation Test
🌐 API URL: http://localhost:5000
🔑 Using API Token: your-secre...
============================================================

============================================================
TEST 1: Text-Only Content
============================================================

📝 Creating content: Test: Text Only Post
   ✅ Created successfully! ID: 1

...

📊 SUMMARY
============================================================
✅ Successfully created 4 test content items
📌 Content IDs: [1, 2, 3, 4]

💾 Saved test content IDs to scripts/test_content_ids.json

💡 To delete these test items, run:
   python scripts/test_api_delete_content.py

✨ Test complete!
```

### Delete Test Content

```bash
# Delete test content saved from creation script
python scripts/test_api_delete_content.py

# Or delete specific content by ID
python scripts/test_api_delete_content.py 1 2 3
```

**Output:**
```
🚀 Srisin API Content Deletion Test
🌐 API URL: http://localhost:5000
🔑 Using API Token: your-secre...
============================================================

📋 Found 4 test content IDs to delete

⚠️  WARNING: This will delete the following content IDs:
   - 1
   - 2
   - 3
   - 4

❓ Continue with deletion? (yes/no): yes

============================================================
DELETING CONTENT
============================================================
🗑️  Deleting content ID: 1...
   ✅ Successfully deleted!
...

📊 SUMMARY
============================================================
✅ Successfully deleted: 4
❌ Failed to delete: 0

🧹 Cleaned up scripts/test_content_ids.json

✨ Deletion complete!
```

## Files Created

- `test_content_ids.json` - Stores IDs of created test content for easy cleanup

## Troubleshooting

### "API_TOKEN environment variable not set"
Make sure you've set the API_TOKEN:
```bash
export API_TOKEN="your-token-here"
```

### "Connection refused"
Make sure the admin server is running:
```bash
python admin_server.py
```

### "Unauthorized" (401 error)
Your API token is incorrect. Check your `.env` file or environment variable.

### PIL/Pillow not installed
Install it:
```bash
pip install pillow
```
Or the script will use minimal placeholder images.

## API Documentation

For complete API documentation, see [docs/API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)

## Examples

### Custom API Calls

```python
import os
import requests

API_TOKEN = os.getenv("API_TOKEN")
BASE_URL = "http://localhost:5000"

headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# Create content
data = {
    "title": "My Custom Post",
    "body": "<p>Hello World!</p>",
    "tag": "Story",
    "date": "December 2025"
}

response = requests.post(f"{BASE_URL}/api/content", headers=headers, json=data)
print(response.json())

# Get all content
response = requests.get(f"{BASE_URL}/api/content")
print(response.json())

# Delete content
content_id = 1
response = requests.delete(f"{BASE_URL}/api/content/{content_id}", headers=headers)
print(response.json())
```

## Security Notes

- Never commit your API token to version control
- Use strong, randomly generated tokens
- Rotate tokens regularly
- Consider using environment-specific tokens (dev, staging, prod)
