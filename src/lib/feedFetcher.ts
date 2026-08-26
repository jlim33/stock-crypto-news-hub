import Parser from "rss-parser";
import { NewsArticle, FeedSource, Category } from "./types";
import { DEFAULT_FEEDS } from "./defaultFeeds";
import { generateFinancialSummary, extractFinancialTickers } from "./aiSummarizer";
import fs from "fs";
import path from "path";
import os from "os";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 FinPulse/1.0",
    "Accept": "application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8"
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
      ["dc:creator", "creator"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

const CACHE_DIR = path.join(os.tmpdir(), "finpulse-cache");
const CACHE_FILE = path.join(CACHE_DIR, "news-cache.json");
const FEEDS_FILE = path.join(CACHE_DIR, "feeds-config.json");

let inMemoryArticles: NewsArticle[] = [];
let lastSyncTime: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch (e) {}
}

export function getSavedFeeds(): FeedSource[] {
  ensureCacheDir();
  try {
    if (fs.existsSync(FEEDS_FILE)) {
      const data = fs.readFileSync(FEEDS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Failed to read feeds file, using defaults:", e);
  }
  return DEFAULT_FEEDS;
}

export function saveFeeds(feeds: FeedSource[]) {
  ensureCacheDir();
  try {
    fs.writeFileSync(FEEDS_FILE, JSON.stringify(feeds, null, 2), "utf-8");
  } catch (e) {}
}

function loadCachedArticles(): NewsArticle[] {
  ensureCacheDir();
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

function saveCachedArticles(articles: NewsArticle[]) {
  ensureCacheDir();
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(articles, null, 2), "utf-8");
  } catch (e) {}
}

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 150));
}

