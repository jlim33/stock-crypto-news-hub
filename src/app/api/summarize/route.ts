import { NextRequest, NextResponse } from "next/server";
import { generateFinancialSummary } from "@/lib/aiSummarizer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { title, content, category, apiKey, lang } = await req.json();
    const effectiveLang = lang === "en" ? "en" : "ko";

    const geminiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      const local = generateFinancialSummary(title, content, category, effectiveLang);
      return NextResponse.json({ summary: local });
    }

    const prompt = effectiveLang === "en"
      ? `You are an elite Wall Street financial and crypto analyst. Summarize this market news in 3 high-impact bullet points and explain why it matters to investors.
Headline: ${title}
Category: ${category}
Content: ${content.slice(0, 1500)}

Respond in valid JSON only with keys:
"tldr": (array of 3 punchy financial strings),
"whyItMatters": (string explaining investor implication, liquidity, valuation, or volatility),
"marketSentiment": ("Strong Bullish 🐂" | "Bullish 📈" | "Neutral ⚖️" | "Bearish 📉" | "Extreme Fear ⚠️"),
"volatilityRisk": ("High Volatility ⚡" | "Moderate 📊" | "Stable 🛡️"),
"targetTickers": (array of uppercase ticker strings, e.g. ["BTC", "NVDA", "ETH"])`
      : `당신은 최고 수준의 월스트리트 & 여의도 증권/크립토 전문 애널리스트입니다. 다음 기사의 핵심을 3줄로 요약하고 투자 시사점을 진단해주세요.
헤드라인: ${title}
카테고리: ${category}
본문 내용: ${content.slice(0, 1500)}

반드시 다음 JSON 형식으로만 응답하세요:
{
  "tldr": ["요약1", "요약2", "요약3"],
  "whyItMatters": "투자자 관점에서의 시장 영향 및 시사점",
  "marketSentiment": "강력 매수/상승 🐂" | "상승 우세 📈" | "중립/관망 ⚖️" | "하락 경계 📉" | "극심한 공포 ⚠️",
  "volatilityRisk": "초고변동성 ⚡" | "보통 📊" | "안정적 🛡️",
  "targetTickers": ["BTC", "NVDA", "ETH"]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const local = generateFinancialSummary(title, content, category, effectiveLang);
      return NextResponse.json({ summary: local });
    }

    const data = await response.json();
    const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJsonText) {
      const local = generateFinancialSummary(title, content, category, effectiveLang);
      return NextResponse.json({ summary: local });
    }

    const parsed = JSON.parse(rawJsonText);
    return NextResponse.json({ summary: parsed });
  } catch (err: any) {
    console.error("[API/Summarize] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
