#!/usr/bin/env python3
"""
Complete Wahoo OAuth flow helper
"""

import os
import webbrowser
import requests
import json
from urllib.parse import urlencode

def get_wahoo_token():
    print("🔐 Wahoo OAuth Token Helper")
    print("===========================")
    
    # Get credentials
    client_id = input("Enter your Wahoo Client ID: ").strip()
    client_secret = input("Enter your Wahoo Client Secret: ").strip()
    redirect_uri = input("Enter redirect URI (default: https://imkomming.com/api/wahoo_callback): ").strip()
    
    if not redirect_uri:
        redirect_uri = "https://imkomming.com/api/wahoo_callback"
    
    if not client_id or not client_secret:
        print("❌ Error: Client ID and Client Secret are required")
        return
    
    # Generate authorization URL
    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': 'user_read'
    }
    
    auth_url = f"https://api.wahooligan.com/oauth/authorize?{urlencode(params)}"
    
    print(f"\n🔗 Opening authorization URL in your browser...")
    print(f"URL: {auth_url}")
    
    # Try to open in browser
    try:
        webbrowser.open(auth_url)
    except:
        print("Could not open browser automatically. Please copy the URL above.")
    
    print(f"\n📋 Instructions:")
    print(f"1. Log in to your Wahoo account")
    print(f"2. Authorize the application")
    print(f"3. You'll be redirected to: {redirect_uri}")
    print(f"4. Copy the 'code' parameter from the URL")
    
    # Get authorization code
    auth_code = input("\nEnter the authorization code: ").strip()
    
    if not auth_code:
        print("❌ Error: Authorization code is required")
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
        
        print("\n✅ Success! Here's your access token:")
        print(f"Access Token: {token_info.get('access_token')}")
        print(f"Expires In: {token_info.get('expires_in')} seconds")
        
        # Save token
        with open('wahoo_token.json', 'w') as f:
            json.dump(token_info, f, indent=2)
        
        print(f"\n💾 Token saved to: wahoo_token.json")
        
        # Test the token
        print(f"\n🧪 Testing the token...")
        test_response = requests.get(
            'https://api.wahooligan.com/v1/user',
            headers={'Authorization': f"Bearer {token_info.get('access_token')}"}
        )
        
        if test_response.status_code == 200:
            user_data = test_response.json()
            print(f"✅ Token works! User: {user_data.get('first_name')} {user_data.get('last_name')}")
        else:
            print(f"⚠️  Token test failed: {test_response.status_code}")
        
        print(f"\n🚀 You can now use the scraper:")
        print(f"python3 wahoo_scraper.py --token {token_info.get('access_token')}")
        
        return token_info.get('access_token')
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    get_wahoo_token()
