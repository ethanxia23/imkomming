import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    serverEnv: {
      WAHOO_CLIENT_ID: process.env.WAHOO_CLIENT_ID ? 'SET' : 'NOT SET',
      WAHOO_CLIENT_SECRET: process.env.WAHOO_CLIENT_SECRET ? 'SET' : 'NOT SET',
      WAHOO_REDIRECT_URI: process.env.WAHOO_REDIRECT_URI || 'NOT SET',
      NEXT_PUBLIC_WAHOO_CLIENT_ID: process.env.NEXT_PUBLIC_WAHOO_CLIENT_ID || 'NOT SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    }
  });
}
