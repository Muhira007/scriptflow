import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transaction, user } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { snap } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    const notificationJson = await request.json();

    // Verify the notification with Midtrans
    const statusResponse = await snap.transaction.notification(notificationJson);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `[Midtrans Webhook] Order: ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`
    );

    // Find the transaction in our database
    const tx = await db
      .select()
      .from(transaction)
      .where(eq(transaction.midtransOrderId, orderId))
      .limit(1);

    if (!tx.length) {
      console.error(`[Midtrans Webhook] Transaction not found for order: ${orderId}`);
      return NextResponse.json({ status: "ok" }); // Still return 200 to Midtrans
    }

    const currentTx = tx[0];

    // Handle transaction status
    if (
      transactionStatus === "capture" ||
      transactionStatus === "settlement"
    ) {
      // Payment successful
      if (fraudStatus === "accept" || !fraudStatus) {
        // Only update if not already success (idempotency)
        if (currentTx.status !== "success") {
          // Update transaction status
          await db
            .update(transaction)
            .set({ status: "success" })
            .where(eq(transaction.id, currentTx.id));

          // Increment user credits
          await db
            .update(user)
            .set({ credits: sql`${user.credits} + ${currentTx.creditsAdded}` })
            .where(eq(user.id, currentTx.userId));

          console.log(
            `[Midtrans Webhook] ✅ Payment success for order ${orderId}. Added ${currentTx.creditsAdded} credits to user ${currentTx.userId}`
          );
        }
      }
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      // Payment failed
      await db
        .update(transaction)
        .set({ status: "failed" })
        .where(eq(transaction.id, currentTx.id));

      console.log(
        `[Midtrans Webhook] ❌ Payment ${transactionStatus} for order ${orderId}`
      );
    } else if (transactionStatus === "pending") {
      console.log(`[Midtrans Webhook] ⏳ Payment pending for order ${orderId}`);
    }

    // Always return 200 to Midtrans
    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Midtrans Webhook] Error:", errorMessage);
    // Still return 200 to prevent Midtrans from retrying
    return NextResponse.json({ status: "ok" });
  }
}
