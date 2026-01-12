import { RewardsOverview } from "@/components/rewards/rewards-overview"
import { ClaimRewards } from "@/components/rewards/claim-rewards"
import { RewardsHistory } from "@/components/rewards/rewards-history"

export default function RewardsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Rewards</h1>
        <p className="mt-2 text-muted-foreground">View your yield earnings and manage reward payouts</p>
      </div>

      <RewardsOverview />

      <ClaimRewards />

      <RewardsHistory />
    </div>
  )
}
