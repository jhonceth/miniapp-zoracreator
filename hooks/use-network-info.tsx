"use client"

import { useState, useEffect } from "react"
import { useChainId } from "wagmi"
import { Shield, Network, AlertTriangle } from "lucide-react"

export function useNetworkInfo() {
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getCurrentNetworkInfo = () => {
    if (!mounted) {
      // Return default during SSR to prevent hydration mismatch
      return {
        name: "Loading...",
        icon: <Shield className="h-3 w-3" />,
        color: "default"
      }
    }

    if (chainId === 8453) {
      return {
        name: "Base Mainnet",
        icon: <Shield className="h-3 w-3" />,
        color: "default"
      }
    } else if (chainId === 84532) {
      return {
        name: "Base Sepolia", 
        icon: <Network className="h-3 w-3" />,
        color: "secondary"
      }
    } else {
      return {
        name: "Unsupported",
        icon: <AlertTriangle className="h-3 w-3" />,
        color: "destructive"
      }
    }
  }

  return {
    networkInfo: {
      ...getCurrentNetworkInfo(),
      chainId
    },
    mounted,
    chainId
  }
}
