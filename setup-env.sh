#!/bin/bash

echo "🔧 Configurando variables de entorno para ZCreate"
echo ""

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    touch .env.local
fi

echo "📋 Necesitas configurar las siguientes variables:"
echo ""
echo "1. ZORA_API_KEY - Tu API key de Zora"
echo "   Obtén tu API key en: https://docs.zora.co/docs/coins-sdk/getting-started"
echo ""
echo "2. NEYNAR_API_KEY - Tu API key de Neynar (opcional para datos de usuario)"
echo "   Obtén tu API key en: https://neynar.com/"
echo ""
echo "3. JWT_SECRET - Un secreto para firmar JWT tokens"
echo "   Puedes generar uno con: openssl rand -base64 32"
echo ""

read -p "¿Quieres configurar ahora? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "ZORA_API_KEY: " zora_key
    read -p "NEYNAR_API_KEY (opcional): " neynar_key
    read -p "JWT_SECRET: " jwt_secret
    
    echo ""
    echo "📝 Escribiendo configuración..."
    
    cat > .env.local << EOF
# Farcaster Configuration
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEYNAR_API_KEY=${neynar_key}
JWT_SECRET=${jwt_secret}

# Zora Configuration
ZORA_API_KEY=${zora_key}

# Farcaster Headers (opcional)
NEXT_PUBLIC_FARCASTER_HEADER=
NEXT_PUBLIC_FARCASTER_PAYLOAD=
NEXT_PUBLIC_FARCASTER_SIGNATURE=
EOF
    
    echo "✅ Configuración completada!"
    echo ""
    echo "🚀 Ahora puedes ejecutar: pnpm dev"
else
    echo ""
    echo "📝 Configura manualmente el archivo .env.local con las variables necesarias"
    echo "   Consulta el archivo .env.example para ver el formato"
fi
