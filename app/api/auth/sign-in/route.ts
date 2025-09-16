import { Errors, createClient } from "@farcaster/quick-auth";

import { env } from "@/lib/env";
import { fetchUser } from "@/lib/neynar";
import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";
import { Address, zeroAddress } from "viem";

export const dynamic = "force-dynamic";

const quickAuthClient = createClient();

export const POST = async (req: NextRequest) => {
  const { referrerFid, token: farcasterToken } = await req.json();
  let fid;
  let isValidSignature;
  let walletAddress: Address = zeroAddress;
  let expirationTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  // Verificar signature real de Farcaster
  try {
    const domain = new URL(env.NEXT_PUBLIC_URL).hostname;
    console.log("🔍 Verificando token con dominio:", domain);
    
    const payload = await quickAuthClient.verifyJwt({
      domain: domain,
      token: farcasterToken,
    });
    isValidSignature = !!payload;
    fid = Number(payload.sub);
    walletAddress = payload.address as `0x${string}`;
    expirationTime = payload.exp ?? Date.now() + 7 * 24 * 60 * 60 * 1000;
    console.log("✅ Token Farcaster verificado correctamente:", { fid, walletAddress });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      console.error("❌ Token inválido:", e.message);
      console.error("❌ Detalles del error:", {
        domain: new URL(env.NEXT_PUBLIC_URL).hostname,
        url: env.NEXT_PUBLIC_URL,
        appEnv: env.NEXT_PUBLIC_APP_ENV
      });
      isValidSignature = false;
    }
    console.error("❌ Error verificando token:", e);
  }

  if (!isValidSignature || !fid) {
    return NextResponse.json(
      { success: false, error: "Invalid token" },
      { status: 401 }
    );
  }

  const user = await fetchUser(fid.toString()).catch(async (error) => {
    console.warn("⚠️ Error fetching user from Neynar, using basic user data:", error.message);
    
    // Usar datos básicos del token de Farcaster si Neynar falla
    return {
      fid: fid.toString(),
      username: `user_${fid}`,
      display_name: `Usuario ${fid}`,
      pfp_url: "https://picsum.photos/200/200?random=" + fid,
      custody_address: walletAddress || "0x0000000000000000000000000000000000000000",
      verifications: walletAddress ? [walletAddress] : []
    };
  });

  // Generate JWT token
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new jose.SignJWT({
    fid,
    walletAddress,
    timestamp: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret);

  // Create the response
  const response = NextResponse.json({ success: true, user });

  // Set the auth cookie with the JWT token
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return response;
};
