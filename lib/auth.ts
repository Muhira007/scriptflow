import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

console.log("[DEBUG] Is betterAuth a function?", typeof betterAuth);
console.log("[DEBUG] Is drizzleAdapter a function?", typeof drizzleAdapter);
console.log("[DEBUG] Is db defined?", typeof db);
console.log("[DEBUG] Adapter result:", typeof drizzleAdapter(db, { provider: "pg" }));

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification
    }
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Don't allow user to set role during signup
      },
      credits: {
        type: "number",
        required: false,
        defaultValue: 3,
        input: false, // Don't allow user to set credits during signup
      },
    },
  },
});
