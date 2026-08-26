import { AISummary, NewsArticle } from "./types";

const COMMON_TICKERS = [
  "BTC", "ETH", "SOL", "XRP", "DOGE", "ADA", "AVAX", "BNB", "LINK", "SUI",
  "NVDA", "AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "META", "AMD", "INTC", "TSM",
  "SPY", "QQQ", "KOSPI", "KOSDAQ", "FED", "SEC", "ETF"
];

/**
 * Extract financial ticker symbols ($BTC, $NVDA, etc.) from title and content
 */
export function extractFinancialTickers(title: string, content: string): string[] {
  const text = (title + " " + content).toUpperCase();
  const found: Set<string> = new Set();

  for (const ticker of COMMON_TICKERS) {
    // Look for $TICKER or standalone word boundary
    const regex = new RegExp(`(\\$${ticker}\\b|\\b${ticker}\\b)`, "i");
    if (regex.test(text)) {
      found.add(ticker);
    }
  }

  // Common Korean terms to tickers mapping
  if (text.includes("비트코인")) found.add("BTC");
  if (text.includes("이더리움")) found.add("ETH");
  if (text.includes("솔라나")) found.add("SOL");
  if (text.includes("리플")) found.add("XRP");
  if (text.includes("엔비디아")) found.add("NVDA");
  if (text.includes("테슬라")) found.add("TSLA");
  if (text.includes("애플")) found.add("AAPL");
  if (text.includes("마이크로소프트")) found.add("MSFT");
  if (text.includes("삼성전자") || text.includes("SK하이닉스")) found.add("KOSPI");
  if (text.includes("연준") || text.includes("금리 인하") || text.includes("파월")) found.add("FED");

  const result = Array.from(found);
  return result.length > 0 ? result.slice(0, 4) : ["MARKET"];
}

/**
 * Intelligent Local Financial NLP Summarizer (Bilingual):
 * Analyzes market sentiment, volatility risk, and key investment takeaways.
 */
