"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, Sparkles } from "lucide-react";
import { MarketAsset } from "@/lib/types";

const INITIAL_ASSETS: MarketAsset[] = [
  { symbol: "BTC", name: "Bitcoin", price: "$64,820", change24h: 3.42, isPositive: true, category: "crypto" },
  { symbol: "ETH", name: "Ethereum", price: "$3,490", change24h: 2.15, isPositive: true, category: "crypto" },
  { symbol: "SOL", name: "Solana", price: "$158.40", change24h: 5.80, isPositive: true, category: "crypto" },
  { symbol: "NVDA", name: "NVIDIA", price: "$128.90", change24h: 4.12, isPositive: true, category: "stock" },
  { symbol: "TSLA", name: "Tesla", price: "$224.50", change24h: -1.45, isPositive: false, category: "stock" },
  { symbol: "AAPL", name: "Apple", price: "$226.30", change24h: 0.85, isPositive: true, category: "stock" },
  { symbol: "MSFT", name: "Microsoft", price: "$448.20", change24h: 1.10, isPositive: true, category: "stock" },
  { symbol: "S&P 500", name: "S&P 500", price: "5,630.2", change24h: 0.62, isPositive: true, category: "index" },
  { symbol: "NASDAQ", name: "Nasdaq 100", price: "19,840.5", change24h: 1.18, isPositive: true, category: "index" },
  { symbol: "XRP", name: "Ripple", price: "$0.592", change24h: -0.80, isPositive: false, category: "crypto" },
];

export function MarketTicker({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const isEn = locale === "en";

  useEffect(() => {
    // Subtle realistic random fluctuations
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          const delta = (Math.random() * 0.2 - 0.1);
          const newChange = parseFloat((asset.change24h + delta).toFixed(2));
          return {
            ...asset,
            change24h: newChange,
            isPositive: newChange >= 0,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-900 text-white border-b border-slate-800 overflow-hidden py-2 px-4 flex items-center gap-3 text-xs">
      
      {/* Pulse Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold tracking-wide uppercase shrink-0 shadow-sm">
        <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>{isEn ? "Live Market Pulse" : "실시간 시세 펄스"}</span>
      </div>

      {/* Marquee Asset Items */}
      <div className="relative overflow-hidden flex-1 group">
        <div className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] gap-8">
          {assets.concat(assets).map((asset, idx) => (
            <div
              key={`${asset.symbol}-${idx}`}
              className="inline-flex items-center gap-2 text-slate-300 font-medium select-none"
            >
              <span className="font-bold text-white tracking-wide">
                ${asset.symbol}
              </span>
              <span className="font-mono text-slate-300 text-[11px]">
                {asset.price}
              </span>
              <span
                className={`flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-bold font-mono ${
                  asset.isPositive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {asset.isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {asset.isPositive ? `+${asset.change24h}%` : `${asset.change24h}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
