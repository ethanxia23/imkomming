#!/usr/bin/env python3
"""
Generate Wahoo OAuth authorization URL
"""

import os
import urllib.parse

def generate_oauth_url():
    # Get credentials from environment or prompt user
    client_id = os.getenv('WAHOO_CLIENT_ID')
    redirect_uri = os.getenv('WAHOO_REDIRECT_URI', 'https://imkomming.com/api/wahoo_callback')
    
    if not client_id:
        print("Wahoo OAuth URL Generator")
        print("========================")
        client_id = input("Enter your Wahoo Client ID: ").strip()
        if not client_id:
            print("Error: Client ID is required")
            return
    
    # OAuth parameters
    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': 'user_read',  # Basic read permissions
        'state': 'random_state_string'  # Optional: for security
    }
    
    # Build the authorization URL
    base_url = "https://api.wahooligan.com/oauth/authorize"
    auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    print(f"\n🔗 Authorization URL:")
    print(f"{auth_url}")
    print(f"\n📋 Instructions:")
    print(f"1. Copy the URL above and open it in your browser")
    print(f"2. Log in to your Wahoo account")
    print(f"3. Authorize the application")
    print(f"4. You'll be redirected to: {redirect_uri}")
    print(f"5. Copy the 'code' parameter from the URL")
    print(f"6. Use that code with your callback endpoint to get the access token")
    
    return auth_url

if __name__ == "__main__":
    generate_oauth_url()
