import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Part } from "@google/genai";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, generationHistory } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import * as cheerio from "cheerio";

import { appSettings } from "@/db/schema";
// Global AI instance removed; initialized per-request now.
export async function POST(request: NextRequest) {
  try {
    // 1. Validate session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Parse FormData first to calculate dynamic cost
    const formData = await request.formData();
    const sourceTab = formData.get("sourceTab") as string;
    const style = formData.get("style") as string;
    const tone = formData.get("tone") as string;
    const audience = formData.get("audience") as string;
    const duration = formData.get("duration") as string;
    const bRoll = formData.get("bRoll") === "true";
    const roleplay = formData.get("roleplay") === "true";
    const hookOnly = formData.get("hookOnly") === "true";

    // 3. Cek Kredit User (Biaya Bertingkat)
    let requiredCredits = 1;
    if (sourceTab === "url") requiredCredits = 2;
    if (sourceTab === "image") requiredCredits = 3;

    const currentUser = await db
      .select({ credits: user.credits, id: user.id })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (currentUser[0].credits < requiredCredits) {
      return NextResponse.json({ error: `Kredit tidak cukup. Fitur ini membutuhkan ${requiredCredits} kredit. Silakan Top Up.` }, { status: 403 });
    }

    // 4b. Fetch API Key from DB or fallback to .env
    const setting = await db
      .select({ value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, "GEMINI_API_KEY"))
      .limit(1);
    
    const dbApiKey = setting.length > 0 ? setting[0].value : "";
    const apiKey = dbApiKey || process.env.GOOGLE_GEMINI_API_KEY || "";
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API Key is not configured. Please contact the administrator." },
        { status: 500 }
      );
    }
    
    const ai = new GoogleGenAI({ apiKey });

    let sourceContent: string | Part = "";

    // 4. Handle Input Sources
    if (sourceTab === "image") {
      const file = formData.get("file") as File | null;
      if (!file || file.size === 0) {
        return NextResponse.json({ error: "Image file is required." }, { status: 400 });
      }

      const buffer = await file.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");

      sourceContent = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };
    } else if (sourceTab === "url") {
      const url = formData.get("url") as string;
      if (!url) {
        return NextResponse.json({ error: "URL is required." }, { status: 400 });
      }

      let title = "";
      let description = "";
      let bodyText = "";

      try {
        const fetchRes = await fetch(url, { 
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          signal: AbortSignal.timeout(8000)
        });
        
        if (fetchRes.ok) {
          const html = await fetchRes.text();
          const $ = cheerio.load(html || "");
          
          $('script, style, nav, footer, header, iframe, noscript').remove();
          
          title = $('title').text().trim();
          description = $('meta[name="description"]').attr('content') || '';
          bodyText = $('body').text().replace(/\s+/g, ' ').trim();
        }
      } catch (err) {
        console.warn("Fetch URL gagal atau diblokir. Melanjutkan dengan slug URL:", err);
      }

      let parsedUrlSlug = "";
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        const potentialSlug = pathParts.find(p => p.includes("-") && p.length > 5) || pathParts.pop() || "";
        parsedUrlSlug = decodeURIComponent(potentialSlug.replace(/-i\.\d+\.\d+.*$/, '').replace(/-/g, ' '));
      } catch (e) {}
      
      sourceContent = `Informasi Sumber URL:\nURL Asli: ${url}\nKemungkinan Nama Produk dari URL: ${parsedUrlSlug}\nJudul Halaman: ${title}\nDeskripsi: ${description}\nKonten Teks: ${bodyText.substring(0, 5000)}`;
    } else if (sourceTab === "name") {
      const name = formData.get("name") as string;
      if (!name) {
        return NextResponse.json({ error: "Product name is required." }, { status: 400 });
      }
      sourceContent = `Product Name/Details: ${name}`;
    }

    let durationGuidance = "";
    if (!hookOnly) {
      let lengthDesc = "standar (ideal untuk video TikTok/Reels)";
      if (duration === "short") lengthDesc = "sangat pendek (langsung ke intisari, ringkas, dan padat)";
      else if (duration === "medium") lengthDesc = "menengah (penjelasan komprehensif namun tidak bertele-tele)";
      else if (duration === "detailed") lengthDesc = "mendetail (long-form, narasi panjang dan menyeluruh)";
      
      durationGuidance = `- Panjang Naskah: Harap sesuaikan panjang teks untuk target "Hasil ${lengthDesc}".`;
    }

    // 5. System Instruction & Prompt
    const systemInstruction = `Kamu adalah seorang Copywriter & Video Scriptwriter profesional kelas atas.
Tugasmu adalah membuat naskah voice-over video pendek (TikTok/Reels/Shorts) untuk mempromosikan produk/jasa.

ATURAN GAYA BAHASA & AUDIENS:
- Gaya Bahasa: ${tone || "Casual & Menarik"}
- Target Audiens: ${audience || "Umum"}

ATURAN STRUKTUR TEKS:
- FORMAT PARAGRAF: Pecah naskah menjadi beberapa paragraf pendek (maksimal 2-3 kalimat per paragraf). Karena output AI berupa ARRAY OF STRINGS, masukkan setiap paragraf sebagai elemen/item array yang terpisah. Jangan menumpuk teks.
${hookOnly 
  ? "- MODE HANYA HOOK (ANTI-SCROLL) AKTIF: SANGAT PENTING! Buat NASKAH BERUPA KUMPULAN HOOK PENDEK sebanyak 10-30 kalimat pancingan. Masing-masing hook maksimal 1-3 kalimat pemancing agar penonton berhenti scroll. JANGAN menulis penjelasan fitur, cerita panjang, atau harga. Cukup bikin penasaran ekstrem!" 
  : "- Buatlah naskah dari awal (Hook), tengah (Isi/Nilai Jual), hingga akhir (Call to Action)."
}
${roleplay && !hookOnly 
  ? "- MODE ROLEPLAY AKTIF: Buat naskah dalam format percakapan (Misal: Tanya-Jawab antara 2 orang, atau POV kreator merespon komentar). Buat interaksinya sangat natural." 
  : ""
}
${bRoll && !hookOnly 
  ? "- KARENA MODE B-ROLL AKTIF: Pisahkan setiap pergantian adegan menjadi paragraf baru. Awali setiap paragraf dengan panduan visual di dalam kurung siku, lalu diikuti teks narasinya di bawahnya. Contoh format:\n\n[Visual: Close up produk X]\nWah, ini dia rahasianya!\n\n[Visual: Tangan memegang produk]\nNggak nyangka banget kan..." 
  : "- KARENA MODE B-ROLL NONAKTIF: DILARANG KERAS menuliskan panduan visual, adegan kamera, (Nada bicara), atau B-Roll apapun dalam teks. Hanya tuliskan kalimat narasinya murni."}
${durationGuidance}`;

    const userPromptText = `Buatkan teks promosi berdasarkan informasi produk/gambar berikut sesuai dengan instruksi yang diberikan.`;

    const contents = typeof sourceContent === "string" 
      ? `${userPromptText}\n\n${sourceContent}`
      : [sourceContent, userPromptText];

    // 6. Call AI API with Retry & Fallback (robust failover for 503 errors)
    let response;
    const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      let attempts = 2;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`[Generate] Trying model ${modelName} (Attempt ${attempt}/${attempts})...`);
          response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.8,
              maxOutputTokens: 4000,
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  versionA: { 
                    type: "ARRAY", 
                    items: { type: "STRING" },
                    description: "Kumpulan paragraf naskah narasi versi 1 (Hard-Selling/To The Point). 1 item array = 1 paragraf." 
                  },
                  versionB: { 
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: "Kumpulan paragraf naskah narasi versi 2 (Storytelling/Emosional). 1 item array = 1 paragraf." 
                  },
                  caption: { 
                    type: "ARRAY",
                    items: { type: "STRING" },
                    description: "Kumpulan paragraf caption media sosial yang relevan lengkap dengan hashtag populer yang cocok. 1 item array = 1 paragraf." 
                  },
                },
                required: ["versionA", "versionB", "caption"],
              },
            },
          });
          if (response && response.text) {
            console.log(`[Generate] Success using model ${modelName}`);
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[Generate] Model ${modelName} attempt ${attempt} failed:`, err.message || err);
          if (attempt < attempts) {
            await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
          }
        }
      }
      if (response && response.text) {
        break;
      }
    }

    if (!response || !response.text) {
      const errorMessage = lastError instanceof Error ? lastError.message : JSON.stringify(lastError);
      return NextResponse.json(
        { error: "AI failed to generate content: " + errorMessage },
        { status: 500 }
      );
    }

    const generatedText = response.text || "";
    const inputTokens = response.usageMetadata?.promptTokenCount || 0;
    const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
    
    if (!generatedText) {
      return NextResponse.json(
        { error: "AI failed to generate content. Please try again." },
        { status: 500 }
      );
    }

    // 7. Deduct credits & Save History
    await db.transaction(async (tx) => {
      await tx.insert(generationHistory).values({
        userId: session.user.id,
        sourceType: sourceTab,
        productName: sourceTab === "name" ? formData.get("name") as string : (sourceTab === "url" ? formData.get("url") as string : "Uploaded Image"),
        content: generatedText,
        inputTokens,
        outputTokens,
      });

      await tx.update(user)
      .set({ credits: currentUser[0].credits - requiredCredits })
      .where(eq(user.id, session.user.id));
    });

    // 8. Return result
    return NextResponse.json({
      success: true,
      script: generatedText,
      creditsRemaining: currentUser[0].credits - requiredCredits,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Generate error:", errorMessage);
    return NextResponse.json(
      { error: "Generation failed: " + errorMessage },
      { status: 500 }
    );
  }
}
