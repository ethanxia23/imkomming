#!/usr/bin/env python3
"""
Test different Wahoo API endpoints to find the correct OAuth URL
"""

import requests
import urllib.parse

def test_endpoint(base_url, endpoint):
    """Test if an endpoint exists"""
    url = f"{base_url}{endpoint}"
    try:
        response = requests.get(url, timeout=10)
        print(f"✅ {url} - Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Content-Type: {response.headers.get('content-type', 'unknown')}")
        return response.status_code
    except requests.exceptions.RequestException as e:
        print(f"❌ {url} - Error: {e}")
        return None

def test_oauth_url(client_id, redirect_uri):
    """Test the complete OAuth URL"""
    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': 'read'
    }
    
    base_urls = [
        'https://api.wahooligan.com',
        'https://cloud-api.wahooligan.com',
        'https://api.wahoofitness.com',
        'https://developer.wahoofitness.com'
    ]
    
    for base_url in base_urls:
        print(f"\n🔍 Testing base URL: {base_url}")
        
        # Test OAuth authorize endpoint
        auth_url = f"{base_url}/oauth/authorize?{urllib.parse.urlencode(params)}"
        print(f"OAuth URL: {auth_url}")
        
        try:
            response = requests.get(auth_url, timeout=10, allow_redirects=False)
            print(f"Status: {response.status_code}")
            if response.status_code in [200, 302, 400, 401]:
                print(f"✅ Endpoint exists! Status: {response.status_code}")
                if response.status_code == 302:
                    print(f"Redirect to: {response.headers.get('location', 'unknown')}")
                return auth_url
            else:
                print(f"❌ Unexpected status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Error: {e}")

def main():
    print("🔍 Wahoo API Endpoint Tester")
    print("=" * 40)
    
    client_id = "70P1LbnCWZ30qUdUR4C0ZX8cuQBlepNZk9F7lyWbmr4"
    redirect_uri = "https://imkomming.com/api/wahoo_callback"
    
    print(f"Client ID: {client_id}")
    print(f"Redirect URI: {redirect_uri}")
    
    # Test basic endpoints first
    print("\n📡 Testing basic endpoints...")
    base_urls = [
        'https://api.wahooligan.com',
        'https://cloud-api.wahooligan.com',
        'https://api.wahoofitness.com'
    ]
    
    for base_url in base_urls:
        print(f"\nTesting {base_url}:")
        test_endpoint(base_url, "/")
        test_endpoint(base_url, "/oauth/authorize")
        test_endpoint(base_url, "/oauth/token")
        test_endpoint(base_url, "/v1/user")
    
    # Test complete OAuth URLs
    print("\n🔐 Testing complete OAuth URLs...")
    test_oauth_url(client_id, redirect_uri)
    
    print("\n💡 Suggestions:")
    print("1. Check if your Wahoo developer account is approved")
    print("2. Verify the redirect URI is exactly: https://imkomming.com/api/wahoo_callback")
    print("3. Try using the Wahoo developer portal directly")
    print("4. Contact Wahoo support if all endpoints return 404")

if __name__ == "__main__":
    main()
