import { Database, Calendar, User, FileText, Activity } from "lucide-react";
import { db } from "@/db";
import { user, generationHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminGenerationsPage() {
  const generations = await db
    .select({
      id: generationHistory.id,
      userEmail: user.email,
      userName: user.name,
      sourceType: generationHistory.sourceType,
      productName: generationHistory.productName,
      inputTokens: generationHistory.inputTokens,
      outputTokens: generationHistory.outputTokens,
      content: generationHistory.content,
      createdAt: generationHistory.createdAt,
    })
    .from(generationHistory)
    .innerJoin(user, eq(user.id, generationHistory.userId))
    .orderBy(desc(generationHistory.createdAt))
    .limit(100);

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          Riwayat Generate (Token Tracking)
        </h1>
        <p className="text-muted-foreground">
          Melacak penggunaan token AI dan histori pembuatan naskah oleh user.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-sm text-muted-foreground">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Waktu</th>
                <th className="p-4 font-medium">Input (Source)</th>
                <th className="p-4 font-medium">Token Terpakai</th>
                <th className="p-4 font-medium">Hasil Naskah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {generations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Belum ada riwayat generate naskah.
                  </td>
                </tr>
              ) : (
                generations.map((gen) => (
                  <tr key={gen.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{gen.userName}</p>
                          <p className="text-xs text-muted-foreground truncate">{gen.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(gen.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-border mb-1">
                        {gen.sourceType.toUpperCase()}
                      </span>
                      <p className="text-sm truncate max-w-[200px] text-muted-foreground" title={gen.productName || "N/A"}>
                        {gen.productName || "N/A"}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-xs font-medium">
                        <div className="flex items-center gap-1.5 text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md w-fit whitespace-nowrap">
                          <Activity className="w-3.5 h-3.5 shrink-0" />
                          IN: {gen.inputTokens.toLocaleString("id-ID")}
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md w-fit whitespace-nowrap">
                          <Activity className="w-3.5 h-3.5 shrink-0" />
                          OUT: {gen.outputTokens.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs" title={gen.content}>
                          {gen.content}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
