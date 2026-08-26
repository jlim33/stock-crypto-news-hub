"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { MarketTicker } from "@/components/MarketTicker";
import { CategoryNav } from "@/components/CategoryNav";
import { HeroFeatured } from "@/components/HeroFeatured";
import { StockCryptoCard } from "@/components/StockCryptoCard";
import { ArticleModal } from "@/components/ArticleModal";
import { DailyBriefingModal } from "@/components/DailyBriefingModal";
import { BookmarksDrawer } from "@/components/BookmarksDrawer";
import { FeedManagerModal } from "@/components/FeedManagerModal";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useSpeech } from "@/hooks/useSpeech";
import { NewsArticle, Category, FeedSource } from "@/lib/types";
import { getAutoRefreshInterval } from "@/lib/storage";
import {
  TrendingUp,
  RefreshCw,
  Sparkles,
  Filter,
  BarChart3,
  SlidersHorizontal,
  Flame,
  ArrowUpDown
} from "lucide-react";

const CATEGORIES_KO: Category[] = [
  "전체",
  "암호화폐 & 비트코인",
  "미국 증시 & 테크",
  "국내 주식 & 증권",
  "거시경제 & 금리",
  "DeFi & 온체인",
  "AI & 반도체주",
  "원자재 & 외환"
];

export default function KoreanHomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "readTime">("latest");
  const [nextSyncSeconds, setNextSyncSeconds] = useState(60);

  // Modals & Drawers
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isFeedsOpen, setIsFeedsOpen] = useState(false);
  const [feeds, setFeeds] = useState<FeedSource[]>([]);

  // Hooks
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const {
    isPlaying: isPlayingAudio,
    isPaused: isPausedAudio,
    speak: onSpeak,
    pause: onPauseAudio,
    resume: onResumeAudio,
    stop: onStopAudio,
  } = useSpeech();

  const fetchArticles = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "전체") params.append("category", selectedCategory);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      params.append("sortBy", sortBy);
      params.append("lang", "ko");

      const res = await fetch(`/api/news?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error("Fetch articles error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  const loadFeeds = useCallback(async () => {
    try {
      const res = await fetch("/api/feeds");
      if (res.ok) {
        const data = await res.json();
        setFeeds(data.feeds || []);
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchArticles();
    loadFeeds();
  }, [fetchArticles, loadFeeds]);

  // Auto-refresh countdown
  useEffect(() => {
    const intervalMinutes = getAutoRefreshInterval() || 15;
    const intervalSeconds = intervalMinutes * 60;
    setNextSyncSeconds(intervalSeconds);

    const timer = setInterval(() => {
      setNextSyncSeconds((prev) => {
        if (prev <= 1) {
          fetchArticles();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchArticles]);

  const handleToggleFeed = async (feedId: string) => {
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", feedId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeeds(data.feeds || []);
        fetchArticles();
      }
    } catch (err) {}
  };

  const handleAddCustomFeed = async (feed: Partial<FeedSource>) => {
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", feed }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeeds(data.feeds || []);
        fetchArticles();
      }
    } catch (err) {}
  };

  const handleResetFeeds = async () => {
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeeds(data.feeds || []);
        fetchArticles();
      }
    } catch (err) {}
  };

  // Category counts
  const categoryCounts = articles.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    acc["전체"] = (acc["전체"] || 0) + 1;
    return acc;
  }, {} as { [cat: string]: number });

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      <div>
        {/* Live Market Price Ticker */}
        <MarketTicker locale="ko" />

        {/* Navigation Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={fetchArticles}
          isRefreshing={refreshing}
          nextSyncSeconds={nextSyncSeconds}
          locale="ko"
          bookmarkCount={bookmarks.length}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          onOpenBriefing={() => setIsBriefingOpen(true)}
          onOpenFeeds={() => setIsFeedsOpen(true)}
        />

        {/* Category Navbar */}
        <CategoryNav
          categories={CATEGORIES_KO}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          
          {/* Hero Featured Section (Only when viewing 'All' and no search) */}
          {selectedCategory === "전체" && !searchQuery.trim() && articles.length > 0 && (
            <HeroFeatured
              articles={articles}
              locale="ko"
              onSelectArticle={setSelectedArticle}
            />
          )}

          {/* Section Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {selectedCategory} 실시간 시장 뉴스
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {articles.length}건
              </span>
            </div>

            {/* Sort Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto text-xs font-bold">
              <button
                onClick={() => setSortBy("latest")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  sortBy === "latest"
                    ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                최신순
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  sortBy === "popular"
                    ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                🔥 투표 인기순
              </button>
              <button
                onClick={() => setSortBy("readTime")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  sortBy === "readTime"
                    ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                3분 숏컷순
              </button>
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
                >
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <Sparkles className="w-10 h-10 mx-auto text-emerald-400 mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                검색된 뉴스가 없습니다
              </h3>
              <p className="text-xs text-slate-400">
                다른 검색어를 입력하시거나 카테고리를 변경해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((art) => (
                <StockCryptoCard
                  key={art.id}
                  article={art}
                  isBookmarked={isBookmarked(art.id)}
                  locale="ko"
                  onToggleBookmark={toggleBookmark}
                  onOpenReader={setSelectedArticle}
                  onPlayAudio={onSpeak}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">핀 & 크립토 펄스 (FinPulse)</span>
            <span>• 실시간 증시 & 암호화폐 투자 인텔리전스</span>
          </div>
          <p>© 2026 FinPulse. Real-time Equity & Crypto Intelligence Platform.</p>
        </div>
      </footer>

      {/* Modals */}
      <ArticleModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isBookmarked={selectedArticle ? isBookmarked(selectedArticle.id) : false}
        locale="ko"
        onToggleBookmark={toggleBookmark}
        isPlayingAudio={isPlayingAudio}
        isPausedAudio={isPausedAudio}
        onSpeak={onSpeak}
        onPauseAudio={onPauseAudio}
        onResumeAudio={onResumeAudio}
        onStopAudio={onStopAudio}
      />

      <DailyBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        articles={articles}
        locale="ko"
      />

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        locale="ko"
        onSelectArticle={setSelectedArticle}
        onRemoveBookmark={toggleBookmark}
      />

      <FeedManagerModal
        isOpen={isFeedsOpen}
        onClose={() => setIsFeedsOpen(false)}
        feeds={feeds}
        locale="ko"
        onToggleFeed={handleToggleFeed}
        onAddCustomFeed={handleAddCustomFeed}
        onResetFeeds={handleResetFeeds}
      />

    </div>
  );
}
