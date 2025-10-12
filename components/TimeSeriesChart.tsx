'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries, LineSeries, HistogramSeries, createImageWatermark, createTextWatermark } from 'lightweight-charts'; // ✅ Import correcto

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
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Effect to create time series chart - VERSIÓN CORREGIDA
  useEffect(() => {
    console.log('🔍 TimeSeriesChart useEffect triggered:', {
      hasContainer: !!containerRef.current,
      dataLength: data?.length || 0,
      contractAddress,
      selectedPeriod,
      isLoading,
      error,
      rawResponse: !!rawResponse
    });

    if (!containerRef.current) {
      console.log('❌ No container ref available');
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ No data available for chart:', data);
      return;
    }

    console.log('🎯 Creating time series chart with API data:', data.length, 'points');
    console.log('📊 Sample data points:', data.slice(0, 3));

    // Detectar si es móvil
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    // Configuración responsive
    const chartHeight = isMobile ? 250 : isTablet ? 300 : height;
    const fontSize = isMobile ? 10 : 12;
    const priceScaleMargin = isMobile ? 0.05 : 0.1;

    const chart = createChart(containerRef.current, {
      layout: { 
        textColor: 'white', 
        background: { type: ColorType.Solid, color: '#141C2E' },
        attributionLogo: false, // ✅ Oculta el logo de TradingView
        fontSize: fontSize
      },
      width: containerRef.current.clientWidth,
      height: chartHeight,
      autoSize: true, // Enable auto sizing
      leftPriceScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: {
          top: priceScaleMargin,
          bottom: isMobile ? 0.2 : 0.4, // Less space for volume on mobile
        },
      },
      timeScale: {
        // Configuración responsive para timeScale
        tickMarkFormatter: (time: any, tickMarkType: any, locale: string) => {
          // Convertir timestamp a fecha legible
          const date = new Date(time * 1000);
          
          if (isMobile) {
            // En móvil, mostrar formato corto
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          } else {
            // En desktop, mostrar formato más completo
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: '2-digit'
            });
          }
        }
      },
      crosshair: {
        // hide the horizontal crosshair line
        horzLine: {
          visible: false,
          labelVisible: false,
        },
        // hide the vertical crosshair label
        vertLine: {
          labelVisible: false,
        },
      },
      // hide the grid lines and borders
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      // Quitar bordes del gráfico
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true, // Mejorar touch en móvil
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: 'rgba(38, 166, 154, 1)', // Verde para la línea
      topColor: 'rgba(168, 85, 247, 0.8)', // Púrpura fuerte en picos
      bottomColor: 'rgba(168, 85, 247, 0.0)', // TRANSPARENCIA TOTAL - se fusiona con el fondo
      crosshairMarkerVisible: true,
      priceFormat: {
        type: 'price',
        precision: isMobile ? 4 : 8, // Menos precisión en móvil
        minMove: 0.00000001,
      },
      lastValueVisible: true,
      priceLineVisible: true,
      lineWidth: isMobile ? 1 : 2, // Línea más delgada en móvil
    });

    // Agregar serie de líneas con colores dinámicos (verde/rojo)
    const lineSeries = chart.addSeries(LineSeries, {
      color: 'rgba(38, 166, 154, 1)', // Color por defecto (verde)
      lineWidth: isMobile ? 3 : 4, // Línea más gruesa
      crosshairMarkerVisible: true,
      priceFormat: {
        type: 'price',
        precision: isMobile ? 4 : 8,
        minMove: 0.00000001,
      },
      lastValueVisible: true,
      priceLineVisible: true,
    });

    // Add volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay by setting a blank priceScaleId
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: isMobile ? 0.5 : 0.7, // Less space on mobile
        bottom: 0,
      },
    });

    // Agregar marca de agua con texto ZCreate
    createTextWatermark(chart.panes()[0], {
      horzAlign: 'center',
      vertAlign: 'center', // Restaurar al centro
      lines: [
        {
          text: 'ZCreate',
          color: 'rgba(38, 166, 154, 0.3)',
          fontSize: isMobile ? 16 : 24, // Texto más pequeño en móvil
          fontFamily: 'Arial, sans-serif',
        },
      ],
    });

    // Convert time series data to line format with dynamic colors
    const lineData = data
      .filter(point => point.time && point.value !== undefined && point.value !== null)
      .map((point, index) => {
        const currentValue = parseFloat(point.value) || 0;
        const previousValue = index > 0 ? parseFloat(data[index - 1].value) || 0 : currentValue;
        
        // Determinar color basado en la tendencia
        let color = 'rgba(38, 166, 154, 1)'; // Verde por defecto
        if (currentValue < previousValue) {
          color = 'rgba(239, 83, 80, 1)'; // Rojo si baja
        } else if (currentValue > previousValue) {
          color = 'rgba(38, 166, 154, 1)'; // Verde si sube
        }
        
        return {
        time: point.time,
          value: currentValue,
          color: color
        };
      })
      .sort((a, b) => {
        // Handle both string and number time values
        const timeA = typeof a.time === 'string' ? a.time : String(a.time);
        const timeB = typeof b.time === 'string' ? b.time : String(b.time);
        return timeA.localeCompare(timeB);
      });

    const uniqueLineData = lineData.reduce((acc: any[], current) => {
      const existing = acc.find(item => item.time === current.time);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log('📊 Processed line data:', uniqueLineData.length, 'points');

    if (uniqueLineData.length === 0) {
      console.warn('⚠️ No valid data for line chart');
      return () => {
        chart.remove();
      };
    }

    areaSeries.setData(uniqueLineData);

    // Crear datos con colores dinámicos para la serie de líneas
    const lineDataWithColors = uniqueLineData.map((point, index) => {
      if (index === 0) return point;
      
      const prevPoint = uniqueLineData[index - 1];
      const currentPrice = parseFloat(point.value) || 0;
      const prevPrice = parseFloat(prevPoint.value) || 0;
      
      return {
        ...point,
        color: currentPrice > prevPrice ? 'rgba(38, 166, 154, 1)' : 'rgba(239, 83, 80, 1)' // Verde si sube, rojo si baja
      };
    });

    lineSeries.setData(lineDataWithColors);
    
    // Función para calcular el color de las barras de volumen
    const getVolumeColor = (open: number, close: number): string => {
      if (close > open) {
        return '#26a69a'; // Verde para precio en alza
      } else if (close < open) {
        return '#ef5350'; // Rojo para precio en baja
      } else {
        return '#9e9e9e'; // Gris para precio sin cambio
      }
    };
    
    // Convert volume data from API con colores dinámicos
    const volumeData = data
      .filter(point => point.time && point.volume !== undefined && point.volume !== null)
      .map(point => ({
        time: point.time,
        value: parseFloat(point.volume) || 0,
        color: getVolumeColor(
          parseFloat(point.open) || 0,
          parseFloat(point.close) || 0
        )
      }))
      .sort((a, b) => {
        // Handle both string and number time values
        const timeA = typeof a.time === 'string' ? a.time : String(a.time);
        const timeB = typeof b.time === 'string' ? b.time : String(b.time);
        return timeA.localeCompare(timeB);
      });

    const uniqueVolumeData = volumeData.reduce((acc: any[], current) => {
      const existing = acc.find(item => item.time === current.time);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log('📊 Volume data:', uniqueVolumeData.length, 'points');
    
    if (uniqueVolumeData.length > 0) {
      volumeSeries.setData(uniqueVolumeData);
    }
    
    chart.timeScale().fitContent();

    // Create tracking tooltip - TradingView Tracking implementation
    const toolTipMargin = 15;

    // Create and style the tooltip html element
    const toolTip = document.createElement('div');
    toolTip.style.cssText = `
      position: absolute; 
      display: none; 
      padding: 12px 16px; 
      box-sizing: border-box; 
      font-size: 12px; 
      text-align: center; 
      z-index: 1000; 
      top: 12px; 
      left: 12px; 
      pointer-events: none; 
      border: 1px solid; 
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif; 
      -webkit-font-smoothing: antialiased; 
      -moz-osx-font-smoothing: grayscale;
      background: rgba(255, 255, 255, 0.95);
      color: black;
      border-color: rgba( 38, 166, 154, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(8px);
      min-width: 100px;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
    `;
    containerRef.current.appendChild(toolTip);

    // Update tooltip on crosshair move - TradingView Tracking implementation
    chart.subscribeCrosshairMove(param => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > containerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > containerRef.current!.clientHeight
      ) {
        toolTip.style.display = 'none';
      } else {
        // time will be in the same format that we supplied to setData.
        // thus it will be YYYY-MM-DD
        const dateStr = param.time;
        toolTip.style.display = 'block';
        const seriesData = param.seriesData.get(areaSeries);
        
        // Get the real price from the original data
        let price = null;
        let volume = null;
        if (seriesData) {
          price = (seriesData as any).value;
        }
        
        // If no price from series data, find it in the original data
        if (price === undefined || price === null) {
          const originalDataPoint = data.find(point => point.time === dateStr);
          if (originalDataPoint) {
            price = originalDataPoint.value;
            volume = originalDataPoint.volume;
          }
        } else {
          // Get volume from original data
          const originalDataPoint = data.find(point => point.time === dateStr);
          if (originalDataPoint) {
            volume = originalDataPoint.volume;
          }
        }
        
        if (price !== undefined && price !== null) {
          // Format price with appropriate decimal places
          const formattedPrice = price < 0.01 
            ? price.toFixed(8) 
            : price < 1 
            ? price.toFixed(6) 
            : price.toFixed(2);
          
          // Format date properly
          let formattedDate = String(dateStr);
          if (typeof dateStr === 'number' || /^\d+$/.test(String(dateStr))) {
            // If it's a timestamp, convert to readable date
            const date = new Date(parseInt(String(dateStr)) * 1000);
            formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          } else if (typeof dateStr === 'string' && dateStr.includes('-')) {
            // If it's already a date string, format it nicely
            const date = new Date(dateStr);
            formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
          
          // Create content with proper styling (removed volume)
          toolTip.innerHTML = `
            <div style="color: rgba( 38, 166, 154, 1); font-weight: bold; margin-bottom: 4px; font-size: 11px;">Token Price</div>
            <div style="font-size: 18px; margin: 6px 0px; color: black; font-weight: bold; word-break: break-all;">
              $${formattedPrice}
            </div>
            <div style="color: #666; font-size: 10px; margin-top: 2px;">
              ${formattedDate}
            </div>
          `;
          
          // Show tooltip to get dimensions
          toolTip.style.display = 'block';
          
          // Get actual dimensions after content is set
          const toolTipWidth = toolTip.offsetWidth;
          const toolTipHeight = toolTip.offsetHeight;
          
          // Improved positioning - more responsive
          const containerWidth = containerRef.current!.clientWidth;
          const containerHeight = containerRef.current!.clientHeight;
          
          // Calculate tooltip position (centered on cursor)
          let left = param.point.x - toolTipWidth / 2;
          let top = param.point.y - toolTipHeight - 10;
          
          // Keep tooltip within bounds
          if (left < 10) left = 10;
          if (left + toolTipWidth > containerWidth - 10) left = containerWidth - toolTipWidth - 10;
          if (top < 10) top = param.point.y + 10;
          if (top + toolTipHeight > containerHeight - 10) top = containerHeight - toolTipHeight - 10;
          
          toolTip.style.left = left + 'px';
          toolTip.style.top = top + 'px';
        }
      }
    });

    // Add click functionality
    chart.subscribeClick((param) => {
      if (param.point) {
        const clickedTime = param.time;
        const closestPoint = data.find(point => point.time === clickedTime);
        
        if (closestPoint) {
          setSelectedPoint(closestPoint);
          console.log('🎯 Point selected:', closestPoint);
        }
      }
    });

    console.log('✅ Time series chart created successfully');

    // Store chart reference for resize handling
    chartRef.current = chart;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [data, height]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Also handle container resize
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);


  return (
    <div className={`w-full ${className}`}>
      {/* Chart Controls */}
      <div className="flex flex-col items-start justify-between mb-2 gap-2 sm:flex-row sm:items-center sm:mb-4 sm:gap-4">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          
          {/* Period Selector - Horizontal Buttons */}
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
          height: window.innerWidth < 768 ? '250px' : window.innerWidth < 1024 ? '300px' : `${height}px`, // Responsive heights
          minHeight: '200px', // Reduced minimum height for mobile
          maxHeight: '600px' // Maximum height to prevent overflow
        }}
      >
        {/* Custom Logo */}
        <div className="absolute bottom-8 left-2 z-10">
          <a 
            href="/"
            className="block"
          >
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