import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Menggunakan API Key spesifik untuk pengetesan murni
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("=> [Test API] Memulai ping ke Gemini API...");
    
    // Panggilan paling dasar, tanpa responseSchema, tanpa MimeType
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Tolong ceritakan secara singkat tentang sejuknya udara pagi di pegunungan. Maksimal 3 kalimat saja.",
      config: {
        temperature: 0.4,
      }
    });

    const generatedText = response.text || "";
    const inputTokens = response.usageMetadata?.promptTokenCount || 0;
    const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
    
    console.log("=> [Test API] Selesai! IN:", inputTokens, "| OUT:", outputTokens);

    return NextResponse.json({
      success: true,
      message: "Berhasil! Ini adalah tes API murni paling sederhana.",
      result: generatedText,
      usage: {
        inputTokens,
        outputTokens,
        total: response.usageMetadata?.totalTokenCount || 0
      }
    });

  } catch (error: any) {
    console.error("Error pada Test API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
