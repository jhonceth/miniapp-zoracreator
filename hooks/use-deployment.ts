"use client"

import { useState, useCallback } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSendTransaction } from "wagmi"
import { prepareZoraDeploymentAction } from "@/lib/zora-deployment-server"
import { getCoinCreateFromLogs } from "@zoralabs/coins-sdk"
import { base, baseSepolia } from "viem/chains"
import type { TokenFormData, CreatedToken } from "@/types/launch"

// Función para detectar si el error es por cancelación del usuario
const isUserRejectedError = (error: any): boolean => {
  if (!error) return false
  
  const errorMessage = error.message?.toLowerCase() || ""
  const errorCode = error.code || error.error?.code
  const errorName = error.name?.toLowerCase() || ""
  
  // Códigos de error comunes para cancelación de usuario
  const rejectionCodes = [
    4001, // User rejected the request
    -32000, // User rejected
    5000, // User rejected
    'ACTION_REJECTED', // MetaMask
    'USER_REJECTED', // WalletConnect
    'user rejected',
    'user cancelled',
    'user denied'
  ]
  
  // Mensajes de error comunes para cancelación (en inglés y español)
  const rejectionMessages = [
    'user rejected',
    'user cancelled',
    'user denied',
    'transaction rejected',
    'request rejected',
    'user rejected request',
    'user rejected the request',
    'user cancelled the request',
    'user denied the request',
    'cancelled by user',
    'rejected by user',
    'denied by user',
    'operation cancelled',
    'transaction cancelled',
    'request cancelled',
    'signature cancelled',
    'signature rejected',
    'signature denied',
    'wallet cancelled',
    'wallet rejected',
    'wallet denied',
    'usuario canceló',
    'usuario rechazó',
    'usuario denegó',
    'cancelado por usuario',
    'rechazado por usuario',
    'denegado por usuario',
    'operación cancelada',
    'transacción cancelada',
    'solicitud cancelada',
    'firma cancelada',
    'firma rechazada',
    'firma denegada',
    'wallet canceló',
    'wallet rechazó',
    'wallet denegó'
  ]
  
  // Verificar código de error
  if (rejectionCodes.includes(errorCode)) {
    return true
  }
  
  // Verificar nombre del error
  if (rejectionMessages.some(msg => errorName.includes(msg))) {
    return true
  }
  
  // Verificar mensaje de error
  return rejectionMessages.some(msg => errorMessage.includes(msg))
}

