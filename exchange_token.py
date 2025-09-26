#!/usr/bin/env python3
"""
Exchange Wahoo authorization code for access token
"""

import requests
import os
import json

def exchange_code_for_token():
    print("Wahoo Token Exchange")
    print("===================")
    
    # Get credentials
    client_id = os.getenv('WAHOO_CLIENT_ID')
    client_secret = os.getenv('WAHOO_CLIENT_SECRET')
    redirect_uri = os.getenv('WAHOO_REDIRECT_URI', 'https://imkomming.com/api/wahoo_callback')
    
    if not client_id:
        client_id = input("Enter your Wahoo Client ID: ").strip()
    if not client_secret:
        client_secret = input("Enter your Wahoo Client Secret: ").strip()
    
    # Get authorization code from user
    auth_code = input("Enter the authorization code from the callback URL: ").strip()
    
    if not auth_code:
        print("Error: Authorization code is required")
        return
    
    # Exchange code for token
    token_url = "https://api.wahooligan.com/oauth/token"
    
    data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': auth_code,
        'redirect_uri': redirect_uri
    }
    
    try:
        print("\n🔄 Exchanging code for access token...")
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        
        print("\n✅ Success! Here's your access token:")
        print(f"Access Token: {token_data.get('access_token')}")
        print(f"Token Type: {token_data.get('token_type')}")
        print(f"Expires In: {token_data.get('expires_in')} seconds")
        print(f"Refresh Token: {token_data.get('refresh_token')}")
        print(f"Scope: {token_data.get('scope')}")
        
        # Save to file
        with open('wahoo_token.json', 'w') as f:
            json.dump(token_data, f, indent=2)
        print(f"\n💾 Token saved to: wahoo_token.json")
        
        print(f"\n🚀 You can now use this access token with the scraper:")
        print(f"python3 wahoo_scraper.py --token {token_data.get('access_token')}")
        
        return token_data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error exchanging token: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        return None

if __name__ == "__main__":
    exchange_code_for_token()
