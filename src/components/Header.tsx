"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  Search,
  Bookmark,
  Rss,
  RefreshCw,
  Clock,
  Languages,
  Activity,
  Zap,
  Coins
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  nextSyncSeconds: number;
  locale?: "ko" | "en";
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onOpenBriefing: () => void;
  onOpenFeeds: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  nextSyncSeconds,
  locale = "ko",
  bookmarkCount,
  onOpenBookmarks,
  onOpenBriefing,
  onOpenFeeds,
}: HeaderProps) {
  const isEn = locale === "en";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href={isEn ? "/en" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {isEn ? "FinPulse" : "핀 & 크립토 펄스"}
                </span>
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                  {isEn ? "Intelligence" : "인텔리전스"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                {isEn ? "Real-Time Equities & Crypto Intelligence" : "실시간 증시 & 암호화폐 투자 인텔리전스 허브"}
              </p>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isEn ? "Search $BTC, $NVDA, Fed, ETF, yields..." : "종목($NVDA), 코인($BTC), 연준 금리, 테마 검색..."}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Refresh Timer */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-mono transition-all"
            title={isEn ? "Click to refresh now" : "지금 즉시 새로고침"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : `${nextSyncSeconds}s`}</span>
          </button>

          {/* Morning Market Bell AI Briefing Button */}
          <button
            onClick={onOpenBriefing}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            title={isEn ? "Generate Morning Market Digest" : "장전 모닝벨 & 코인 브리핑"}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">{isEn ? "Market Digest" : "장전 모닝벨"}</span>
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="relative p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-xs"
            title={isEn ? "Saved stories" : "저장한 기사"}
          >
            <Bookmark className="w-4 h-4" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Feed Manager */}
          <button
            onClick={onOpenFeeds}
            className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-xs"
            title={isEn ? "Manage RSS feeds" : "피드 관리"}
          >
            <Rss className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <Link
            href={isEn ? "/" : "/en"}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
            title={isEn ? "Switch to Korean Edition" : "글로벌 영문 에디션으로 전환"}
          >
            <Languages className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEn ? "🇰🇷 KR" : "🇺🇸 Global"}</span>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

        </div>
      </div>
    </header>
  );
}
