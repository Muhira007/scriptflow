import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Validate admin session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    // 2. Parse request
    const { userId, action, amount } = await request.json();

    if (!userId || !["add", "deduct"].includes(action) || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "userId, action (add/deduct), and amount (positive number) are required" },
        { status: 400 }
      );
    }

    // 3. Find user
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!targetUser.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 4. Update credits
    if (action === "add") {
      await db
        .update(user)
        .set({ credits: sql`${user.credits} + ${amount}` })
        .where(eq(user.id, userId));

      return NextResponse.json({
        success: true,
        message: `Added ${amount} credits to ${targetUser[0].email}`,
        newCredits: targetUser[0].credits + amount,
      });
    } else {
      // Prevent negative credits
      const newCredits = Math.max(0, targetUser[0].credits - amount);
      await db
        .update(user)
        .set({ credits: newCredits })
        .where(eq(user.id, userId));

      return NextResponse.json({
        success: true,
        message: `Deducted ${amount} credits from ${targetUser[0].email}`,
        newCredits,
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin credits error:", errorMessage);
    return NextResponse.json(
      { error: "Operation failed: " + errorMessage },
      { status: 500 }
    );
  }
}
