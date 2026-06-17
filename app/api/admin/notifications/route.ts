import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction, user } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Admin
    const currentUser = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser.length || currentUser[0].role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Get pending transactions
    const pendingTransactions = await db
      .select({
        id: transaction.id,
        userEmail: user.email,
        amount: transaction.amount,
        createdAt: transaction.createdAt,
      })
      .from(transaction)
      .leftJoin(user, eq(transaction.userId, user.id))
      .where(eq(transaction.status, "pending"))
      .orderBy(desc(transaction.createdAt))
      .limit(5);

    const notifications = pendingTransactions.map((tx) => ({
      id: tx.id,
      title: "New Top Up Request",
      message: `${tx.userEmail} requested top up of Rp ${tx.amount.toLocaleString("id-ID")}`,
      time: new Date(tx.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      isUnread: true,
    }));

    if (notifications.length === 0) {
      notifications.push({
        id: "welcome-admin",
        title: "All caught up!",
        message: "There are no pending top up requests.",
        time: "Just now",
        isUnread: false,
      });
    }

    return NextResponse.json({ notifications, count: pendingTransactions.length });
  } catch (error: any) {
    console.error("Admin notifications GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
