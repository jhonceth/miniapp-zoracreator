/**
 * Utilidades centralizadas para validación de imágenes
 * Todas las validaciones de imagen deben usar estas constantes y funciones
 */

// Constantes centralizadas
export const IMAGE_VALIDATION_CONFIG = {
  // Límite de tamaño en bytes
  MAX_SIZE: 25 * 1024 * 1024, // 25MB
  
  // Formatos soportados
  ALLOWED_TYPES: [
    'image/png',
    'image/jpeg', 
    'image/jpg',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/avif',
    'image/heic',
    'image/heif'
  ],
  
  // Mensajes de error estandarizados
  ERROR_MESSAGES: {
    TOO_LARGE: "Image file is too large. Please use an image smaller than 25MB.",
    INVALID_TYPE: "Image must be a PNG, JPEG, JPG, GIF, SVG, WebP, BMP, TIFF, AVIF, HEIC, or HEIF. Please try again with a valid image format.",
    EMPTY_FILE: "Image file is empty. Please select a valid image.",
    REQUIRED: "Token image is required",
    INVALID_ADDRESS: "Dirección de pago inválida"
  },
  
  // Información para UI
  UI_INFO: {
    MAX_SIZE_MB: 25,
    RECOMMENDED_SIZE_MB: 0.6,
    SUPPORTED_FORMATS_TEXT: "All image formats up to 25MB (auto-compressed to ≤0.6MB)",
    TOOLTIP_TEXT: "PNG, JPG, GIF, WebP, BMP, TIFF, AVIF, HEIC, HEIF up to 25MB (auto-compressed to ≤0.6MB)"
  }
} as const;

// Función para validar tamaño de archivo
export function validateImageSize(file: File): { isValid: boolean; error?: string } {
  if (file.size === 0) {
    return { isValid: false, error: IMAGE_VALIDATION_CONFIG.ERROR_MESSAGES.EMPTY_FILE };
  }
  
  if (file.size > IMAGE_VALIDATION_CONFIG.MAX_SIZE) {
    return { 
      isValid: false, 
      error: IMAGE_VALIDATION_CONFIG.ERROR_MESSAGES.TOO_LARGE 
    };
  }
  
  return { isValid: true };
}

// Función para validar tipo de archivo
export function validateImageType(file: File): { isValid: boolean; error?: string } {
  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: IMAGE_VALIDATION_CONFIG.ERROR_MESSAGES.INVALID_TYPE };
  }
  
  if (!IMAGE_VALIDATION_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
    return { isValid: false, error: IMAGE_VALIDATION_CONFIG.ERROR_MESSAGES.INVALID_TYPE };
  }
  
  return { isValid: true };
}

// Función para validar archivo completo
export function validateImageFile(file: File | null): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: IMAGE_VALIDATION_CONFIG.ERROR_MESSAGES.REQUIRED };
  }
  
  // Validar tipo
  const typeValidation = validateImageType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }
  
  // Validar tamaño
  const sizeValidation = validateImageSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }
  
  return { isValid: true };
}

// Función de validación extra robusta (recomendada)
export function validateImageFileExtra(file: File | null): { isValid: boolean; error?: string } {
  // Validación básica primero
  const basicValidation = validateImageFile(file)
  if (!basicValidation.isValid) {
    return basicValidation
  }
  
  if (!file) return { isValid: false, error: "File is null" }
  
  // Validación extra de tipo
  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "El archivo debe ser una imagen válida" }
  }
  
  // Validación extra de tamaño
  if (file.size > IMAGE_VALIDATION_CONFIG.MAX_SIZE) {
    return { 
      isValid: false, 
      error: `Imagen demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máximo ${IMAGE_VALIDATION_CONFIG.UI_INFO.MAX_SIZE_MB}MB)` 
    }
  }
  
  return { isValid: true }
}

// Función para obtener información del archivo
export function getImageFileInfo(file: File): {
  name: string;
  type: string;
  size: number;
  sizeMB: string;
  isValid: boolean;
  error?: string;
} {
  const validation = validateImageFile(file);
  
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2),
    isValid: validation.isValid,
    error: validation.error
  };
}

// Función para crear datos serializables del archivo
export async function createSerializableImageData(file: File): Promise<{
  name: string;
  type: string;
  size: number;
  data: number[];
}> {
  const imageArrayBuffer = await file.arrayBuffer();
  const imageUint8Array = new Uint8Array(imageArrayBuffer);
  
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    data: Array.from(imageUint8Array)
  };
}

// Función para reconstruir archivo desde datos serializados
export function recreateImageFile(imageData: {
  name: string;
  type: string;
  size: number;
  data: number[];
}): File {
  // Validar datos de entrada
  if (!imageData || !imageData.data || !Array.isArray(imageData.data)) {
    throw new Error("Invalid image data: missing or invalid data array")
  }
  
  if (!imageData.name || !imageData.type) {
    throw new Error("Invalid image data: missing name or type")
  }
  
  // Crear Uint8Array desde los datos
  const imageUint8Array = new Uint8Array(imageData.data)
  
  // Crear File directamente usando Uint8Array como recomendado
  const imageFile = new File([imageUint8Array], imageData.name, {
    type: imageData.type,
  })
  
  // Validación extra antes de validar con validateImageFile
  if (!imageFile.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen válida")
  }
  
  if (imageFile.size > IMAGE_VALIDATION_CONFIG.MAX_SIZE) {
    throw new Error(`Imagen demasiado grande: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB (máximo ${IMAGE_VALIDATION_CONFIG.UI_INFO.MAX_SIZE_MB}MB)`)
  }
  
  // Validar que el archivo recreado sea válido
  const validation = validateImageFile(imageFile)
  if (!validation.isValid) {
    throw new Error(`Recreated file validation failed: ${validation.error}`)
  }
  
  return imageFile
}

// Función para validar dirección de wallet
export function validateWalletAddress(address: string): { isValid: boolean; error?: string } {
  if (!address || !address.trim()) {
    return { isValid: true }; // Opcional
  }
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { isValid: false, error: IMAGE_VALIDATION_CONFIG.ERROR_MESSAGES.INVALID_ADDRESS };
  }
  
  return { isValid: true };
}

// Función para obtener mensaje de error específico basado en el texto del error
export function getSpecificErrorMessage(error: Error | string): string {
  const errorText = (typeof error === 'string' ? error : error.message).toLowerCase();
  
  if (errorText.includes("too large") || errorText.includes("size")) {
    return IMAGE_VALIDATION_CONFIG.ERROR_MESSAGES.TOO_LARGE;
  }
  
  if (errorText.includes("image must be") || errorText.includes("format")) {
    return IMAGE_VALIDATION_CONFIG.ERROR_MESSAGES.INVALID_TYPE;
  }
  
  if (errorText.includes("webp")) {
    return "WebP format is not supported. Please use PNG, JPEG, JPG, GIF or SVG format.";
  }
  
  if (errorText.includes("failed to upload file")) {
    return "IPFS upload failed. This might be due to network issues or file size. Please try again with a smaller image or check your connection.";
  }
  
  if (errorText.includes("service unavailable") || errorText.includes("timeout")) {
    return "IPFS service is temporarily unavailable. Please try again in a few minutes.";
  }
  
  if (errorText.includes("empty")) {
    return IMAGE_VALIDATION_CONFIG.ERROR_MESSAGES.EMPTY_FILE;
  }
  
  return typeof error === 'string' ? error : error.message;
}
