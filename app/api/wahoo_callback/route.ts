import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

// Store your secrets in Vercel environment variables:
// WAHOO_CLIENT_ID, WAHOO_CLIENT_SECRET, WAHOO_REDIRECT_URI

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.wahoofitness.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.WAHOO_CLIENT_ID!,
        client_secret: process.env.WAHOO_CLIENT_SECRET!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: process.env.WAHOO_REDIRECT_URI!,
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Error fetching token:", data);
      return NextResponse.json({ error: "Failed to fetch token", details: data }, { status: 500 });
    }

    console.log("Wahoo Access Token Response:", data);

    return NextResponse.json({ success: true, token: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
