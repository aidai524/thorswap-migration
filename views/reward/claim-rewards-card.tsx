"use client";

import { Button } from "@/components/ui/button";
import { ButtonWithAuth } from "@/components/button-with-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { xMetroToken } from "@/config/tokens";
import useClaimRewards from "@/hooks/use-claim-rewards";
import { DollarSign, Loader2 } from "lucide-react";
import Big from "big.js";
import { formatNumber } from "@/lib/format-number";

interface ClaimRewardsCardProps {
  onOpenAutocompoundDialog: () => void;
}

export function ClaimRewardsCard({
  onOpenAutocompoundDialog
}: ClaimRewardsCardProps) {
  const { claiming, claimableAmount, isLoadingClaimable, claimRewards } =
    useClaimRewards();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Claim Rewards
        </CardTitle>
        <CardDescription>
          Withdraw your earned USDC rewards to your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-secondary/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">Available to Claim</p>
          <p className="mt-2 text-4xl font-bold text-success">
            {isLoadingClaimable ? (
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            ) : (
              `${formatNumber(claimableAmount || 0, 2, true)}`
            )}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">USDC</p>
        </div>

        <div className="flex items-center justify-between grid grid-cols-2 gap-4">
          <Button
            variant="secondary"
            className="h-[40px] cursor-pointer"
            onClick={onOpenAutocompoundDialog}
          >
            Compound Rewards
          </Button>
          <div>
            <ButtonWithAuth
              chainId={xMetroToken.chainId}
              onClick={claimRewards}
              loading={claiming}
              disabled={
                claiming ||
                isLoadingClaimable ||
                !claimableAmount ||
                Big(claimableAmount || "0").lte(0)
              }
            >
              {claiming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                "Claim Rewards"
              )}
            </ButtonWithAuth>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Rewards are paid in USDC on Base network
        </p>
      </CardContent>
    </Card>
  );
}
