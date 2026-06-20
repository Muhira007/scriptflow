import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

    // 2. Fetch all transactions with user email
    const transactions = await db
      .select({
        id: transaction.id,
        userId: transaction.userId,
        userEmail: user.email,
        amount: transaction.amount,
        creditsAdded: transaction.creditsAdded,
        method: transaction.method,
        status: transaction.status,
        proofUrl: transaction.proofUrl,
        createdAt: transaction.createdAt,
      })
      .from(transaction)
      .leftJoin(user, eq(transaction.userId, user.id))
      .orderBy(desc(transaction.createdAt));

    return NextResponse.json({ transactions });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin transactions list error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch transactions: " + errorMessage },
      { status: 500 }
    );
  }
}
