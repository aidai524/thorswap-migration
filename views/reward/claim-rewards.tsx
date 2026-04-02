"use client";

import { useWallet } from "@/contexts/wallet";
import { Card, CardContent } from "@/components/ui/card";
import { RewardsPageBlock } from "@/sections/rewards";
import { RewardsHistory } from "./rewards-history";

export function ClaimRewards() {
  const { account } = useWallet();

  if (!account) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Connect your wallet to view and claim rewards
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <RewardsPageBlock />
      <RewardsHistory />
    </div>
  );
}
