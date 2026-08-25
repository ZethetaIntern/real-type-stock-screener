'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  Time,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { useStockStore } from '@/stores/stockStore';
import { generateOHLCV } from '@/lib/stockData';
import {
  calculateSMA,
  calculateEMA,
  calculateBollinger,
  calculateRSI,
  calculateVolumeProfile,
} from '@/lib/indicators';
import { OHLCV } from '@/types/stock';
import clsx from 'clsx';
import ChartToolbar, { Timeframe } from './ChartToolbar';
import dynamic from 'next/dynamic';

const TIMEFRAME_DAYS: Record<Timeframe, number> = {
  '1D': 1,
  '1W': 5,
  '1M': 22,
  '3M': 66,
  '1Y': 252,
  '5Y': 1260,
};

// Extra history so indicators (SMA-50, EMA-26) have data to warm up on,
// while the visible window stays limited to the selected timeframe.
const WARMUP = 60;

const CHART_THEME = {
  dark: {
    background: '#111827',
    text: '#9ca3af',
    grid: '#1f2937',
    border: '#374151',
    container: 'bg-gray-900',
  },
  light: {
    background: '#ffffff',
    text: '#374151',
    grid: '#e5e7eb',
    border: '#d1d5db',
    container: 'bg-white border border-gray-200',
  },
} as const;

const DynamicChart = dynamic(() => Promise.resolve({ default: ChartComponent }), {
  ssr: false,
  loading: () => (
    <div className="h-[650px] flex items-center justify-center bg-gray-900 rounded-lg">
      <div className="text-gray-400">Loading chart...</div>
    </div>
  ),
});

interface ChartComponentProps {
  symbol: string;
  timeframe?: Timeframe;
}

