import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { generationHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db
      .select()
      .from(generationHistory)
      .where(eq(generationHistory.userId, session.user.id))
      .orderBy(desc(generationHistory.createdAt))
      .limit(10);

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error("Fetch history error:", error.message);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(generationHistory)
      .where(eq(generationHistory.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete history error:", error.message);
    return NextResponse.json({ error: "Failed to delete history" }, { status: 500 });
  }
}
