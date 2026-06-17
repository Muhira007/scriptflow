"use client";

import { useState, useRef, useEffect } from "react";
import {
  Link2, Sparkles, Clock, Users, Type, Copy, CheckCircle2,
  Loader2, PlayCircle, Image as ImageIcon, Type as TextIcon, UploadCloud, Trash2, AlertCircle
} from "lucide-react";

import { useRouter } from "next/navigation";
import Link from "next/link";

type ParsedResult = {
  versionA?: string;
  versionB?: string;
  caption?: string;
};

type HistoryItem = {
  id: string;
  sourceType: string;
  productName: string | null;
  content: string;
  createdAt: string;
};

export default function GeneratorPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [activeTab, setActiveTab] = useState<"versionA" | "versionB" | "caption">("versionA");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [isCopiedText, setIsCopiedText] = useState(false);
  const [isCopiedCaption, setIsCopiedCaption] = useState(false);
  const [sourceTab, setSourceTab] = useState<"image" | "name" | "url">("name");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [bRoll, setBRoll] = useState(false);
  const [roleplay, setRoleplay] = useState(false);
  const [hookOnly, setHookOnly] = useState(false);

  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistories(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (hookOnly) {
      setBRoll(false);
      setRoleplay(false);
    }
  }, [hookOnly]);

  const handleDeleteHistory = async () => {
    if (!confirm("Yakin ingin menghapus semua riwayat?")) return;
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (res.ok) {
        setHistories([]);
      }
    } catch (err) {
      console.error("Failed to delete history");
    }
  };

  useEffect(() => {
    if (result) {
      try {
        const startIdx = result.indexOf('{');
        const endIdx = result.lastIndexOf('}');

        if (startIdx !== -1) {
          // Try standard JSON parsing first if we have closing brace
          if (endIdx !== -1 && endIdx > startIdx) {
            let cleanJson = result.substring(startIdx, endIdx + 1);
            try {
              const parsed = JSON.parse(cleanJson);
              if (parsed.versionA || parsed.versionB || parsed.caption) {
                setParsedResult(parsed);
                return;
              }
            } catch (e) {
              // fall through to lax parsing
            }
          }

          // Lax parsing / Regex fallback for truncated or malformed JSON
          const extractArray = (key: string) => {
            const keyIndex = result.indexOf(`"${key}"`);
            if (keyIndex === -1) return [];
            
            const afterKey = result.substring(keyIndex + key.length + 2);
            const startBracket = afterKey.indexOf('[');
            if (startBracket === -1) return [];
            
            const arrayContent = afterKey.substring(startBracket + 1);
            
            const matches: string[] = [];
            const stringRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
            let match;
            let lastIndex = 0;
            while ((match = stringRegex.exec(arrayContent)) !== null) {
              matches.push(match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'));
              lastIndex = stringRegex.lastIndex;
            }
            
            // Check for unclosed string at the end of the array
            const remaining = arrayContent.substring(lastIndex).trim();
            if (remaining.startsWith(',')) {
              const afterComma = remaining.substring(1).trim();
              if (afterComma.startsWith('"')) {
                const unclosedMatch = afterComma.match(/^"([^"\\]*(?:\\.[^"\\]*)*)$/);
                if (unclosedMatch) {
                  matches.push(unclosedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'));
                }
              }
            } else if (remaining.startsWith('"')) {
              const unclosedMatch = remaining.match(/^"([^"\\]*(?:\\.[^"\\]*)*)$/);
              if (unclosedMatch) {
                matches.push(unclosedMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'));
              }
            }
            return matches;
          };

          const versionA = extractArray("versionA");
          const versionB = extractArray("versionB");
          const caption = extractArray("caption");

          if (versionA.length > 0 || versionB.length > 0 || caption.length > 0) {
            setParsedResult({
              versionA: versionA.length > 0 ? versionA : undefined,
              versionB: versionB.length > 0 ? versionB : undefined,
              caption: caption.length > 0 ? caption : undefined,
            } as any);
            return;
          }
        }

        // Final fallback
        setParsedResult({ versionA: result });
      } catch (e) {
        setParsedResult({ versionA: result });
      }
    } else {
      setParsedResult(null);
    }
  }, [result]);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGenerating) return; // Mencegah double-click / spam klik

    setIsGenerating(true);
    setErrorMsg(null);
    setResult(null);
    setActiveTab("versionA");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("sourceTab", sourceTab);

    if (sourceTab === "image" && selectedFile) {
      formData.set("file", selectedFile);
    }

    // Convert checkbox states
    formData.set("bRoll", bRoll ? "true" : "false");
    formData.set("roleplay", roleplay ? "true" : "false");
    formData.set("hookOnly", hookOnly ? "true" : "false");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setResult(data.script);
      fetchHistory(); // Refresh history
      router.refresh(); // Refresh layout so Sidebar picks up the new credits balance
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("credit") || msg.toLowerCase().includes("kredit") || msg.toLowerCase().includes("top up")) {
        setShowTopupModal(true);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const getActiveText = () => {
    if (!result) return "";
    if (!parsedResult) return result;
    
    let textObj: any = "";
    if (activeTab === "versionA") textObj = parsedResult.versionA;
    else if (activeTab === "versionB") textObj = parsedResult.versionB;
    else if (activeTab === "caption") textObj = parsedResult.caption;
    
    if (!textObj) return "";
    
    let text = "";
    if (Array.isArray(textObj)) {
      text = textObj.join("\n\n");
    } else {
      text = String(textObj);
    }
    
    // Fix escaped newlines sometimes returned by AI in JSON
    return text.replace(/\\n/g, '\n');
  };

  const handleCopyCaption = () => {
    if (parsedResult?.caption) {
      navigator.clipboard.writeText(parsedResult.caption);
      setIsCopiedCaption(true);
      setTimeout(() => setIsCopiedCaption(false), 2000);
    }
  };

  const handleCopyText = () => {
    // If active tab is versionB, copy B. Otherwise, default to A.
    const textToCopy = activeTab === "versionB"
      ? parsedResult?.versionB
      : (activeTab === "caption" ? getActiveText() : parsedResult?.versionA);

    const text = textToCopy || getActiveText();

    if (text) {
      navigator.clipboard.writeText(text);
      setIsCopiedText(true);
      setTimeout(() => setIsCopiedText(false), 2000);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Utils
  const wordCount = getActiveText().trim() ? getActiveText().trim().split(/\s+/).length : 0;
  // Avg reading speed 200 words per minute -> 3.3 words per second
  const readingTimeSecs = Math.ceil(wordCount / 3.3);

  return (
    <div className="min-h-full lg:h-full flex flex-col lg:flex-row gap-8 animate-fade-in-up">
      {/* Left Column - Input Form */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 custom-scrollbar pb-8">

        {errorMsg && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleGenerate} className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-lg flex-1">
          <div className="space-y-6">

            {/* 1. SUMBER PRODUK */}
            <div className="space-y-4">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Sumber Produk
              </label>

              {/* Tabs */}
              <div className="flex bg-muted/50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSourceTab("name")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${sourceTab === "name" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <TextIcon className="w-4 h-4" />
                  Nama Produk
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab("url")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${sourceTab === "url" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Link2 className="w-4 h-4" />
                  Link URL
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab("image")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${sourceTab === "image" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Gambar Produk
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                {sourceTab === "name" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nama Produk & Detail Singkat
                    </label>
                    <textarea
                      name="name"
                      maxLength={1000}
                      placeholder="Masukkan nama produk dan keunggulannya..."
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[120px] resize-y"
                    />
                  </div>
                )}

                {sourceTab === "url" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Link URL Produk (Toko Online/Website)
                    </label>
                    <input
                      type="url"
                      name="url"
                      placeholder="https://example.com/product"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                )}

                {sourceTab === "image" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Upload Foto Produk
                    </label>
                    <input
                      type="file"
                      name="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer ${selectedFile ? 'bg-primary/5 border-primary/50' : 'bg-background/50'} group`}
                    >
                      <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors overflow-hidden">
                        {selectedFile ? (
                          <ImageIcon className="w-6 h-6 text-primary" />
                        ) : (
                          <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                        )}
                      </div>
                      <p className="text-base font-medium mb-1">
                        {selectedFile ? selectedFile.name : "Klik untuk unggah atau seret kesini"}
                      </p>
                      <p className="text-sm text-muted-foreground">PNG, JPG, JPEG (Maks. 5MB) - Diproses secara lokal</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 2. GAYA BAHASA */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Gaya Bahasa
                </label>
                <select name="style" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer">
                  <option>Santai & Gaul (Gen-Z)</option>
                  <option>Hard Selling (FOMO)</option>
                  <option>Storytelling (Bercerita)</option>
                  <option>Edukasi & Pakar</option>
                  <option>Savage & Lucu</option>
                  <option>ASMR / Calming</option>
                  <option>Elegan & Mewah</option>
                  <option>Misteri (Bikin Penasaran)</option>
                  <option>Curhat / POV</option>
                  <option>Jujur & Brutal Review</option>
                  <option>Tantangan (Challenge)</option>
                  <option>Tips & Hacks</option>
                  <option>Breaking News</option>
                  <option>Pantun / Rima</option>
                  <option>Motivasi / Inspiring</option>
                  <option>Ngerap / Cepat</option>
                </select>
              </div>

              {/* 3. TARGET AUDIENS */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Target Audiens
                </label>
                <select name="targetAudience" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer">
                  <option>Semua Gender (Umum)</option>
                  <option>Khusus Perempuan</option>
                  <option>Khusus Laki-laki</option>
                </select>
              </div>
            </div>

            {/* 4. DURASI VIDEO / JUMLAH HOOK */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {hookOnly ? "Jumlah Hook" : "Panjang Naskah"}
              </label>
              {hookOnly ? (
                <select key="select-hook" name="duration" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer">
                  <option>10 Hook</option>
                  <option>30 Hook</option>
                  <option>50 Hook</option>
                </select>
              ) : (
                <select key="select-duration" name="duration" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer">
                  <option value="short">Hasil Pendek</option>
                  <option value="standard">Hasil Standar</option>
                  <option value="medium">Hasil Menengah</option>
                  <option value="detailed">Hasil Mendetail</option>
                </select>
              )}
            </div>

            {/* 5. MODES (TOGGLES) */}
            <div className="space-y-4 pt-4 border-t border-border">

              <label className={`flex items-center justify-between group ${hookOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <span className="font-medium group-hover:text-primary transition-colors">Panduan Visual B-Roll</span>
                <input type="checkbox" name="bRoll" checked={bRoll} onChange={(e) => !hookOnly && setBRoll(e.target.checked)} disabled={hookOnly} className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
              </label>

              <label className={`flex items-center justify-between group ${hookOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <span className="font-medium group-hover:text-primary transition-colors">Mode Roleplay (Percakapan Q&A)</span>
                <input type="checkbox" name="roleplay" checked={roleplay} onChange={(e) => !hookOnly && setRoleplay(e.target.checked)} disabled={hookOnly} className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="font-medium group-hover:text-primary transition-colors">Mode Hanya Hook (Anti-Scroll)</span>
                <input type="checkbox" name="hookOnly" checked={hookOnly} onChange={(e) => setHookOnly(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
              </label>

            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-primary-foreground py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Script ({sourceTab === "name" ? 1 : sourceTab === "url" ? 2 : 3} Kredit)
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column - Result Area & History */}
      <div className="w-full lg:w-1/2 flex flex-col h-full pb-8 gap-6">

        {/* Result Area */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-lg flex flex-col relative overflow-hidden flex-shrink-0 min-h-[400px]">

          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Hasil Racikan AI
            </h2>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors border border-border"
                >
                  {isCopiedCaption ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  Salin Caption
                </button>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-background hover:bg-muted text-foreground rounded-lg transition-colors border border-border shadow-sm"
                >
                  {isCopiedText ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  Salin Text
                </button>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 relative flex flex-col">
            {!result && !isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-50">
                <Sparkles className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Naskah AI akan muncul di sini</p>
                <p className="text-sm">Isi form di samping dan klik generate untuk memulai.</p>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm z-10 rounded-xl">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-lg font-medium animate-pulse text-primary">Meracik Naskah & Caption...</p>
              </div>
            )}

            {parsedResult && (
              <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex border-b border-border mb-4">
                  <button
                    onClick={() => setActiveTab("versionA")}
                    className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === "versionA" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    Versi A (Hard-Selling)
                  </button>
                  <button
                    onClick={() => setActiveTab("versionB")}
                    className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === "versionB" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    Versi B (Storytelling)
                  </button>
                  <button
                    onClick={() => setActiveTab("caption")}
                    className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === "caption" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    Caption Sosmed
                  </button>
                </div>

                {/* Text Box */}
                <div className="flex-1 bg-muted/30 border border-border rounded-2xl p-5 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar text-foreground leading-relaxed text-[15px] whitespace-pre-wrap">
                  {getActiveText() || (
                    <span className="text-muted-foreground italic text-sm">
                      Konten untuk versi ini tidak tersedia atau terpotong saat proses generate. Coba jalankan kembali.
                    </span>
                  )}
                </div>

                {/* Footer Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mt-auto">
                  <span>Estimasi durasi baca: ~{readingTimeSecs} detik</span>
                  <span>{wordCount} Kata</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Area */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-lg flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Riwayat Terakhir
            </h3>
            {histories.length > 0 && (
              <button onClick={handleDeleteHistory} className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 font-medium transition-colors">
                <Trash2 className="w-3 h-3" />
                Hapus Riwayat
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : histories.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                Belum ada riwayat generate.
              </div>
            ) : (
              histories.map((hist) => (
                <div key={hist.id} className="bg-background border border-border rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-semibold text-sm truncate text-foreground">
                      {hist.productName || "Upload Gambar"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(hist.createdAt).toLocaleString("id-ID")} •
                      {(() => {
                        try {
                          JSON.parse(hist.content);
                          return " Naskah & Caption (JSON)";
                        } catch {
                          return " Naskah Lengkap (Markdown)";
                        }
                      })()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setResult(hist.content);
                      setActiveTab("versionA");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                  >
                    Buka Ulang
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Topup Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Kredit Anda Habis!</h3>
            <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed">
              Maaf, Anda tidak memiliki sisa kredit yang cukup untuk meracik naskah ini. Silakan isi ulang kredit Anda untuk melanjutkan.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/topup"
                className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Isi Ulang Sekarang
              </Link>
              <button
                onClick={() => setShowTopupModal(false)}
                className="w-full py-3 px-4 bg-transparent text-muted-foreground font-medium rounded-xl hover:bg-muted hover:text-foreground transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
