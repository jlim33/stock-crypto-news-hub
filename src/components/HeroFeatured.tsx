"use client";

import React from "react";
import { Sparkles, TrendingUp, Clock, ArrowUpRight, Flame, Activity } from "lucide-react";
import { NewsArticle } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface HeroFeaturedProps {
  articles: NewsArticle[];
  locale?: "ko" | "en";
  onSelectArticle: (article: NewsArticle) => void;
}

export function HeroFeatured({ articles, locale = "ko", onSelectArticle }: HeroFeaturedProps) {
  if (!articles || articles.length === 0) return null;

  const isEn = locale === "en";
  const mainStory = articles[0];
  const sideStories = articles.slice(1, 4);

  const formatTime = (dateStr: string) => {
    try {
      if (isEn) {
        return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
      }
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ko });
    } catch {
      return isEn ? "Just now" : "방금 전";
    }
  };

  return (
    <div className="w-full my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Lead Story */}
        <div
          onClick={() => onSelectArticle(mainStory)}
          className="lg:col-span-7 group relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/50 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-emerald-950/30 border border-emerald-100 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 shadow-luxury hover:shadow-luxury-hover cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {isEn ? "Market Lead" : "주요 시장 헤드라인"}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 shadow-xs">
                {mainStory.source}
              </span>

              {mainStory.tickers && mainStory.tickers.length > 0 && (
                mainStory.tickers.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60"
                  >
                    ${t}
                  </span>
                ))
              )}

              <span className="text-xs text-slate-400 font-mono ml-auto">
                {formatTime(mainStory.pubDate)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight mb-4 tracking-tight">
              {mainStory.title}
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed mb-6 font-medium">
              {mainStory.aiSummary?.whyItMatters || mainStory.contentSnippet}
            </p>
          </div>

          <div className="pt-4 border-t border-emerald-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {mainStory.aiSummary?.marketSentiment || (isEn ? "Bullish 🐂" : "상승 우세 📈")}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {mainStory.readTimeMinutes} {isEn ? "min read" : "분 분량"}
              </span>
            </div>

            <span className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              {isEn ? "Read Takeaways" : "핵심 시사점 보기"} <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Side Movers */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {sideStories.map((story) => (
            <div
              key={story.id}
              onClick={() => onSelectArticle(story)}
              className="group p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer shadow-luxury hover:shadow-luxury-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80">
                      {story.source}
                    </span>
                    {story.tickers && story.tickers.length > 0 && (
                      <span className="font-mono text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200">
                        ${story.tickers[0]}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {formatTime(story.pubDate)}
                  </span>
                </div>

                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2 leading-snug tracking-tight">
                  {story.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {story.category}
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 transition-colors">
                  {isEn ? "AI Takeaway" : "AI 핵심 요약"} <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
