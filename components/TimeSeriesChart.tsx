'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createChart, ColorType, AreaSeries, LineSeries, HistogramSeries, createTextWatermark } from 'lightweight-charts';

interface TimeSeriesChartProps {
  data: any[];
  contractAddress: string;
  selectedPeriod?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  onPeriodChange?: (period: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL') => void;
  onFetchData?: () => void;
  isLoading?: boolean;
  error?: string | null;
  rawResponse?: any;
  className?: string;
  height?: number;
}

// Función de throttling para optimizar redimensionamiento
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

// Función para verificar si el chart está disponible
const isChartAvailable = (chart: any): boolean => {
  return chart && !chart._disposed;
};

export default function TimeSeriesChart({
  data,
  contractAddress,
  selectedPeriod = '1M',
  onPeriodChange,
  onFetchData,
  isLoading = false,
  error = null,
  rawResponse,
  className = '',
  height = 400
}: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // ✅ OPTIMIZACIÓN: Memoización de datos procesados
  const { processedLineData, processedVolumeData } = useMemo(() => {
    if (!data || data.length === 0) {
      return { processedLineData: [], processedVolumeData: [] };
    }

    console.log('🔄 Procesando datos del gráfico...');

    // Procesamiento optimizado de lineData
    const validData = data.filter(point => 
      point.time && point.value !== undefined && point.value !== null
    );

    const lineData = validData.map((point, index) => {
      const currentValue = parseFloat(point.value) || 0;
      const previousValue = index > 0 ? parseFloat(validData[index - 1].value) || 0 : currentValue;
      
      return {
        time: point.time,
        value: currentValue,
        color: currentValue < previousValue ? 
          'rgba(239, 83, 80, 1)' : 'rgba(38, 166, 154, 1)'
      };
    });

    // Eliminar duplicados usando Map (más eficiente)
    const uniqueLineData = Array.from(
      new Map(lineData.map(item => [item.time, item])).values()
    ).sort((a, b) => String(a.time).localeCompare(String(b.time)));

    // Procesamiento optimizado de volumeData
    const getVolumeColor = (open: number, close: number): string => 
      close > open ? '#26a69a' : close < open ? '#ef5350' : '#9e9e9e';

    const volumeData = data
      .filter(point => point.time && point.volume !== undefined && point.volume !== null)
      .map(point => ({
        time: point.time,
        value: parseFloat(point.volume) || 0,
        color: getVolumeColor(
          parseFloat(point.open) || 0,
          parseFloat(point.close) || 0
        )
      }));

    const uniqueVolumeData = Array.from(
      new Map(volumeData.map(item => [item.time, item])).values()
    ).sort((a, b) => String(a.time).localeCompare(String(b.time)));

    return {
      processedLineData: uniqueLineData,
      processedVolumeData: uniqueVolumeData
    };
  }, [data]);

  // ✅ OPTIMIZACIÓN: Configuración responsive memoizada
  const chartConfig = useMemo(() => {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const isTablet = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
    
    return {
      height: isMobile ? 250 : isTablet ? 300 : height,
      fontSize: isMobile ? 10 : 12,
      priceScaleMargin: isMobile ? 0.05 : 0.1,
      lineWidth: isMobile ? 1 : 2,
      precision: isMobile ? 4 : 8,
      volumeScaleMargin: isMobile ? 0.5 : 0.7
    };
  }, [height]);

  // ✅ OPTIMIZACIÓN: Función de cleanup segura
  const safeCleanup = useCallback(() => {
    // Cancelar animation frame primero


    // Limpiar chart de forma segura
    if (chartRef.current && isChartAvailable(chartRef.current)) {
      try {
        chartRef.current.remove();
      } catch (error) {
        console.log('⚠️ Chart ya estaba disposed:', error);
      }
      chartRef.current = null;
    }
  }, []);


  // ✅ OPTIMIZACIÓN: Effect principal optimizado y seguro
  useEffect(() => {
    if (!containerRef.current || processedLineData.length === 0) {
      return;
    }

    console.log('🎯 Creando gráfico optimizado con:', processedLineData.length, 'puntos');

    // Limpieza previa segura
    safeCleanup();

    let chart: any = null;
    let toolTip: HTMLDivElement | null = null;

    try {
      chart = createChart(containerRef.current, {
      layout: { 
          textColor: 'white', 
          background: { type: ColorType.Solid, color: '#141C2E' },
          attributionLogo: false,
          fontSize: chartConfig.fontSize
      },
      width: containerRef.current.clientWidth,
        height: chartConfig.height,
        autoSize: true,
      leftPriceScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: {
            top: chartConfig.priceScaleMargin,
            bottom: window.innerWidth < 768 ? 0.2 : 0.4,
        },
      },
      timeScale: {
        tickMarkFormatter: (time: any, tickMarkType: any, locale: string) => {
          const date = new Date(time * 1000);
            if (window.innerWidth < 768) {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          } else {
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: '2-digit'
            });
          }
        }
      },
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        vertLine: {
            visible: true,
            labelVisible: true,
            labelBackgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'rgba(255, 255, 255, 0.4)',
            width: window.innerWidth < 768 ? 1 : 2,
            style: 0, // Solid line
          },
        },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
          horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
        kineticScroll: {
          touch: true,
          mouse: false
        },
        trackingMode: {
          exitMode: 'onTouchEnd' as any
        }
      });

      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: 'rgba(38, 166, 154, 1)',
        topColor: 'rgba(168, 85, 247, 0.8)',
        bottomColor: 'rgba(168, 85, 247, 0.0)',
        crosshairMarkerVisible: true,
        priceFormat: {
          type: 'price',
          precision: chartConfig.precision,
          minMove: 0.00000001,
        },
        lastValueVisible: true,
        priceLineVisible: true,
        lineWidth: chartConfig.lineWidth,
      });

      const lineSeries = chart.addSeries(LineSeries, {
        color: 'rgba(38, 166, 154, 1)',
        lineWidth: window.innerWidth < 768 ? 3 : 4,
      crosshairMarkerVisible: true,
      priceFormat: {
        type: 'price',
          precision: chartConfig.precision,
        minMove: 0.00000001,
      },
      lastValueVisible: true,
      priceLineVisible: true,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
        priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
          top: chartConfig.volumeScaleMargin,
        bottom: 0,
      },
    });

      // ✅ OPTIMIZACIÓN: Configurar datos memoizados
      areaSeries.setData(processedLineData);
      lineSeries.setData(processedLineData);
      
      if (processedVolumeData.length > 0) {
        volumeSeries.setData(processedVolumeData);
      }

      // Marca de agua
    createTextWatermark(chart.panes()[0], {
      horzAlign: 'center',
        vertAlign: 'center',
      lines: [
        {
          text: 'ZCreate',
          color: 'rgba(38, 166, 154, 0.3)',
            fontSize: window.innerWidth < 768 ? 16 : 24,
          fontFamily: 'Arial, sans-serif',
        },
      ],
    });

      // ✅ OPTIMIZACIÓN: Canvas overlay para punto titilante
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';

      // Tooltip optimizado
      toolTip = document.createElement('div');
    const isMobile = window.innerWidth < 768;
    toolTip.style.cssText = `
      position: absolute; 
      display: none; 
      padding: ${isMobile ? '8px 12px' : '12px 16px'}; 
      box-sizing: border-box; 
      font-size: ${isMobile ? '10px' : '12px'}; 
      text-align: center; 
      z-index: 1000; 
      top: 12px; 
      left: 12px; 
      pointer-events: none; 
      border: 1px solid; 
      border-radius: ${isMobile ? '6px' : '8px'};
      font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif; 
      background: rgba(255, 255, 255, 0.95);
      color: black;
        border-color: rgba(38, 166, 154, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(8px);
      min-width: ${isMobile ? '80px' : '100px'};
      max-width: ${isMobile ? '150px' : '200px'};
      white-space: nowrap;
      overflow: hidden;
    `;
    containerRef.current.appendChild(toolTip);

      // ✅ OPTIMIZACIÓN: Crosshair move throttled
      let lastCrosshairTime = 0;
      let isMouseOver = false;
      
      // Solo mostrar tooltip con mouse, no con touch
      containerRef.current.addEventListener('mouseenter', () => {
        isMouseOver = true;
      });
      
      containerRef.current.addEventListener('mouseleave', () => {
        isMouseOver = false;
        if (toolTip) toolTip.style.display = 'none';
      });
      
    chart.subscribeCrosshairMove((param: any) => {
        const now = Date.now();
        if (now - lastCrosshairTime < 50) return; // Limitar a 20 FPS
        lastCrosshairTime = now;
        
        // Solo mostrar tooltip si el mouse está sobre el gráfico
        if (!isMouseOver && !isMobile) {
          if (toolTip) toolTip.style.display = 'none';
          return;
        }

      if (
          !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > containerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > containerRef.current!.clientHeight
      ) {
          if (toolTip) toolTip.style.display = 'none';
      } else {
        const dateStr = param.time;
          const seriesData = param.seriesData.get(areaSeries);
          
          let price = seriesData?.value;
        if (price === undefined || price === null) {
          const originalDataPoint = data.find(point => point.time === dateStr);
            price = originalDataPoint?.value;
          }
          
          if (price !== undefined && price !== null && toolTip) {
          const formattedPrice = price < 0.01 
            ? price.toFixed(8) 
            : price < 1 
            ? price.toFixed(6) 
            : price.toFixed(2);
          
          let formattedDate = String(dateStr);
          if (typeof dateStr === 'number' || /^\d+$/.test(String(dateStr))) {
            const date = new Date(parseInt(String(dateStr)) * 1000);
            formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          } else if (typeof dateStr === 'string' && dateStr.includes('-')) {
            const date = new Date(dateStr);
            formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
          
          const titleSize = isMobile ? '9px' : '11px';
          const priceSize = isMobile ? '14px' : '18px';
          const dateSize = isMobile ? '8px' : '10px';
          const titleMargin = isMobile ? '2px' : '4px';
          const priceMargin = isMobile ? '4px 0px' : '6px 0px';
          const dateMargin = isMobile ? '1px' : '2px';
          
          toolTip.innerHTML = `
              <div style="color: rgba(38, 166, 154, 1); font-weight: bold; margin-bottom: ${titleMargin}; font-size: ${titleSize};">Token Price</div>
            <div style="font-size: ${priceSize}; margin: ${priceMargin}; color: black; font-weight: bold; word-break: break-all;">
              $${formattedPrice}
            </div>
            <div style="color: #666; font-size: ${dateSize}; margin-top: ${dateMargin};">
              ${formattedDate}
            </div>
          `;
          
          toolTip.style.display = 'block';
          const toolTipWidth = toolTip.offsetWidth;
          const toolTipHeight = toolTip.offsetHeight;
          
          const containerWidth = containerRef.current!.clientWidth;
          const containerHeight = containerRef.current!.clientHeight;
          
          let left = param.point.x - toolTipWidth / 2;
          let top = param.point.y - toolTipHeight - 10;
          
          if (left < 10) left = 10;
          if (left + toolTipWidth > containerWidth - 10) left = containerWidth - toolTipWidth - 10;
          if (top < 10) top = param.point.y + 10;
          if (top + toolTipHeight > containerHeight - 10) top = containerHeight - toolTipHeight - 10;
          
          toolTip.style.left = left + 'px';
          toolTip.style.top = top + 'px';
        }
      }
    });

    chart.subscribeClick((param: any) => {
        if (param.point && param.time) {
          const closestPoint = data.find(point => point.time === param.time);
        if (closestPoint) {
          setSelectedPoint(closestPoint);
        }
      }
    });

      chart.timeScale().fitContent();
    chartRef.current = chart;

    } catch (error) {
      console.error('❌ Error al crear el gráfico:', error);
      safeCleanup();
    }

    return () => {
      safeCleanup();
      
      // Limpiar tooltip si existe
      if (toolTip && toolTip.parentNode) {
        try {
          toolTip.parentNode.removeChild(toolTip);
        } catch (error) {
          console.log('⚠️ Error al limpiar tooltip:', error);
        }
      }
    };
  }, [processedLineData, processedVolumeData, chartConfig, data, safeCleanup]);

  // ✅ OPTIMIZACIÓN: Redimensionamiento throttled
  useEffect(() => {
    const handleResize = throttle(() => {
      if (chartRef.current && isChartAvailable(chartRef.current) && containerRef.current) {
        try {
          const isMobile = window.innerWidth < 768;
          const isTablet = window.innerWidth < 1024;
          const newHeight = isMobile ? 250 : isTablet ? 300 : height;
          
        chartRef.current.resize(
          containerRef.current.clientWidth,
            newHeight
        );

        } catch (error) {
          console.log('⚠️ Error en resize, realizando cleanup...');
          safeCleanup();
        }
      }
    }, 100);

    window.addEventListener('resize', handleResize);
    
    resizeObserverRef.current = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      safeCleanup();
    };
  }, [height, safeCleanup]);

  const currentHeight = useMemo(() => {
    if (typeof window === 'undefined') return height;
    return window.innerWidth < 768 ? 250 : window.innerWidth < 1024 ? 300 : height;
  }, [height]);

  return (
    <div className={`w-full ${className}`}>
      {/* Chart Controls */}
      <div className="flex flex-col items-start justify-between mb-2 gap-2 sm:flex-row sm:items-center sm:mb-4 sm:gap-4">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          {onPeriodChange && (
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-secondary mb-2">
                📅 Period:
              </label>
              <div className="flex flex-wrap gap-1">
                {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => onPeriodChange(period)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                      selectedPeriod === period
                        ? 'bg-accent-blue text-white shadow-sm'
                        : 'bg-card-dark text-secondary hover:bg-card-dark/80 hover:text-primary border border-card-dark'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-[250px] sm:h-[400px] text-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-sm sm:text-base">Loading chart data...</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-4 text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={containerRef} 
        className="w-full border border-gray-200 rounded relative"
        style={{ 
          display: isLoading ? 'none' : 'block',
          height: currentHeight,
          minHeight: '200px',
          maxHeight: '600px'
        }}
      >
        {/* Custom Logo */}
        <div className="absolute bottom-8 left-2 z-10">
          <a href="/" className="block">
            <img 
              src="/minicon.png" 
              alt="LaunchCoin" 
              className="w-6 h-6 sm:w-8 sm:h-8 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            />
          </a>
        </div>
      </div>

      {/* Selected Point Information */}
      {selectedPoint && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">
            🎯 Selected Point Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <p><strong>📅 Date:</strong> {selectedPoint.date}</p>
              <p><strong>💰 Price:</strong> {selectedPoint.value?.toFixed(8)} USD</p>
              <p><strong>📈 High:</strong> {selectedPoint.high?.toFixed(8)} USD</p>
              <p><strong>📉 Low:</strong> {selectedPoint.low?.toFixed(8)} USD</p>
            </div>
            <div>
              <p><strong>📊 Volume:</strong> {selectedPoint.volume?.toFixed(2)} USD</p>
              <p><strong>🔢 Token0Price:</strong> {selectedPoint.token0Price?.toFixed(8)}</p>
              <p><strong>🔢 Token1Price:</strong> {selectedPoint.token1Price?.toFixed(2)}</p>
              <p><strong>📝 Open:</strong> {selectedPoint.open?.toFixed(8)} USD</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            💡 Click on any point in the chart to see detailed information
          </div>
        </div>
      )}
    </div>
  );
}