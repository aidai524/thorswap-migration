"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { ClaimRewards } from "@/views/reward/claim-rewards";
import { RewardsHistoryDialog } from "@/views/reward/rewards-history-dialog";

export default function RewardsPage() {
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Rewards
          </h1>
          <p className="mt-2 text-muted-foreground">
            View your yield earnings and manage reward payouts
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setHistoryDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          History
        </Button>
      </div>

      <ClaimRewards />

      <RewardsHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      />
    </div>
  );
}
