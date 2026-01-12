"use client"

import { StatCard } from "@/components/ui/stat-card"
import { mockStats } from "@/lib/mock-data"
import { Coins, TrendingUp, DollarSign } from "lucide-react"

export function StakingOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Total Staked METRO"
        value={Number(mockStats.totalStaked).toLocaleString()}
        suffix="METRO"
        icon={<Coins className="h-5 w-5" />}
      />
      <StatCard
        label="Current APY"
        value={mockStats.currentAPY}
        suffix="%"
        icon={<TrendingUp className="h-5 w-5" />}
        trend={{ value: "2.3% from last week", positive: true }}
      />
      <StatCard
        label="Claimable Rewards"
        value={`$${Number(mockStats.claimableUSDC).toLocaleString()}`}
        suffix="USDC"
        icon={<DollarSign className="h-5 w-5" />}
      />
    </div>
  )
}
