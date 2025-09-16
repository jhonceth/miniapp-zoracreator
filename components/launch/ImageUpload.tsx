"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Upload, X, AlertTriangle } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  error?: string
}

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

      // Validate file size (1MB limit)
      if (file.size > 1 * 1024 * 1024) {
        setUploadError("El archivo debe ser menor a 1MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        setUploadError("Por favor selecciona un archivo de imagen válido")
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
          setUploadError("Error al leer el archivo")
          setUploading(false)
        }
        reader.readAsDataURL(file)
      } catch (err) {
        setUploadError("Error al procesar la imagen")
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
              <p className="text-xs text-gray-300">PNG, JPG, GIF up to 1MB</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Card className="p-2">
            <div className="relative">
              <div className="w-24 h-24 mx-auto">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Token preview"
                  className="w-full h-full object-cover rounded-lg border-2 border-purple-200"
                />
              </div>
              <Button variant="destructive" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={removeImage}>
                <X className="w-3 h-3" />
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
