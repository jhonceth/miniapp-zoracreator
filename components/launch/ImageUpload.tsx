"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Upload, X, AlertTriangle } from "lucide-react"
import { validateImageFile, IMAGE_VALIDATION_CONFIG } from "@/lib/image-validation";

export function ImageUpload({ onImageSelect, error }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string>("")

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
        // Create preview
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
          onImageSelect(file)
          setUploading(false)
        }
        reader.onerror = () => {
          setUploadError("Error reading file")
          setUploading(false)
        }
        reader.readAsDataURL(file)
      } catch (err) {
        setUploadError("Error processing image")
        setUploading(false)
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
                      {uploading ? "Processing..." : "upload image"}
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
