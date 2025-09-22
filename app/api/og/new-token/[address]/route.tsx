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
    let creatorAvatar: string | undefined
    let creatorIdentity: string | undefined
    let creatorFid: string | undefined

    try {
      const response = await getCoin({ address, chain: 8453 })
      const token = response.data?.zora20Token
      if (token) {
        coinName = token.name || coinName
        coinSymbol = token.symbol ? `(${token.symbol})` : ""
        creatorAddress = token.creatorAddress || creatorAddress
        createdAt = token.createdAt || createdAt
        logoSrc = token.mediaContent?.previewImage?.medium || token.mediaContent?.previewImage?.small
        
        // Try to get creator avatar from web3.bio
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
          
          const creatorResponse = await fetch(`https://api.web3.bio/profile/${creatorAddress}`, {
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (creatorResponse.ok) {
            const creatorData = await creatorResponse.json()
            if (creatorData && creatorData.length > 0) {
              const farcasterProfile = creatorData.find((profile: any) => profile.platform === 'farcaster')
              if (farcasterProfile) {
                if (farcasterProfile.avatar) {
                  creatorAvatar = farcasterProfile.avatar
                }
                if (farcasterProfile.identity) {
                  creatorIdentity = farcasterProfile.identity
                }
                if (farcasterProfile.social?.uid) {
                  creatorFid = farcasterProfile.social.uid.toString()
                }
              }
            }
          }
        } catch (error) {
          // Ignore web3.bio API errors/timeouts
          console.log('web3.bio API skipped:', (error as Error).message)
        }
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
          background: "#9333EA",
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

          {/* Token Logo and Info - Side by side */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "60px",
              marginBottom: "40px",
            }}
          >
            {/* LEFT SIDE - Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "250px",
                height: "250px",
                borderRadius: "25px",
                background: "linear-gradient(135deg, #10B981, #059669)",
                border: "8px solid #FFFFFF",
                boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
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
                    fontSize: "100px",
                    fontWeight: "900",
                    color: "#FFFFFF",
                  }}
                >
                  {coinName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* RIGHT SIDE - Name and Symbol */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "72px",
                  fontWeight: "900",
                  color: "#FFFFFF",
                  marginBottom: "20px",
                  textAlign: "left",
                }}
              >
                {coinName}
              </div>
              {coinSymbol && (
                <div
                  style={{
                    display: "flex",
                    fontSize: "48px",
                    fontWeight: "900",
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {coinSymbol}
                </div>
              )}
            </div>
          </div>

          {/* Created and Creator Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "30px",
              gap: "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "32px",
                fontWeight: "600",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              ⏰ Created: {formatDate(createdAt)}
            </div>
            {/* Creator Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {/* Creator Label */}
              <div
                style={{
                  display: "flex",
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                Creator
              </div>
              
              {/* Avatar and Info Side by Side */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                }}
              >
                {/* Creator Avatar */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "3px solid #FFFFFF",
                    backgroundColor: creatorAvatar ? "transparent" : "#E5E7EB",
                  }}
                >
                  {creatorAvatar ? (
                    <img
                      src={creatorAvatar}
                      alt="creator avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: "40px",
                        fontWeight: "600",
                        color: "#6B21A8",
                      }}
                    >
                      👤
                    </div>
                  )}
                </div>
                
                {/* Creator Info */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: "32px",
                      fontWeight: "600",
                      color: "#FFFFFF",
                      textAlign: "left",
                    }}
                  >
                    {creatorIdentity || creatorAddress.slice(0, 6) + "..." + creatorAddress.slice(-4)}
                  </div>
                  {creatorFid && (
                    <div
                      style={{
                        display: "flex",
                        fontSize: "24px",
                        fontWeight: "500",
                        color: "rgba(255, 255, 255, 0.8)",
                        textAlign: "left",
                      }}
                    >
                      FID: {creatorFid}
                    </div>
                  )}
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
              Launch in ZBase Creator
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
