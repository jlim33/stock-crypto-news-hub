import { useState, useEffect, useCallback } from "react";
import { NewsArticle } from "@/lib/types";
import { getStoredBookmarks, saveBookmark, removeBookmark, isArticleBookmarked } from "@/lib/storage";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([]);

  useEffect(() => {
    setBookmarks(getStoredBookmarks());
  }, []);

  const toggleBookmark = useCallback((article: NewsArticle) => {
    if (isArticleBookmarked(article.id)) {
      removeBookmark(article.id);
      setBookmarks((prev) => prev.filter((b) => b.id !== article.id));
    } else {
      saveBookmark(article);
      setBookmarks((prev) => [article, ...prev.filter((b) => b.id !== article.id)]);
    }
  }, []);

  const isBookmarked = useCallback(
    (id: string) => {
      return bookmarks.some((b) => b.id === id);
    },
    [bookmarks]
  );

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
  };
}
