import "dotenv/config";
import { auth } from "./lib/auth";
import { db } from "./db";
import { user } from "./db/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const res = await auth.api.signUpEmail({
      headers: new Headers(),
      body: {
        email: "admin@generator.com",
        password: "password123",
        name: "Admin User"
      }
    });
    console.log("Registered:", res);
    
    await db.update(user).set({ role: "admin" }).where(eq(user.email, "admin@generator.com"));
    console.log("Role updated to admin.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
main();
