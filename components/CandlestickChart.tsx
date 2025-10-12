'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, createTextWatermark, ColorType } from 'lightweight-charts';

interface CandlestickChartProps {
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

export default function CandlestickChart({
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
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Effect to create candlestick chart
  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    console.log('🎯 Creating candlestick chart with API data:', data.length, 'points');

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
        background: { type: ColorType.Solid, color: 'black' },
        attributionLogo: false, // Hide TradingView logo
        fontSize: fontSize
      },
      width: containerRef.current.clientWidth,
      height: chartHeight,
      autoSize: true, // Enable auto sizing
      leftPriceScale: {
        visible: false, // Hide left price scale
      },
      rightPriceScale: {
        visible: true, // Show price scale on the right
        borderVisible: false,
        scaleMargins: {
          top: priceScaleMargin,
          bottom: priceScaleMargin,
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
        mode: 1, // Normal crosshair mode
        vertLine: {
          color: '#888',
          width: isMobile ? 1 : 2,
          style: 0,
          labelBackgroundColor: '#26a69a',
        },
        horzLine: {
          color: '#888',
          width: isMobile ? 1 : 2,
          style: 0,
          labelBackgroundColor: '#26a69a',
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
        horzTouchDrag: true, // Mejorar touch en móvil
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', 
      downColor: '#ef5350', 
      borderVisible: false,
      wickUpColor: '#26a69a', 
      wickDownColor: '#ef5350',
      priceFormat: {
        type: 'price',
        precision: isMobile ? 4 : 8, // Menos precisión en móvil
        minMove: 0.00000001,
      },
      lastValueVisible: true,
      priceLineVisible: true,
    });

    // Add watermark
    createTextWatermark(chart.panes()[0], {
      horzAlign: 'center',
      vertAlign: 'center',
      lines: [
        {
          text: 'ZCreate',
          color: 'rgba(255, 255, 255, 0.3)',
          fontSize: isMobile ? 16 : 24, // Texto más pequeño en móvil
          fontFamily: 'Arial, sans-serif',
        },
      ],
    });

    // Process candlestick data from API
    const candlestickData = data
      .filter(point => point.time && point.open !== undefined && point.high !== undefined && point.low !== undefined && point.close !== undefined)
      .map(point => ({
        time: point.time,
        open: parseFloat(point.open) || 0,
        high: parseFloat(point.high) || 0,
        low: parseFloat(point.low) || 0,
        close: parseFloat(point.close) || 0
      }))
      .sort((a, b) => {
        const timeA = typeof a.time === 'string' ? a.time : String(a.time);
        const timeB = typeof b.time === 'string' ? b.time : String(b.time);
        return timeA.localeCompare(timeB);
      });

    const uniqueCandlestickData = candlestickData.reduce((acc: any[], current) => {
      const existing = acc.find(item => item.time === current.time);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log('📊 Processed candlestick data:', uniqueCandlestickData.length, 'points');

    if (uniqueCandlestickData.length === 0) {
      console.warn('⚠️ No valid data for candlestick chart');
      return () => {
        chart.remove();
      };
    }

    candlestickSeries.setData(uniqueCandlestickData);
    chart.timeScale().fitContent();

    // ✅ FORZAR ELIMINACIÓN DE CUALQUIER ELEMENTO DE TRADINGVIEW
    setTimeout(() => {
      const watermarks = containerRef.current?.querySelectorAll('[class*="watermark"], [class*="Watermark"], a[href*="tradingview"], svg[viewBox*="24"], [d*="M14 2H2v6h6v9h6V2"]');
      watermarks?.forEach(el => {
        el.remove();
        console.log('🗑️ Removed potential watermark element');
      });
      
      // También eliminar cualquier SVG que contenga el path específico de TradingView
      const svgs = containerRef.current?.querySelectorAll('svg');
      svgs?.forEach(svg => {
        const path = svg.querySelector('path[d*="M14 2H2v6h6v9h6V2"]');
        if (path) {
          svg.remove();
          console.log('🗑️ Removed TradingView SVG logo');
        }
      });
    }, 100);

    // Add click functionality to show detailed information
    chart.subscribeClick((param) => {
      if (param.point) {
        // Find the closest point in original data
        const clickedTime = param.time;
        const closestPoint = data.find(point => point.time === clickedTime);
        
        if (closestPoint) {
          setSelectedPoint(closestPoint);
          console.log('🎯 Point selected:', closestPoint);
        }
      }
    });

    console.log('✅ Candlestick chart created successfully');

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
              <label className="block text-xs font-medium text-white mb-2 sm:text-sm">
                📅 Data Period:
              </label>
              <div className="flex flex-wrap gap-1">
                {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => onPeriodChange(period)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                      selectedPeriod === period
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600'
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
        <div className="flex items-center justify-center h-[250px] sm:h-[400px] text-gray-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
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
        className="w-full border border-gray-600 rounded relative"
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
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <h4 className="text-xs sm:text-sm font-semibold text-green-800 mb-2">
            🎯 Selected Point Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <p><strong>📅 Date:</strong> {selectedPoint.time}</p>
              <p><strong>💰 Close:</strong> {selectedPoint.close?.toFixed(8)} USD</p>
              <p><strong>📈 High:</strong> {selectedPoint.high?.toFixed(8)} USD</p>
              <p><strong>📉 Low:</strong> {selectedPoint.low?.toFixed(8)} USD</p>
            </div>
            <div>
              <p><strong>📝 Open:</strong> {selectedPoint.open?.toFixed(8)} USD</p>
              <p><strong>📊 Volume:</strong> {selectedPoint.volume?.toFixed(2)} USD</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600">
            💡 Click on any candlestick to see detailed information
          </div>
        </div>
      )}

    </div>
  );
}