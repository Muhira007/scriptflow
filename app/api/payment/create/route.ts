import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction, appSettings } from "@/db/schema";
import { snap } from "@/lib/midtrans";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { DEFAULT_PACKAGES } from "@/app/api/admin/packages/route";

export async function POST(request: NextRequest) {
  try {
    // 1. Validate session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch packages dynamically
    const settings = await db.select().from(appSettings).where(eq(appSettings.key, "TOPUP_PACKAGES"));
    let packages = DEFAULT_PACKAGES;
    if (settings.length > 0 && settings[0].value) {
      try {
        packages = JSON.parse(settings[0].value);
      } catch (e) {
        console.error("Failed to parse packages", e);
      }
    }

    // 2. Parse request
    const { packageId } = await request.json();
    const selectedPackage = packages.find((p: any) => p.id === packageId);

    if (!selectedPackage) {
      return NextResponse.json(
        { error: "Invalid package selection" },
        { status: 400 }
      );
    }

    // 3. Create transaction record
    const txId = `tx_${randomUUID().replace(/-/g, "").substring(0, 16)}`;
    const orderId = `VOGEN-${Date.now()}-${txId.substring(3, 11)}`;

    await db.insert(transaction).values({
      id: txId,
      userId: session.user.id,
      amount: selectedPackage.amount,
      creditsAdded: selectedPackage.credits,
      method: "midtrans_qris",
      status: "pending",
      midtransOrderId: orderId,
    });

    // 4. Create Midtrans Snap transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: selectedPackage.amount,
      },
      item_details: [
        {
          id: packageId,
          price: selectedPackage.amount,
          quantity: 1,
          name: `${selectedPackage.name} (${selectedPackage.credits} Credits)`,
        },
      ],
      customer_details: {
        email: session.user.email,
        first_name: session.user.name || "User",
      },
    };

    const snapTransaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: snapTransaction.token,
      redirectUrl: snapTransaction.redirect_url,
      orderId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Payment creation error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create payment: " + errorMessage },
      { status: 500 }
    );
  }
}