function ChartComponent({ symbol, timeframe: initialTimeframe = '1M' }: ChartComponentProps) {
  const mainChartContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartContainerRef = useRef<HTMLDivElement>(null);
  const mainChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showVolumeProfile, setShowVolumeProfile] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);

  const { stocks, livePrices, theme } = useStockStore();
  const stock = stocks.find((s) => s.symbol === symbol);
  const livePrice = livePrices.get(symbol);
  const colors = theme === 'light' ? CHART_THEME.light : CHART_THEME.dark;

  const ohlcvData = useRef<OHLCV[]>([]);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const buildMainChart = useCallback(() => {
    if (!mainChartContainerRef.current || !stock) return;

    const price = livePrice?.price ?? stock.lastPrice;
    const days = TIMEFRAME_DAYS[timeframe];
    ohlcvData.current = generateOHLCV(price, days + WARMUP, 0.02, stock.avgVolume20D);

    if (mainChartRef.current) {
      mainChartRef.current.remove();
      mainChartRef.current = null;
    }

    const chart = createChart(mainChartContainerRef.current, {
      width: mainChartContainerRef.current.clientWidth,
      height: mainChartContainerRef.current.clientHeight || (showRSI ? 350 : 500),
      layout: {
        textColor: colors.text,
        background: { color: colors.background },
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: colors.border },
    });

    mainChartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#16a34a',
      borderDownColor: '#dc2626',
      wickUpColor: '#16a34a',
      wickDownColor: '#dc2626',
    });
    candlestickSeriesRef.current = candlestickSeries;

    const candleData: CandlestickData[] = ohlcvData.current.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candlestickSeries.setData(candleData);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(
      ohlcvData.current.map((c) => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
      }))
    );

    const closePrices = ohlcvData.current.map((c) => c.close);

    if (showSMA) {
      const sma20 = calculateSMA(closePrices, 20);
      const sma50 = calculateSMA(closePrices, 50);

      const sma20Series = chart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 1,
        title: 'SMA 20',
      });
      sma20Series.setData(
        sma20
          .map(
            (val, i) => val !== undefined && { time: ohlcvData.current[i].time as Time, value: val }
          )
          .filter((x): x is LineData => x !== false && x !== undefined)
      );

      const sma50Series = chart.addSeries(LineSeries, {
        color: '#f97316',
        lineWidth: 1,
        title: 'SMA 50',
      });
      sma50Series.setData(
        sma50
          .map(
            (val, i) => val !== undefined && { time: ohlcvData.current[i].time as Time, value: val }
          )
          .filter((x): x is LineData => x !== false && x !== undefined)
      );
    }

    if (showEMA) {
      const ema12 = calculateEMA(closePrices, 12);
      const ema26 = calculateEMA(closePrices, 26);

      const ema12Series = chart.addSeries(LineSeries, {
        color: '#06b6d4',
        lineWidth: 1,
        title: 'EMA 12',
      });
      ema12Series.setData(
        ema12
          .map(
            (val, i) => val !== undefined && { time: ohlcvData.current[i].time as Time, value: val }
          )
          .filter((x): x is LineData => x !== false && x !== undefined)
      );

      const ema26Series = chart.addSeries(LineSeries, {
        color: '#0ea5e9',
        lineWidth: 1,
        title: 'EMA 26',
      });
      ema26Series.setData(
        ema26
          .map(
            (val, i) => val !== undefined && { time: ohlcvData.current[i].time as Time, value: val }
          )
          .filter((x): x is LineData => x !== false && x !== undefined)
      );
    }

    if (showBollinger) {
      const bollinger = calculateBollinger(closePrices, 20, 2);

      const upperSeries = chart.addSeries(LineSeries, {
        color: '#8b5cf6',
        lineWidth: 1,
        title: 'BB Upper',
      });
      upperSeries.setData(
        bollinger.upper
          .map(
            (val, i) => val !== undefined && { time: ohlcvData.current[i].time as Time, value: val }
          )
          .filter((x): x is LineData => x !== false && x !== undefined)
      );

      const middleSeries = chart.addSeries(LineSeries, {
        color: '#8b5cf6',
        lineWidth: 1,
        lineStyle: 2,
        title: 'BB Middle',
      });
      middleSeries.setData(
        bollinger.middle
          .map(
            (val, i) => val !== undefined && { time: ohlcvData.current[i].time as Time, value: val }
          )
          .filter((x): x is LineData => x !== false && x !== undefined)
      );

      const lowerSeries = chart.addSeries(LineSeries, {
        color: '#8b5cf6',
        lineWidth: 1,
        title: 'BB Lower',
      });
      lowerSeries.setData(
        bollinger.lower
          .map(
            (val, i) => val !== undefined && { time: ohlcvData.current[i].time as Time, value: val }
          )
          .filter((x): x is LineData => x !== false && x !== undefined)
      );
    }

    if (showVolumeProfile) {
      renderVolumeProfile(chart);
    }

    // Show only the selected timeframe's recent bars; warmup bars stay off-screen
    const visibleBars = Math.max(1, Math.round(days * 0.714));
    const totalBars = ohlcvData.current.length;
    chart.timeScale().setVisibleLogicalRange({
      from: Math.max(0, totalBars - visibleBars),
      to: totalBars - 1,
    });

    if (showRSI && rsiChartRef.current) {
      syncTimeScales(chart, rsiChartRef.current);
    }
  }, [
    stock,
    showSMA,
    showEMA,
    showBollinger,
    showRSI,
    showVolumeProfile,
    timeframe,
    livePrice,
    colors,
  ]);

  const buildRSIChart = useCallback(() => {
    if (!rsiChartContainerRef.current || !stock) return;

    if (rsiChartRef.current) {
      rsiChartRef.current.remove();
      rsiChartRef.current = null;
    }

    if (!showRSI) return;

    const price = livePrice?.price ?? stock.lastPrice;
    const days = TIMEFRAME_DAYS[timeframe];
    const data =
      ohlcvData.current.length > 0
        ? ohlcvData.current
        : generateOHLCV(price, days + WARMUP, 0.02, stock.avgVolume20D);
    const closePrices = data.map((c) => c.close);
    const rsi = calculateRSI(closePrices, 14);

    const rsiChart = createChart(rsiChartContainerRef.current, {
      width: rsiChartContainerRef.current.clientWidth,
      height: rsiChartContainerRef.current.clientHeight || 150,
      layout: {
        textColor: colors.text,
        background: { color: colors.background },
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { timeVisible: true, secondsVisible: false, visible: false },
      rightPriceScale: { borderColor: colors.border, scaleMargins: { top: 0.1, bottom: 0.1 } },
    });

    rsiChartRef.current = rsiChart;

    const rsiSeries = rsiChart.addSeries(LineSeries, {
      color: '#8B5CF6',
      lineWidth: 2,
      title: 'RSI (14)',
    });

    const rsiData: LineData[] = rsi
      .map((val, i) => val !== undefined && { time: data[i].time as Time, value: val })
      .filter((x): x is LineData => x !== false && x !== undefined);
    rsiSeries.setData(rsiData);

    rsiSeries.createPriceLine({
      price: 70,
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Overbought',
    });

    rsiSeries.createPriceLine({
      price: 30,
      color: '#22c55e',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: 'Oversold',
    });

    rsiSeries.createPriceLine({
      price: 50,
      color: '#6b7280',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: false,
    });

    const visibleBars = Math.max(1, Math.round(days * 0.714));
    const totalBars = data.length;
    rsiChart.timeScale().setVisibleLogicalRange({
      from: Math.max(0, totalBars - visibleBars),
      to: totalBars - 1,
    });

    if (mainChartRef.current) {
      syncTimeScales(mainChartRef.current, rsiChart);
    }
  }, [stock, showRSI, timeframe, livePrice, colors]);

  function syncTimeScales(chart1: IChartApi, chart2: IChartApi) {
    const sync = (source: IChartApi, target: IChartApi) => {
      source.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          if (range) {
            target.timeScale().setVisibleLogicalRange(range);
          }
        }, 50);
      });
    };

    sync(chart1, chart2);
    sync(chart2, chart1);
  }

  function renderVolumeProfile(chart: IChartApi) {
    const visibleRange = chart.timeScale().getVisibleLogicalRange();
    if (!visibleRange) return;

    const from = Math.max(0, Math.floor(visibleRange.from));
    const to = Math.min(ohlcvData.current.length - 1, Math.ceil(visibleRange.to));
    const visibleCandles = ohlcvData.current.slice(from, to + 1);

    if (visibleCandles.length === 0) return;

    const profile = calculateVolumeProfile(visibleCandles, 20);
    const maxVolume = Math.max(...profile.volumes, 1);

    for (let i = 0; i < profile.priceLevels.length; i++) {
      const normalizedVol = profile.volumes[i] / maxVolume;

      const candlestickSeries = candlestickSeriesRef.current;
      if (candlestickSeries) {
        candlestickSeries.createPriceLine({
          price: profile.priceLevels[i],
          color: `rgba(245,158,11,${0.15 + normalizedVol * 0.4})`,
          lineWidth: Math.max(1, Math.min(4, Math.round(normalizedVol * 4))) as 1 | 2 | 3 | 4,
          lineStyle: 0,
          axisLabelVisible: false,
        });
      }
    }
  }

  useEffect(() => {
    buildMainChart();

    const mainEl = mainChartContainerRef.current;
    const rsiEl = rsiChartContainerRef.current;

    const applySize = () => {
      if (mainEl && mainChartRef.current) {
        mainChartRef.current.applyOptions({
          width: mainEl.clientWidth,
          height: mainEl.clientHeight,
        });
      }
      if (rsiEl && rsiChartRef.current) {
        rsiChartRef.current.applyOptions({ width: rsiEl.clientWidth, height: rsiEl.clientHeight });
      }
    };

    const ro = new ResizeObserver(applySize);
    if (mainEl) ro.observe(mainEl);
    if (rsiEl) ro.observe(rsiEl);

    return () => {
      ro.disconnect();
      if (mainChartRef.current) {
        mainChartRef.current.remove();
        mainChartRef.current = null;
      }
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
      }
    };
  }, [buildMainChart]);

  useEffect(() => {
    buildRSIChart();
  }, [buildRSIChart]);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !livePrice) return;

    candlestickSeriesRef.current.update({
      time: Math.floor(Date.now() / 1000) as Time,
      open: livePrice.price,
      high: livePrice.price * 1.001,
      low: livePrice.price * 0.999,
      close: livePrice.price,
    });
  }, [livePrice]);

  const currentPrice = livePrice?.price ?? stock?.lastPrice ?? 0;
  const change = livePrice?.change ?? stock?.changeAbsolute ?? 0;
  const changePercent = livePrice?.changePercent ?? stock?.changePercent ?? 0;

  return (
    <div className={clsx('rounded-lg p-4 flex flex-col h-full', colors.container)}>
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{symbol}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{stock?.companyName}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{currentPrice.toFixed(2)}
          </div>
          <div className={`text-sm ${change >= 0 ? 'text-positive' : 'text-negative'}`}>
            {change >= 0 ? '+' : ''}
            {change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="mb-4 shrink-0">
        <ChartToolbar
          showSMA={showSMA}
          showEMA={showEMA}
          showBollinger={showBollinger}
          showRSI={showRSI}
          showVolumeProfile={showVolumeProfile}
          timeframe={timeframe}
          onToggleSMA={() => setShowSMA(!showSMA)}
          onToggleEMA={() => setShowEMA(!showEMA)}
          onToggleBollinger={() => setShowBollinger(!showBollinger)}
          onToggleRSI={() => setShowRSI(!showRSI)}
          onToggleVolumeProfile={() => setShowVolumeProfile(!showVolumeProfile)}
          onTimeframeChange={setTimeframe}
        />
      </div>

      <div
        ref={mainChartContainerRef}
        className="w-full flex-1 min-h-0 rounded-lg overflow-hidden"
      />

      {showRSI && (
        <div className="mt-1 shrink-0">
          <div className="text-xs text-gray-600 dark:text-gray-500 mb-1 px-1">RSI (14)</div>
          <div ref={rsiChartContainerRef} className="w-full h-[150px] rounded-lg overflow-hidden" />
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600 dark:text-gray-500 shrink-0">
        <p>Indicators: SMA, EMA, Bollinger Bands, RSI, Volume Profile</p>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Note: This is a demo chart with simulated data. Real trading platforms use live market
          data.
        </p>
      </div>
    </div>
  );
}

interface StockChartProps {
  symbol: string;
  timeframe?: Timeframe;
}

export default function StockChart(props: StockChartProps) {
  return <DynamicChart {...props} />;
}
