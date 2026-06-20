import { db } from "@/db";
import { transaction, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { TransactionsClient } from "./transactions-client";

export default async function AdminTransactionsPage() {
  const transactions = await db
    .select({
      id: transaction.id,
      userId: transaction.userId,
      userEmail: user.email,
      amount: transaction.amount,
      creditsAdded: transaction.creditsAdded,
      method: transaction.method,
      status: transaction.status,
      proofUrl: transaction.proofUrl,
      createdAt: transaction.createdAt,
    })
    .from(transaction)
    .leftJoin(user, eq(transaction.userId, user.id))
    .orderBy(desc(transaction.createdAt));

  // Serialize dates to ISO strings for client component
  const serializedTransactions = transactions.map((t) => ({
    ...t,
    userEmail: t.userEmail ?? "Unknown",
    createdAt: t.createdAt.toISOString(),
  }));

  return <TransactionsClient initialTransactions={serializedTransactions} />;
}
