"use client";

import { useWallet } from "@/contexts/wallet";
import { Card, CardContent } from "@/components/ui/card";
import { AutocompoundCard } from "./autocompound-card";
import { ClaimRewardsCard } from "./claim-rewards-card";

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
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <ClaimRewardsCard />
        <AutocompoundCard />
      </div>
    </>
  );
}
