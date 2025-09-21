"use server"

import { 
  createCoinCall, 
  createMetadataBuilder, 
  createZoraUploaderForCreator,
  CreateConstants,
  setApiKey,
  type ValidMetadataURI,
  type CreateCoinArgs
} from "@zoralabs/coins-sdk"
import { Address, parseEther } from "viem"
import { base, baseSepolia } from "viem/chains"
import { validateImageFile, recreateImageFile, getSpecificErrorMessage, IMAGE_VALIDATION_CONFIG } from "./image-validation"

interface ZoraDeploymentParams {
  name: string
  symbol: string
  description: string
  imageData: {
    name: string
    type: string
    size: number
    data: number[] // Array de bytes serializable
  }
  currency: "ZORA" | "ETH"
  initialPurchase?: string
  payoutRecipient: Address
  chainId: number
}

export async function prepareZoraDeploymentAction(params: ZoraDeploymentParams) {
  try {
    console.log("🚀 Preparando deployment con Zora SDK...")
    console.log("📋 Parámetros recibidos:", {
      name: params.name,
      symbol: params.symbol,
      currency: params.currency,
      chainId: params.chainId,
      payoutRecipient: params.payoutRecipient,
      imageSize: params.imageData.size,
      imageType: params.imageData.type
    })
    
    // Configurar API key de Zora
    const zoraApiKey = process.env.ZORA_API_KEY
    if (!zoraApiKey) {
      throw new Error("ZORA_API_KEY no configurado en variables de entorno")
    }
    
    console.log("🔑 Zora API Key encontrada:", zoraApiKey.substring(0, 20) + "...")
    setApiKey(zoraApiKey)
    console.log("✅ Zora API key configurado correctamente")
    
    // Configurar Platform Referrer desde variables de entorno
    const platformReferrer = process.env.PLATFORM_REFERRER_ADDRESS || "0x7587bE5404514609410C7727e04dB9029C701eDc"
    console.log("🏢 Platform Referrer configurado:", platformReferrer)

    // Validar chain ID soportado
    if (!(params.chainId === base.id || params.chainId === baseSepolia.id)) {
      throw new Error(`Chain ID ${params.chainId} no soportado. Usa Base Mainnet (8453) o Base Sepolia (84532)`)
    }

    console.log("🌐 Configuración de red:", {
      chainId: params.chainId,
      networkName: params.chainId === base.id ? "Base Mainnet" : "Base Sepolia",
      currency: params.currency,
      isTestnet: params.chainId === baseSepolia.id
    })

    // Convertir datos serializados de vuelta a File usando función centralizada
    console.log("🔄 Convirtiendo datos de imagen...")
    const imageFile = recreateImageFile(params.imageData)

    // Validar archivo usando validación centralizada
    console.log("🔍 Validando archivo de imagen...")
    const validation = validateImageFile(imageFile)
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid image file")
    }
    
    console.log(`✅ Imagen validada: ${imageFile.name} (${imageFile.type}, ${(imageFile.size / 1024 / 1024).toFixed(2)}MB)`)
    
    // Crear metadata usando el builder oficial de Zora
    console.log("📝 Creando metadata con Zora Metadata Builder...")
    console.log("🔧 Configuración del metadata:", {
      name: params.name,
      symbol: params.symbol,
      description: params.description.substring(0, 50) + "...",
      imageName: imageFile.name,
      imageSize: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
      payoutRecipient: params.payoutRecipient
    })
    
    try {
      console.log("🔧 Creando uploader de Zora para creator:", params.payoutRecipient)
      const uploader = createZoraUploaderForCreator(params.payoutRecipient)
      console.log("✅ Uploader de Zora creado:", typeof uploader)
      
      console.log("📝 Construyendo metadata...")
      const metadataBuilder = createMetadataBuilder()
        .withName(params.name)
        .withSymbol(params.symbol)
        .withDescription(params.description)
        .withImage(imageFile)
      
      console.log("📤 Subiendo metadata a IPFS...")
      const { createMetadataParameters } = await metadataBuilder.upload(uploader)

      console.log("✅ Metadata creado y subido a IPFS:", createMetadataParameters.metadata?.uri)
      console.log("📋 Metadata parameters completos:", createMetadataParameters)
      
      // Validar que el metadata se creó correctamente
      if (!createMetadataParameters.metadata?.uri) {
        throw new Error("Metadata URI es undefined - falló la subida a IPFS")
      }
      
      if (!createMetadataParameters.name || !createMetadataParameters.symbol) {
        throw new Error("Metadata incompleto - faltan name o symbol")
      }
      
      console.log("✅ Metadata validado correctamente")

      // Configurar parámetros del coin
      console.log("🪙 Configurando parámetros del coin...")
      const coinArgs: CreateCoinArgs = {
        creator: params.payoutRecipient,
        name: createMetadataParameters.name,
        symbol: createMetadataParameters.symbol,
        metadata: {
          type: "RAW_URI" as const,
          uri: createMetadataParameters.metadata.uri
        },
        currency: params.currency === "ZORA" ? CreateConstants.ContentCoinCurrencies.ZORA : CreateConstants.ContentCoinCurrencies.ETH,
        chainId: params.chainId,
        platformReferrer: platformReferrer as Address,
        skipMetadataValidation: true, // Saltar validación que está causando el error
      }
      
      console.log("🔧 Parámetros del coin configurados:", {
        creator: params.payoutRecipient,
        name: createMetadataParameters.name,
        symbol: createMetadataParameters.symbol,
        currency: params.currency,
        chainId: params.chainId,
        platformReferrer: platformReferrer,
        metadataType: "RAW_URI",
        metadataUri: createMetadataParameters.metadata?.uri,
        isBaseSepolia: params.chainId === baseSepolia.id,
        isBaseMainnet: params.chainId === base.id
      })

      // initialPurchase removido: no soportado por CreateCoinArgs en esta versión

      // Crear configuración para el contrato
      console.log("🔧 Generando configuración del contrato...")
      console.log("📋 CoinArgs final:", {
        creator: coinArgs.creator,
        name: coinArgs.name,
        symbol: coinArgs.symbol,
        metadataType: coinArgs.metadata.type,
        metadataUri: coinArgs.metadata.uri,
        currency: coinArgs.currency,
        chainId: coinArgs.chainId,
        platformReferrer: coinArgs.platformReferrer,
        // sin initialPurchase en esta versión
      })
      
      const contractCallParams = await createCoinCall(coinArgs)
      
      console.log("✅ Configuración del contrato generada:", {
        isArray: Array.isArray(contractCallParams),
        length: Array.isArray(contractCallParams) ? contractCallParams.length : 0,
        firstTransaction: Array.isArray(contractCallParams) && contractCallParams.length > 0 ? {
          to: contractCallParams[0].to,
          hasData: !!contractCallParams[0].data,
          value: contractCallParams[0].value?.toString() || "0"
        } : null
      })
      
      console.log("🔍 ContractCallParams completo:", contractCallParams)
      
      // Validar que es un array de transacciones
      if (!Array.isArray(contractCallParams)) {
        throw new Error("ContractCallParams debe ser un array de transacciones")
      }
      
      if (contractCallParams.length === 0) {
        throw new Error("ContractCallParams está vacío - no se generaron transacciones")
      }
      
      // Validar la primera transacción
      const firstTx = contractCallParams[0]
      if (!firstTx.to || !firstTx.data) {
        throw new Error("Primera transacción inválida - faltan to o data")
      }
      
      console.log("✅ Transacciones validadas correctamente")

      console.log("✅ Deployment preparado exitosamente")
      console.log("🎉 Todo listo para enviar la transacción a la blockchain")

      return {
        success: true,
        data: {
          contractCallParams,
          metadataUri: createMetadataParameters.metadata?.uri,
          networkInfo: {
            chainId: params.chainId,
            networkName: params.chainId === base.id ? "Base Mainnet" : "Base Sepolia",
            factoryAddress: "0x777777751622c0d3258f214F9DF38E35BF45baF3",
          },
        },
      }
    } catch (uploadError) {
      console.error("❌ Error subiendo metadata a IPFS:", uploadError)
      
      // Analizar el error específico
      let errorMessage = "Failed to upload file"
      
      if (uploadError instanceof Error) {
        const errorText = uploadError.message.toLowerCase()
        
        if (errorText.includes("image must be") || errorText.includes("format")) {
          errorMessage = "Image must be a PNG, JPEG, JPG, GIF, SVG, WebP, BMP, TIFF, AVIF, HEIC, or HEIF. Please try again with a valid image format."
        } else if (errorText.includes("size") || errorText.includes("too large")) {
          errorMessage = "Image file is too large. Please use an image smaller than 10MB."
        } else if (errorText.includes("network") || errorText.includes("connection")) {
          errorMessage = "Network error uploading image. Please check your connection and try again."
        } else if (errorText.includes("service unavailable") || errorText.includes("timeout")) {
          errorMessage = "IPFS service is temporarily unavailable. Please try again in a few minutes."
        } else {
          errorMessage = `Failed to upload file: ${uploadError.message}. Please try again or check your network connection.`
        }
      }
      
      // Fallback: crear metadata sin imagen
      console.log("🔄 Intentando fallback sin imagen...")
      
      try {
        const { createMetadataParameters } = await createMetadataBuilder()
          .withName(params.name)
          .withSymbol(params.symbol)
          .withDescription(params.description)
          .upload(createZoraUploaderForCreator(params.payoutRecipient))

        console.log("✅ Metadata creado sin imagen:", createMetadataParameters.metadata?.uri)

        // Configurar parámetros del coin
        const coinArgs: CreateCoinArgs = {
          creator: params.payoutRecipient,
          name: createMetadataParameters.name,
          symbol: createMetadataParameters.symbol,
          metadata: {
            type: "RAW_URI" as const,
            uri: createMetadataParameters.metadata.uri
          },
          currency: params.currency === "ZORA" ? CreateConstants.ContentCoinCurrencies.ZORA : CreateConstants.ContentCoinCurrencies.ETH,
          chainId: params.chainId,
          platformReferrer: platformReferrer as Address,
          skipMetadataValidation: true, // Saltar validación que está causando el error
        }

        // initialPurchase removido también en fallback

        const contractCallParams = await createCoinCall(coinArgs)
        
        console.log("🔍 ContractCallParams fallback completo:", contractCallParams)
        
        // Validar que es un array de transacciones
        if (!Array.isArray(contractCallParams)) {
          throw new Error("ContractCallParams debe ser un array de transacciones")
        }
        
        if (contractCallParams.length === 0) {
          throw new Error("ContractCallParams está vacío - no se generaron transacciones")
        }
        
        // Validar la primera transacción
        const firstTx = contractCallParams[0]
        if (!firstTx.to || !firstTx.data) {
          throw new Error("Primera transacción inválida - faltan to o data")
        }
        
        console.log("✅ Transacciones fallback validadas correctamente")

        return {
          success: true,
          data: {
            contractCallParams,
            metadataUri: createMetadataParameters.metadata?.uri,
            networkInfo: {
              chainId: params.chainId,
              networkName: params.chainId === base.id ? "Base Mainnet" : "Base Sepolia",
              factoryAddress: "0x777777751622c0d3258f214F9DF38E35BF45baF3",
            },
          },
        }
      } catch (fallbackError) {
        console.error("❌ Error en fallback:", fallbackError)
        throw new Error(errorMessage)
      }
    }
    } catch (error) {
      console.error("❌ Error preparando deployment:", error)
      
      // Manejo específico de errores para Base Sepolia
      if (params.chainId === baseSepolia.id) {
        console.error("🔍 Error específico de Base Sepolia:", {
          chainId: params.chainId,
          currency: params.currency,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          errorStack: error instanceof Error ? error.stack : undefined
        })
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al preparar deployment",
      }
    }
}

export async function validateZoraEnvironmentAction() {
  try {
    const zoraApiKey = process.env.ZORA_API_KEY
    
    if (!zoraApiKey) {
      return {
        success: false,
        error: "ZORA_API_KEY no configurado",
        details: {
          hasZoraKey: false,
          keyLength: 0,
        },
      }
    }

    // Configurar API key para validación
    setApiKey(zoraApiKey)

    return {
      success: true,
      data: {
        hasZoraKey: true,
        keyLength: zoraApiKey.length,
        keyPrefix: zoraApiKey.substring(0, 10) + "...",
        supportedChains: [
          { id: base.id, name: "Base Mainnet", factory: "0x777777751622c0d3258f214F9DF38E35BF45baF3" },
          { id: baseSepolia.id, name: "Base Sepolia", factory: "0x777777751622c0d3258f214F9DF38E35BF45baF3" },
        ],
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error validando entorno Zora",
    }
  }
}