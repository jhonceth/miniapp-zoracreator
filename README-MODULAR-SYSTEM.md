# 🎯 Sistema Modular de Búsquedas en Pools y Graph

## Resumen

Se ha implementado un sistema modular completo para búsquedas en pools y Graph con soporte para múltiples timeframes, agregaciones automáticas y hooks React para uso fácil.

## Archivos Implementados

### 1. **`lib/graphql-modular.ts`** - Sistema Core
- **Configuraciones de timeframe**: 1H, 1D, 1W, 1M, 3M, 1Y, ALL
- **Consulta GraphQL dinámica**: Adapta la consulta según el timeframe
- **Procesamiento de datos**: Convierte datos de pools a formato de gráfico
- **Agregaciones**: Semanal y mensual automáticas
- **Selección de pools**: Algoritmo inteligente para encontrar el mejor pool

### 2. **`hooks/use-token-chart.ts`** - Hooks React
- **`useTokenChart`**: Hook principal para un token
- **`useMultipleTokenCharts`**: Hook para múltiples tokens
- **`useTimeframeSelector`**: Hook para manejo de timeframes
- **Estados de carga**: Loading, error, success
- **Refetch**: Función para actualizar datos

### 3. **Componentes de Ejemplo** - ELIMINADO
- **`TokenChartComponent`**: Componente eliminado - usar TimeSeriesChart o CandlestickChart
- **`MultipleTokenCharts`**: Componente para múltiples tokens
- **Selector de timeframe**: Botones para cambiar período
- **Tabs de gráficos**: TimeSeries y Candlestick
- **Metadata display**: Información del pool y método de cálculo

### 4. **`app/api/charts/data/route.ts`** - API Modular
- **Endpoint actualizado**: Usa el sistema modular
- **Parámetros**: timeframe, network, preferredBaseTokens
- **Respuesta**: Formato compatible con componentes existentes

### 5. **`app/api/charts/data/route.backup.ts`** - Respaldo
- **API original**: Respaldo completo del sistema anterior
- **Funcionalidad**: Mantiene toda la lógica original

## Características Principales

### 🎯 **Timeframes Soportados**
```typescript
const TIMEFRAMES = {
  '1H': { days: 1, interval: 'hourly', entity: 'poolHourData' },
  '1D': { days: 1, interval: 'hourly', entity: 'poolHourData' },
  '1W': { days: 7, interval: 'daily', entity: 'poolDayData' },
  '1M': { days: 30, interval: 'daily', entity: 'poolDayData' },
  '3M': { days: 90, interval: 'daily', entity: 'poolDayData' },
  '1Y': { days: 365, interval: 'weekly', entity: 'poolDayData' },
  'ALL': { days: 365 * 5, interval: 'monthly', entity: 'poolDayData' }
};
```

### 🔍 **Consulta GraphQL Dinámica**
- **Condicional**: `@include(if: $shouldIncludeDaily)` para datos diarios
- **Condicional**: `@include(if: $shouldIncludeHourly)` para datos horarios
- **Optimizada**: Solo obtiene los datos necesarios según timeframe

### 📊 **Procesamiento de Datos**
- **Conversión de precios**: `tokenPrice × baseTokenDerivedETH × ethPriceUSD`
- **Agregaciones automáticas**: Semanal y mensual
- **Filtrado**: Elimina datos inválidos y duplicados

### 🎨 **Hooks React**
```typescript
// Uso básico
const { response, loading, error, refetch } = useTokenChart(tokenAddress, {
  timeframe: '1M',
  preferredBaseTokens: ['ZORA', 'WETH', 'USDC', 'USDT'],
  network: 'base'
});

// Múltiples tokens
const { responses, loading, errors, refetchAll } = useMultipleTokenCharts(
  ['0x123...', '0x456...'], 
  { timeframe: '1W' }
);
```

## Uso del Sistema

### 1. **Uso Básico con Hook**
```typescript
import { useTokenChart } from '@/hooks/use-token-chart';

function MyComponent() {
  const { response, loading, error } = useTokenChart('0x123...', {
    timeframe: '1M',
    preferredBaseTokens: ['ZORA', 'WETH']
  });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <Chart data={response.chartData} />;
}
```

### 2. **Uso con Componente**
```typescript
// TokenChartComponent eliminado - usar TimeSeriesChart o CandlestickChart

function MyPage() {
  return (
    <TimeSeriesChart
      data={chartData}
      contractAddress="0x123..."
      selectedPeriod="1M"
    />
  );
}
```

### 3. **Uso Directo de la Función**
```typescript
import { getTokenChartData } from '@/lib/graphql-modular';

const result = await getTokenChartData(
  '0x123...',
  '1M',
  ['ZORA', 'WETH', 'USDC', 'USDT'],
  'base'
);
```

## Ventajas del Sistema Modular

### ✅ **Flexibilidad**
- Múltiples timeframes
- Configuración de tokens base preferidos
- Soporte para múltiples redes

### ✅ **Rendimiento**
- Consultas optimizadas según timeframe
- Agregaciones eficientes
- Caché de datos

### ✅ **Mantenibilidad**
- Código modular y reutilizable
- Tipos TypeScript completos
- Separación de responsabilidades

### ✅ **Usabilidad**
- Hooks React fáciles de usar
- Componentes listos para usar
- Estados de carga y error manejados

## Migración desde Sistema Anterior

### 🔄 **Compatibilidad**
- La API mantiene el mismo formato de respuesta
- Los componentes existentes siguen funcionando
- El sistema anterior está respaldado

### 🚀 **Nuevas Características**
- Timeframes adicionales (1H, 1D, 1W, 3M, 1Y, ALL)
- Agregaciones automáticas
- Selección inteligente de pools
- Hooks React para uso fácil

## Próximos Pasos

1. **Testing**: Probar con diferentes tokens y timeframes
2. **Optimización**: Mejorar rendimiento de agregaciones
3. **UI**: Mejorar interfaz de usuario
4. **Documentación**: Agregar más ejemplos de uso
5. **Métricas**: Implementar sistema de métricas y monitoreo

## Archivos de Respaldo

- `app/api/charts/data/route.backup.ts`: API original completa
- Sistema anterior completamente funcional
- Migración gradual posible

---

**Estado**: ✅ Implementación completa y funcional
**Compatibilidad**: ✅ Mantiene compatibilidad con sistema anterior
**Testing**: 🔄 Pendiente de pruebas exhaustivas
