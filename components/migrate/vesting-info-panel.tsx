"use client"

import type { TokenSymbol } from "@/lib/types"
import { AlertTriangle, Clock, Lock, Info } from "lucide-react"
import { migrationPhases } from "@/lib/mock-data"

interface VestingInfoPanelProps {
  token: TokenSymbol
}

export function VestingInfoPanel({ token }: VestingInfoPanelProps) {
  if (token === "THOR") {
    const activePhase = migrationPhases.find((p) => p.active)

    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Migration Lock Period</h3>
        </div>

        <div className="space-y-3">
          {migrationPhases.map((phase) => (
            <div
              key={phase.phase}
              className={`rounded-lg border p-3 ${phase.active ? "border-primary bg-primary/5" : "border-border opacity-60"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Phase {phase.phase}</span>
                <span className={`text-sm ${phase.active ? "text-primary" : "text-muted-foreground"}`}>
                  {phase.active ? "Active" : "Ended"}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>{phase.lockDuration} lock</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{phase.description}</p>
            </div>
          ))}
        </div>

        {activePhase && (
          <div className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-sm">
            <Info className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-muted-foreground">
              Your METRO will be locked for{" "}
              <span className="text-foreground font-medium">{activePhase.lockDuration}</span> after migration. Rewards
              can still be claimed during this period.
            </p>
          </div>
        )}
      </div>
    )
  }

  // yTHOR vesting info
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-medium">yTHOR Vesting Schedule</h3>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-warning/50 bg-warning/5 p-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-warning" />
            <span className="font-medium text-warning">4-Year Cliff</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your METRO will remain fully locked for 4 years from the vesting start date.
          </p>
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">2-Year Linear Vesting</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">After the cliff, METRO unlocks linearly over 2 years.</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
        <p className="text-muted-foreground">
          yTHOR migration results in a <span className="text-foreground font-medium">6-year total lock period</span>.
          Staking rewards are still claimable.
        </p>
      </div>
    </div>
  )
}
