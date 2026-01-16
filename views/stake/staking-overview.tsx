"use client";

import { StatCard } from "@/components/ui/stat-card";
import { mockStats } from "@/lib/mock-data";
import { TrendingUp, Coins, Wallet, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/format-number";

export function StakingOverview({
  isLoading,
  stakeData
}: {
  isLoading: boolean;
  stakeData: any;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="APR"
        value={mockStats.apr}
        suffix="%"
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Total Staked</p>
            {isLoading ? (
              <div className="mt-[16px] flex items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight">
                  {formatNumber(stakeData.totalShares || 0, 2, true)}
                </span>
                <span className="text-sm text-muted-foreground">METRO</span>
                <span className="text-sm text-muted-foreground">
                  (Locked:{" "}
                  {formatNumber(stakeData.totalLockedShares || 0, 2, true)} )
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-secondary p-2 text-muted-foreground">
            <Coins className="h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Your Staked</p>
            {isLoading ? (
              <div className="mt-[16px] flex items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tracking-tight">
                  {formatNumber(stakeData.totalSharesOf || 0, 2, true)}
                </span>
                <span className="text-sm text-muted-foreground">METRO</span>
                <span className="text-sm text-muted-foreground">
                  (Locked: {formatNumber(stakeData.lockedShares || 0, 2, true)}{" "}
                  )
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-secondary p-2 text-muted-foreground">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
