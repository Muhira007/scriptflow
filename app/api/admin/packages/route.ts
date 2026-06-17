import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_PACKAGES = [
  { 
    id: "starter", 
    name: "Starter Pack", 
    amount: 25000, 
    credits: 50, 
    features: ["URL Scraping Enabled", "Standard AI Models"], 
    isPopular: false 
  },
  { 
    id: "business", 
    name: "Creator Pack", 
    amount: 100000, 
    credits: 250, 
    features: ["URL Scraping Enabled", "Priority AI Processing", "24/7 Email Support"], 
    isPopular: true 
  },
  { 
    id: "agency", 
    name: "Agency Pack", 
    amount: 250000, 
    credits: 1000, 
    features: ["Highest Priority API", "Dedicated Support", "Best Value per Credit"], 
    isPopular: false 
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await db.select().from(appSettings).where(eq(appSettings.key, "TOPUP_PACKAGES"));
    let packages = DEFAULT_PACKAGES;
    
    if (settings.length > 0 && settings[0].value) {
      try {
        packages = JSON.parse(settings[0].value);
      } catch (e) {
        console.error("Failed to parse packages JSON", e);
      }
    }

    return NextResponse.json({ packages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!Array.isArray(body.packages)) {
      return NextResponse.json({ error: "Invalid data format. Expected 'packages' array." }, { status: 400 });
    }

    const packagesJson = JSON.stringify(body.packages);

    const existing = await db.select().from(appSettings).where(eq(appSettings.key, "TOPUP_PACKAGES"));
    if (existing.length > 0) {
      await db.update(appSettings).set({ value: packagesJson }).where(eq(appSettings.key, "TOPUP_PACKAGES"));
    } else {
      await db.insert(appSettings).values({ key: "TOPUP_PACKAGES", value: packagesJson });
    }

    return NextResponse.json({ success: true, packages: body.packages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
