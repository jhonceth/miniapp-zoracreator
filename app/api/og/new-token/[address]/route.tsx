/*
  Imagen OG dinámica para compartir tokens recién creados en Farcaster Mini Apps
  - Formato 3:2 (1200x800)
  - Enfoque en celebración: "NEW COIN CREATED"
  - Incluye: nombre, símbolo, fecha, creador
  - Cache-Control recomendado para feeds
*/

import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { getCoin } from "@zoralabs/coins-sdk"

export const runtime = "edge"

export async function GET(req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params

  // Dimensiones 3:2
  const width = 1200
  const height = 800

  try {
    let coinName = "New ZoraCoin"
    let coinSymbol = ""
    let creatorAddress = "Unknown"
    let createdAt = new Date().toISOString()
    let logoSrc: string | undefined

    try {
      const response = await getCoin({ address, chain: 8453 })
      const token = response.data?.zora20Token
      if (token) {
        coinName = token.name || coinName
        coinSymbol = token.symbol ? `(${token.symbol})` : ""
        creatorAddress = token.creatorAddress || creatorAddress
        createdAt = token.createdAt || createdAt
        logoSrc = token.mediaContent?.previewImage?.medium || token.mediaContent?.previewImage?.small
      }
    } catch {}

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    }

    const image = new ImageResponse(
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial",
          position: "relative",
          background: "linear-gradient(135deg, #10B981 0%, #059669 25%, #047857 50%, #065F46 75%, #064E3B 100%)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            opacity: 0.1,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: "radial-gradient(circle at 25% 25%, #ffffff 2px, transparent 2px), radial-gradient(circle at 75% 75%, #ffffff 2px, transparent 2px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>


        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: "40px",
            zIndex: 2,
          }}
        >
          {/* Celebration Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                fontWeight: "800",
                color: "#FFFFFF",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                background: "rgba(255, 255, 255, 0.1)",
                padding: "20px 40px",
                borderRadius: "20px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              🎉 NEW COIN CREATED IN ZORA! 🎉
            </div>
          </div>

          {/* Token Info Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #9333EA 0%, #EC4899 50%, #9333EA 100%)",
              borderRadius: "25px",
              padding: "60px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              maxWidth: "900px",
              width: "100%",
              position: "relative",
            }}
          >
            {/* Token Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "180px",
                height: "180px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #10B981, #059669)",
                marginBottom: "40px",
                border: "6px solid #FFFFFF",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "20px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "72px",
                    fontWeight: "900",
                    color: "#FFFFFF",
                  }}
                >
                  {coinName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Token Name and Symbol */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "56px",
                  fontWeight: "900",
                  color: "#FFFFFF",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                {coinName}
              </div>
              {coinSymbol && (
                <div
                  style={{
                    display: "flex",
                    fontSize: "36px",
                    fontWeight: "900",
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {coinSymbol}
                </div>
              )}
            </div>

            {/* Token Details Grid */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                width: "100%",
                gap: "20px",
              }}
            >
              {/* Created Date */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "24px",
                    fontWeight: "900",
                    color: "rgba(255, 255, 255, 0.9)",
                    marginBottom: "12px",
                  }}
                >
                  CREATED
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "28px",
                    fontWeight: "900",
                    color: "#FFFFFF",
                    textAlign: "center",
                  }}
                >
                  {formatDate(createdAt)}
                </div>
              </div>

              {/* Creator */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "24px",
                    fontWeight: "900",
                    color: "rgba(255, 255, 255, 0.9)",
                    marginBottom: "12px",
                  }}
                >
                  CREATOR
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "28px",
                    fontWeight: "900",
                    color: "#FFFFFF",
                    textAlign: "center",
                    fontFamily: "monospace",
                  }}
                >
                  {creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "24px",
                fontWeight: "700",
                color: "#FFFFFF",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
              }}
            >
              Created on Zbase Creator
            </div>
          </div>
        </div>
      </div>,
      {
        width,
        height,
        headers: {
          "Cache-Control": "public, immutable, no-transform, max-age=300",
        },
      },
    )

    return image
  } catch (e) {
    return new ImageResponse(
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          color: "#F9FAFB",
          fontSize: 42,
          fontWeight: 700,
        }}
      >
        ZBase Creator - New ZoraCoin
      </div>,
      { width, height },
    )
  }
}
