import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Validate admin session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserRole = (session.user as { role?: string }).role;
    if (currentUserRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    // 2. Parse request
    const { userId, role } = await request.json();

    if (!userId || !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "userId and role (user/admin) are required" },
        { status: 400 }
      );
    }

    // 3. Prevent self-demotion
    if (userId === session.user.id && role !== "admin") {
      return NextResponse.json(
        { error: "You cannot remove your own admin role" },
        { status: 400 }
      );
    }

    // 4. Find target user
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

    // 5. Update role
    await db
      .update(user)
      .set({ role })
      .where(eq(user.id, userId));

    return NextResponse.json({
      success: true,
      message: `User ${targetUser[0].email} role changed to ${role}`,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin role update error:", errorMessage);
    return NextResponse.json(
      { error: "Operation failed: " + errorMessage },
      { status: 500 }
    );
  }
}
