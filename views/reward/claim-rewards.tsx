"use client";

import { useWallet } from "@/contexts/wallet";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { AutocompoundDialog } from "./autocompound-dialog";
import { AutocompoundCard } from "./autocompound-card";
import { ClaimRewardsCard } from "./claim-rewards-card";
import useClaimRewards from "@/hooks/use-claim-rewards";
import { useState } from "react";

export function ClaimRewards() {
  const { account } = useWallet();
  const [showAutocompoundDialog, setShowAutocompoundDialog] = useState(false);
  const { claimableAmount } = useClaimRewards();

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
      <AutocompoundDialog
        open={showAutocompoundDialog}
        onOpenChange={setShowAutocompoundDialog}
        claimableAmount={claimableAmount}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ClaimRewardsCard
          onOpenAutocompoundDialog={() => setShowAutocompoundDialog(true)}
        />
        <AutocompoundCard />
      </div>
    </>
  );
}
