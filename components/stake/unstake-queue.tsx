"use client"

import type { UnstakeRequest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Clock, ArrowDownToLine } from "lucide-react"

interface UnstakeQueueProps {
  requests: UnstakeRequest[]
  onWithdraw: (id: string) => void
}

export function UnstakeQueue({ requests, onWithdraw }: UnstakeQueueProps) {
  const now = new Date()

  if (requests.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Unstake Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-4">No pending unstake requests</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Unstake Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => {
          const totalCooldown = request.availableDate.getTime() - request.requestDate.getTime()
          const elapsed = now.getTime() - request.requestDate.getTime()
          const progress = Math.min(Math.max((elapsed / totalCooldown) * 100, 0), 100)
          const isAvailable = now >= request.availableDate

          const getRemainingTime = () => {
            if (isAvailable) return "Ready to withdraw"
            const remaining = request.availableDate.getTime() - now.getTime()
            const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
            const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            return `${days}d ${hours}h remaining`
          }

          return (
            <div key={request.id} className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{Number(request.amount).toLocaleString()} METRO</p>
                  <p className="text-xs text-muted-foreground">
                    Requested on {request.requestDate.toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={isAvailable ? "default" : "outline"}
                  disabled={!isAvailable}
                  onClick={() => onWithdraw(request.id)}
                  className="gap-1"
                >
                  <ArrowDownToLine className="h-3 w-3" />
                  Withdraw
                </Button>
              </div>

              <ProgressBar
                value={progress}
                variant={isAvailable ? "success" : "warning"}
                label={getRemainingTime()}
                showPercentage={false}
              />

              <p className="text-xs text-muted-foreground">
                14-day cooldown period • Available on{" "}
                {request.availableDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