function sanitizeSnippet(text?: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function autoRefineCategory(title: string, snippet: string, defaultCat: Category, lang: "ko" | "en"): Category {
  const text = (title + " " + snippet).toLowerCase();

  if (lang === "en") {
    if (text.includes("bitcoin") || text.includes("btc") || text.includes("crypto") || text.includes("ethereum") || text.includes("solana") || text.includes("altcoin")) {
      return "Crypto & Bitcoin";
    }
    if (text.includes("defi") || text.includes("uniswap") || text.includes("web3") || text.includes("on-chain") || text.includes("staking") || text.includes("airdrop")) {
      return "DeFi & Web3";
    }
    if (text.includes("nvidia") || text.includes("nvda") || text.includes("amd") || text.includes("tsmc") || text.includes("semiconductor") || text.includes("ai stock")) {
      return "AI & Semi Stocks";
    }
    if (text.includes("fed") || text.includes("fomc") || text.includes("cpi") || text.includes("inflation") || text.includes("powell") || text.includes("interest rate")) {
      return "Macro & Central Banks";
    }
    if (text.includes("gold") || text.includes("oil") || text.includes("crude") || text.includes("forex") || text.includes("dollar") || text.includes("yen")) {
      return "Commodities & FX";
    }
    return defaultCat;
  }

  // Korean Category Classification
  if (
    text.includes("비트코인") ||
    text.includes("이더리움") ||
    text.includes("가상자산") ||
    text.includes("업비트") ||
    text.includes("빗썸") ||
    text.includes("암호화폐") ||
    text.includes("코인")
  ) {
    return "암호화폐 & 비트코인";
  }

  if (
    text.includes("디파이") ||
    text.includes("defi") ||
    text.includes("웹3") ||
    text.includes("스테이킹") ||
    text.includes("온체인") ||
    text.includes("에어드랍")
  ) {
    return "DeFi & 온체인";
  }

  if (
    text.includes("엔비디아") ||
    text.includes("반도체") ||
    text.includes("sk하이닉스") ||
    text.includes("삼성전자") ||
    text.includes("hbm") ||
    text.includes("tsmc")
  ) {
    return "AI & 반도체주";
  }

  if (
    text.includes("금리") ||
    text.includes("연준") ||
    text.includes("fomc") ||
    text.includes("인플레이션") ||
    text.includes("환율") ||
    text.includes("cpi")
  ) {
    return "거시경제 & 금리";
  }

  if (
    text.includes("원유") ||
    text.includes("금값") ||
    text.includes("달러") ||
    text.includes("엔화") ||
    text.includes("환율")
  ) {
    return "원자재 & 외환";
  }

  if (text.includes("코스피") || text.includes("코스닥") || text.includes("증시") || text.includes("주가")) {
    return "국내 주식 & 증권";
  }

  return defaultCat;
}

function extractTags(title: string, snippet: string, category: Category, tickers: string[]): string[] {
  const text = (title + " " + snippet).toLowerCase();
  const tags: Set<string> = new Set();

  tags.add(category);
  tickers.forEach(t => tags.add(`$${t}`));

  const keywords = [
    "Bitcoin", "Ethereum", "Solana", "NVIDIA", "Tesla", "Apple", "Fed",
    "FOMC", "ETF", "Upbit", "Binance", "WallStreet", "코스피", "금리인하", "반도체"
  ];

  for (const kw of keywords) {
    if (new RegExp(`\\b${kw}\\b`, "i").test(text)) {
      tags.add(kw);
    }
  }

  return Array.from(tags).slice(0, 4);
}

async function fetchFeed(feed: FeedSource): Promise<NewsArticle[]> {
  try {
    const feedData = await parser.parseURL(feed.url);
    const articles: NewsArticle[] = [];
    const lang = feed.lang || (feed.id.includes("kr") || feed.id.includes("stock") ? "ko" : "en");

    for (const item of feedData.items || []) {
      if (!item.title || !item.link) continue;

      const title = item.title.trim();
      const rawItem = item as any;
      const snippet = sanitizeSnippet(
        rawItem.contentSnippet || rawItem.summary || rawItem.content || rawItem["content:encoded"] || ""
      );

      const pubDateObj = rawItem.pubDate || rawItem.isoDate ? new Date(rawItem.pubDate || rawItem.isoDate!) : new Date();
      const pubDate = isNaN(pubDateObj.getTime()) ? new Date().toISOString() : pubDateObj.toISOString();
      const timestamp = isNaN(pubDateObj.getTime()) ? Date.now() : pubDateObj.getTime();

      let imageUrl = "";
      if (rawItem.enclosure?.url && (rawItem.enclosure?.type?.startsWith("image/") || typeof rawItem.enclosure?.url === "string")) {
        imageUrl = rawItem.enclosure.url;
      } else if (rawItem.mediaContent?.$?.url) {
        imageUrl = rawItem.mediaContent.$.url;
      } else if (rawItem.mediaThumbnail?.$?.url) {
        imageUrl = rawItem.mediaThumbnail.$.url;
      }

      const id = Buffer.from(item.link).toString("base64url").slice(0, 32);

      const category = autoRefineCategory(title, snippet, feed.category, lang);
      const readTimeMinutes = estimateReadTime(snippet || title);
      const tickers = extractFinancialTickers(title, snippet);
      const tags = extractTags(title, snippet, category, tickers);

      const aiSummary = generateFinancialSummary(title, snippet, category, lang);

      articles.push({
        id,
        title,
        link: item.link,
        source: feed.name,
        sourceUrl: feed.url,
        pubDate,
        timestamp,
        category,
        lang,
        contentSnippet: snippet.slice(0, 400),
        fullContent: snippet,
        author: rawItem.creator || rawItem.author || feed.name,
        imageUrl: imageUrl || undefined,
        readTimeMinutes,
        aiSummary,
        bullishVotes: Math.floor(Math.random() * 25) + 10,
        bearishVotes: Math.floor(Math.random() * 8) + 2,
        commentsCount: 0,
        tickers,
        tags
      });
    }

    return articles;
  } catch (err: any) {
    console.warn(`[FeedFetcher] Error fetching "${feed.name}":`, err.message || err);
    return [];
  }
}

export async function syncAllFeeds(force = false): Promise<{
  articles: NewsArticle[];
  sourcesStatus: { [id: string]: { count: number; error?: string } };
}> {
  const now = Date.now();

  if (!force && inMemoryArticles.length > 0 && now - lastSyncTime < CACHE_TTL_MS) {
    return {
      articles: inMemoryArticles,
      sourcesStatus: {}
    };
  }

  if (!force && inMemoryArticles.length === 0) {
    const diskArticles = loadCachedArticles();
    if (diskArticles.length > 0) {
      inMemoryArticles = diskArticles;
      lastSyncTime = now;
      return {
        articles: inMemoryArticles,
        sourcesStatus: {}
      };
    }
  }

  const feeds = getSavedFeeds().filter(f => f.enabled !== false);
  const sourcesStatus: { [id: string]: { count: number; error?: string } } = {};
  const allFetched: NewsArticle[] = [];

  const chunkSize = 5;
  for (let i = 0; i < feeds.length; i += chunkSize) {
    const chunk = feeds.slice(i, i + chunkSize);
    const results = await Promise.allSettled(chunk.map(f => fetchFeed(f)));

    results.forEach((res, index) => {
      const feed = chunk[index];
      if (res.status === "fulfilled") {
        sourcesStatus[feed.id] = { count: res.value.length };
        allFetched.push(...res.value);
      } else {
        sourcesStatus[feed.id] = { count: 0, error: res.reason?.message || "Failed to fetch" };
      }
    });
  }

  const combinedMap = new Map<string, NewsArticle>();
  for (const art of inMemoryArticles) {
    combinedMap.set(art.link, art);
  }
  for (const art of allFetched) {
    combinedMap.set(art.link, art);
  }

  const finalArticles = Array.from(combinedMap.values()).sort(
    (a, b) => b.timestamp - a.timestamp
  );

  if (finalArticles.length > 0) {
    inMemoryArticles = finalArticles.slice(0, 400);
    lastSyncTime = now;
    saveCachedArticles(inMemoryArticles);
  }

  return {
    articles: inMemoryArticles,
    sourcesStatus
  };
}

export async function getNewsArticles(options?: {
  category?: Category;
  lang?: "ko" | "en";
  search?: string;
  source?: string;
  sortBy?: "latest" | "popular" | "readTime";
  limit?: number;
  offset?: number;
}): Promise<{ articles: NewsArticle[]; total: number; updatedAt: string }> {
  if (inMemoryArticles.length === 0) {
    await syncAllFeeds(false);
  }

  let filtered = [...inMemoryArticles];

  if (options?.lang) {
    filtered = filtered.filter(a => (a.lang || "ko") === options.lang);
  }

  if (options?.category && options.category !== "전체" && options.category !== "All") {
    filtered = filtered.filter(a => a.category === options.category);
  }

  if (options?.source) {
    filtered = filtered.filter(a => a.source === options.source);
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.contentSnippet.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.tickers.some(t => t.toLowerCase().includes(q)) ||
        a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (options?.sortBy === "readTime") {
    filtered.sort((a, b) => a.readTimeMinutes - b.readTimeMinutes);
  } else if (options?.sortBy === "popular") {
    filtered.sort((a, b) => ((b.bullishVotes || 0) + (b.bearishVotes || 0)) - ((a.bullishVotes || 0) + (a.bearishVotes || 0)));
  } else {
    filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  const total = filtered.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    articles: paginated,
    total,
    updatedAt: new Date(lastSyncTime || Date.now()).toISOString()
  };
}
