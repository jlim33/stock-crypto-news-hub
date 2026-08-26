import { NextRequest, NextResponse } from "next/server";
import { getSavedFeeds, saveFeeds } from "@/lib/feedFetcher";
import { DEFAULT_FEEDS } from "@/lib/defaultFeeds";
import { FeedSource } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const feeds = getSavedFeeds();
  return NextResponse.json({ feeds });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "reset") {
      saveFeeds(DEFAULT_FEEDS);
      return NextResponse.json({ success: true, feeds: DEFAULT_FEEDS });
    }

    if (body.action === "add" && body.feed) {
      const current = getSavedFeeds();
      const updated = [body.feed, ...current];
      saveFeeds(updated);
      return NextResponse.json({ success: true, feeds: updated });
    }

    if (body.action === "toggle" && body.feedId) {
      const current = getSavedFeeds();
      const updated = current.map((f) =>
        f.id === body.feedId ? { ...f, enabled: f.enabled === false ? true : false } : f
      );
      saveFeeds(updated);
      return NextResponse.json({ success: true, feeds: updated });
    }

    if (Array.isArray(body.feeds)) {
      saveFeeds(body.feeds);
      return NextResponse.json({ success: true, feeds: body.feeds });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
