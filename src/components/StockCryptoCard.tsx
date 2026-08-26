"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Bookmark,
  Share2,
  Check,
  ExternalLink,
  MessageSquare,
  Volume2,
  Sparkles,
  Zap
} from "lucide-react";
import { NewsArticle, SentimentState } from "@/lib/types";
import {
  getArticleSentiment,
  toggleArticleSentiment,
  getArticleComments
} from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface StockCryptoCardProps {
  article: NewsArticle;
  isBookmarked: boolean;
  locale?: "ko" | "en";
  viewMode?: "grid" | "list";
  onToggleBookmark: (art: NewsArticle) => void;
  onOpenReader: (art: NewsArticle) => void;
  onPlayAudio?: (text: string, lang?: "en" | "ko") => void;
}

export function StockCryptoCard({
  article,
  isBookmarked,
  locale = "ko",
  viewMode = "grid",
  onToggleBookmark,
  onOpenReader,
  onPlayAudio,
}: StockCryptoCardProps) {
  const [copied, setCopied] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentState>({
    userVote: null,
    bullishCount: article.bullishVotes || 15,
    bearishCount: article.bearishVotes || 4,
  });
  const [commentCount, setCommentCount] = useState(0);
  const isEn = locale === "en";

  useEffect(() => {
    setSentiment(
      getArticleSentiment(
        article.id,
        article.bullishVotes || 15,
        article.bearishVotes || 4
      )
    );
    const comments = getArticleComments(article.id);
    setCommentCount(comments.length);
  }, [article.id, article.bullishVotes, article.bearishVotes]);

  const handleBullish = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleArticleSentiment(
      article.id,
      "bullish",
      article.bullishVotes || 15,
      article.bearishVotes || 4
    );
    setSentiment({ ...updated });
  };

  const handleBearish = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleArticleSentiment(
      article.id,
      "bearish",
      article.bullishVotes || 15,
      article.bearishVotes || 4
    );
    setSentiment({ ...updated });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(article.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const totalVotes = sentiment.bullishCount + sentiment.bearishCount;
  const bullishRatio = totalVotes > 0 ? Math.round((sentiment.bullishCount / totalVotes) * 100) : 75;

  return (
    <div
      onClick={() => onOpenReader(article)}
      className="group relative rounded-3xl p-5 sm:p-6 bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/80 transition-all duration-300 shadow-luxury hover:shadow-luxury-hover cursor-pointer flex flex-col justify-between backdrop-blur-md"
    >
      <div>
        {/* Source & Timestamp */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80">
              {article.source}
            </span>

            {/* Target Tickers */}
            {article.tickers && article.tickers.length > 0 && (
              article.tickers.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="font-mono text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60"
                >
                  ${t}
                </span>
              ))
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {formatTime(article.pubDate)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2 mb-3 tracking-tight">
          {article.title}
        </h3>

        {/* Snippet */}
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4 font-medium">
          {article.contentSnippet}
        </p>

        {/* AI Financial Takeaway Pill */}
        {article.aiSummary?.tldr && article.aiSummary.tldr.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/80 dark:border-emerald-800/40 mb-4 text-xs text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center justify-between gap-1.5 font-bold text-[10px] uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                {isEn ? "AI Market Takeaway" : "AI 핵심 투자 요약"}
              </span>
              <span className="text-amber-700 dark:text-amber-400 font-mono font-black">
                {article.aiSummary.marketSentiment}
              </span>
            </div>
            <p className="line-clamp-2 leading-relaxed text-emerald-900/90 dark:text-emerald-200/90 font-medium">
              {article.aiSummary.tldr[0]}
            </p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {article.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              #{tag}
            </span>
          ))}
          <span className="text-[11px] text-slate-400 font-mono ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {article.readTimeMinutes} {isEn ? "min read" : "분"}
          </span>
        </div>
      </div>

      {/* Bullish vs Bearish Sentiment Voting Bar */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <button
            onClick={handleBullish}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all ${
              sentiment.userVote === "bullish"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800"
            }`}
            title={isEn ? "Vote Bullish (Upside)" : "상승(Bullish) 투표"}
          >
            <span>🐂 {isEn ? "Bullish" : "상승"}</span>
            <span className="font-mono text-[10px]">({sentiment.bullishCount})</span>
          </button>

          <span className="text-[10px] font-mono font-bold text-slate-400">
            {bullishRatio}% Bullish
          </span>

          <button
            onClick={handleBearish}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all ${
              sentiment.userVote === "bearish"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800"
            }`}
            title={isEn ? "Vote Bearish (Downside)" : "하락(Bearish) 투표"}
          >
            <span>🐻 {isEn ? "Bearish" : "하락"}</span>
            <span className="font-mono text-[10px]">({sentiment.bearishCount})</span>
          </button>
        </div>

        {/* Sentiment Gauge Bar */}
        <div className="w-full h-1.5 rounded-full bg-rose-200 dark:bg-rose-950 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${bullishRatio}%` }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenReader(article);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 transition-all"
            title={isEn ? "Open Discussion" : "토론 보기"}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>{commentCount}</span>
          </button>

          <div className="flex items-center gap-1">
            {onPlayAudio && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const textToRead = `${article.title}. ${article.aiSummary?.whyItMatters || article.contentSnippet}`;
                  onPlayAudio(textToRead, isEn ? "en" : "ko");
                }}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all"
                title={isEn ? "Audio briefing (US Voice)" : "AI 음성 브리핑 듣기"}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all"
              title={isEn ? "Share link" : "링크 복사"}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(article);
              }}
              className={`p-1.5 rounded-xl border transition-all ${
                isBookmarked
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-600"
              }`}
              title={isBookmarked ? (isEn ? "Remove bookmark" : "북마크 해제") : (isEn ? "Save story" : "기사 저장")}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>

            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all"
              title={isEn ? "Original report" : "원문 기사"}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
