#!/usr/bin/env python3
"""
Test Script: Create Different Types of Content via API

This script demonstrates how to create various types of content using the API:
1. Text-only content
2. Text + Image content  
3. Text + Image + Video content
4. Title + Video only content

Usage:
    1. Set your API token as an environment variable:
       export API_TOKEN="your-secret-token"
    
    2. Run the script:
       python scripts/test_api_create_content.py

Requirements:
    pip install requests pillow

The script will:
- Generate test images and videos
- Upload them via the API
- Create 4 different types of test content
- Save the content IDs to test_content_ids.json for cleanup
"""

import os
import sys
import json
import requests
from pathlib import Path
from io import BytesIO
from datetime import datetime

# Configuration
BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000")
API_TOKEN = os.getenv("API_TOKEN")
TEST_IDS_FILE = Path(__file__).parent / "test_content_ids.json"

# Check for API token
if not API_TOKEN:
    print("❌ Error: API_TOKEN environment variable not set!")
    print("   Set it with: export API_TOKEN='your-secret-token'")
    sys.exit(1)

# Headers for authenticated requests
AUTH_HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}"
}


def create_test_image(color=(255, 0, 0), size=(800, 600)):
    """Create a test image using PIL"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        img = Image.new('RGB', size, color=color)
        draw = ImageDraw.draw(img)
        
        # Add text
        text = "Test Image"
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position (center)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
        
        draw.text(position, text, fill=(255, 255, 255), font=font)
        
        # Save to BytesIO
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        return img_bytes
    except ImportError:
        print("⚠️  Warning: PIL/Pillow not installed. Using placeholder for images.")
        # Create a minimal PNG file
        return BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')


def create_test_video():
    """Create a minimal test video file (actually just a small MP4 header)"""
    # Minimal MP4 file structure (not a real video, but valid for upload testing)
    mp4_header = bytes([
        0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,  # ftyp box
        0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
        0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
        0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31,
    ])
    return BytesIO(mp4_header)


def upload_file(filename, file_bytes, file_type="image"):
    """Upload a file via the API"""
    files = {'file': (filename, file_bytes, f'{file_type}/png' if file_type == 'image' else 'video/mp4')}
    
    print(f"📤 Uploading {filename}...")
    response = requests.post(
        f"{BASE_URL}/api/upload",
        headers=AUTH_HEADERS,
        files=files
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"   ✅ Uploaded: {data['url']}")
            return data
        else:
            print(f"   ❌ Upload failed: {data.get('message', 'Unknown error')}")
            return None
    else:
        print(f"   ❌ Upload failed with status {response.status_code}")
        return None


def create_content(title, body, tag="Story", date=None, media=None):
    """Create content via the API"""
    if date is None:
        date = datetime.now().strftime("%B %Y")
    
    payload = {
        "title": title,
        "body": body,
        "tag": tag,
        "date": date,
        "media": media or []
    }
    
    headers = {**AUTH_HEADERS, "Content-Type": "application/json"}
    
    print(f"\n📝 Creating content: {title}")
    response = requests.post(
        f"{BASE_URL}/api/content",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            content = data['content']
            print(f"   ✅ Created successfully! ID: {content['id']}")
            return content['id']
        else:
            print(f"   ❌ Creation failed: {data.get('message', 'Unknown error')}")
            return None
    else:
        print(f"   ❌ Creation failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return None


def save_test_ids(ids):
    """Save test content IDs for cleanup"""
    with open(TEST_IDS_FILE, 'w') as f:
        json.dump({"test_content_ids": ids, "created_at": datetime.now().isoformat()}, f, indent=2)
    print(f"\n💾 Saved test content IDs to {TEST_IDS_FILE}")


def main():
    print("🚀 Srisin API Content Creation Test")
    print(f"🌐 API URL: {BASE_URL}")
    print(f"🔑 Using API Token: {API_TOKEN[:10]}...")
    print("=" * 60)
    
    created_ids = []
    
    # Test 1: Text-only content
    print("\n" + "=" * 60)
    print("TEST 1: Text-Only Content")
    print("=" * 60)
    
    text_only_id = create_content(
        title="Test: Text Only Post",
        body="""
        <div style="text-align: center;">
            <h2>Welcome to Test Content!</h2>
            <p>This is a <strong>text-only</strong> test post created via API.</p>
            <p>It demonstrates simple content creation without media files.</p>
        </div>
        """,
        tag="Test",
        date="December 2025"
    )
    if text_only_id:
        created_ids.append(text_only_id)
    
    # Test 2: Text + Image content
    print("\n" + "=" * 60)
    print("TEST 2: Text + Image Content")
    print("=" * 60)
    
    # Create and upload test image
    test_image = create_test_image(color=(0, 120, 255))
    image_data = upload_file("test_image.png", test_image, "image")
    
    if image_data:
        text_image_id = create_content(
            title="Test: Text with Image",
            body="""
            <p>This test post includes an <strong>image</strong> attachment.</p>
            <p>The image was uploaded via the API and then referenced in the content creation.</p>
            """,
            tag="Test",
            media=[{
                "url": image_data['url'],
                "type": image_data['type'],
                "filename": image_data['filename']
            }]
        )
        if text_image_id:
            created_ids.append(text_image_id)
    
    # Test 3: Text + Image + Video content
    print("\n" + "=" * 60)
    print("TEST 3: Text + Image + Video Content")
    print("=" * 60)
    
    # Upload another image
    test_image2 = create_test_image(color=(255, 100, 50))
    image_data2 = upload_file("test_image2.png", test_image2, "image")
    
    # Upload test video
    test_video = create_test_video()
    video_data = upload_file("test_video.mp4", test_video, "video")
    
    if image_data2 and video_data:
        text_image_video_id = create_content(
            title="Test: Full Media Post",
            body="""
            <div style="padding: 20px;">
                <h3>Complete Media Test</h3>
                <p>This post demonstrates <strong>multiple media types</strong>:</p>
                <ul>
                    <li>Rich HTML content</li>
                    <li>Image attachments</li>
                    <li>Video attachments</li>
                </ul>
                <p>All uploaded via the API! 🎉</p>
            </div>
            """,
            tag="Test",
            media=[
                {
                    "url": image_data2['url'],
                    "type": image_data2['type'],
                    "filename": image_data2['filename']
                },
                {
                    "url": video_data['url'],
                    "type": video_data['type'],
                    "filename": video_data['filename']
                }
            ]
        )
        if text_image_video_id:
            created_ids.append(text_image_video_id)
    
    # Test 4: Title + Video only (no body text)
    print("\n" + "=" * 60)
    print("TEST 4: Title + Video Only")
    print("=" * 60)
    
    # Upload another test video
    test_video2 = create_test_video()
    video_data2 = upload_file("test_video_only.mp4", test_video2, "video")
    
    if video_data2:
        video_only_id = create_content(
            title="Test: Video Only Post",
            body="",  # Empty body - just title and video
            tag="Video",
            media=[{
                "url": video_data2['url'],
                "type": video_data2['type'],
                "filename": video_data2['filename']
            }]
        )
        if video_only_id:
            created_ids.append(video_only_id)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"✅ Successfully created {len(created_ids)} test content items")
    print(f"📌 Content IDs: {created_ids}")
    
    if created_ids:
        save_test_ids(created_ids)
        print(f"\n💡 To delete these test items, run:")
        print(f"   python scripts/test_api_delete_content.py")
    
    print("\n✨ Test complete!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
