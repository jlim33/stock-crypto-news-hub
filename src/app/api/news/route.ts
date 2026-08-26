import { NextRequest, NextResponse } from "next/server";
import { getNewsArticles } from "@/lib/feedFetcher";
import { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as Category | null;
    const lang = searchParams.get("lang") as "ko" | "en" | null;
    const search = searchParams.get("search") || undefined;
    const source = searchParams.get("source") || undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "latest";
    const limit = parseInt(searchParams.get("limit") || "60", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await getNewsArticles({
      category: category || undefined,
      lang: lang || undefined,
      search,
      source,
      sortBy,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API/News] Error:", err);
    return NextResponse.json(
      { error: "Failed to load stock & crypto news", message: err.message },
      { status: 500 }
    );
  }
}
