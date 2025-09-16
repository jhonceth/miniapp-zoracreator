import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { env } from "@/lib/env";

export async function middleware(request: NextRequest) {
  // Solo procesar rutas de API
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Obtener el token de la cookie
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    console.log("🔍 Middleware: No auth token found");
    return NextResponse.next();
  }

  try {
    // Verificar el token JWT
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    console.log("✅ Middleware: Token verified, FID:", payload.fid);
    
    // Agregar el FID a los headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-fid", payload.fid as string);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("❌ Middleware: Token verification failed:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/api/:path*",
};
