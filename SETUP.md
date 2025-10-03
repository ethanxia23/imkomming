# Wahoo Data Scraper Setup

## Environment Variables

### Option 1: Quick Setup (Recommended)
Run the interactive setup script:
```bash
npm run setup
```

### Option 2: Copy from Vercel
If you have Vercel CLI installed and are logged in:
```bash
npm run setup:vercel
```

### Option 3: Manual Setup
Create a `.env.local` file in the root directory with the following variables:

```bash
# Wahoo API Credentials
WAHOO_CLIENT_ID=your_wahoo_client_id_here
WAHOO_CLIENT_SECRET=your_wahoo_client_secret_here
WAHOO_REDIRECT_URI=http://localhost:3000/api/wahoo_callback

# Next.js Environment Variables
NEXT_PUBLIC_WAHOO_CLIENT_ID=your_wahoo_client_id_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** The `NEXT_PUBLIC_` variables are safe to expose in the browser and are required for the OAuth flow to work.

## How to Use

### Option 1: Web Interface (Recommended)
1. Set up your environment variables
2. Run `npm run dev`
3. Open http://localhost:3000
4. Click "Authorize with Wahoo" to get your token automatically
5. Click "Run Scraper" to extract your data

### Option 2: Python Script
1. Run `python3 get_token.py` to get an access token
2. Run `python3 wahoo_scraper.py --token YOUR_TOKEN` to scrape data

## Files Structure

### Essential Files (Keep)
- `app/` - Next.js web interface
- `wahoo_scraper.py` - Main Python scraper
- `get_token.py` - Standalone OAuth helper
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies

### Removed Files
- `quick_test.py` - Test file
- `test_token_exchange.py` - Test file  
- `test_wahoo_endpoints.py` - Test file
- `generate_oauth_url.py` - Redundant
- `exchange_token.py` - Redundant
- `run_scraper.py` - Redundant
- `public/callback.html` - Static HTML callback
- `app/test/` - Test page

## OAuth Flow

The web interface now includes a complete OAuth flow:
1. User clicks "Authorize with Wahoo"
2. Redirects to Wahoo OAuth page
3. User authorizes the app
4. Wahoo redirects to `/api/wahoo_callback`
5. Callback exchanges code for token
6. Redirects back to main page with token
7. User can immediately run the scraper
