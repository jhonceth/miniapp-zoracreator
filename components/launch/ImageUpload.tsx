"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Upload, X, AlertTriangle, HelpCircle } from "lucide-react"
import { validateImageFile, IMAGE_VALIDATION_CONFIG } from "@/lib/image-validation";
import { compressImageForZora, getCompressionInfo, getCompressionRecommendations } from "@/lib/image-compression";

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  error?: string;
}

export function ImageUpload({ onImageSelect, error }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string>("")
  const [compressionInfo, setCompressionInfo] = useState<{
    needsCompression: boolean;
    currentSize: string;
    recommendedSize: string;
    message: string;
  } | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      setUploadError("")

      // Usar validación centralizada
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        setUploadError(validation.error || "Invalid image file")
        return
      }

      setUploading(true)

      try {
        // Compress image if needed
        console.log("📦 Compressing image to optimize deployment...")
        const compressionResult = await compressImageForZora(file)
        const finalFile = compressionResult.compressedFile
        
        // Validate the compressed file
        if (!finalFile || !(finalFile instanceof File)) {
          throw new Error("Failed to process image file")
        }
        
        if (finalFile.size === 0) {
          throw new Error("Processed image file is empty")
        }
        
        console.log("✅ Image processed successfully:", {
          name: finalFile.name,
          type: finalFile.type,
          size: finalFile.size,
          isFile: finalFile instanceof File
        })
        
        const compressionDetails = getCompressionInfo(compressionResult)
        console.log("📊 Compression result:", compressionDetails)
        
        // Only show compression info if the image was actually compressed
        if (compressionResult.wasCompressed) {
          const recommendations = getCompressionRecommendations(file)
          setCompressionInfo(recommendations)
          setIsOptimizing(true)
        } else {
          // Clear compression info if no compression was needed
          setCompressionInfo(null)
          setIsOptimizing(false)
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
          onImageSelect(finalFile) // Use compressed file
          setUploading(false)
          setIsOptimizing(false)
        }
        reader.onerror = () => {
          setUploadError("Error reading file")
          setUploading(false)
          setIsOptimizing(false)
        }
        reader.readAsDataURL(finalFile) // Use compressed file for preview
      } catch (err) {
        console.error("❌ Error processing image:", err)
        
        // Fallback: try with original file if compression failed
        try {
          console.log("🔄 Fallback: Using original file...")
          const reader = new FileReader()
          reader.onload = () => {
            setPreview(reader.result as string)
            onImageSelect(file) // Use original file as fallback
            setUploading(false)
            setIsOptimizing(false)
          }
          reader.onerror = () => {
            setUploadError("Error reading file")
            setUploading(false)
            setIsOptimizing(false)
          }
          reader.readAsDataURL(file)
        } catch (fallbackErr) {
          console.error("❌ Fallback also failed:", fallbackErr)
          setUploadError("Error processing image")
          setUploading(false)
          setIsOptimizing(false)
        }
      }
    },
    [onImageSelect],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      handleFiles(e.target.files)
    },
    [handleFiles],
  )

  const removeImage = () => {
    setPreview(null)
    setUploadError("")
    setCompressionInfo(null)
    setIsOptimizing(false)
    onImageSelect(null)
  }

  const displayError = error || uploadError

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {!preview ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                className={`border-2 border-dashed p-3 text-center cursor-pointer transition-colors ${
                  dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"
                } ${displayError ? "border-red-500" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input type="file" accept="image/*" onChange={handleChange} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="space-y-1">
                    {uploading ? (
                      <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                    )}
                    <p className="text-xs font-medium">
                      {uploading ? (isOptimizing ? "Optimizing..." : "Processing...") : "upload image"}
                    </p>
                  </div>
                </label>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-300">{IMAGE_VALIDATION_CONFIG.UI_INFO.SUPPORTED_FORMATS_TEXT}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Card className="p-2">
            <div className="relative group">
              <div className="w-24 h-24 mx-auto">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Token preview"
                  className="w-full h-full object-cover rounded-lg border-2 border-purple-200"
                />
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute -top-1 -right-1 h-7 w-7 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-50 border border-red-200" 
                onClick={removeImage}
                title="Remove image"
              >
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>
            
            {/* Compression Info Tooltip - Only show if image was actually compressed */}
            {compressionInfo && compressionInfo.needsCompression && (
              <div className="mt-1 flex items-center justify-center">
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    {isOptimizing ? "Optimizing..." : "Compressed"}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3 h-3 text-blue-600 dark:text-blue-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs bg-gray-900 dark:bg-gray-800 border-gray-700 text-white">
                      <div className="space-y-1">
                        <div className="font-medium text-blue-300">
                          {isOptimizing ? "Optimizing Image..." : "Image Compressed"}
                        </div>
                        <div className="text-sm text-gray-200">
                          {isOptimizing ? (
                            <div>Compressing image to optimize deployment...</div>
                          ) : compressionInfo ? (
                            <>
                              <div>Size: {compressionInfo.currentSize} → {compressionInfo.recommendedSize}</div>
                              <div className="text-xs mt-1 text-gray-300">{compressionInfo.message}</div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </Card>
        )}
        {displayError && (
          <div className="flex items-center space-x-1 text-xs text-red-500">
            <AlertTriangle className="w-3 h-3" />
            <span>{displayError}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
