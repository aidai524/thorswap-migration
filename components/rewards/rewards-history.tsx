"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, ExternalLink } from "lucide-react"

interface RewardEvent {
  id: string
  type: "claim" | "autocompound"
  amount: string
  date: Date
  txHash: string
}

const mockHistory: RewardEvent[] = [
  {
    id: "1",
    type: "claim",
    amount: "125.50",
    date: new Date("2024-03-10"),
    txHash: "0x1234...5678",
  },
  {
    id: "2",
    type: "autocompound",
    amount: "89.25",
    date: new Date("2024-03-05"),
    txHash: "0xabcd...efgh",
  },
  {
    id: "3",
    type: "claim",
    amount: "210.00",
    date: new Date("2024-02-28"),
    txHash: "0x9876...5432",
  },
  {
    id: "4",
    type: "autocompound",
    amount: "156.75",
    date: new Date("2024-02-20"),
    txHash: "0xfedc...ba98",
  },
  {
    id: "5",
    type: "claim",
    amount: "78.30",
    date: new Date("2024-02-15"),
    txHash: "0x2468...1357",
  },
]

export function RewardsHistory() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Reward History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockHistory.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="flex items-center gap-3">
                <Badge variant={event.type === "claim" ? "default" : "secondary"} className="capitalize">
                  {event.type === "claim" ? "Claimed" : "Compounded"}
                </Badge>
                <div>
                  <p className="font-medium">${event.amount} USDC</p>
                  <p className="text-xs text-muted-foreground">
                    {event.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <a
                href={`https://basescan.org/tx/${event.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {event.txHash.slice(0, 6)}...{event.txHash.slice(-4)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>

        {mockHistory.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No reward history yet</p>
        )}
      </CardContent>
    </Card>
  )
}
