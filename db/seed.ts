/**
 * Database Seed Script
 * 
 * Creates two dummy accounts as required by the PRD:
 * - User: user@generator.com / @Pasword123 / role: user / credits: 100
 * - Admin: admin@generator.com / @Pasword123 / role: admin / credits: 9999
 * 
 * Usage: npx tsx db/seed.ts
 */
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

async function seed() {
  console.log("🌱 Starting database seed...\n");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema });

  // Create a temporary auth instance for password hashing
  const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        role: { type: "string", required: false, defaultValue: "user", input: false },
        credits: { type: "number", required: false, defaultValue: 0, input: false },
      },
    },
  });

  const seedUsers = [
    {
      name: "User Demo",
      email: "user@generator.com",
      password: "@Pasword123",
      role: "user",
      credits: 100,
    },
    {
      name: "Admin Master",
      email: "admin@generator.com",
      password: "@Pasword123",
      role: "admin",
      credits: 9999,
    },
  ];

  for (const userData of seedUsers) {
    // Check if user already exists
    const existing = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, userData.email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏭️  User ${userData.email} already exists, skipping.`);
      continue;
    }

    // Use Better Auth's internal signup to properly hash passwords
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        },
      });

      if (result?.user?.id) {
        // Update role and credits (since these are input: false, they can't be set via signup)
        await db
          .update(schema.user)
          .set({ role: userData.role, credits: userData.credits })
          .where(eq(schema.user.id, result.user.id));

        console.log(
          `✅ Created ${userData.role}: ${userData.email} (credits: ${userData.credits})`
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to create ${userData.email}:`, errorMessage);
    }
  }

  console.log("\n🌱 Seed complete!");
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
