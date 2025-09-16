"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Loader2, CheckCircle, AlertTriangle, Clock } from "lucide-react"

interface TransactionStatusProps {
  hash?: string
  progress: number
  error?: string | null
  isPreparingDeployment: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  onRetry?: () => void
}

export function TransactionStatus({
  hash,
  progress,
  error,
  isPreparingDeployment,
  isPending,
  isConfirming,
  isConfirmed,
  onRetry,
}: TransactionStatusProps) {
  // Detectar si es una cancelación de usuario
  const isUserCancelled = error && (
    error.includes("cancelada") || 
    error.includes("User rejected") || 
    error.includes("User denied") ||
    error.includes("cancelled") ||
    error.includes("rejected")
  )

  const getStatusIcon = () => {
    if (isUserCancelled) return <AlertTriangle className="h-5 w-5 text-orange-500" />
    if (error) return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (isConfirmed) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (isConfirming) return <CheckCircle className="h-5 w-5 text-blue-500" />
    if (isPending) return <Clock className="h-5 w-5 text-yellow-500" />
    if (isPreparingDeployment) return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
  }

  const getStatusText = () => {
    if (isUserCancelled) return "Transacción abortada"
    if (error) return "Error en la transacción"
    if (isConfirmed) return "Token desplegado exitosamente"
    if (isConfirming) return "Confirmando transacción"
    if (isPending) return "Transacción pendiente"
    if (isPreparingDeployment) return "Preparando despliegue"
    return "Procesando..."
  }

  const getStatusColor = () => {
    if (isUserCancelled) return "secondary"
    if (error) return "destructive"
    if (isConfirmed) return "default"
    if (isConfirming) return "default"
    if (isPending) return "secondary"
    return "default"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Estado del Despliegue
          <Badge variant={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Progreso del despliegue del token
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Transaction Hash */}
        {hash && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Hash de Transacción:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </code>
              <a
                href={`https://basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant={isUserCancelled ? "default" : "destructive"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isUserCancelled ? (
                <div className="space-y-3">
                  <div>
                    <strong>🚫 Transacción Abortada</strong>
                    <p className="mt-1 text-sm">
                      Has cancelado la transacción. Puedes intentar crear el token nuevamente cuando estés listo.
                    </p>
                  </div>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      Intentar Nuevamente
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <strong>Error:</strong> {error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Messages */}
        <div className="space-y-2 text-sm">
          {isPreparingDeployment && (
            <p className="text-blue-600">
              📤 Subiendo imagen y metadatos a IPFS...
            </p>
          )}
          {isPending && (
            <p className="text-yellow-600">
              ⏳ Esperando confirmación de la transacción...
            </p>
          )}
          {isConfirming && (
            <p className="text-blue-600">
              🔍 Confirmando transacción en la blockchain...
            </p>
          )}
          {isConfirmed && (
            <p className="text-green-600">
              ✅ Token desplegado exitosamente en la blockchain
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

