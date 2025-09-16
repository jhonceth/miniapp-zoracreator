# Configuración para Farcaster Mini App

## Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en Farcaster, necesitas configurar las siguientes variables de entorno:

### 1. Crear archivo `.env.local`

```bash
# URL de tu aplicación (debe coincidir con el dominio registrado en Farcaster)
NEXT_PUBLIC_URL=https://tu-dominio.com

# Entorno de la aplicación
NEXT_PUBLIC_APP_ENV=production

# API Key de Neynar (obtén una en https://neynar.com)
NEYNAR_API_KEY=tu_api_key_de_neynar

# JWT Secret para firmar tokens (usa un string seguro y único)
JWT_SECRET=tu_jwt_secret_super_seguro_y_unico
```

### 2. Configuración en Farcaster

1. **Registra tu Mini App** en el portal de desarrolladores de Farcaster
2. **Configura el dominio** para que coincida con `NEXT_PUBLIC_URL`
3. **Obtén una API Key de Neynar** en https://neynar.com

### 3. Solución al Error "unexpected aud claim value"

Este error ocurre cuando:
- El dominio en `NEXT_PUBLIC_URL` no coincide con el registrado en Farcaster
- Las variables de entorno no están configuradas correctamente
- La aplicación no está ejecutándose en el contexto de Farcaster

### 4. Para Desarrollo Local

Si quieres probar localmente antes de desplegar:

```bash
# Para desarrollo local
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
NEYNAR_API_KEY=tu_api_key_de_neynar
JWT_SECRET=dev_jwt_secret
```

### 5. Despliegue

1. Despliega tu aplicación en un dominio público
2. Actualiza `NEXT_PUBLIC_URL` con el dominio real
3. Configura `NEXT_PUBLIC_APP_ENV=production`
4. Prueba la aplicación desde Farcaster

## Troubleshooting

- **Error 401**: Verifica que `NEYNAR_API_KEY` sea válida
- **Error "unexpected aud claim value"**: Verifica que `NEXT_PUBLIC_URL` coincida con el dominio registrado
- **Error de conexión**: Verifica que la aplicación esté desplegada y accesible públicamente
