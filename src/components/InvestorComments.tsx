"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Trash2,
  User,
  Sparkles,
  Smile,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Comment } from "@/lib/types";
import {
  getArticleComments,
  addArticleComment,
  deleteArticleComment,
  likeArticleComment,
  getSavedNickname,
  saveNickname
} from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface InvestorCommentsProps {
  articleId: string;
  locale?: "ko" | "en";
  onCommentCountChange?: (count: number) => void;
}

const PRESET_NICKNAMES_KO = [
  "여의도 퀀트 애널리스트",
  "비트코인 온체인 고래",
  "나스닥 롱 포지션",
  "배당주 가치투자자",
  "DeFi 일드 파머",
  "크립토 스윙 트레이더"
];

const PRESET_NICKNAMES_EN = [
  "Wall Street Quant",
  "Bitcoin Macro Whale",
  "Nasdaq Tech Bull",
  "DeFi Protocol Architect",
  "Dividend Compounder",
  "Crypto Momentum Trader"
];

const QUICK_STARTERS_KO = [
  "🐂 강한 상승 모멘텀이 기대되는 호재입니다!",
  "🐻 단기 급등에 따른 차익 실현 매물 주의해야 합니다.",
  "💡 온체인 고래 지갑 이동과 수급을 주목해야겠네요.",
  "📊 연준 금리 결정 전까지는 분할 매수 관점이 유효합니다."
];

const QUICK_STARTERS_EN = [
  "🐂 Strong bullish setup, expecting upside breakout!",
  "🐻 Watch for short-term profit-taking at resistance.",
  "💡 Key institutional on-chain flows to monitor closely.",
  "📊 Favorable risk/reward profile for swing positions."
];

const AVATAR_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-blue-600 to-indigo-700",
  "from-purple-600 to-pink-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
];

export function InvestorComments({ articleId, locale = "ko", onCommentCountChange }: InvestorCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEn = locale === "en";

  useEffect(() => {
    const list = getArticleComments(articleId);
    setComments(list);
    if (onCommentCountChange) onCommentCountChange(list.length);

    const savedName = getSavedNickname();
    if (savedName) {
      if (isEn && /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(savedName)) {
        const randomEn = PRESET_NICKNAMES_EN[Math.floor(Math.random() * PRESET_NICKNAMES_EN.length)];
        setNickname(randomEn);
        saveNickname(randomEn);
      } else {
        setNickname(savedName);
      }
    } else {
      const presets = isEn ? PRESET_NICKNAMES_EN : PRESET_NICKNAMES_KO;
      const randomPreset = presets[Math.floor(Math.random() * presets.length)];
      setNickname(randomPreset);
    }
  }, [articleId, isEn]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!content.trim()) {
      setErrorMessage(
        isEn
          ? "Please type your investment analysis or comment below before posting!"
          : "투자 견해나 분석 내용을 아래 입력창에 작성해주세요!"
      );
      textareaRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    const defaultAnonymous = isEn ? "Anonymous Investor" : "익명의 투자자";
    const chosenName = nickname.trim() || defaultAnonymous;
    saveNickname(chosenName);

    const randomGradient = AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];
    const newComment = addArticleComment(articleId, chosenName, content.trim(), randomGradient);

    const updated = [newComment, ...comments];
    setComments(updated);
    setContent("");
    setIsSubmitting(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 2500);

    if (onCommentCountChange) onCommentCountChange(updated.length);
  };

  const handleDelete = (commentId: string) => {
    deleteArticleComment(articleId, commentId);
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    if (onCommentCountChange) onCommentCountChange(updated.length);
  };

  const handleLike = (commentId: string) => {
    likeArticleComment(articleId, commentId);
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c))
    );
  };

  const handleQuickStarter = (starterText: string) => {
    setContent(starterText);
    setErrorMessage("");
    textareaRef.current?.focus();
  };

  const formatCommentDate = (isoStr: string) => {
    try {
      if (isEn) {
        return formatDistanceToNow(new Date(isoStr), { addSuffix: true });
      }
      return formatDistanceToNow(new Date(isoStr), { addSuffix: true, locale: ko });
    } catch {
      return isEn ? "Just now" : "방금 전";
    }
  };

  const quickStarters = isEn ? QUICK_STARTERS_EN : QUICK_STARTERS_KO;
  const presets = isEn ? PRESET_NICKNAMES_EN : PRESET_NICKNAMES_KO;

  return (
    <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-wide">
            {isEn ? "Investor Discussion & Analysis" : "투자자 토론 & 포지션 견해"}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700">
            {comments.length}
          </span>
        </div>

        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          {isEn ? "Live Market Pulse" : "실시간 시장 심리 교환"}
        </span>
      </div>

      {/* Preset Nickname Badges */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-400 font-semibold mr-1">
          {isEn ? "Investor Persona:" : "추천 페르소나:"}
        </span>
        {presets.slice(0, 4).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setNickname(p)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
              nickname === p
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEn ? "Handle:" : "닉네임:"}</span>
          </div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={isEn ? "Enter your investor handle..." : "투자자 닉네임을 입력하세요..."}
            className="w-full max-w-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-emerald-500"
          />
        </div>

        {/* Quick Starters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium">
            {isEn ? "💡 Quick Market Takeaways:" : "💡 빠른 투자 견해:"}
          </span>
          {quickStarters.map((starter, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickStarter(starter)}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 transition-all font-medium text-left"
            >
              {starter}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={3}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={
              isEn
                ? "Share your price target, technical chart reading, or macro thesis..."
                : "해당 종목/코인의 목표가, 차트 분석, 매수/매도 포지션 의견을 공유해주세요..."
            }
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 resize-none transition-all"
          />

          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 py-1 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successToast && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 py-1 font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{isEn ? "Analysis shared successfully!" : "투자 의견이 성공적으로 등록되었습니다!"}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              {content.length} {isEn ? "chars (Ctrl+Enter to post)" : "자 (Ctrl+Enter로 등록)"}
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isEn ? "Share Analysis" : "의견 등록"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-medium">
            <Smile className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <p>{isEn ? "No comments yet. Click one of the quick ideas above to start the discussion!" : "아직 작성된 의견이 없습니다. 위의 빠른 입력을 눌러 첫 번째 시장 견해를 남겨보세요!"}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-tr ${
                      comment.avatarColor || "from-emerald-500 to-teal-600"
                    } text-white font-black text-xs flex items-center justify-center shadow-xs`}
                  >
                    {comment.author.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {comment.author}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatCommentDate(comment.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-300 hover:text-emerald-600 font-semibold transition-all"
                    title={isEn ? "Agree" : "공감"}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comment.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                    title={isEn ? "Delete comment" : "삭제"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-9 font-medium">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
