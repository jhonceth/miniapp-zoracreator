#!/usr/bin/env pwsh

# Script para agregar PLATFORM_REFERRER_ADDRESS al .env.local
# Ejecutar con: pwsh scripts/add-platform-referrer.ps1

Write-Host "🔧 Agregando PLATFORM_REFERRER_ADDRESS al .env.local..." -ForegroundColor Cyan

$envFile = ".env.local"
$platformReferrerAddress = "0x7587bE5404514609410C7727e04dB9029C701eDc"

# Verificar si el archivo existe
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "💡 Crea el archivo .env.local primero" -ForegroundColor Yellow
    exit 1
}

# Leer el contenido actual
$content = Get-Content $envFile -Raw

# Verificar si la variable ya existe
if ($content -match "PLATFORM_REFERRER_ADDRESS") {
    Write-Host "⚠️ PLATFORM_REFERRER_ADDRESS ya existe en .env.local" -ForegroundColor Yellow
    
    # Preguntar si quiere actualizarla
    $response = Read-Host "¿Quieres actualizarla? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        # Reemplazar la línea existente
        $content = $content -replace "PLATFORM_REFERRER_ADDRESS=.*", "PLATFORM_REFERRER_ADDRESS=`"$platformReferrerAddress`""
        Set-Content $envFile $content
        Write-Host "✅ PLATFORM_REFERRER_ADDRESS actualizada" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ No se realizaron cambios" -ForegroundColor Blue
    }
} else {
    # Agregar la variable al final del archivo
    $newLine = "`n# Platform Referrer Address (Server-side only)`nPLATFORM_REFERRER_ADDRESS=`"$platformReferrerAddress`""
    Add-Content $envFile $newLine
    Write-Host "✅ PLATFORM_REFERRER_ADDRESS agregada al .env.local" -ForegroundColor Green
}

Write-Host "`n📋 Variable agregada:" -ForegroundColor Cyan
Write-Host "PLATFORM_REFERRER_ADDRESS=`"$platformReferrerAddress`"" -ForegroundColor White
Write-Host "`n💡 Esta dirección se usará como referrer de plataforma en todos los tokens creados" -ForegroundColor Yellow
