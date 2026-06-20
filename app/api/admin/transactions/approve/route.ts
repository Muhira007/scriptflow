import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction, user } from "@/db/schema";
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
    const { transactionId, action } = await request.json();

    if (!transactionId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "transactionId and action (approve/reject) are required" },
        { status: 400 }
      );
    }

    // 3. Find transaction
    const tx = await db
      .select()
      .from(transaction)
      .where(eq(transaction.id, transactionId))
      .limit(1);

    if (!tx.length) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const currentTx = tx[0];

    if (currentTx.status !== "pending") {
      return NextResponse.json(
        { error: `Transaction is already ${currentTx.status}` },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Approve: update status + add credits
      await db
        .update(transaction)
        .set({ status: "success" })
        .where(eq(transaction.id, transactionId));

      await db
        .update(user)
        .set({ credits: sql`${user.credits} + ${currentTx.creditsAdded}` })
        .where(eq(user.id, currentTx.userId));

      return NextResponse.json({
        success: true,
        message: `Approved. Added ${currentTx.creditsAdded} credits to user.`,
      });
    } else {
      // Reject
      await db
        .update(transaction)
        .set({ status: "failed" })
        .where(eq(transaction.id, transactionId));

      return NextResponse.json({
        success: true,
        message: "Transaction rejected.",
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin approve error:", errorMessage);
    return NextResponse.json(
      { error: "Operation failed: " + errorMessage },
      { status: 500 }
    );
  }
}
