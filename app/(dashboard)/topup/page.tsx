import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { TopUpClient } from "./TopUpClient";
import { DEFAULT_PACKAGES } from "@/app/api/admin/packages/route";

export default async function TopUpPage() {
  // Fetch settings from DB
  const dbSettings = await db.select().from(appSettings);
  const settingsMap = dbSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const manualPaymentEnabled = settingsMap["MANUAL_PAYMENT_ENABLED"] === "true";
  const manualPaymentBank = settingsMap["MANUAL_PAYMENT_BANK"] || "";
  const manualPaymentAccount = settingsMap["MANUAL_PAYMENT_ACCOUNT"] || "";
  const manualPaymentName = settingsMap["MANUAL_PAYMENT_NAME"] || "";
  const midtransEnabled = settingsMap["MIDTRANS_ENABLED"] !== "false";

  let packages = DEFAULT_PACKAGES;
  if (settingsMap["TOPUP_PACKAGES"]) {
    try {
      packages = JSON.parse(settingsMap["TOPUP_PACKAGES"]);
    } catch (e) {
      console.error("Error parsing packages", e);
    }
  }

  return (
    <TopUpClient 
      midtransClientKey={process.env.MIDTRANS_CLIENT_KEY || ""}
      midtransIsProduction={process.env.MIDTRANS_IS_PRODUCTION === "true"}
      midtransEnabled={midtransEnabled}
      manualPaymentEnabled={manualPaymentEnabled}
      manualPaymentBank={manualPaymentBank}
      manualPaymentAccount={manualPaymentAccount}
      manualPaymentName={manualPaymentName}
      packages={packages}
    />
  );
}
