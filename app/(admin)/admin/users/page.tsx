import { db } from "@/db";
import { user } from "@/db/schema";
import { desc } from "drizzle-orm";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  // Serialize dates to ISO strings for client component
  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <UsersClient initialUsers={serializedUsers} />;
}