export function useDeployment() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, data: hash, isPending, error: writeError, reset: resetWriteContract } = useWriteContract()
  const { sendTransaction, data: sendHash, isPending: isSendPending, error: sendError, reset: resetSendTransaction } = useSendTransaction()
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    data: receipt,
    error: receiptError 
  } = useWaitForTransactionReceipt({ hash: sendHash || hash })

  const [isPreparingDeployment, setIsPreparingDeployment] = useState(false)
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null)
  const [progress, setProgress] = useState(0)
  const [deploymentError, setDeploymentError] = useState<string | null>(null)
  const [isUserCancelled, setIsUserCancelled] = useState(false)

  // Network validation
  const isSupportedChain = (chainId === base.id) || (chainId === baseSepolia.id)
  const currentChain = {
    id: chainId,
    name: chainId === base.id ? "Base Mainnet" : chainId === baseSepolia.id ? "Base Sepolia" : "Unknown",
  }

  const deployToken = useCallback(async (formData: TokenFormData) => {
    if (!isConnected || !address) {
      throw new Error("Wallet no conectado")
    }

    if (!isSupportedChain) {
      throw new Error("Red no soportada. Usa Base Mainnet o Base Sepolia")
    }

    if (!formData.image) {
      throw new Error("Imagen requerida")
    }

    try {
      setIsPreparingDeployment(true)
      setDeploymentError(null)
      setIsUserCancelled(false)
      setProgress(10)

      console.log("🚀 Iniciando deployment con Zora SDK...")

      // Convertir File a ArrayBuffer para serialización
      setProgress(20)
      const imageArrayBuffer = await formData.image.arrayBuffer()
      const imageUint8Array = new Uint8Array(imageArrayBuffer)
      
      // Crear objeto serializable para Server Action
      const serializableImageData = {
        name: formData.image.name,
        type: formData.image.type,
        size: formData.image.size,
        data: Array.from(imageUint8Array), // Convertir a array normal para serialización
      }

      // Preparar deployment usando Zora SDK
      setProgress(30)
      const deploymentResult = await prepareZoraDeploymentAction({
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        imageData: serializableImageData, // Usar datos serializables en lugar de File
        currency: formData.currency as "ZORA" | "ETH",
        initialPurchase: formData.initialPurchase,
        payoutRecipient: (formData.payoutRecipient || address) as `0x${string}`,
        chainId: chainId,
      })

      if (!deploymentResult.success) {
        throw new Error(deploymentResult.error)
      }

      setProgress(70)
      console.log("✅ Deployment preparado, enviando transacción...")

      // Ejecutar transacción usando los parámetros del SDK
      const contractCallParams = deploymentResult.data!.contractCallParams
      
      console.log("🔍 ContractCallParams recibido en hook:", {
        isArray: Array.isArray(contractCallParams),
        length: Array.isArray(contractCallParams) ? contractCallParams.length : 0,
        firstTransaction: Array.isArray(contractCallParams) && contractCallParams.length > 0 ? {
          to: contractCallParams[0].to,
          hasData: !!contractCallParams[0].data,
          value: contractCallParams[0].value?.toString() || "0"
        } : null
      })
      
      // Validar que es un array de transacciones
      if (!Array.isArray(contractCallParams)) {
        throw new Error("ContractCallParams debe ser un array de transacciones")
      }
      
      if (contractCallParams.length === 0) {
        throw new Error("ContractCallParams está vacío - no se generaron transacciones")
      }
      
      // Usar la primera transacción (según documentación de Zora SDK)
      const firstTx = contractCallParams[0]
      
      // Validar la primera transacción
      if (!firstTx.to || !firstTx.data) {
        throw new Error("Primera transacción inválida - faltan to o data")
      }
      
      console.log("✅ Parámetros de transacción validados correctamente")
      
      // Usar sendTransaction en lugar de writeContract según documentación de Zora SDK
      const txValue = firstTx.value
      await sendTransaction({
        to: firstTx.to,
        data: firstTx.data,
        ...(txValue ? { value: txValue } : {}),
      })

      setProgress(90)
      console.log("📤 Transacción enviada")

      // Guardar la información del formulario para usarla después
      setFormDataForToken(formData)

    } catch (error) {
      console.error("❌ Error en deployment:", error)
      
      // Verificar si es un error de cancelación del usuario
      if (isUserRejectedError(error)) {
        setDeploymentError("❌ Transacción cancelada por el usuario")
        setIsUserCancelled(true)
        setIsPreparingDeployment(false)
        setProgress(0)
        // Resetear el estado de wagmi para permitir reintentar
        resetWriteContract()
        resetSendTransaction()
      } else {
        // Manejar errores específicos de IPFS
        let errorMessage = "Unknown error"
        
        if (error instanceof Error) {
          const errorText = error.message.toLowerCase()
          
          if (errorText.includes("webp")) {
            errorMessage = "WebP format is not supported. Please use PNG, JPEG, JPG, GIF or SVG format."
          } else if (errorText.includes("image must be") || errorText.includes("format")) {
            errorMessage = "Image format error. Please use PNG, JPEG, JPG, GIF or SVG format."
          } else if (errorText.includes("too large") || errorText.includes("size")) {
            errorMessage = "Image file is too large. Please use an image smaller than 5MB."
          } else if (errorText.includes("failed to upload file")) {
            errorMessage = "IPFS upload failed. This might be due to network issues or file size. Please try again with a smaller image or check your connection."
          } else if (errorText.includes("service unavailable") || errorText.includes("timeout")) {
            errorMessage = "IPFS service is temporarily unavailable. Please try again in a few minutes."
          } else if (errorText.includes("empty")) {
            errorMessage = "Image file is empty. Please select a valid image."
          } else {
            errorMessage = error.message
          }
        }
        
        setDeploymentError(errorMessage)
      }
      
      setIsPreparingDeployment(false)
      setProgress(0)
    }
  }, [isConnected, address, isSupportedChain, chainId, writeContract, resetWriteContract])

  // Estado para guardar la información del formulario
  const [formDataForToken, setFormDataForToken] = useState<TokenFormData | null>(null)

  // Procesar resultado cuando la transacción se confirme
  const processDeploymentSuccess = useCallback(async () => {
    if (!receipt || !(sendHash || hash)) return

    try {
      console.log("🔍 Procesando resultado del deployment...")
      
      // Extraer dirección del coin de los logs usando el SDK de Zora
      const coinDeployment = getCoinCreateFromLogs(receipt)
      
      if (!coinDeployment?.coin) {
        throw new Error("No se pudo extraer la dirección del coin de los logs")
      }

      // Determinar el explorer correcto según la red
      const explorerBase = chainId === base.id 
        ? "https://basescan.org"
        : "https://sepolia.basescan.org"

      // Determinar el nombre de la red
      const networkName = chainId === base.id ? "Base Mainnet" : "Base Sepolia"

      // Usar la información real del formulario si está disponible
      const tokenName = formDataForToken?.name || "Token creado"
      const tokenSymbol = formDataForToken?.symbol || "TOKEN"

      const createdTokenData: CreatedToken = {
        address: coinDeployment.coin,
        name: tokenName,
        symbol: tokenSymbol,
        transactionHash: `${sendHash || hash || ""}`,
        creatorAddress: address!,
        createdAt: new Date().toISOString(),
        poolAddress: `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`,
        initialMarketCap: "50000",
        network: networkName,
        explorer: `${explorerBase}/address/${coinDeployment.coin}`,
        transactionExplorer: `${explorerBase}/tx/${sendHash || hash}`,
        imageUrl: formDataForToken?.image ? URL.createObjectURL(formDataForToken.image) : undefined,
      }

      setCreatedToken(createdTokenData)
      setProgress(100)
      console.log("✅ Token creado exitosamente:", coinDeployment.coin)

    } catch (error) {
      console.error("❌ Error procesando resultado:", error)
      setDeploymentError("Token desplegado pero falló al extraer detalles")
    } finally {
      setIsPreparingDeployment(false)
    }
  }, [receipt, sendHash, hash, chainId, address, currentChain.name, formDataForToken])

  // Debug logging para confirmación
  console.log("🔍 Confirmation State:", {
    isConfirmed,
    hasReceipt: !!receipt,
    hasHash: !!hash,
    hasSendHash: !!sendHash,
    hasCreatedToken: !!createdToken,
    isConfirming,
    receiptError: receiptError?.message,
    receiptStatus: receipt?.status,
    receiptBlockNumber: receipt?.blockNumber,
    transactionHash: sendHash || hash
  })

  // Ejecutar procesamiento cuando se confirme la transacción
  if (isConfirmed && !createdToken && receipt) {
    console.log("🚀 Procesando deployment confirmado...")
    processDeploymentSuccess()
  }

  const resetDeployment = useCallback(() => {
    setCreatedToken(null)
    setProgress(0)
    setDeploymentError(null)
    setIsPreparingDeployment(false)
    setIsUserCancelled(false)
    resetWriteContract()
    resetSendTransaction()
  }, [resetWriteContract, resetSendTransaction])

  // Manejar errores de wagmi
  const wagmiError = writeError || sendError || receiptError
  let finalError = deploymentError

  if (wagmiError) {
    if (isUserRejectedError(wagmiError)) {
      finalError = "❌ Transacción cancelada por el usuario"
      setIsUserCancelled(true)
      setIsPreparingDeployment(false)
      setProgress(0)
      // Resetear el estado de wagmi para permitir reintentar
      resetWriteContract()
    } else {
      finalError = wagmiError.message || "Error en la transacción"
    }
  }

  // Determinar si el botón debe estar deshabilitado
  // Si el usuario canceló, no considerar isPending como deshabilitante
  const isDeploying = isPreparingDeployment || ((isPending || isSendPending) && !isUserCancelled)

  // Debug logging
  console.log("🔍 Estado del deployment:", {
    isPreparingDeployment,
    isPending,
    isUserCancelled,
    isDeploying,
    error: finalError
  })

  return {
    deployToken,
    resetDeployment,
    isPreparingDeployment,
    isPending,
    isConfirming,
    isConfirmed,
    transactionHash: hash,
    createdToken,
    error: finalError,
    progress,
    currentChain,
    isSupportedChain,
    isDeploying,
  }
}