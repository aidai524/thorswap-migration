import { AutocompoundCard } from "../reward/autocompound-card";
import { ClaimRewardsCard } from "../reward/claim-rewards-card";

export default function Rewards() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <ClaimRewardsCard />
        <AutocompoundCard />
      </div>
    </>
  );
}
