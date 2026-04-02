import { AutoCompoundSection } from "@/sections/auto-compound";
import { RewardsSection } from "@/sections/rewards";
import StakeUnstakePanel from "./stake-unstake-panel";

export default function Stake() {
  return (
    <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-[24px]">
      <StakeUnstakePanel />
      <div className="flex flex-col gap-4">
        <RewardsSection variant="stake" />
        <AutoCompoundSection variant="stake" />
      </div>
    </div>
  );
}
