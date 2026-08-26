"use client";

import React, { useState } from "react";
import { X, Rss, Plus, Trash2, CheckCircle2, Globe, Shield, RefreshCw } from "lucide-react";
import { FeedSource, Category } from "@/lib/types";

interface FeedManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: FeedSource[];
  locale?: "ko" | "en";
  onToggleFeed: (feedId: string) => void;
  onAddCustomFeed: (feed: Partial<FeedSource>) => void;
  onResetFeeds: () => void;
}

export function FeedManagerModal({
  isOpen,
  onClose,
  feeds,
  locale = "ko",
  onToggleFeed,
  onAddCustomFeed,
  onResetFeeds,
}: FeedManagerModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<Category>(locale === "en" ? "Crypto & Bitcoin" : "암호화폐 & 비트코인");
  const isEn = locale === "en";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    onAddCustomFeed({
      id: "custom-" + Date.now(),
      name: name.trim(),
      url: url.trim(),
      category,
      enabled: true,
      isCustom: true,
      type: "rss",
      lang: isEn ? "en" : "ko",
    });

    setName("");
    setUrl("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {isEn ? "Financial RSS Feeds & Sources Manager" : "금융 RSS 피드 및 소스 관리"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? "Customize stock, crypto, and macro intelligence feeds" : "원하는 증권사, 블록체인 미디어 RSS를 자유롭게 켜고 끄거나 추가하세요"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* Add Custom Feed Form */}
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-3">
            <h4 className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isEn ? "Add Custom Financial RSS Source" : "맞춤 금융 RSS 소스 등록"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isEn ? "Source Name (e.g. Bloomberg Tech)" : "미디어 이름 (예: 블룸버그 코인)"}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              >
                {isEn ? (
                  <>
                    <option value="Crypto & Bitcoin">Crypto & Bitcoin</option>
                    <option value="US Equities & Tech">US Equities & Tech</option>
                    <option value="Macro & Central Banks">Macro & Central Banks</option>
                    <option value="DeFi & Web3">DeFi & Web3</option>
                    <option value="AI & Semi Stocks">AI & Semi Stocks</option>
                    <option value="Commodities & FX">Commodities & FX</option>
                  </>
                ) : (
                  <>
                    <option value="암호화폐 & 비트코인">암호화폐 & 비트코인</option>
                    <option value="미국 증시 & 테크">미국 증시 & 테크</option>
                    <option value="국내 주식 & 증권">국내 주식 & 증권</option>
                    <option value="거시경제 & 금리">거시경제 & 금리</option>
                    <option value="DeFi & 온체인">DeFi & 온체인</option>
                    <option value="AI & 반도체주">AI & 반도체주</option>
                    <option value="원자재 & 외환">원자재 & 외환</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/rss"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEn ? "Add Source" : "소스 추가"}</span>
              </button>
            </div>
          </form>

          {/* Feeds List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{isEn ? "Configured Feeds" : "활성화된 피드 목록"} ({feeds.length})</span>
              <button
                onClick={onResetFeeds}
                className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isEn ? "Reset Defaults" : "기본값 초기화"}</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={feed.enabled !== false}
                      onChange={() => onToggleFeed(feed.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {feed.name}
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold shrink-0">
                          {feed.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {feed.url}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    feed.enabled !== false
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {feed.enabled !== false ? (isEn ? "Active" : "활성") : (isEn ? "Disabled" : "비활성")}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
