#!/usr/bin/env python3
"""
Test token exchange with correct redirect URI
"""

import requests
import urllib.parse

def exchange_code_for_token():
    # Your credentials
    client_id = "70P1LbnCWZ30qUdUR4C0ZX8cuQBlepNZk9F7lyWbmr4"
    client_secret = input("Enter your Wahoo Client Secret: ").strip()
    
    if not client_secret:
        print("❌ Client Secret is required")
        return
    
    # Use the production redirect URI that matches your Wahoo app
    redirect_uri = "https://imkomming.com/api/wahoo_callback"
    
    # Get fresh authorization code
    print("\n🔗 Get a fresh authorization code from this URL:")
    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': 'user_read'
    }
    auth_url = f"https://api.wahooligan.com/oauth/authorize?{urllib.parse.urlencode(params)}"
    print(auth_url)
    
    auth_code = input("\nEnter the authorization code: ").strip()
    
    if not auth_code:
        print("❌ Authorization code is required")
        return
    
    # Exchange code for token
    print("\n🔄 Exchanging code for access token...")
    
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': auth_code,
        'redirect_uri': redirect_uri
    }
    
    try:
        response = requests.post('https://api.wahooligan.com/oauth/token', data=token_data)
        response.raise_for_status()
        
        token_info = response.json()
        access_token = token_info.get('access_token')
        
        print(f"\n✅ Success! Access Token: {access_token}")
        
        # Test the token
        print(f"\n🧪 Testing the token...")
        test_response = requests.get(
            'https://api.wahooligan.com/v1/user',
            headers={'Authorization': f"Bearer {access_token}"}
        )
        
        if test_response.status_code == 200:
            user_data = test_response.json()
            print(f"✅ Token works! User: {user_data.get('first_name')} {user_data.get('last_name')}")
            
            # Test the scraper
            print(f"\n🚀 Testing the Python scraper...")
            import subprocess
            result = subprocess.run([
                'python3', 'wahoo_scraper.py', 
                '--token', access_token, 
                '--export-json', 
                '--quiet'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Python scraper works!")
                print("You can now use this token in the web interface")
            else:
                print(f"❌ Python scraper failed: {result.stderr}")
                
        else:
            print(f"❌ Token test failed: {test_response.status_code}")
            print(f"Response: {test_response.text}")
        
        return access_token
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    exchange_code_for_token()
