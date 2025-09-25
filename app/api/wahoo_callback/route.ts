// app/api/wahoo_callback/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  return NextResponse.json({
    success: true,
    receivedCode: code,
  });
}
