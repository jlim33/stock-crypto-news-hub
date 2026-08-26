import { NextRequest, NextResponse } from "next/server";
import { syncAllFeeds } from "@/lib/feedFetcher";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const result = await syncAllFeeds(true);
    return NextResponse.json({
      success: true,
      total: result.articles.length,
      sourcesStatus: result.sourcesStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[API/News/Sync] Error:", err);
    return NextResponse.json(
      { error: "Failed to force sync feeds", message: err.message },
      { status: 500 }
    );
  }
}
