"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Bookmark,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock,
  Share2,
  Check,
  Building2,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Activity
} from "lucide-react";
import { NewsArticle, AISummary, SentimentState } from "@/lib/types";
import {
  getStoredApiKey,
  getArticleSentiment,
  toggleArticleSentiment
} from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { InvestorComments } from "./InvestorComments";

interface ArticleModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  locale?: "ko" | "en";
  onToggleBookmark: (article: NewsArticle) => void;
  isPlayingAudio: boolean;
  isPausedAudio: boolean;
  onSpeak: (text: string, lang?: "en" | "ko") => void;
  onPauseAudio: () => void;
  onResumeAudio: () => void;
  onStopAudio: () => void;
}

export function ArticleModal({
  article,
  isOpen,
  onClose,
  isBookmarked,
  locale = "ko",
  onToggleBookmark,
  isPlayingAudio,
  isPausedAudio,
  onSpeak,
  onPauseAudio,
  onResumeAudio,
  onStopAudio,
}: ArticleModalProps) {
  const [copied, setCopied] = useState(false);
  const [customSummary, setCustomSummary] = useState<AISummary | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentState>({
    userVote: null,
    bullishCount: 15,
    bearishCount: 4,
  });

  const isEn = locale === "en" || article?.lang === "en";

  useEffect(() => {
    if (article) {
      setSentiment(
        getArticleSentiment(
          article.id,
          article.bullishVotes || 15,
          article.bearishVotes || 4
        )
      );
      setCustomSummary(null);
    }
  }, [article]);

  if (!isOpen || !article) return null;

  const currentSummary = customSummary || article.aiSummary;

  const handleBullish = () => {
    const updated = toggleArticleSentiment(
      article.id,
      "bullish",
      article.bullishVotes || 15,
      article.bearishVotes || 4
    );
    setSentiment({ ...updated });
  };

  const handleBearish = () => {
    const updated = toggleArticleSentiment(
      article.id,
      "bearish",
      article.bullishVotes || 15,
      article.bearishVotes || 4
    );
    setSentiment({ ...updated });
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(article.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeepAIAnalysis = async () => {
    try {
      setIsGeneratingAI(true);
      const userKey = getStoredApiKey();
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.fullContent || article.contentSnippet,
          category: article.category,
          apiKey: userKey,
          lang: isEn ? "en" : "ko",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setCustomSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Deep summary error:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const textToRead = isEn
    ? `${article.title}. Key Takeaway: ${currentSummary?.tldr?.join(". ") || article.contentSnippet}. Investor Impact: ${currentSummary?.whyItMatters || ""}`
    : `${article.title}. 핵심 요약: ${currentSummary?.tldr?.join(". ") || article.contentSnippet}. 투자 시사점: ${currentSummary?.whyItMatters || ""}`;

  let formattedDate = isEn ? "Just now" : "방금 전";
  try {
    if (isEn) {
      formattedDate = formatDistanceToNow(new Date(article.pubDate), { addSuffix: true });
    } else {
      formattedDate = formatDistanceToNow(new Date(article.pubDate), { addSuffix: true, locale: ko });
    }
  } catch {}

  const totalVotes = sentiment.bullishCount + sentiment.bearishCount;
  const bullishRatio = totalVotes > 0 ? Math.round((sentiment.bullishCount / totalVotes) * 100) : 75;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Container */}
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/80">
              {article.source}
            </span>
            {article.tickers && article.tickers.length > 0 && (
              article.tickers.map((t) => (
                <span
                  key={t}
                  className="font-mono text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60"
                >
                  ${t}
                </span>
              ))
            )}
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              {formattedDate}
            </span>
          </div>

          {/* Action Header & Bull/Bear Voting */}
          <div className="flex items-center gap-2">
            
            {/* Bullish & Bearish Buttons */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-200/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={handleBullish}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                  sentiment.userVote === "bullish"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:text-emerald-600"
                }`}
                title={isEn ? "Vote Bullish (Buy/Up)" : "상승(Bullish) 투표"}
              >
                <span>🐂</span>
                <span>{sentiment.bullishCount}</span>
              </button>
              <button
                onClick={handleBearish}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
                  sentiment.userVote === "bearish"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:text-rose-600"
                }`}
                title={isEn ? "Vote Bearish (Sell/Down)" : "하락(Bearish) 투표"}
              >
                <span>🐻</span>
                <span>{sentiment.bearishCount}</span>
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-all"
              title={isEn ? "Share link" : "링크 공유"}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onToggleBookmark(article)}
              className={`p-2 rounded-xl border transition-all ${
                isBookmarked
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-500 dark:text-slate-400 hover:text-emerald-600"
              }`}
              title={isEn ? (isBookmarked ? "Remove bookmark" : "Save article") : (isBookmarked ? "북마크 해제" : "기사 저장")}
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              title={isEn ? "Close (Esc)" : "창 닫기 (Esc)"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 max-h-[78vh] overflow-y-auto space-y-6">
          
          {/* Title & Byline */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-3 tracking-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {article.author && (
                <span>{isEn ? "By:" : "작성자:"} <strong className="text-slate-800 dark:text-slate-200">{article.author}</strong></span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {article.readTimeMinutes} {isEn ? "min read" : "분 분량"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                {article.category}
              </span>
            </div>
          </div>

          {/* Wall Street Voice Audio Player Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-amber-950/30 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                <Volume2 className={`w-5 h-5 ${isPlayingAudio ? "animate-pulse" : ""}`} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {isEn ? "Wall Street Audio Briefing (US Native Voice)" : "AI 금융 뉴스 음성 브리핑 (Audio)"}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isPlayingAudio
                    ? isPausedAudio
                      ? (isEn ? "Audio briefing paused." : "음성 재생이 일시 정지되었습니다.")
                      : (isEn ? "Broadcasting executive investment takeaways with US native voice..." : "전문 금융 앵커 톤으로 핵심 브리핑을 재생 중입니다...")
                    : (isEn ? "Listen to full AI market takeaway in native American voice" : "핵심 시황과 투자 요약을 음성으로 편안하게 청취하세요")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isPlayingAudio ? (
                <button
                  onClick={() => onSpeak(textToRead, isEn ? "en" : "ko")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isEn ? "Listen" : "듣기"}</span>
                </button>
              ) : (
                <>
                  {isPausedAudio ? (
                    <button
                      onClick={onResumeAudio}
                      className="p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                      title={isEn ? "Resume" : "이어듣기"}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={onPauseAudio}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                      title={isEn ? "Pause" : "일시정지"}
                    >
                      <Pause className="w-4 h-4 fill-current" />
                    </button>
                  )}
                  <button
                    onClick={onStopAudio}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-600/20 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs"
                    title={isEn ? "Stop audio" : "재생 중단"}
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* AI Financial Intelligence Analysis Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-black text-sm text-emerald-950 dark:text-emerald-300 tracking-wider">
                  {isEn ? "AI Financial Analyst Breakdown" : "AI 금융 애널리스트 심층 진단"}
                </span>
              </div>

              <button
                onClick={handleDeepAIAnalysis}
                disabled={isGeneratingAI}
                className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-600/20 hover:bg-emerald-200 dark:hover:bg-emerald-600/30 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 transition-all flex items-center gap-1.5"
                title={isEn ? "Regenerate AI analysis" : "Gemini AI 심층 분석 재생성"}
              >
                <Sparkles className={`w-3 h-3 ${isGeneratingAI ? "animate-spin" : ""}`} />
                <span>{isGeneratingAI ? (isEn ? "Analyzing..." : "분석 중...") : (isEn ? "Re-analyze" : "AI 재분석")}</span>
              </button>
            </div>

            {/* 3 Bullets */}
            {currentSummary?.tldr && currentSummary.tldr.length > 0 && (
              <ul className="space-y-2.5 mb-5 text-sm text-slate-800 dark:text-slate-200">
                {currentSummary.tldr.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Why It Matters Box */}
            {currentSummary?.whyItMatters && (
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-950/60 border border-emerald-100 dark:border-emerald-800/30 text-xs shadow-sm">
                <span className="font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1 text-[11px]">
                  💡 {isEn ? "WHY IT MATTERS TO INVESTORS" : "투자 시사점 (Why It Matters)"}
                </span>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                  {currentSummary.whyItMatters}
                </p>
              </div>
            )}

            {/* Meta Tags: Sentiment & Volatility */}
            <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isEn ? "Market Sentiment:" : "시장 심리:"}</span>
                <span className="font-black text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  {currentSummary?.marketSentiment || (isEn ? "Bullish 📈" : "상승 우세 📈")}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium ml-2">{isEn ? "Volatility Risk:" : "변동성 리스크:"}</span>
                <span className="font-black text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                  {currentSummary?.volatilityRisk || (isEn ? "Moderate 📊" : "보통 📊")}
                </span>
              </div>

              {currentSummary?.targetTickers && currentSummary.targetTickers.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? "Target Assets:" : "관련 자산:"}</span>
                  {currentSummary.targetTickers.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold border border-slate-200 dark:border-slate-700">
                      ${t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full Preview */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isEn ? "Original Story Preview" : "기사 본문 요약"}
            </h3>
            <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800">
              {article.fullContent || article.contentSnippet}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {article.tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                #{tag}
              </span>
            ))}
          </div>

          {/* Investor Discussion Section */}
          <InvestorComments articleId={article.id} locale={isEn ? "en" : "ko"} />

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            {isEn ? "Close" : "닫기"}
          </button>

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>{isEn ? `Read Full Story on ${article.source}` : `${article.source} 원문 기사 보기`}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
