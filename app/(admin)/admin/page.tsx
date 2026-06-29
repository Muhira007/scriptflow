import { Users, Receipt, Activity, CreditCard } from "lucide-react";
import { db } from "@/db";
import { user, transaction } from "@/db/schema";
import { count, sum, eq, desc } from "drizzle-orm";

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(1)}K`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default async function AdminOverviewPage() {
  // Fetch all stats from database in parallel
  const [
    totalUsersResult,
    totalRevenueResult,
    pendingResult,
    successTxResult,
    recentSignups,
  ] = await Promise.all([
    db.select({ count: count() }).from(user),
    db
      .select({ total: sum(transaction.amount) })
      .from(transaction)
      .where(eq(transaction.status, "success")),
    db
      .select({ count: count() })
      .from(transaction)
      .where(eq(transaction.status, "pending")),
    db
      .select({ count: count() })
      .from(transaction)
      .where(eq(transaction.status, "success")),
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(5),
  ]);

  const totalUsers = totalUsersResult[0]?.count ?? 0;
  const totalRevenue = Number(totalRevenueResult[0]?.total ?? 0);
  const pendingApprovals = pendingResult[0]?.count ?? 0;
  const totalSuccessTx = successTxResult[0]?.count ?? 0;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString("id-ID"),
      change: `${totalUsers} registered`,
      icon: Users,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      change: `${totalSuccessTx} transactions`,
      icon: Receipt,
    },
    {
      title: "Successful Txns",
      value: totalSuccessTx.toLocaleString("id-ID"),
      change: "Completed",
      icon: Activity,
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals.toLocaleString("id-ID"),
      change: pendingApprovals > 0 ? "Requires action" : "All clear",
      icon: CreditCard,
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Overview</h1>
        <p className="text-muted-foreground text-sm md:text-base">High-level metrics and system status.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isAction = stat.title === "Pending Approvals" && pendingApprovals > 0;
          return (
            <div key={index} className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-xl">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <span className={`text-xs sm:text-sm font-medium ${
                  isAction
                    ? "text-amber-500"
                    : stat.change.includes("Completed") || stat.change.includes("All clear")
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-sm min-h-[400px]">
          <h3 className="font-semibold text-lg mb-4">Revenue Overview</h3>
          <div className="flex items-center justify-center h-full text-muted-foreground border-2 border-dashed border-border rounded-xl">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Recent Signups</h3>
          <div className="space-y-4">
            {recentSignups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No users yet.</p>
            ) : (
              recentSignups.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{timeAgo(u.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
