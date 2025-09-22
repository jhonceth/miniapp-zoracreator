/**
 * Utilidades centralizadas para validación de imágenes
 * Todas las validaciones de imagen deben usar estas constantes y funciones
 */

// Constantes centralizadas
export const IMAGE_VALIDATION_CONFIG = {
  // Límite de tamaño en bytes
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  
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
    TOO_LARGE: "Image file is too large. Please use an image smaller than 10MB.",
    INVALID_TYPE: "Image must be a PNG, JPEG, JPG, GIF, SVG, WebP, BMP, TIFF, AVIF, HEIC, or HEIF. Please try again with a valid image format.",
    EMPTY_FILE: "Image file is empty. Please select a valid image.",
    REQUIRED: "Token image is required",
    INVALID_ADDRESS: "Dirección de pago inválida"
  },
  
  // Información para UI
  UI_INFO: {
    MAX_SIZE_MB: 10,
    SUPPORTED_FORMATS_TEXT: "All image formats up to 10MB",
    TOOLTIP_TEXT: "PNG, JPG, GIF, WebP, BMP, TIFF, AVIF, HEIC, HEIF up to 10MB"
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
  const imageBlob = new Blob([new Uint8Array(imageData.data)], { 
    type: imageData.type 
  });
  
  return new File([imageBlob], imageData.name, { 
    type: imageData.type 
  });
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
