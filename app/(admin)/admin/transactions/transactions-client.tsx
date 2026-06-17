"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, CheckCircle2, XCircle, FileImage, X, Loader2, AlertTriangle } from "lucide-react";
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

export type Transaction = {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  creditsAdded: number;
  method: string;
  status: string;
  proofUrl: string | null;
  createdAt: string;
};

function TransactionActions({
  tx,
  onViewProof,
  onConfirmAction,
}: {
  tx: Transaction;
  onViewProof: (url: string) => void;
  onConfirmAction: (action: "approve" | "reject") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8 w-8 p-0 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
      >
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tx.id)}>
            Copy ID
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {tx.method === "manual_transfer" && tx.proofUrl && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-primary focus:text-primary cursor-pointer"
              onClick={() => onViewProof(tx.proofUrl!)}
            >
              <FileImage className="w-4 h-4 mr-2" /> View Proof
            </DropdownMenuItem>
          </>
        )}

        {tx.status === "pending" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-green-500 focus:text-green-500 focus:bg-green-500/10 cursor-pointer"
              onClick={() => onConfirmAction("approve")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Payment
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
              onClick={() => onConfirmAction("reject")}
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TransactionsClient({
  initialTransactions,
}: {
  initialTransactions: Transaction[];
}) {
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    txId: string;
    action: "approve" | "reject";
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  const executeApproveReject = async () => {
    if (!confirmModal) return;
    
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/transactions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: confirmModal.txId, action: confirmModal.action }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        router.refresh();
      } else {
        alert(data.error || "Operation failed");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setProcessing(false);
      setConfirmModal(null);
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: "Transaction ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "userEmail",
      header: "User",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "creditsAdded",
      header: "Credits",
      cell: ({ row }) => {
        return (
          <div className="font-bold text-primary">
            +{row.getValue("creditsAdded")}
          </div>
        );
      },
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => {
        const method = row.getValue("method") as string;
        return (
          <Badge variant="outline" className="capitalize">
            {method.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={
              status === "success"
                ? "default"
                : status === "failed"
                ? "destructive"
                : "secondary"
            }
            className={`capitalize ${
              status === "success"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : ""
            }`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const dateString = row.getValue("createdAt") as string;
        const formatted = dateString.split("T")[0];
        return (
          <div className="text-sm text-muted-foreground">{formatted}</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tx = row.original;
        return (
          <TransactionActions
            tx={tx}
            onViewProof={(url) => setPreviewProofUrl(url)}
            onConfirmAction={(action) => setConfirmModal({ txId: tx.id, action })}
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transactions</h1>
        <p className="text-muted-foreground">
          Manage payments and manual approvals.
        </p>
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

      {initialTransactions.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-12 shadow-sm text-center">
          <p className="text-muted-foreground">No transactions found.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={initialTransactions} />
      )}

      {/* Proof Preview Modal */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileImage className="w-5 h-5 text-primary" />
                Bukti Transfer (Payment Proof)
              </h2>
              <button onClick={() => setPreviewProofUrl(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto flex justify-center items-center bg-muted/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={previewProofUrl} 
                alt="Payment Proof" 
                className="max-w-full max-h-[60vh] object-contain rounded-xl border border-border shadow-md" 
              />
            </div>
            <div className="p-4 border-t border-border shrink-0 flex justify-end bg-muted/5">
               <button 
                  onClick={() => setPreviewProofUrl(null)}
                  className="px-6 py-2 rounded-xl font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                  Tutup Preview
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner ${confirmModal.action === "approve" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                {confirmModal.action === "approve" ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
              </div>
              <h2 className="text-2xl font-bold mb-3">Konfirmasi Tindakan</h2>
              <p className="text-muted-foreground leading-relaxed">
                Apakah Anda yakin ingin <strong className={confirmModal.action === "approve" ? "text-green-500" : "text-red-500"}>{confirmModal.action === "approve" ? "menyetujui (approve)" : "menolak (reject)"}</strong> pembayaran untuk transaksi <br />
                <span className="font-mono bg-muted px-2 py-1 rounded text-xs mt-2 inline-block border border-border">{confirmModal.txId}</span>?
              </p>
            </div>
            <div className="p-5 border-t border-border bg-muted/10 flex gap-4">
              <button 
                onClick={() => setConfirmModal(null)}
                disabled={processing}
                className="flex-1 px-4 py-3.5 rounded-xl font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={executeApproveReject}
                disabled={processing}
                className={`flex-1 px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-white ${
                  confirmModal.action === "approve" 
                    ? "bg-green-500 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                    : "bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                }`}
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {confirmModal.action === "approve" ? "Ya, Setujui" : "Ya, Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
