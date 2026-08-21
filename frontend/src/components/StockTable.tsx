"use client";

import { Stock } from "@/types/stock";
import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

interface StockTableProps {
  stocks: Stock[];
}

export default function StockTable({ stocks }: StockTableProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(2)}T`;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    return num.toLocaleString("en-IN");
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Price</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Change</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Volume</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Mkt Cap</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">P/E</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Sector</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.symbol} className="border-b border-gray-900 hover:bg-gray-900 transition-colors">
              <td className="py-3 px-4">
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-500">{stock.companyName}</div>
              </td>
              <td className="text-right py-3 px-4 font-mono">
                ₹{stock.lastPrice.toFixed(2)}
              </td>
              <td className="text-right py-3 px-4">
                <div className={clsx("flex items-center justify-end gap-1", stock.changeAbsolute >= 0 ? "text-green-500" : "text-red-500")}>
                  {stock.changeAbsolute >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="font-mono">
                    {stock.changeAbsolute >= 0 ? "+" : ""}{stock.changeAbsolute.toFixed(2)}
                  </span>
                  <span className="text-sm">
                    ({stock.changeAbsolute >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-4 font-mono text-gray-300">
                {formatNumber(stock.volume)}
              </td>
              <td className="text-right py-3 px-4 font-mono text-gray-300">
                ₹{formatNumber(stock.marketCap)}
              </td>
              <td className="text-right py-3 px-4 font-mono text-gray-300">
                {stock.pe !== null ? stock.pe.toFixed(1) : 'N/A'}
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300">
                  {stock.sector}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {stocks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No stocks match your filters
        </div>
      )}
    </div>
  );
}