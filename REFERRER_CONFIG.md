# Configuración de Variables de Entorno

## Variables del Cliente (NEXT_PUBLIC_*)

Estas variables son accesibles en el navegador y deben tener el prefijo `NEXT_PUBLIC_`:

```bash
# Dirección de referencia para trading
NEXT_PUBLIC_PLATFORM_REFERRER_ADDRESS="0x7587bE5404514609410C7727e04dB9029C701eDc"
```

## Variables del Servidor

Estas variables solo son accesibles en el servidor:

```bash
# API Keys
NEYNAR_API_KEY="your_neynar_api_key"
ETHERSCAN_API_KEY="your_etherscan_api_key"

# Otros
JWT_SECRET="your_jwt_secret"
REDIS_URL="redis://localhost:6379"
REDIS_TOKEN="your_redis_token"
```

## Configuración Actual

La dirección de referencia `0x7587bE5404514609410C7727e04dB9029C701eDc` está configurada como variable del cliente para que sea accesible en el componente TradingCoins.

## Uso en el Código

```typescript
// En el componente TradingCoins.tsx
const referrerAddress = env.NEXT_PUBLIC_PLATFORM_REFERRER_ADDRESS;
const hookData = encodeReferrerHookData(referrerAddress);
```
