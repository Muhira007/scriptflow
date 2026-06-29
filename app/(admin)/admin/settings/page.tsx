"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  CreditCard,
  Save,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type SettingsData = {
  aiProvider: string;
  geminiApiKey: string;
  deepseekApiKey: string;
  midtransServerKey: string;
  midtransClientKey: string;
  midtransIsProduction: boolean;
  hasGeminiKey: boolean;
  hasDeepseekKey: boolean;
  hasMidtransServerKey: boolean;
  hasMidtransClientKey: boolean;
  midtransEnabled: boolean;
  manualPaymentEnabled: boolean;
  manualPaymentBank: string;
  manualPaymentAccount: string;
  manualPaymentName: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "warning";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch {
        console.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiProvider: settings?.aiProvider,
          geminiApiKey: settings?.geminiApiKey,
          deepseekApiKey: settings?.deepseekApiKey,
          midtransEnabled: settings?.midtransEnabled,
          manualPaymentEnabled: settings?.manualPaymentEnabled,
          manualPaymentBank: settings?.manualPaymentBank,
          manualPaymentAccount: settings?.manualPaymentAccount,
          manualPaymentName: settings?.manualPaymentName,
        }),
      });
      const data = await res.json();
      setMessage({
        type: data.success ? "success" : "warning",
        text: data.message,
      });
    } catch {
      setMessage({ type: "warning", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {message && (
        <div className="fixed top-20 bottom-0 left-0 right-0 md:left-64 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-4 animate-scale-in">
            <div
              className={`p-4 rounded-full ${
                message.type === "success"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : (
                <AlertTriangle className="w-12 h-12" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-semibold">
                {message.type === "success" ? "Success!" : "Notice"}
              </h3>
              <p className="text-sm text-muted-foreground">{message.text}</p>
            </div>

            <button
              onClick={() => setMessage(null)}
              className="mt-2 w-full bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 animate-fade-in-up max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-muted-foreground">
            Manage application configurations, API keys, and security.
          </p>
        </div>

        <div className="grid gap-8">
          {/* AI Configuration Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                AI Providers Integration
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure your AI models and API keys.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">
                Active AI Provider
              </label>
              <select
                value={settings?.aiProvider || "gemini"}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, aiProvider: e.target.value } : null,
                  )
                }
                className="flex h-10 w-full md:w-1/2 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="gemini">Google Gemini API</option>
                <option value="deepseek">DeepSeek API</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">
                Google Gemini API Key
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="password"
                  value={settings?.geminiApiKey ?? ""}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, geminiApiKey: e.target.value } : null,
                    )
                  }
                  placeholder="AIzaSy..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                    settings?.hasGeminiKey || settings?.geminiApiKey
                      ? "bg-green-500/10 text-green-500 border border-green-500/30"
                      : "bg-red-500/10 text-red-500 border border-red-500/30"
                  }`}
                >
                  {settings?.hasGeminiKey || settings?.geminiApiKey
                    ? "Configured"
                    : "Not Set"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This key is used for the script generation engine. Overrides the{" "}
                <code className="bg-muted px-1 rounded">.env</code> file.
              </p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">
                DeepSeek API Key
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="password"
                  value={settings?.deepseekApiKey ?? ""}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, deepseekApiKey: e.target.value } : null,
                    )
                  }
                  placeholder="sk-..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                    settings?.hasDeepseekKey || settings?.deepseekApiKey
                      ? "bg-green-500/10 text-green-500 border border-green-500/30"
                      : "bg-red-500/10 text-red-500 border border-red-500/30"
                  }`}
                >
                  {settings?.hasDeepseekKey || settings?.deepseekApiKey
                    ? "Configured"
                    : "Not Set"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                DeepSeek API key for AI script generation. Overrides the{" "}
                <code className="bg-muted px-1 rounded">.env</code> file.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Configuration Section */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Midtrans Payment Gateway
                </h2>
                <p className="text-sm text-muted-foreground">
                  Configure QRIS and automated payment callbacks.
                </p>
              </div>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings?.midtransEnabled !== false}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, midtransEnabled: e.target.checked } : null,
                    )
                  }
                />
                <div
                  className={`block w-14 h-8 rounded-full transition-colors ${settings?.midtransEnabled !== false ? "bg-primary" : "bg-muted border border-border"}`}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings?.midtransEnabled !== false ? "transform translate-x-6" : ""}`}
                ></div>
              </div>
            </label>
          </div>

          <div
            className={`space-y-6 transition-opacity duration-300 ${settings?.midtransEnabled === false ? "opacity-40 pointer-events-none grayscale-[50%]" : ""}`}
          >
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground">
                Environment
              </label>
              <div className="flex items-center gap-3">
                <select
                  disabled
                  value={
                    settings?.midtransIsProduction ? "production" : "sandbox"
                  }
                  className="flex h-10 w-full md:w-1/2 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="production">Production (Live)</option>
                </select>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                    settings?.midtransIsProduction
                      ? "bg-red-500/10 text-red-500 border border-red-500/30"
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                  }`}
                >
                  {settings?.midtransIsProduction ? "LIVE" : "Sandbox"}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">
                  Server Key
                </label>
                <input
                  type="password"
                  value={settings?.midtransServerKey ?? ""}
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background cursor-not-allowed opacity-70"
                />
                <div
                  className={`text-xs font-medium ${
                    settings?.hasMidtransServerKey
                      ? "text-green-500"
                      : "text-amber-500"
                  }`}
                >
                  {settings?.hasMidtransServerKey
                    ? "✓ Configured"
                    : "⚠ Using placeholder"}
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">
                  Client Key
                </label>
                <input
                  type="text"
                  value={settings?.midtransClientKey ?? ""}
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background cursor-not-allowed opacity-70"
                />
                <div
                  className={`text-xs font-medium ${
                    settings?.hasMidtransClientKey
                      ? "text-green-500"
                      : "text-amber-500"
                  }`}
                >
                  {settings?.hasMidtransClientKey
                    ? "✓ Configured"
                    : "⚠ Using placeholder"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Payment Configuration Section */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Manual Payment Transfer
                </h2>
                <p className="text-sm text-muted-foreground">
                  Setup bank details for manual payments.
                </p>
              </div>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings?.manualPaymentEnabled || false}
                  onChange={(e) =>
                    setSettings((s) =>
                      s
                        ? { ...s, manualPaymentEnabled: e.target.checked }
                        : null,
                    )
                  }
                />
                <div
                  className={`block w-14 h-8 rounded-full transition-colors ${settings?.manualPaymentEnabled ? "bg-primary" : "bg-muted border border-border"}`}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings?.manualPaymentEnabled ? "transform translate-x-6" : ""}`}
                ></div>
              </div>
            </label>
          </div>

          {settings?.manualPaymentEnabled && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BCA, Mandiri"
                    value={settings?.manualPaymentBank ?? ""}
                    onChange={(e) =>
                      setSettings((s) =>
                        s ? { ...s, manualPaymentBank: e.target.value } : null,
                      )
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234567890"
                    value={settings?.manualPaymentAccount ?? ""}
                    onChange={(e) =>
                      setSettings((s) =>
                        s
                          ? { ...s, manualPaymentAccount: e.target.value }
                          : null,
                      )
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PT VO Generator"
                    value={settings?.manualPaymentName ?? ""}
                    onChange={(e) =>
                      setSettings((s) =>
                        s ? { ...s, manualPaymentName: e.target.value } : null,
                      )
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <div className="bg-amber-500/10 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Admin Account Security</h2>
              <p className="text-sm text-muted-foreground">
                Manage your credentials and access.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">
                  Admin Email
                </label>
                <input
                  type="email"
                  defaultValue="admin@generator.com"
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background cursor-not-allowed opacity-70"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password to change..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Note:</span> API keys and
            payment configurations are stored in the{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.env</code>{" "}
            file. To update these values, edit the file directly and restart the
            development server.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-4">
          <button className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-foreground transition-colors">
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Configuration
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
