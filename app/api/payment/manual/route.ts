import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction, appSettings } from "@/db/schema";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { eq } from "drizzle-orm";
import { DEFAULT_PACKAGES } from "@/app/api/admin/packages/route";

export async function POST(request: NextRequest) {
  try {
    // 1. Validate session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // 2. Parse form data
    const formData = await request.formData();
    const packageId = formData.get("packageId") as string;
    const proofFile = formData.get("proof") as File | null;
    
    const selectedPackage = packages.find((p: any) => p.id === packageId);

    if (!packageId || !selectedPackage) {
      return NextResponse.json({ error: "Invalid package selection" }, { status: 400 });
    }

    if (!proofFile) {
      return NextResponse.json({ error: "Proof of payment is required" }, { status: 400 });
    }

    // 3. Save the uploaded file
    const bytes = await proofFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExt = proofFile.name.split('.').pop() || 'jpg';
    const fileName = `proof_${Date.now()}_${randomUUID().substring(0, 8)}.${fileExt}`;
    
    const uploadDir = join(process.cwd(), "public", "uploads", "proofs");
    
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const proofUrl = `/uploads/proofs/${fileName}`;

    // 4. Create transaction record
    const txId = `tx_${randomUUID().replace(/-/g, "").substring(0, 16)}`;

    await db.insert(transaction).values({
      id: txId,
      userId: session.user.id,
      amount: selectedPackage.amount,
      creditsAdded: selectedPackage.credits,
      method: "manual_transfer",
      status: "pending",
      proofUrl: proofUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Bukti pembayaran berhasil diunggah. Menunggu persetujuan admin.",
      transactionId: txId,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Manual payment error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to submit manual payment: " + errorMessage },
      { status: 500 }
    );
  }
}
