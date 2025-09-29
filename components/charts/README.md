# Componentes de Gráficos de Velas

Este módulo proporciona componentes reutilizables para crear gráficos de velas usando datos de swaps de tokens.

## Componentes Disponibles

### 1. CandlestickChart
Componente completo con lógica de datos integrada.

```tsx
import { CandlestickChart } from '@/components/charts/CandlestickChart';

<CandlestickChart
  contractAddress="0x5fc18a6d9f8dca772a6ccc524c6657d1e647bd7c"
  network="base"
  sdk="zora"
  height={400}
  width={800}
  className="border rounded-lg"
/>
```

### 2. SimpleCandlestickChart
Componente simplificado que usa el hook `useChartData`.

```tsx
import { SimpleCandlestickChart } from '@/components/charts/SimpleCandlestickChart';

<SimpleCandlestickChart
  contractAddress="0x5fc18a6d9f8dca772a6ccc524c6657d1e647bd7c"
  network="base"
  sdk="zora"
  height={300}
  days={7} // Últimos 7 días
/>
```

### 3. Hook useChartData
Hook personalizado para obtener datos de gráficos.

```tsx
import { useChartData } from '@/hooks/use-chart-data';

const { data, isLoading, error, refetch } = useChartData({
  contractAddress: "0x5fc18a6d9f8dca772a6ccc524c6657d1e647bd7c",
  network: "base",
  days: 30
});
```

## Props

### CandlestickChart & SimpleCandlestickChart

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `contractAddress` | `string` | ✅ | Dirección del contrato del token |
| `network` | `string` | ✅ | Red blockchain ('base', 'ethereum') |
| `sdk` | `string` | ✅ | SDK utilizado ('zora', 'uniswap') |
| `height` | `number` | ❌ | Altura del gráfico (default: 400) |
| `width` | `number` | ❌ | Ancho del gráfico (opcional) |
| `className` | `string` | ❌ | Clases CSS adicionales |
| `days` | `number` | ❌ | Días de datos a mostrar (default: 30) |

### useChartData

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `contractAddress` | `string` | ✅ | Dirección del contrato del token |
| `network` | `string` | ✅ | Red blockchain |
| `days` | `number` | ❌ | Días de datos (default: 30) |

## Redes Soportadas

- **Base**: `base`
- **Ethereum**: `ethereum` (requiere configuración adicional)

## Características

- ✅ Gráficos de velas interactivos
- ✅ Responsive design
- ✅ Manejo de errores
- ✅ Estados de carga
- ✅ Datos en tiempo real
- ✅ Configuración personalizable
- ✅ Reutilizable y modular

## Dependencias

- `lightweight-charts`: Librería de gráficos
- `urql`: Cliente GraphQL
- `@urql/core`: Core de URQL

## Configuración de API

La API key está configurada en las variables de entorno:

```bash
# En .env.local
THEGRAPH_API_KEY=504e0dc261179f646432c478e126dc15
```

Para cambiar la configuración, modifica la variable `THEGRAPH_API_KEY` en tu archivo `.env.local`.
