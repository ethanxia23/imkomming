import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    if (!process.env.WAHOO_CLIENT_ID || !process.env.WAHOO_CLIENT_SECRET || !process.env.WAHOO_REDIRECT_URI) {
      return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
    }

    const body = new URLSearchParams({
      client_id: process.env.WAHOO_CLIENT_ID!,
      client_secret: process.env.WAHOO_CLIENT_SECRET!,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: process.env.WAHOO_REDIRECT_URI!,
    });

    const tokenResponse = await fetch("https://api.wahooligan.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch token", details: data }, { status: 500 });
    }

    return NextResponse.json({ success: true, token: data });
  } catch (err) {
    console.error("Server exception:", err);
    return NextResponse.json({ error: "Server exception" }, { status: 500 });
  }
}
