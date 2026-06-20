"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Trash2, Edit2, Loader2, Save, GripVertical } from "lucide-react";

type TopUpPackage = {
  id: string;
  name: string;
  amount: number;
  credits: number;
  features: string[];
  isPopular: boolean;
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<TopUpPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // For editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TopUpPackage | null>(null);
  const [featuresText, setFeaturesText] = useState("");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/admin/packages");
      const data = await res.json();
      if (data.packages) {
        setPackages(data.packages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const savePackages = async (newPackages: TopUpPackage[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages: newPackages }),
      });
      if (res.ok) {
        setPackages(newPackages);
        setEditingIndex(null);
      } else {
        alert("Failed to save packages");
      }
    } catch (e) {
      alert("Error saving packages");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (index: number, pkgList = packages) => {
    setEditingIndex(index);
    setEditForm({ ...pkgList[index] });
    setFeaturesText(pkgList[index].features.join("\n"));
  };

  const handleAddNew = () => {
    const newPkg: TopUpPackage = {
      id: `pkg_${Date.now()}`,
      name: "New Package",
      amount: 25000,
      credits: 50,
      features: ["Standard AI Models", "URL Scraping"],
      isPopular: false,
    };
    const newPackages = [...packages, newPkg];
    setPackages(newPackages);
    handleEdit(newPackages.length - 1, newPackages);
  };

  const handleDelete = (index: number) => {
    if (confirm("Yakin ingin menghapus paket ini?")) {
      const newPackages = packages.filter((_, i) => i !== index);
      savePackages(newPackages);
    }
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editForm) return;
    
    // Validasi ID kosong atau spasi
    if (!editForm.id.trim() || editForm.id.includes(" ")) {
      alert("ID tidak boleh kosong dan tidak boleh mengandung spasi. Gunakan underscore (_).");
      return;
    }

    const updatedForm = {
      ...editForm,
      features: featuresText.split("\n").map(f => f.trim()).filter(f => f),
    };

    const newPackages = [...packages];
    newPackages[editingIndex] = updatedForm;
    savePackages(newPackages);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newPackages = [...packages];
      const temp = newPackages[index - 1];
      newPackages[index - 1] = newPackages[index];
      newPackages[index] = temp;
      savePackages(newPackages);
    } else if (direction === "down" && index < packages.length - 1) {
      const newPackages = [...packages];
      const temp = newPackages[index + 1];
      newPackages[index + 1] = newPackages[index];
      newPackages[index] = temp;
      savePackages(newPackages);
    }
  };

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-primary" />
            Top-Up Packages
          </h1>
          <p className="text-muted-foreground">Atur daftar paket Top-Up Credit yang tersedia untuk user.</p>
        </div>
        <button 
          onClick={handleAddNew}
          disabled={saving || editingIndex !== null}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Tambah Paket
        </button>
      </div>

      <div className="space-y-5">
        {packages.map((pkg, index) => (
          <div key={pkg.id + index} className={`bg-card border-2 ${pkg.isPopular ? 'border-primary' : 'border-border'} rounded-3xl p-6 shadow-sm transition-all relative overflow-hidden`}>
            {pkg.isPopular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 rounded-bl-2xl text-xs font-bold tracking-wider uppercase">
                Most Popular
              </div>
            )}
            
            {editingIndex === index ? (
              <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ID Paket (Sistem)</label>
                    <input 
                      type="text" 
                      value={editForm?.id || ""} 
                      onChange={e => setEditForm({ ...editForm!, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="contoh_id_paket"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Tampilan</label>
                    <input 
                      type="text" 
                      value={editForm?.name || ""} 
                      onChange={e => setEditForm({ ...editForm!, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Harga (Rp)</label>
                    <input 
                      type="number" 
                      value={editForm?.amount || 0} 
                      onChange={e => setEditForm({ ...editForm!, amount: parseInt(e.target.value) || 0 })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jumlah Kredit</label>
                    <input 
                      type="number" 
                      value={editForm?.credits || 0} 
                      onChange={e => setEditForm({ ...editForm!, credits: parseInt(e.target.value) || 0 })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fitur (1 fitur per baris / enter)</label>
                  <textarea 
                    value={featuresText} 
                    onChange={e => setFeaturesText(e.target.value)}
                    rows={4}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed"
                    placeholder="URL Scraping Enabled&#10;Priority AI Processing"
                  />
                </div>

                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                  <input 
                    type="checkbox" 
                    id={`popular-${index}`}
                    checked={editForm?.isPopular || false}
                    onChange={e => setEditForm({ ...editForm!, isPopular: e.target.checked })}
                    className="w-5 h-5 text-primary rounded border-border focus:ring-primary"
                  />
                  <label htmlFor={`popular-${index}`} className="text-sm font-semibold cursor-pointer">
                    Tandai paket ini sebagai "Most Popular"
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-5 border-t border-border">
                  <button 
                    onClick={() => setEditingIndex(null)}
                    disabled={saving}
                    className="px-6 py-3 rounded-xl text-sm font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex flex-row md:flex-col gap-1 md:gap-2">
                  <button 
                    onClick={() => handleMove(index, "up")} 
                    disabled={index === 0 || saving}
                    className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors bg-muted/30"
                  >
                    <GripVertical className="w-4 h-4 rotate-90 md:rotate-0" />
                  </button>
                  <button 
                    onClick={() => handleMove(index, "down")} 
                    disabled={index === packages.length - 1 || saving}
                    className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors bg-muted/30"
                  >
                    <GripVertical className="w-4 h-4 rotate-90 md:rotate-0" />
                  </button>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">{pkg.name}</h3>
                    <span className="text-xs font-mono bg-muted/80 px-2.5 py-1 rounded-md text-muted-foreground border border-border/50">
                      id: {pkg.id}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-primary tracking-tight">
                      Rp {pkg.amount.toLocaleString("id-ID")}
                    </span>
                    <span className="text-lg text-muted-foreground font-medium">/ {pkg.credits} Credits</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {pkg.features.map((feature, i) => (
                      <span key={i} className="text-xs font-medium bg-secondary/30 text-secondary-foreground border border-secondary/20 px-3 py-1.5 rounded-lg">
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-auto w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                  <button 
                    onClick={() => handleEdit(index)}
                    disabled={saving || editingIndex !== null}
                    className="flex-1 md:flex-none p-3 md:p-4 flex items-center justify-center bg-muted/50 hover:bg-muted text-foreground rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(index)}
                    disabled={saving || editingIndex !== null}
                    className="flex-1 md:flex-none p-3 md:p-4 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {packages.length === 0 && !loading && (
          <div className="text-center py-16 bg-card/50 border-2 border-dashed border-border rounded-3xl">
            <Package className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum Ada Paket Top-Up</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">Tambahkan paket top-up pertama Anda agar user bisa mulai melakukan pembelian kredit.</p>
          </div>
        )}
      </div>
    </div>
  );
}
