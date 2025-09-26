#!/usr/bin/env python3
"""
Quick test of the Python scraper with a dummy token
"""

from wahoo_scraper import WahooAPI
import requests

def test_api_connection():
    print("🧪 Testing Wahoo API connection...")
    
    # Test if the API endpoint is accessible
    try:
        response = requests.get('https://api.wahooligan.com/v1/user', 
                              headers={'Authorization': 'Bearer dummy_token'}, 
                              timeout=10)
        print(f"✅ API endpoint accessible: Status {response.status_code}")
        
        if response.status_code == 401:
            print("✅ API is working (401 = unauthorized, which is expected)")
        elif response.status_code == 200:
            print("✅ API is working and token is valid!")
        else:
            print(f"⚠️  Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False
    
    return True

def test_scraper_import():
    print("\n🧪 Testing scraper import...")
    try:
        from wahoo_scraper import WahooDataScraper
        print("✅ Scraper imports successfully")
        return True
    except Exception as e:
        print(f"❌ Scraper import failed: {e}")
        return False

def main():
    print("🔍 Wahoo Scraper Quick Test")
    print("=" * 40)
    
    # Test imports
    if not test_scraper_import():
        return
    
    # Test API connection
    if not test_api_connection():
        return
    
    print("\n✅ All tests passed!")
    print("\n📋 Next steps:")
    print("1. Create .env.local file with your credentials")
    print("2. Get a fresh authorization code")
    print("3. Exchange it for an access token")
    print("4. Test the scraper with the real token")

if __name__ == "__main__":
    main()
