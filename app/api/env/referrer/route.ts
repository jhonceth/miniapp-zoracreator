import { NextResponse } from "next/server";

export async function GET() {
  const referrer = process.env.PLATFORM_REFERRER_ADDRESS || "";
  return NextResponse.json({ referrer });
}