export function generateFinancialSummary(
  title: string,
  content: string,
  category: string,
  lang: "ko" | "en" = "ko"
): AISummary {
  const cleanContent = content
    .replace(/<[^>]*>?/gm, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tickers = extractFinancialTickers(title, cleanContent);

  const sentences = cleanContent
    .split(/(?<=[.?!])\s+/)
    .filter(
      s =>
        s.length > 15 &&
        !s.toLowerCase().includes("copyright") &&
        !s.toLowerCase().includes("read more") &&
        !s.toLowerCase().includes("subscribe") &&
        !s.includes("기자") &&
        !s.includes("무단전재")
    );

  const lowerText = (title + " " + cleanContent).toLowerCase();

  // -------------------------------------------------------------
  // 1. English Financial Logic
  // -------------------------------------------------------------
  if (lang === "en") {
    let bullets: string[] = [];

    if (sentences.length >= 3) {
      bullets = [sentences[0], sentences[1], sentences[Math.min(2, sentences.length - 1)]];
    } else if (sentences.length === 2) {
      bullets = [
        sentences[0],
        sentences[1],
        `Directly impacts liquidity and trading momentum across ${category}.`
      ];
    } else if (sentences.length === 1) {
      bullets = [
        sentences[0],
        `Institutional and retail positioning shifts following "${title}".`,
        `Monitored closely by crypto desks and equity fund managers for volatility triggers.`
      ];
    } else {
      bullets = [
        `Live market development regarding ${title}.`,
        `Key macro and on-chain liquidity indicators are pricing in the shift.`,
        `Refer to the source report for real-time order book and exchange flows.`
      ];
    }

    bullets = bullets.map(b => b.replace(/\s+/g, " ").trim());

    // Market Sentiment
    let marketSentiment: AISummary["marketSentiment"] = "Neutral ⚖️";
    if (
      lowerText.includes("soar") ||
      lowerText.includes("rally") ||
      lowerText.includes("all-time high") ||
      lowerText.includes("ath") ||
      lowerText.includes("breakout") ||
      lowerText.includes("bull") ||
      lowerText.includes("inflow") ||
      lowerText.includes("record high")
    ) {
      marketSentiment = "Strong Bullish 🐂";
    } else if (
      lowerText.includes("gain") ||
      lowerText.includes("surge") ||
      lowerText.includes("buy") ||
      lowerText.includes("approved") ||
      lowerText.includes("rate cut") ||
      lowerText.includes("upgrade")
    ) {
      marketSentiment = "Bullish 📈";
    } else if (
      lowerText.includes("crash") ||
      lowerText.includes("plunge") ||
      lowerText.includes("liquidation") ||
      lowerText.includes("ban") ||
      lowerText.includes("sec lawsuit") ||
      lowerText.includes("hack") ||
      lowerText.includes("panic")
    ) {
      marketSentiment = "Extreme Fear ⚠️";
    } else if (
      lowerText.includes("drop") ||
      lowerText.includes("fall") ||
      lowerText.includes("bear") ||
      lowerText.includes("outflow") ||
      lowerText.includes("rate hike") ||
      lowerText.includes("selloff")
    ) {
      marketSentiment = "Bearish 📉";
    }

    // Volatility Risk
    let volatilityRisk: AISummary["volatilityRisk"] = "Moderate 📊";
    if (
      lowerText.includes("cpi") ||
      lowerText.includes("fomc") ||
      lowerText.includes("liquidation") ||
      lowerText.includes("etf approval") ||
      lowerText.includes("earnings") ||
      lowerText.includes("halving") ||
      lowerText.includes("hack")
    ) {
      volatilityRisk = "High Volatility ⚡";
    } else if (
      lowerText.includes("dividend") ||
      lowerText.includes("treasury") ||
      lowerText.includes("stablecoin") ||
      lowerText.includes("blue chip")
    ) {
      volatilityRisk = "Stable 🛡️";
    }

    // Why It Matters
    let whyItMatters = `Catalyzes capital reallocation and sentiment shifts across ${tickers.map(t => `$${t}`).join(", ")} market participants.`;
    if (lowerText.includes("fed") || lowerText.includes("interest rate") || lowerText.includes("inflation")) {
      whyItMatters = "Shifts macroeconomic cost of capital, resetting valuation multiples across tech equities and risk assets.";
    } else if (lowerText.includes("bitcoin") || lowerText.includes("crypto") || lowerText.includes("etf")) {
      whyItMatters = "Influences spot exchange depth and institutional ETF net inflow velocity.";
    }

    return {
      tldr: bullets,
      whyItMatters,
      marketSentiment,
      volatilityRisk,
      targetTickers: tickers
    };
  }

  // -------------------------------------------------------------
  // 2. Korean Financial Logic
  // -------------------------------------------------------------
  let bullets: string[] = [];

  if (sentences.length >= 3) {
    bullets = [sentences[0], sentences[1], sentences[Math.min(2, sentences.length - 1)]];
  } else if (sentences.length === 2) {
    bullets = [
      sentences[0],
      sentences[1],
      `${category} 시장의 자금 유입 및 투자 심리에 직결되는 주요 이슈입니다.`
    ];
  } else if (sentences.length === 1) {
    bullets = [
      sentences[0],
      `'${title}' 발표 이후 기관 및 개인 투자자들의 포지션 변동이 포착되고 있습니다.`,
      `단기 변동성 및 중장기 가격 방향성에 핵심 변수로 작용할 전망입니다.`
    ];
  } else {
    bullets = [
      `'${title}' 관련 실시간 시장 속보입니다.`,
      `${category} 섹터 내 수급 변화와 주요 지표를 면밀히 확인할 필요가 있습니다.`,
      `세부적인 호가 및 온체인 데이터는 원문 링크를 통해 확인하세요.`
    ];
  }

  bullets = bullets.map(b => b.replace(/\s+/g, " ").trim());

  // Market Sentiment (Korean)
  let marketSentiment: AISummary["marketSentiment"] = "중립/관망 ⚖️";
  if (
    lowerText.includes("신고가") ||
    lowerText.includes("급등") ||
    lowerText.includes("불장") ||
    lowerText.includes("ath") ||
    lowerText.includes("돌파") ||
    lowerText.includes("순유입") ||
    lowerText.includes("대규모 매수")
  ) {
    marketSentiment = "강력 매수/상승 🐂";
  } else if (
    lowerText.includes("상승") ||
    lowerText.includes("호재") ||
    lowerText.includes("승인") ||
    lowerText.includes("금리 인하") ||
    lowerText.includes("목표가 상향")
  ) {
    marketSentiment = "상승 우세 📈";
  } else if (
    lowerText.includes("폭락") ||
    lowerText.includes("청산") ||
    lowerText.includes("해킹") ||
    lowerText.includes("패닉셀") ||
    lowerText.includes("기소") ||
    lowerText.includes("거래정지")
  ) {
    marketSentiment = "극심한 공포 ⚠️";
  } else if (
    lowerText.includes("하락") ||
    lowerText.includes("악재") ||
    lowerText.includes("순유출") ||
    lowerText.includes("금리 인상") ||
    lowerText.includes("차익 실현")
  ) {
    marketSentiment = "하락 경계 📉";
  }

  // Volatility Risk (Korean)
  let volatilityRisk: AISummary["volatilityRisk"] = "보통 📊";
  if (
    lowerText.includes("cpi") ||
    lowerText.includes("fomc") ||
    lowerText.includes("대규모 청산") ||
    lowerText.includes("etf 승인") ||
    lowerText.includes("실적 발표") ||
    lowerText.includes("반감기") ||
    lowerText.includes("해킹")
  ) {
    volatilityRisk = "초고변동성 ⚡";
  } else if (
    lowerText.includes("배당") ||
    lowerText.includes("국채") ||
    lowerText.includes("스테이블코인") ||
    lowerText.includes("우량주")
  ) {
    volatilityRisk = "안정적 🛡️";
  }

  // Why It Matters (Korean)
  let whyItMatters = `관련 자산(${tickers.map(t => `$${t}`).join(", ")})의 유동성 및 매수/매도 수급 균형에 직접적인 영향을 미칩니다.`;
  if (lowerText.includes("연준") || lowerText.includes("금리") || lowerText.includes("fomc") || lowerText.includes("인플레이션")) {
    whyItMatters = "거시경제 금리 경로 재조정으로 성장주 및 암호화폐 전반의 밸류에이션 리레이팅을 촉발합니다.";
  } else if (lowerText.includes("비트코인") || lowerText.includes("etf") || lowerText.includes("코인")) {
    whyItMatters = "기관 자금 순유입 속도 및 선물 시장 청산 맵에 결정적인 변곡점을 제공합니다.";
  }

  return {
    tldr: bullets,
    whyItMatters,
    marketSentiment,
    volatilityRisk,
    targetTickers: tickers
  };
}

/**
 * Format daily financial briefing text for English and Korean
 */
export function formatDailyFinancialBriefing(articles: NewsArticle[], lang: "ko" | "en" = "ko"): string {
  const dateStr = new Date().toLocaleDateString(lang === "en" ? "en-US" : "ko-KR", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (lang === "en") {
    let body = `💎 FinPulse - Morning Market Bell & Crypto Executive Digest (${dateStr})\n`;
    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    articles.slice(0, 6).forEach((art, idx) => {
      body += `[${idx + 1}] ${art.title}\n`;
      body += `• Source: ${art.source} | Tickers: ${art.tickers.map(t => `$${t}`).join(", ")} | Sentiment: ${art.aiSummary?.marketSentiment || "Neutral"}\n`;
      if (art.aiSummary?.tldr) {
        art.aiSummary.tldr.forEach(bullet => {
          body += `  - ${bullet}\n`;
        });
      }
      if (art.aiSummary?.whyItMatters) {
        body += `  ★ Investor Impact: ${art.aiSummary.whyItMatters}\n`;
      }
      body += `• Link: ${art.link}\n\n`;
    });

    body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    body += `Generated automatically by FinPulse (Stock & Crypto Intelligence Hub)\n`;
    return body;
  }

  let body = `💎 핀 & 크립토 펄스 - 장전 모닝벨 & 코인 브리핑 (${dateStr})\n`;
  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  articles.slice(0, 6).forEach((art, idx) => {
    body += `[${idx + 1}] ${art.title}\n`;
    body += `• 출처: ${art.source} | 관련종목: ${art.tickers.map(t => `$${t}`).join(", ")} | 시장심리: ${art.aiSummary?.marketSentiment || "중립"}\n`;
    if (art.aiSummary?.tldr) {
      art.aiSummary.tldr.forEach(bullet => {
        body += `  - ${bullet}\n`;
      });
    }
    if (art.aiSummary?.whyItMatters) {
      body += `  ★ 투자 시사점: ${art.aiSummary.whyItMatters}\n`;
    }
    body += `• 링크: ${art.link}\n\n`;
  });

  body += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  body += `발행: 핀 & 크립토 펄스 자동 큐레이션 시스템\n`;
  return body;
}
