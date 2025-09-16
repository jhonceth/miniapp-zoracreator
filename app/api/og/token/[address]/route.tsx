import { env } from "@/lib/env";
import { loadGoogleFont, loadImage } from "@/lib/og-utils";
import { ImageResponse } from "next/og";
import { getCoin } from "@zoralabs/coins-sdk";

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

// Define the dimensions for the generated OpenGraph image
const size = {
  width: 600,
  height: 400,
};

/**
 * GET handler for generating dynamic OpenGraph images for token sharing
 * @param request - The incoming HTTP request
 * @param params - Route parameters containing the token address
 * @returns ImageResponse - A dynamically generated image for OpenGraph
 */
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      address: string;
    }>;
  }
) {
  try {
    // Extract the token address from the route parameters
    const { address } = await params;

    // Get the application's base URL from environment variables
    const appUrl = env.NEXT_PUBLIC_URL;

    // Try to get token data from Zora
    let tokenData = null;
    try {
      const response = await getCoin({
        address: address,
        chain: 8453, // Base Mainnet
      });
      tokenData = response.data?.zora20Token;
    } catch (error) {
      console.log("Could not fetch token data:", error);
    }

    // Load the logo image from the public directory
    const logoImage = await loadImage(`${appUrl}/icon.png`);

    // Load token image if available
    let tokenImage = null;
    if (tokenData?.mediaContent?.previewImage?.medium) {
      try {
        tokenImage = await loadImage(tokenData.mediaContent.previewImage.medium);
      } catch (error) {
        console.log("Could not load token image:", error);
      }
    }

    // Load and prepare the custom font with the text to be rendered
    const displayText = tokenData?.name || `Token ${address.slice(0, 6)}...${address.slice(-4)}`;
    const fontData = await loadGoogleFont("Inter", displayText);

    // Generate and return the image response with the composed elements
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            gap: "20px",
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.1)",
              backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
            }}
          />
          
          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "30px",
              zIndex: 1,
              width: "100%",
              padding: "0 40px",
            }}
          >
            {/* Left side - Token info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "15px",
                flex: 1,
              }}
            >
              {/* Token name and symbol */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontSize: 28,
                    fontWeight: "bold",
                    fontFamily: "Inter",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {tokenData?.name || "Unknown Token"}
                </div>
                {tokenData?.symbol && (
                  <div
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: 18,
                      fontFamily: "Inter",
                    }}
                  >
                    ${tokenData.symbol}
                  </div>
                )}
              </div>

              {/* Token address */}
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: 14,
                  fontFamily: "monospace",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>

              {/* Stats */}
              {tokenData && (
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    marginTop: "10px",
                  }}
                >
                  {tokenData.marketCap && (
                    <div
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: 14,
                        fontFamily: "Inter",
                      }}
                    >
                      <div style={{ opacity: 0.7 }}>Market Cap</div>
                      <div style={{ fontWeight: "bold" }}>
                        ${parseFloat(tokenData.marketCap).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {tokenData.uniqueHolders && (
                    <div
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: 14,
                        fontFamily: "Inter",
                      }}
                    >
                      <div style={{ opacity: 0.7 }}>Holders</div>
                      <div style={{ fontWeight: "bold" }}>
                        {tokenData.uniqueHolders}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right side - Token image */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "15px",
              }}
            >
              {/* Token image or logo */}
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  border: "3px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {tokenImage ? (
                  <img
                    src={`data:image/png;base64,${Buffer.from(tokenImage).toString(
                      "base64"
                    )}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src={`data:image/png;base64,${Buffer.from(logoImage).toString(
                      "base64"
                    )}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              {/* Zbase Creator branding */}
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: 14,
                  textAlign: "center",
                  fontFamily: "Inter",
                  fontWeight: "bold",
                }}
              >
                Created on Zbase Creator
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        // Configure the custom font for use in the image
        fonts: [
          {
            name: "Inter",
            data: fontData,
            style: "normal",
          },
        ],
      }
    );
  } catch (e) {
    console.error("Error generating token share image:", e);
    // Return a fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#667eea",
            color: "white",
            fontSize: 24,
            fontFamily: "Inter",
          }}
        >
          <div>Zbase Creator Token</div>
          <div style={{ fontSize: 16, marginTop: "20px" }}>
            Failed to load token image
          </div>
        </div>
      ),
      size
    );
  }
}
