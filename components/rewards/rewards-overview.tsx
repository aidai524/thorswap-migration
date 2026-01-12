"use client"

import { StatCard } from "@/components/ui/stat-card"
import { mockStats } from "@/lib/mock-data"
import { DollarSign, TrendingUp, Wallet } from "lucide-react"

export function RewardsOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Total USDC Earned"
        value={`$${Number(mockStats.totalEarnedUSDC).toLocaleString()}`}
        suffix="USDC"
        icon={<TrendingUp className="h-5 w-5" />}
        className="lg:col-span-1"
      />
      <StatCard
        label="Claimable Now"
        value={`$${Number(mockStats.claimableUSDC).toLocaleString()}`}
        suffix="USDC"
        icon={<Wallet className="h-5 w-5" />}
        className="lg:col-span-1"
      />
      <StatCard
        label="Current APY"
        value={mockStats.currentAPY}
        suffix="%"
        icon={<DollarSign className="h-5 w-5" />}
        trend={{ value: "Paid in USDC", positive: true }}
        className="lg:col-span-1"
      />
    </div>
  )
}
