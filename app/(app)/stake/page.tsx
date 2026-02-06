"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import Stake from "@/views/stake";
import { RewardsHistoryDialog } from "@/views/reward/rewards-history-dialog";

export default function StakePage() {
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            METRO Staking
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stake METRO to earn USDC rewards and trading discounts
          </p>
          <p className="text-muted-foreground">
            Turn on autocompound to auto convert rewards to more $xMETRO
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setHistoryDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          Reward History
        </Button>
      </div>
      <Stake />
      <RewardsHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      />
    </div>
  );
}
