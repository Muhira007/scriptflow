"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, MinusCircle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  createdAt: string;
};

function UserActions({ user, onAction }: { user: User; onAction: (msg: string) => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCredits = async (action: "add" | "deduct") => {
    const amountStr = prompt(`Enter amount of credits to ${action}:`);
    if (!amountStr) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        onAction(data.message);
        router.refresh();
      } else {
        alert(data.error || "Operation failed");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async () => {
    const newRole = user.role === "admin" ? "user" : "admin";
    const confirmed = confirm(
      `Are you sure you want to ${newRole === "admin" ? "promote" : "demote"} ${user.email} to ${newRole}?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        onAction(data.message);
        router.refresh();
      } else {
        alert(data.error || "Operation failed");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        className="flex h-8 w-8 p-0 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
      >
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
            Copy User ID
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-green-500 focus:text-green-500 focus:bg-green-500/10"
          onClick={() => handleCredits("add")}
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add Credits
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
          onClick={() => handleCredits("deduct")}
        >
          <MinusCircle className="w-4 h-4 mr-2" /> Deduct Credits
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleRole}>
          <ShieldAlert className="w-4 h-4 mr-2" />
          {user.role === "admin" ? "Revoke Admin" : "Make Admin"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "User ID",
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge
            variant={role === "admin" ? "default" : "secondary"}
            className={`capitalize ${role === "admin" ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
          >
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "credits",
      header: "Credits Balance",
      cell: ({ row }) => {
        return (
          <div className="font-bold flex items-center gap-1 text-primary">
            {row.getValue("credits")}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        const dateString = row.getValue("createdAt") as string;
        const formatted = dateString.split("T")[0];
        return <div className="text-sm text-muted-foreground">{formatted}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return <UserActions user={user} onAction={(msg) => setSuccessMsg(msg)} />;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-2">Users Management</h1>
        <p className="text-muted-foreground">Manage users, roles, and credit balances.</p>
      </div>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in-up">
          <span className="text-sm">{successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-green-400 hover:text-green-300 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      <DataTable columns={columns} data={initialUsers} />
    </div>
  );
}
