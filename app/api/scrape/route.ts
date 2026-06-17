import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the HTML content
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract product context
    const title = $("title").text().trim() || "";
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || "";
    const ogTitle =
      $('meta[property="og:title"]').attr("content")?.trim() || "";
    const ogDescription =
      $('meta[property="og:description"]').attr("content")?.trim() || "";
    const ogImage =
      $('meta[property="og:image"]').attr("content")?.trim() || "";

    // Try to extract price from common patterns
    const priceSelectors = [
      '[class*="price"]',
      '[id*="price"]',
      '[data-testid*="price"]',
    ];
    let price = "";
    for (const selector of priceSelectors) {
      const el = $(selector).first().text().trim();
      if (el) {
        price = el;
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        title: ogTitle || title,
        description: ogDescription || metaDescription,
        image: ogImage,
        price,
        url: parsedUrl.toString(),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Scrape error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to scrape URL: " + errorMessage },
      { status: 500 }
    );
  }
}
