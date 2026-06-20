import "dotenv/config";
import { db } from "./db";
import { appSettings } from "./db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const result = await db.select().from(appSettings).where(eq(appSettings.key, "DEEPSEEK_API_KEY"));
  console.log("DEEPSEEK_API_KEY in DB:", result);
  process.exit(0);
}
main();
