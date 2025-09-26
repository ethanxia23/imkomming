# Production Setup for imkomming.com

## 🔐 Wahoo OAuth Configuration

### 1. Wahoo Developer Portal Setup

1. Go to [https://developer.wahoofitness.com/](https://developer.wahoofitness.com/)
2. Create a new application
3. Set the **Redirect URI** to: `https://imkomming.com/api/wahoo_callback`
4. Note down your:
   - **Client ID**
   - **Client Secret**

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# Wahoo API Configuration
WAHOO_CLIENT_ID=your_wahoo_client_id_here
WAHOO_CLIENT_SECRET=your_wahoo_client_secret_here
WAHOO_REDIRECT_URI=https://imkomming.com/api/wahoo_callback
```

### 3. Getting Your Access Token

#### Option A: Using the Helper Script (Recommended)

```bash
python3 get_token.py
```

This will:
- Ask for your Client ID and Secret
- Open the OAuth URL in your browser
- Guide you through the authorization process
- Exchange the code for an access token
- Test the token to ensure it works

#### Option B: Manual Process

1. **Generate OAuth URL**:
   ```bash
   python3 generate_oauth_url.py
   ```

2. **Authorize the application**:
   - Open the generated URL in your browser
   - Log in to your Wahoo account
   - Authorize the application
   - You'll be redirected to `https://imkomming.com/api/wahoo_callback?code=AUTHORIZATION_CODE`

3. **Exchange code for token**:
   ```bash
   python3 exchange_token.py
   ```

### 4. Testing Your Setup

Once you have your access token, test it:

```bash
# Test the Python scraper
python3 wahoo_scraper.py --token YOUR_ACCESS_TOKEN --export-json

# Test the web interface
npm run dev
# Visit http://localhost:3000 and enter your token
```

### 5. Production Deployment

#### Vercel Deployment

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables in Vercel dashboard:
     - `WAHOO_CLIENT_ID`
     - `WAHOO_CLIENT_SECRET`
     - `WAHOO_REDIRECT_URI=https://imkomming.com/api/wahoo_callback`

3. **Deploy**:
   - Vercel will automatically deploy your app
   - Your callback URL will be available at `https://imkomming.com/api/wahoo_callback`

#### Other Platforms

For other deployment platforms, ensure:
- Environment variables are set
- Python 3.7+ is available
- HTTPS is enabled
- The callback URL matches exactly: `https://imkomming.com/api/wahoo_callback`

### 6. OAuth Flow for Production

1. **User visits your app**: `https://imkomming.com`

2. **Generate OAuth URL**:
   ```
   https://api.wahoofitness.com/oauth/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https://imkomming.com/api/wahoo_callback&scope=read
   ```

3. **User authorizes**: They log in and authorize your app

4. **Callback receives code**: Your `/api/wahoo_callback` route receives the authorization code

5. **Exchange for token**: Your callback route exchanges the code for an access token

6. **Use the token**: The user can now use the scraper with their access token

### 7. Security Considerations

- ✅ Use HTTPS in production
- ✅ Store credentials in environment variables
- ✅ Never commit tokens to version control
- ✅ Implement token refresh logic
- ✅ Validate all input data
- ✅ Use proper error handling

### 8. Troubleshooting

#### Common Issues

1. **"Invalid redirect_uri"**:
   - Ensure the redirect URI in Wahoo Developer Portal exactly matches: `https://imkomming.com/api/wahoo_callback`
   - Check for typos or extra characters

2. **"Invalid client_id"**:
   - Verify your Client ID is correct
   - Check environment variables are set properly

3. **"Token expired"**:
   - Access tokens expire after a certain time
   - Use the refresh token to get a new access token
   - Implement automatic token refresh

4. **"CORS errors"**:
   - Ensure your domain is properly configured
   - Check that HTTPS is working correctly

### 9. Token Management

Access tokens expire, so you'll need to refresh them:

```python
# Refresh token example
def refresh_access_token(refresh_token, client_id, client_secret):
    data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': client_id,
        'client_secret': client_secret
    }
    
    response = requests.post('https://api.wahoofitness.com/oauth/token', data=data)
    return response.json()
```

### 10. Next Steps

Once your production setup is complete:

1. **Test the OAuth flow** end-to-end
2. **Deploy your application**
3. **Test the Python scraper** with real data
4. **Monitor for errors** and implement proper logging
5. **Set up token refresh** for long-term usage

Your Wahoo data scraper will be ready to use at `https://imkomming.com`! 🚀
