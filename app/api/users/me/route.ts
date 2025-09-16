import { fetchUser } from "@/lib/neynar";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fid = request.headers.get("x-user-fid");
  
  console.log("🔍 /api/users/me - FID from headers:", fid);
  
  if (!fid) {
    console.error("❌ No FID found in headers");
    return NextResponse.json({ error: "No FID found" }, { status: 401 });
  }
  
  const user = await fetchUser(fid).catch(async (error) => {
    console.warn("⚠️ Error fetching user from Neynar, using basic user data:", error.message);
    
    // Usar datos básicos si Neynar falla
    return {
      fid: fid,
      username: `user_${fid}`,
      display_name: `Usuario ${fid}`,
      pfp_url: "https://picsum.photos/200/200?random=" + fid,
      custody_address: "0x0000000000000000000000000000000000000000",
      verifications: []
    };
  });
  
  console.log("✅ User data for /api/users/me:", user);
  
  return NextResponse.json(user);
}
