/**
 * Utilidades para compresión automática de imágenes
 * Optimiza imágenes grandes para evitar fallos en el deployment de Zora
 */

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

export interface CompressionResult {
  originalFile: File;
  compressedFile: File;
  compressionRatio: number;
  sizeReduction: number;
  wasCompressed: boolean;
}

// Configuración por defecto optimizada para Zora - Compresión más agresiva
const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.8, // Límite más estricto para mejor compatibilidad
  maxWidthOrHeight: 800, // Resolución reducida para menor tamaño
  useWebWorker: true,
  quality: 0.7, // Calidad reducida para mayor compresión
};

/**
 * Comprimir imagen automáticamente si es necesario
 */
export async function compressImageIfNeeded(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  
  console.log("🔄 Iniciando compresión de imagen:", {
    name: file.name,
    type: file.type,
    originalSize: file.size,
    originalSizeMB: (file.size / 1024 / 1024).toFixed(2),
    targetSizeMB: finalOptions.maxSizeMB,
    targetResolution: finalOptions.maxWidthOrHeight
  });

  // Si la imagen ya es pequeña, no comprimir
  const sizeInMB = file.size / (1024 * 1024);
  if (sizeInMB <= (finalOptions.maxSizeMB || 1.5)) {
    console.log("✅ Imagen ya es suficientemente pequeña, no se comprime");
    return {
      originalFile: file,
      compressedFile: file,
      compressionRatio: 1,
      sizeReduction: 0,
      wasCompressed: false
    };
  }

  try {
    console.log("📦 Comprimiendo imagen...");
    const compressedFile = await imageCompression(file, finalOptions);
    
    const compressionRatio = compressedFile.size / file.size;
    const sizeReduction = ((file.size - compressedFile.size) / file.size) * 100;
    
    console.log("✅ Compresión completada:", {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      originalSizeMB: (file.size / 1024 / 1024).toFixed(2),
      compressedSizeMB: (compressedFile.size / 1024 / 1024).toFixed(2),
      compressionRatio: compressionRatio.toFixed(2),
      sizeReduction: sizeReduction.toFixed(1) + '%'
    });

    return {
      originalFile: file,
      compressedFile,
      compressionRatio,
      sizeReduction,
      wasCompressed: true
    };
  } catch (error) {
    console.error("❌ Error comprimiendo imagen:", error);
    
    // Si falla la compresión, devolver el archivo original
    console.log("⚠️ Usando imagen original sin comprimir");
    return {
      originalFile: file,
      compressedFile: file,
      compressionRatio: 1,
      sizeReduction: 0,
      wasCompressed: false
    };
  }
}

/**
 * Comprimir imagen con configuración específica para Zora
 */
export async function compressImageForZora(file: File): Promise<CompressionResult> {
  return compressImageIfNeeded(file, {
    maxSizeMB: 0.6, // Límite muy estricto para máxima compatibilidad
    maxWidthOrHeight: 600, // Resolución reducida para menor tamaño
    quality: 0.6, // Calidad reducida para mayor compresión
  });
}

/**
 * Obtener información detallada de la compresión
 */
export function getCompressionInfo(result: CompressionResult): {
  originalSize: string;
  compressedSize: string;
  savings: string;
  ratio: string;
  status: string;
} {
  const originalSizeMB = (result.originalFile.size / 1024 / 1024).toFixed(2);
  const compressedSizeMB = (result.compressedFile.size / 1024 / 1024).toFixed(2);
  const savings = result.wasCompressed ? `${result.sizeReduction.toFixed(1)}%` : "0%";
  const ratio = result.compressionRatio.toFixed(2);
  const status = result.wasCompressed ? "Comprimida" : "Sin comprimir";

  return {
    originalSize: `${originalSizeMB}MB`,
    compressedSize: `${compressedSizeMB}MB`,
    savings,
    ratio,
    status
  };
}

/**
 * Validar si una imagen necesita compresión
 */
export function needsCompression(file: File, maxSizeMB: number = 0.6): boolean {
  const sizeInMB = file.size / (1024 * 1024);
  return sizeInMB > maxSizeMB;
}

/**
 * Obtener recomendaciones de compresión
 */
export function getCompressionRecommendations(file: File): {
  needsCompression: boolean;
  currentSize: string;
  recommendedSize: string;
  message: string;
} {
  const sizeInMB = file.size / (1024 * 1024);
  const needsComp = needsCompression(file);
  
  return {
    needsCompression: needsComp,
    currentSize: `${sizeInMB.toFixed(2)}MB`,
    recommendedSize: "≤0.6MB",
    message: needsComp 
      ? "This image will be automatically compressed to optimize deployment"
      : "This image doesn't need compression"
  };
}
