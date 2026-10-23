import Parser from "rss-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parser = new Parser({
  timeout: 7000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) StockCryptoPulse/1.0",
    "Accept": "application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8"
  }
});

const FEEDS = [
  { id: "hankyung-stock", name: "한국경제 증권", url: "https://www.hankyung.com/feed/finance", category: "국내 주식 & 증권", lang: "ko" },
  { id: "blockmedia-kr", name: "블록미디어", url: "https://www.blockmedia.co.kr/feed", category: "암호화폐 & 비트코인", lang: "ko" },
  { id: "coindesk-en", name: "CoinDesk Global", url: "https://www.coindesk.com/arc/outboundfeeds/rss/", category: "암호화폐 & 비트코인", lang: "en" },
  { id: "cointelegraph-en", name: "Cointelegraph", url: "https://cointelegraph.com/rss", category: "암호화폐 & 비트코인", lang: "en" },
  { id: "bloomberg-market", name: "Yahoo Finance Market", url: "https://finance.yahoo.com/news/rssindex", category: "미국 증시 & 테크주", lang: "en" }
];

async function generate() {
  console.log("Fetching Stock & Crypto RSS feeds...");
  const articles = [];

  for (const feed of FEEDS) {
    try {
      console.log(`Fetching ${feed.name}...`);
      const res = await parser.parseURL(feed.url);
      const items = (res.items || []).slice(0, 10);
      for (const item of items) {
        const title = item.title?.trim() || "Untitled";
        const snippet = (item.contentSnippet || item.content || item.summary || "")
          .replace(/<[^>]*>?/gm, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 280);
        
        articles.push({
          id: Buffer.from(item.link || title).toString("base64").slice(0, 16),
          title,
          link: item.link || "#",
          source: feed.name,
          sourceId: feed.id,
          category: feed.category,
          lang: feed.lang,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          timestamp: new Date(item.isoDate || item.pubDate || Date.now()).getTime(),
          author: item.creator || item.author || feed.name,
          snippet: snippet || "실시간 증시 동향 및 가상자산 시황 인텔리전스",
          readTime: Math.max(2, Math.ceil((snippet.length || 100) / 70)),
          likes: Math.floor(Math.random() * 50) + 20,
          bookmarksCount: Math.floor(Math.random() * 30) + 8,
          isBreaking: Math.random() < 0.15,
          keyTakeaways: [
            `${title}에 대한 시장 분석 및 유동성 자금 흐름 추적`,
            `금리 변동 및 거시경제 지표와의 상관관계 평가`,
            `단기 변동성 및 중장기 포트폴리오 리스크 관리 권고`
          ]
        });
      }
    } catch (e) {
      console.warn(`Failed to fetch ${feed.name}:`, e.message);
    }
  }

  // Fallback seed articles
  if (articles.length === 0) {
    console.log("Using rich fallback seed articles for stock & crypto hub...");
    articles.push(
      {
        id: "stock-sample-1",
        title: "비트코인 신고가 랠리 지속: 기관 ETF 순유입액 15억 달러 돌파",
        link: "https://coindesk.com",
        source: "CoinDesk Global",
        sourceId: "coindesk-en",
        category: "암호화폐 & 비트코인",
        lang: "ko",
        publishedAt: new Date().toISOString(),
        timestamp: Date.now(),
        author: "가상자산분석팀",
        snippet: "글로벌 기관 자금의 현물 ETF 집중 유입과 반감기 공급 감소 효과가 맞물리며 비트코인이 강력한 지지선을 유지하고 있습니다.",
        readTime: 3,
        likes: 184,
        bookmarksCount: 92,
        isBreaking: true,
        keyTakeaways: [
          "기관 전용 ETF 유입세 급증으로 시장 유동성 강화",
          "선물 시장 미결제약정 증가에 따른 레버리지 청산 구간 주의",
          "거시 유동성 환경과 미 연준 금리 경로의 향방 모니터링"
        ]
      },
      {
        id: "stock-sample-2",
        title: "미국 나스닥 빅테크 실적 호조: AI 인프라 투자 지속 확대 전망",
        link: "https://finance.yahoo.com",
        source: "Yahoo Finance Market",
        sourceId: "bloomberg-market",
        category: "미국 증시 & 테크주",
        lang: "ko",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        timestamp: Date.now() - 3600000,
        author: "글로벌마켓팀",
        snippet: "주요 매그니피센트 7 기업들의 분기 실적이 시장 전망치를 상회하며 데이터센터 및 반도체 밸류체인 전반에 걸친 설비투자가 지속되고 있습니다.",
        readTime: 4,
        likes: 135,
        bookmarksCount: 56,
        isBreaking: false,
        keyTakeaways: [
          "AI 서버 및 차세대 가속기 수요 견조세 확인",
          "엔터프라이즈 소프트웨어 기업들의 수익화 가속",
          "밸류에이션 부담 완화를 위한 실적 가이던스 주시 필요"
        ]
      }
    );
  }

  articles.sort((a, b) => b.timestamp - a.timestamp);

  const outDir = path.join(__dirname, "..", "public", "data");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "news.json");

  const payload = {
    updatedAt: new Date().toISOString(),
    total: articles.length,
    articles
  };

  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`Saved ${articles.length} stock/crypto articles to ${outFile}`);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
