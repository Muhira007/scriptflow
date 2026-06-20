"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";

// Define Snap global to satisfy TS
declare global {
  interface Window {
    snap: any;
  }
}

type TopUpPackage = {
  id: string;
  name: string;
  amount: number;
  credits: number;
  features: string[];
  isPopular: boolean;
};

type TopUpClientProps = {
  midtransClientKey: string;
  midtransIsProduction: boolean;
  midtransEnabled?: boolean;
  manualPaymentEnabled: boolean;
  manualPaymentBank: string;
  manualPaymentAccount: string;
  manualPaymentName: string;
  packages: TopUpPackage[];
};

export function TopUpClient({
  midtransClientKey,
  midtransIsProduction,
  midtransEnabled = true,
  manualPaymentEnabled,
  manualPaymentBank,
  manualPaymentAccount,
  manualPaymentName,
  packages,
}: TopUpClientProps) {
  const router = useRouter();
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ id: string; name: string; amount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"midtrans" | "manual">("midtrans");
  
  // Manual upload state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load Midtrans Snap script
  useEffect(() => {
    if (!midtransClientKey) return;
    
    const scriptUrl = midtransIsProduction 
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
      
    const scriptTag = document.createElement("script");
    scriptTag.src = scriptUrl;
    scriptTag.setAttribute("data-client-key", midtransClientKey);
    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, [midtransClientKey, midtransIsProduction]);

  const handleBuyClick = (pkgId: string, pkgName: string, amount: number) => {
    if (!midtransEnabled && !manualPaymentEnabled) {
      alert("Tidak ada metode pembayaran yang tersedia saat ini. Silakan hubungi admin.");
      return;
    }
    setSelectedPackage({ id: pkgId, name: pkgName, amount });
    setPaymentMethod(midtransEnabled ? "midtrans" : "manual");
    setProofFile(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedPackage) return;
    
    if (paymentMethod === "midtrans") {
      setLoadingPkg(selectedPackage.id);
      try {
        const res = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId: selectedPackage.id }),
        });
        const data = await res.json();
        
        if (data.success && data.token) {
          setShowModal(false);
          window.snap.pay(data.token, {
            onSuccess: function (result: any) {
              alert("Pembayaran berhasil!");
              router.push("/dashboard");
            },
            onPending: function (result: any) {
              alert("Menunggu pembayaran Anda!");
            },
            onError: function (result: any) {
              alert("Pembayaran gagal!");
            },
            onClose: function () {
              // Customer closed the popup without finishing the payment
            },
          });
        } else {
          alert("Gagal memulai pembayaran: " + (data.error || "Kesalahan tidak diketahui"));
        }
      } catch (e) {
        alert("Kesalahan jaringan.");
      } finally {
        setLoadingPkg(null);
      }
    } else {
      // Manual Payment
      if (!proofFile) {
        alert("Harap unggah gambar bukti pembayaran.");
        return;
      }
      
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("packageId", selectedPackage.id);
        formData.append("proof", proofFile);
        
        const res = await fetch("/api/payment/manual", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        if (data.success) {
          setSuccessMsg(data.message);
          setTimeout(() => {
            setShowModal(false);
            router.push("/dashboard"); // Or wherever to show pending status
          }, 3000);
        } else {
          alert(data.error || "Gagal mengirim pembayaran");
        }
      } catch (e) {
        alert("Kesalahan unggah.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-2">Isi Ulang Kredit</h1>
        <p className="text-muted-foreground">Beli lebih banyak kredit untuk terus membuat video viral.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className={
              pkg.isPopular 
                ? "bg-gradient-to-b from-primary/20 to-card border border-primary rounded-3xl p-8 relative shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col" 
                : "bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 hover:border-primary/50 transition-colors shadow-sm flex flex-col"
            }
          >
            {pkg.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                Paling Populer
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
            <p className="text-muted-foreground mb-6">Paket Spesial Top-Up</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold">Rp {pkg.amount.toLocaleString("id-ID")}</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span><strong>{pkg.credits} Kredit</strong></span>
              </li>
              {pkg.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => handleBuyClick(pkg.id, pkg.name, pkg.amount)}
              disabled={loadingPkg === pkg.id}
              className={`w-full py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-auto ${
                pkg.isPopular
                  ? "bg-primary hover:opacity-90 text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {loadingPkg === pkg.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              Beli {pkg.name}
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-muted/30 border border-border rounded-2xl p-6 mt-4 max-w-6xl">
        <h4 className="font-semibold mb-2">Metode Pembayaran yang Didukung:</h4>
        <p className="text-sm text-muted-foreground">
          {midtransEnabled && "Kami menggunakan Midtrans untuk pembayaran otomatis yang aman (QRIS, GoPay, OVO, Virtual Account). "}
          {manualPaymentEnabled && "Transfer Bank Manual juga tersedia jika dibutuhkan."}
          {!midtransEnabled && !manualPaymentEnabled && "Tidak ada metode pembayaran yang tersedia."}
        </p>
      </div>

      {/* Payment Modal */}
      {showModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">Pembayaran: {selectedPackage.name}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {successMsg ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-500 mb-2">Berhasil!</h3>
                  <p className="text-muted-foreground">{successMsg}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-xl flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">Total Tagihan:</span>
                    <span className="text-2xl font-bold text-primary">
                      Rp {selectedPackage.amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {midtransEnabled && manualPaymentEnabled && (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold">Pilih Metode Pembayaran:</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setPaymentMethod("midtrans")}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${paymentMethod === "midtrans" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                        >
                          <div className="font-bold mb-1">Otomatis (Midtrans)</div>
                          <div className="text-xs text-muted-foreground">QRIS, E-Wallet, VA</div>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod("manual")}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${paymentMethod === "manual" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                        >
                          <div className="font-bold mb-1">Transfer Manual</div>
                          <div className="text-xs text-muted-foreground">Unggah Bukti</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "manual" && manualPaymentEnabled && (
                    <div className="animate-fade-in-up space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                      <p className="text-sm">Silakan transfer sejumlah <strong>Rp {selectedPackage.amount.toLocaleString("id-ID")}</strong> ke:</p>
                      <div className="bg-background p-4 rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground">Nama Bank</p>
                        <p className="font-bold text-lg mb-2">{manualPaymentBank}</p>
                        
                        <p className="text-sm text-muted-foreground">Nomor Rekening</p>
                        <p className="font-bold text-lg mb-2 tracking-wider">{manualPaymentAccount}</p>
                        
                        <p className="text-sm text-muted-foreground">Nama Rekening</p>
                        <p className="font-bold">{manualPaymentName}</p>
                      </div>

                      <div className="space-y-2 mt-4">
                        <label className="text-sm font-semibold">Unggah Bukti Transfer</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${proofFile ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                            <UploadCloud className={`w-6 h-6 ${proofFile ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium">
                              {proofFile ? proofFile.name : "Klik atau seret gambar ke sini"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!successMsg && (
              <div className="p-6 border-t border-border shrink-0 bg-muted/10">
                <button 
                  onClick={handleProcessPayment}
                  disabled={uploading || loadingPkg !== null}
                  className="w-full py-4 rounded-xl font-bold bg-primary hover:opacity-90 text-primary-foreground flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                >
                  {uploading || loadingPkg !== null ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  {paymentMethod === "midtrans" ? "Lanjutkan Pembayaran" : "Kirim Bukti Pembayaran"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
