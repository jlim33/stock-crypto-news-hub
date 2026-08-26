export type Category =
  // Korean Categories
  | "전체"
  | "암호화폐 & 비트코인"
  | "미국 증시 & 테크"
  | "국내 주식 & 증권"
  | "거시경제 & 금리"
  | "DeFi & 온체인"
  | "AI & 반도체주"
  | "원자재 & 외환"
  // English Categories
  | "All"
  | "Crypto & Bitcoin"
  | "US Equities & Tech"
  | "Korean Markets"
  | "Macro & Central Banks"
  | "DeFi & Web3"
  | "AI & Semi Stocks"
  | "Commodities & FX";

export interface AISummary {
  tldr: string[];
  whyItMatters: string;
  marketSentiment: "Strong Bullish 🐂" | "Bullish 📈" | "Neutral ⚖️" | "Bearish 📉" | "Extreme Fear ⚠️" | "강력 매수/상승 🐂" | "상승 우세 📈" | "중립/관망 ⚖️" | "하락 경계 📉" | "극심한 공포 ⚠️";
  volatilityRisk: "High Volatility ⚡" | "Moderate 📊" | "Stable 🛡️" | "초고변동성 ⚡" | "보통 📊" | "안정적 🛡️";
  targetTickers: string[]; // e.g. ["BTC", "ETH", "NVDA", "TSLA"]
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  avatarColor: string;
  content: string;
  createdAt: string; // ISO string
  likes: number;
}

export interface SentimentState {
  userVote: "bullish" | "bearish" | null;
  bullishCount: number;
  bearishCount: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  price: string;
  change24h: number; // e.g. +3.45 or -1.20
  isPositive: boolean;
  category: "crypto" | "stock" | "index";
}

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceUrl?: string;
  pubDate: string; // ISO 8601 string
  timestamp: number; // epoch ms
  category: Category;
  lang?: "ko" | "en";
  contentSnippet: string;
  fullContent?: string;
  author?: string;
  imageUrl?: string;
  readTimeMinutes: number;
  aiSummary?: AISummary;
  bullishVotes?: number;
  bearishVotes?: number;
  commentsCount?: number;
  tickers: string[]; // ["BTC", "ETH", "NVDA"]
  tags: string[];
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: Category;
  enabled: boolean;
  isCustom?: boolean;
  icon?: string;
  type: "rss" | "atom" | "json";
  lang?: "ko" | "en";
  lastFetched?: string;
  status?: "ok" | "error" | "pending";
}

export interface SyncResponse {
  articles: NewsArticle[];
  total: number;
  updatedAt: string;
  sourcesStatus: { [feedId: string]: { count: number; error?: string } };
}
