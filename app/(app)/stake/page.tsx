import { StakingOverview } from "@/components/stake/staking-overview"
import { PositionsList } from "@/components/stake/positions-list"

export default function StakePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Stake</h1>
        <p className="mt-2 text-muted-foreground">Manage your METRO staking positions and earn USDC rewards</p>
      </div>

      <StakingOverview />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Your Positions</h2>
        <PositionsList />
      </div>
    </div>
  )
}
