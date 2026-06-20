import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ notifications: [] });
    }

    const userId = session.user.id;

    // Fetch successful top-ups
    const txs = await db.select()
      .from(transaction)
      .where(and(eq(transaction.userId, userId), eq(transaction.status, "success")))
      .orderBy(desc(transaction.createdAt))
      .limit(5);

    const notifications = txs.map(tx => {
      const diffMs = Date.now() - new Date(tx.createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);
      
      let timeStr = "Baru saja";
      if (diffDays > 0) timeStr = `${diffDays} hari yang lalu`;
      else if (diffHrs > 0) timeStr = `${diffHrs} jam yang lalu`;
      else if (diffMins > 0) timeStr = `${diffMins} menit yang lalu`;

      return {
        id: tx.id,
        title: "Top Up Berhasil ⚡",
        message: `Anda berhasil menambahkan ${tx.credits} kredit ke akun Anda.`,
        time: timeStr,
        read: true,
      };
    });

    // Default system notification
    notifications.push({
      id: "sys-welcome",
      title: "Selamat datang di VOGen.ai! 🎉",
      message: "Mulai hasilkan naskah dan voice-over viral Anda sekarang.",
      time: "Sistem",
      read: true,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}
