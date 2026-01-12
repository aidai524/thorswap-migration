"use client"

import type { TransactionStatus as TxStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionStatusProps {
  status: TxStatus
  network?: "ethereum" | "base"
  onClose?: () => void
}

export function TransactionStatus({ status, network = "ethereum", onClose }: TransactionStatusProps) {
  if (status.status === "idle") return null

  const explorerUrl =
    network === "ethereum" ? `https://etherscan.io/tx/${status.hash}` : `https://basescan.org/tx/${status.hash}`

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        status.status === "pending" && "border-primary/50 bg-primary/5",
        status.status === "confirmed" && "border-success/50 bg-success/5",
        status.status === "error" && "border-destructive/50 bg-destructive/5",
      )}
    >
      <div className="flex items-start gap-3">
        {status.status === "pending" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        {status.status === "confirmed" && <CheckCircle2 className="h-5 w-5 text-success" />}
        {status.status === "error" && <XCircle className="h-5 w-5 text-destructive" />}

        <div className="flex-1">
          <p
            className={cn(
              "font-medium",
              status.status === "pending" && "text-primary",
              status.status === "confirmed" && "text-success",
              status.status === "error" && "text-destructive",
            )}
          >
            {status.status === "pending" && "Transaction Pending"}
            {status.status === "confirmed" && "Transaction Confirmed"}
            {status.status === "error" && "Transaction Failed"}
          </p>

          {status.message && <p className="mt-1 text-sm text-muted-foreground">{status.message}</p>}

          {status.hash && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View on {network === "ethereum" ? "Etherscan" : "BaseScan"}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {onClose && status.status !== "pending" && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Dismiss
          </Button>
        )}
      </div>
    </div>
  )
}
