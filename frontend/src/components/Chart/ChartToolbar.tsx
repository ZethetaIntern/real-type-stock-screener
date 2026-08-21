'use client';

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

interface ChartToolbarProps {
  showSMA: boolean;
  showEMA: boolean;
  showBollinger: boolean;
  showRSI: boolean;
  showVolumeProfile: boolean;
  timeframe: Timeframe;
  onToggleSMA: () => void;
  onToggleEMA: () => void;
  onToggleBollinger: () => void;
  onToggleRSI: () => void;
  onToggleVolumeProfile: () => void;
  onTimeframeChange: (tf: Timeframe) => void;
}

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

export default function ChartToolbar({
  showSMA,
  showEMA,
  showBollinger,
  showRSI,
  showVolumeProfile,
  timeframe,
  onToggleSMA,
  onToggleEMA,
  onToggleBollinger,
  onToggleRSI,
  onToggleVolumeProfile,
  onTimeframeChange,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onToggleSMA}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            showSMA ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          SMA (20, 50)
        </button>
        <button
          onClick={onToggleEMA}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            showEMA ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          EMA (12, 26)
        </button>
        <button
          onClick={onToggleBollinger}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            showBollinger ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Bollinger Bands
        </button>
        <button
          onClick={onToggleRSI}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            showRSI ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          RSI (14)
        </button>
        <button
          onClick={onToggleVolumeProfile}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            showVolumeProfile ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Volume Profile
        </button>
      </div>

      <div className="flex gap-1 bg-gray-800 rounded p-0.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              timeframe === tf
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}
