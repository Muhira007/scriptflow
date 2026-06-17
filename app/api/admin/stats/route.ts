import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, transaction } from "@/db/schema";
import { eq, sql, count, sum, desc } from "drizzle-orm";

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

    // 2. Get total users
    const totalUsersResult = await db
      .select({ count: count() })
      .from(user);
    const totalUsers = totalUsersResult[0]?.count ?? 0;

    // 3. Get total revenue (sum of successful transactions)
    const totalRevenueResult = await db
      .select({ total: sum(transaction.amount) })
      .from(transaction)
      .where(eq(transaction.status, "success"));
    const totalRevenue = Number(totalRevenueResult[0]?.total ?? 0);

    // 4. Get pending approvals count
    const pendingResult = await db
      .select({ count: count() })
      .from(transaction)
      .where(eq(transaction.status, "pending"));
    const pendingApprovals = pendingResult[0]?.count ?? 0;

    // 5. Get total successful transactions count
    const successTxResult = await db
      .select({ count: count() })
      .from(transaction)
      .where(eq(transaction.status, "success"));
    const totalSuccessTransactions = successTxResult[0]?.count ?? 0;

    // 6. Get 5 most recent signups
    const recentSignups = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(5);

    return NextResponse.json({
      totalUsers,
      totalRevenue,
      pendingApprovals,
      totalSuccessTransactions,
      recentSignups,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin stats error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch stats: " + errorMessage },
      { status: 500 }
    );
  }
}
