#!/usr/bin/env python3
"""
Test Script: Delete Test Content via API

This script deletes test content created by test_api_create_content.py

Usage:
    1. Set your API token as an environment variable:
       export API_TOKEN="your-secret-token"
    
    2. Run the script:
       python scripts/test_api_delete_content.py
    
    Or delete specific content by ID:
       python scripts/test_api_delete_content.py 1 2 3

Requirements:
    pip install requests
"""

import os
import sys
import json
import requests
from pathlib import Path

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


def load_test_ids():
    """Load test content IDs from file"""
    if TEST_IDS_FILE.exists():
        with open(TEST_IDS_FILE, 'r') as f:
            data = json.load(f)
            return data.get('test_content_ids', [])
    return []


def delete_content(content_id):
    """Delete content by ID via the API"""
    print(f"🗑️  Deleting content ID: {content_id}...")
    
    response = requests.delete(
        f"{BASE_URL}/api/content/{content_id}",
        headers=AUTH_HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"   ✅ Successfully deleted!")
            return True
        else:
            print(f"   ❌ Deletion failed: {data.get('message', 'Unknown error')}")
            return False
    elif response.status_code == 404:
        print(f"   ⚠️  Content not found (already deleted or never existed)")
        return True  # Consider it a success if already gone
    else:
        print(f"   ❌ Deletion failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return False


def get_all_content():
    """Get all content to show what exists"""
    response = requests.get(f"{BASE_URL}/api/content")
    if response.status_code == 200:
        return response.json()
    return []


def main():
    print("🚀 Srisin API Content Deletion Test")
    print(f"🌐 API URL: {BASE_URL}")
    print(f"🔑 Using API Token: {API_TOKEN[:10]}...")
    print("=" * 60)
    
    # Determine which IDs to delete
    ids_to_delete = []
    
    # Check if IDs provided as command line arguments
    if len(sys.argv) > 1:
        # Use IDs from command line
        try:
            ids_to_delete = [int(arg) for arg in sys.argv[1:]]
            print(f"\n📋 Deleting specified content IDs: {ids_to_delete}")
        except ValueError:
            print("❌ Error: Invalid content ID(s). Please provide integer IDs.")
            sys.exit(1)
    else:
        # Load IDs from test file
        ids_to_delete = load_test_ids()
        
        if not ids_to_delete:
            print(f"\n⚠️  No test content IDs found in {TEST_IDS_FILE}")
            print("   Either:")
            print("   1. Run test_api_create_content.py first to create test content")
            print("   2. Specify content IDs manually: python script.py 1 2 3")
            
            # Show existing content
            print("\n📄 Current content:")
            content = get_all_content()
            if content:
                for item in content:
                    print(f"   - ID {item['id']}: {item['title']} (Tag: {item['tag']})")
            else:
                print("   No content found")
            
            sys.exit(0)
        
        print(f"\n📋 Found {len(ids_to_delete)} test content IDs to delete")
    
    # Confirm deletion
    print(f"\n⚠️  WARNING: This will delete the following content IDs:")
    for content_id in ids_to_delete:
        print(f"   - {content_id}")
    
    confirm = input("\n❓ Continue with deletion? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("❌ Deletion cancelled")
        sys.exit(0)
    
    # Delete each content item
    print("\n" + "=" * 60)
    print("DELETING CONTENT")
    print("=" * 60)
    
    success_count = 0
    failed_count = 0
    
    for content_id in ids_to_delete:
        if delete_content(content_id):
            success_count += 1
        else:
            failed_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"✅ Successfully deleted: {success_count}")
    print(f"❌ Failed to delete: {failed_count}")
    
    # Clean up test IDs file if all were deleted successfully
    if failed_count == 0 and TEST_IDS_FILE.exists():
        TEST_IDS_FILE.unlink()
        print(f"\n🧹 Cleaned up {TEST_IDS_FILE}")
    
    print("\n✨ Deletion complete!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Deletion interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
