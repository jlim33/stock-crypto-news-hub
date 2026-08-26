import { FeedSource } from "./types";

export const DEFAULT_FEEDS: FeedSource[] = [
  // 1. 국내 주요 증권 & 크립토 미디어 (Korean Market & Crypto Feeds)
  {
    id: "hankyung-stock",
    name: "한국경제 증권 (Hankyung)",
    url: "https://www.hankyung.com/feed/finance",
    category: "국내 주식 & 증권",
    enabled: true,
    type: "rss",
    lang: "ko",
    icon: "TrendingUp"
  },
  {
    id: "mk-stock",
    name: "매일경제 증권 (Maeil Business)",
    url: "https://www.mk.co.kr/rss/30100041/",
    category: "국내 주식 & 증권",
    enabled: true,
    type: "rss",
    lang: "ko",
    icon: "BarChart3"
  },
  {
    id: "blockmedia-kr",
    name: "블록미디어 (BlockMedia)",
    url: "https://www.blockmedia.co.kr/feed",
    category: "암호화폐 & 비트코인",
    enabled: true,
    type: "rss",
    lang: "ko",
    icon: "Coins"
  },
  {
    id: "coindesk-kr",
    name: "코인데스크 코리아 (CoinDesk Korea)",
    url: "https://www.coindeskkorea.com/rss/allArticle.xml",
    category: "암호화폐 & 비트코인",
    enabled: true,
    type: "rss",
    lang: "ko",
    icon: "Bitcoin"
  },
  {
    id: "etoday-stock",
    name: "이투데이 증권 & 코인",
    url: "https://www.etoday.co.kr/news/rss/rss_all.php",
    category: "거시경제 & 금리",
    enabled: true,
    type: "rss",
    lang: "ko",
    icon: "Globe"
  },

  // 2. 글로벌 티어 1 주식 & 크립토 미디어 (Global English Feeds)
  {
    id: "coindesk-global",
    name: "CoinDesk Global",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    category: "Crypto & Bitcoin",
    enabled: true,
    type: "rss",
    lang: "en",
    icon: "Bitcoin"
  },
  {
    id: "cointelegraph-news",
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    category: "Crypto & Bitcoin",
    enabled: true,
    type: "rss",
    lang: "en",
    icon: "Coins"
  },
  {
    id: "decrypt-news",
    name: "Decrypt Media",
    url: "https://decrypt.co/feed",
    category: "DeFi & Web3",
    enabled: true,
    type: "rss",
    lang: "en",
    icon: "Zap"
  },
  {
    id: "cnbc-markets",
    name: "CNBC Markets",
    url: "https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=markets&sort=date&minimumDate=3&includeChannel=false",
    category: "US Equities & Tech",
    enabled: true,
    type: "rss",
    lang: "en",
    icon: "DollarSign"
  },
  {
    id: "marketwatch-top",
    name: "MarketWatch Real-time",
    url: "https://feeds.content.dowjones.io/public/rss/mw_topstories",
    category: "US Equities & Tech",
    enabled: true,
    type: "rss",
    lang: "en",
    icon: "TrendingUp"
  },
  {
    id: "investing-crypto",
    name: "Investing.com Crypto",
    url: "https://www.investing.com/rss/news_301.rss",
    category: "Crypto & Bitcoin",
    enabled: true,
    type: "rss",
    lang: "en",
    icon: "Activity"
  },
  {
    id: "investing-stock",
    name: "Investing.com Stock Markets",
    url: "https://www.investing.com/rss/news_25.rss",
    category: "US Equities & Tech",
    enabled: true,
    type: "rss",
    lang: "en",
    icon: "BarChart3"
  },
  {
    id: "yahoo-finance-tech",
    name: "Yahoo Finance Tech & Equities",
    url: "https://finance.yahoo.com/news/rssindex",
    category: "AI & Semi Stocks",
    enabled: true,
    type: "rss",
    lang: "en",
    icon: "Cpu"
  },
  {
    id: "blockworks-macro",
    name: "Blockworks Macro & Crypto",
    url: "https://blockworks.co/feed",
    category: "Macro & Central Banks",
    enabled: true,
    type: "rss",
    lang: "en",
    icon: "ShieldAlert"
  }
];
