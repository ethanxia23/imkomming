import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  // For now, just log the code and return it
  console.log("Received Wahoo OAuth code:", code);

  return NextResponse.json({ success: true, code });
}
