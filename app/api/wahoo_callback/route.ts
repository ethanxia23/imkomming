import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imkomming.com'}?error=oauth_failed&details=${encodeURIComponent(errorDescription || error)}`;
      return NextResponse.redirect(errorUrl);
    }

    if (!code) {
      // Return a user-friendly HTML page for missing code
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Wahoo OAuth Callback</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #dc3545; background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
            .button:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <h1>🔐 Wahoo OAuth Callback</h1>
          <div class="error">
            <h2>❌ Missing Authorization Code</h2>
            <p>No authorization code found in the URL.</p>
            <p>Make sure you're being redirected from the Wahoo OAuth flow.</p>
          </div>
          <a href="https://imkomming.com" class="button">← Back to App</a>
        </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!process.env.WAHOO_CLIENT_ID || !process.env.WAHOO_CLIENT_SECRET || !process.env.WAHOO_REDIRECT_URI) {
      console.error("Missing environment variables:", {
        hasClientId: !!process.env.WAHOO_CLIENT_ID,
        hasClientSecret: !!process.env.WAHOO_CLIENT_SECRET,
        hasRedirectUri: !!process.env.WAHOO_REDIRECT_URI
      });
      
      // Return a user-friendly error page
      return new NextResponse(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Wahoo OAuth Callback</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #dc3545; background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
            .button:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <h1>🔐 Wahoo OAuth Callback</h1>
          <div class="error">
            <h2>❌ Configuration Error</h2>
            <p>OAuth is not properly configured on the server.</p>
            <p>Please contact the administrator or try again later.</p>
          </div>
          <a href="https://imkomming.com" class="button">← Back to App</a>
        </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const body = new URLSearchParams({
      client_id: process.env.WAHOO_CLIENT_ID!,
      client_secret: process.env.WAHOO_CLIENT_SECRET!,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: process.env.WAHOO_REDIRECT_URI!,
    });

    console.log("Exchanging code for token...");
    const tokenResponse = await fetch("https://api.wahooligan.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", data);
      const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imkomming.com'}?error=oauth_failed&details=${encodeURIComponent(data.error_description || data.error || 'Token exchange failed')}`;
      return NextResponse.redirect(errorUrl);
    }

    // Success! Redirect to main page with token
    const token = data.access_token;
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imkomming.com'}?token=${token}`;
    
    console.log("OAuth successful, redirecting to:", redirectUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Server exception:", err);
    // Redirect to main page with error
    const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://imkomming.com'}?error=oauth_failed&details=${encodeURIComponent('Server error occurred')}`;
    return NextResponse.redirect(errorUrl);
  }
}
