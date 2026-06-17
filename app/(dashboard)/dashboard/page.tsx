import { LayoutDashboard, Zap, Clock, Video, PlayCircle, Image as ImageIcon, Link2, Type as TextIcon } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, generationHistory } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DashboardOverviewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch real data from the database
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  const availableCredits = currentUser?.credits || 0;

  // Fetch generation statistics
  const generationStats = await db
    .select({ count: count() })
    .from(generationHistory)
    .where(eq(generationHistory.userId, session.user.id));
    
  const scriptsGenerated = generationStats[0].count;
  const timeSavedMinutes = scriptsGenerated * 30; // Assuming each script saves 30 minutes
  const timeSavedStr = timeSavedMinutes >= 60 
    ? `${(timeSavedMinutes / 60).toFixed(1)}h` 
    : `${timeSavedMinutes}m`;
  
  // Fetch recent history
  const recentHistory = await db.query.generationHistory.findMany({
    where: eq(generationHistory.userId, session.user.id),
    orderBy: [desc(generationHistory.createdAt)],
    limit: 5,
  });

  const stats = [
    { title: "Available Credits", value: availableCredits.toString(), icon: Zap, color: "text-primary", bg: "bg-primary/10" },
    { title: "Scripts Generated", value: scriptsGenerated.toString(), icon: LayoutDashboard, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Time Saved", value: timeSavedStr, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Total Projects", value: scriptsGenerated.toString(), icon: Video, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="h-full flex flex-col gap-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your AI generation activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-muted-foreground font-medium text-sm mb-1">{stat.title}</p>
            <h3 className="text-3xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Generation History</h2>
          <Link href="/generator" className="text-sm font-medium text-primary hover:underline">
            Generate New
          </Link>
        </div>
        
        {recentHistory.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-2xl bg-background/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No history yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                You haven&apos;t generated any scripts or voiceovers yet. Start your first project now!
              </p>
              <Link 
                href="/generator" 
                className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-all"
              >
                Go to AI Generator
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {recentHistory.map((history) => (
              <div key={history.id} className="p-5 rounded-2xl border border-border bg-background/50 hover:bg-muted/50 transition-colors flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
                  {history.sourceType === "image" && <ImageIcon className="w-6 h-6 text-primary" />}
                  {history.sourceType === "url" && <Link2 className="w-6 h-6 text-primary" />}
                  {history.sourceType === "name" && <TextIcon className="w-6 h-6 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold truncate">
                    {history.productName || "Generated Script"}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-2 mt-1">
                    <span className="capitalize">{history.sourceType} Source</span>
                    <span>&bull;</span>
                    {new Date(history.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
                <div className="shrink-0 flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors border border-border">
                    <PlayCircle className="w-4 h-4" />
                    Audio
                  </button>
                  <Link href="/generator" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
