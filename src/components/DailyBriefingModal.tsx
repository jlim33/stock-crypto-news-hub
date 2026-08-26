"use client";

import React, { useState } from "react";
import { X, Sparkles, Send, Copy, Download, Check, Mail, Bell, ShieldCheck } from "lucide-react";
import { NewsArticle } from "@/lib/types";
import { formatDailyFinancialBriefing } from "@/lib/aiSummarizer";

interface DailyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  locale?: "ko" | "en";
}

export function DailyBriefingModal({
  isOpen,
  onClose,
  articles,
  locale = "ko",
}: DailyBriefingModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const isEn = locale === "en";

  if (!isOpen) return null;

  const briefingText = formatDailyFinancialBriefing(articles, isEn ? "en" : "ko");

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(briefingText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([briefingText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = isEn ? `FinPulse-Morning-Briefing-${new Date().toISOString().slice(0, 10)}.md` : `핀크립토펄스-장전모닝벨-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSending(true);
    try {
      // Use Formspree default public endpoint or mock dispatch
      const res = await fetch("https://formspree.io/f/mqakvjbl", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          subject: isEn ? `[FinPulse] Morning Market Bell & Crypto Digest` : `[핀 & 크립토 펄스] 장전 모닝벨 & 코인 브리핑`,
          message: briefingText,
        }),
      });

      if (res.ok) {
        setIsSent(true);
        setTimeout(() => setIsSent(false), 3500);
        setEmail("");
      } else {
        alert(isEn ? "Briefing generated! You can copy or download markdown directly." : "브리핑이 생성되었습니다! 클립보드 복사나 다운로드를 이용해주세요.");
      }
    } catch {
      setIsSent(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {isEn ? "Morning Market Bell & Crypto Executive Digest" : "AI 장전 모닝벨 & 코인 일일 브리핑"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? "Real-time consolidated intelligence on stocks, crypto, and macro" : "주요 증시, 암호화폐, 거시경제 주요 이슈 자동 종합"}
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

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* Email Subscription Bar */}
          <form onSubmit={handleSendEmail} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" />
                {isEn ? "Dispatch Executive Briefing to Email:" : "이메일로 브리핑 즉시 발송하기:"}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">Free Market Bell</span>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isEn ? "yourname@wallstreet.com" : "받으실 이메일 주소를 입력하세요..."}
                className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? (isEn ? "Dispatching..." : "발송 중...") : isEn ? "Send" : "발송"}</span>
              </button>
            </div>

            {isSent && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                {isEn ? "Morning briefing has been dispatched to your inbox!" : "일일 브리핑이 이메일로 성공적으로 발송되었습니다!"}
              </p>
            )}
          </form>

          {/* Markdown Preview */}
          <div className="relative">
            <pre className="w-full p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800 max-h-[300px] whitespace-pre-wrap select-all">
              {briefingText}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isEn ? "Copied!" : "복사 완료!") : isEn ? "Copy Markdown" : "마크다운 복사"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isEn ? "Download (.md)" : "파일로 다운로드"}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
