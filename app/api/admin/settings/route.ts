import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { appSettings, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const settings = await db.select().from(appSettings);
    
    // Convert array to key-value object
    const settingsObj = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      geminiApiKey: settingsObj.GEMINI_API_KEY || "",
      hasGeminiKey: !!settingsObj.GEMINI_API_KEY,
      midtransServerKey: "",
      midtransClientKey: "",
      midtransIsProduction: false,
      hasMidtransServerKey: false,
      hasMidtransClientKey: false,
      midtransEnabled: settingsObj.MIDTRANS_ENABLED !== "false", // default true
      manualPaymentEnabled: settingsObj.MANUAL_PAYMENT_ENABLED === "true",
      manualPaymentBank: settingsObj.MANUAL_PAYMENT_BANK || "",
      manualPaymentAccount: settingsObj.MANUAL_PAYMENT_ACCOUNT || "",
      manualPaymentName: settingsObj.MANUAL_PAYMENT_NAME || "",
    });
  } catch (error: any) {
    console.error("Admin settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      geminiApiKey,
      midtransEnabled,
      manualPaymentEnabled,
      manualPaymentBank,
      manualPaymentAccount,
      manualPaymentName
    } = body;

    const updates = [];

    if (geminiApiKey !== undefined) {
      updates.push({ key: "GEMINI_API_KEY", value: geminiApiKey });
    }
    if (midtransEnabled !== undefined) {
      updates.push({ key: "MIDTRANS_ENABLED", value: midtransEnabled ? "true" : "false" });
    }
    if (manualPaymentEnabled !== undefined) {
      updates.push({ key: "MANUAL_PAYMENT_ENABLED", value: manualPaymentEnabled ? "true" : "false" });
    }
    if (manualPaymentBank !== undefined) {
      updates.push({ key: "MANUAL_PAYMENT_BANK", value: manualPaymentBank });
    }
    if (manualPaymentAccount !== undefined) {
      updates.push({ key: "MANUAL_PAYMENT_ACCOUNT", value: manualPaymentAccount });
    }
    if (manualPaymentName !== undefined) {
      updates.push({ key: "MANUAL_PAYMENT_NAME", value: manualPaymentName });
    }

    // Upsert all settings
    for (const setting of updates) {
      await db.insert(appSettings)
        .values(setting)
        .onConflictDoUpdate({
          target: appSettings.key,
          set: { value: setting.value },
        });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error: any) {
    console.error("Admin settings POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
