import { NewsArticle, Comment, SentimentState } from "./types";

const BOOKMARKS_KEY = "finpulse_bookmarks_v1";
const COMMENTS_KEY = "finpulse_comments_v1";
const SENTIMENT_KEY = "finpulse_sentiment_v1";
const USER_NICKNAME_KEY = "finpulse_nickname_v1";
const AUTO_REFRESH_KEY = "finpulse_auto_refresh_v1";
const GEMINI_KEY = "finpulse_gemini_key_v1";

export function getStoredBookmarks(): NewsArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(article: NewsArticle): boolean {
  if (typeof window === "undefined") return false;
  try {
    const bookmarks = getStoredBookmarks();
    if (!bookmarks.some(b => b.id === article.id)) {
      bookmarks.unshift(article);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks.slice(0, 100)));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function removeBookmark(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const bookmarks = getStoredBookmarks().filter(b => b.id !== id);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {}
}

export function isArticleBookmarked(id: string): boolean {
  return getStoredBookmarks().some(b => b.id === id);
}

// --- Bullish 🐂 vs Bearish 🐻 Sentiment System ---

export function getStoredSentiment(): Record<string, SentimentState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SENTIMENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getArticleSentiment(
  articleId: string,
  defaultBullish = 15,
  defaultBearish = 4
): SentimentState {
  const all = getStoredSentiment();
  if (all[articleId]) return all[articleId];
  return {
    userVote: null,
    bullishCount: defaultBullish,
    bearishCount: defaultBearish,
  };
}

export function toggleArticleSentiment(
  articleId: string,
  type: "bullish" | "bearish",
  defaultBullish = 15,
  defaultBearish = 4
): SentimentState {
  const all = getStoredSentiment();
  const current = all[articleId] || {
    userVote: null,
    bullishCount: defaultBullish,
    bearishCount: defaultBearish,
  };

  if (current.userVote === type) {
    // Cancel vote
    if (type === "bullish") current.bullishCount = Math.max(0, current.bullishCount - 1);
    if (type === "bearish") current.bearishCount = Math.max(0, current.bearishCount - 1);
    current.userVote = null;
  } else {
    // Switch vote
    if (current.userVote === "bullish") current.bullishCount = Math.max(0, current.bullishCount - 1);
    if (current.userVote === "bearish") current.bearishCount = Math.max(0, current.bearishCount - 1);

    if (type === "bullish") current.bullishCount += 1;
    if (type === "bearish") current.bearishCount += 1;
    current.userVote = type;
  }

  all[articleId] = current;
  if (typeof window !== "undefined") {
    localStorage.setItem(SENTIMENT_KEY, JSON.stringify(all));
  }
  return current;
}

// --- Comments System ---

export function getStoredComments(): Record<string, Comment[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getArticleComments(articleId: string): Comment[] {
  const all = getStoredComments();
  return all[articleId] || [];
}

export function addArticleComment(
  articleId: string,
  author: string,
  content: string,
  avatarColor = "from-emerald-500 to-teal-600"
): Comment {
  const all = getStoredComments();
  const list = all[articleId] || [];

  const newComment: Comment = {
    id: "fin-cmt-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    articleId,
    author: author.trim() || "익명의 투자자",
    avatarColor,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  list.unshift(newComment);
  all[articleId] = list;

  if (typeof window !== "undefined") {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  }
  return newComment;
}

export function deleteArticleComment(articleId: string, commentId: string): void {
  const all = getStoredComments();
  if (!all[articleId]) return;
  all[articleId] = all[articleId].filter(c => c.id !== commentId);
  if (typeof window !== "undefined") {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  }
}

export function likeArticleComment(articleId: string, commentId: string): void {
  const all = getStoredComments();
  if (!all[articleId]) return;
  all[articleId] = all[articleId].map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c);
  if (typeof window !== "undefined") {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  }
}

export function getSavedNickname(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_NICKNAME_KEY) || "";
}

export function saveNickname(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_NICKNAME_KEY, name.trim());
}

export function getAutoRefreshInterval(): number {
  if (typeof window === "undefined") return 15;
  try {
    const val = localStorage.getItem(AUTO_REFRESH_KEY);
    return val ? parseInt(val, 10) : 15;
  } catch {
    return 15;
  }
}

export function setAutoRefreshInterval(min: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTO_REFRESH_KEY, min.toString());
}

export function getStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(GEMINI_KEY) || "";
}

export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GEMINI_KEY, key.trim());
}
