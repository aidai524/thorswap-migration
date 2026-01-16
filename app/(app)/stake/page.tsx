"use client";

import { StakeOperations } from "@/views/stake/stake-operations";
import { StatCard } from "@/components/ui/stat-card";
import { mockStats } from "@/lib/mock-data";
import { TrendingUp } from "lucide-react";

export default function StakePage() {
  // const { stakeData, isLoading, refetch } = useStakeData();
  return (
    <div className="space-y-8 w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Stake
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your METRO staking positions and earn USDC rewards
          </p>
        </div>
        <StatCard
          label="APR"
          value={mockStats.apr}
          suffix="%"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>
      {/* <StakingOverview isLoading={isLoading} stakeData={stakeData} /> */}

      <StakeOperations refetchData={() => {}} />
    </div>
  );
}
