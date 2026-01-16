"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ButtonWithApprove } from "@/components/button-with-approve";
import useStake from "@/hooks/use-stake";
import { MetroToken, xMetroToken } from "@/config/tokens";
import { Info, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/format-number";

/**
 * Stake panel component
 * Handles staking operations with amount input
 */
export function StakePanel({ refetchData }: { refetchData: () => void }) {
  const {
    stakeAmount,
    setStakeAmount,
    staking,
    tokenBalance,
    isTokenBalanceLoading,
    stake,
    amountError,
    isContributor,
    estimatedXMetroAmount,
    isEstimatingXMetro
  } = useStake({ onSuccess: refetchData });

  // Handle max stake button click
  const handleMaxStake = () => {
    setStakeAmount(tokenBalance || "");
  };

  // Check if stake button should be disabled
  const isStakeDisabled =
    !stakeAmount ||
    Number(stakeAmount) <= 0 ||
    !!amountError ||
    isTokenBalanceLoading;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stake-amount">Amount</Label>
        <div className="relative">
          <Input
            id="stake-amount"
            type="number"
            placeholder="0.00"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="h-12 pr-20 text-lg"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMaxStake}
              className="cursor-pointer"
              disabled={isTokenBalanceLoading || !tokenBalance}
            >
              MAX
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available Balance</span>
          <div className="font-medium flex items-center gap-1">
            {isTokenBalanceLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              formatNumber(tokenBalance || 0, 2, true)
            )}
            <span>METRO</span>
          </div>
        </div>
        {!isContributor && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">You'll receive</span>
            <div className="font-medium flex items-center gap-1">
              {isEstimatingXMetro ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                formatNumber(estimatedXMetroAmount || 0, 2, true)
              )}
              <span>xMETRO</span>
            </div>
          </div>
        )}
      </div>
      {isContributor && (
        <div className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 text-primary" />
          <p className="text-muted-foreground">
            6 month cliff, 2.5 year linear unlock
          </p>
        </div>
      )}
      {amountError && <p className="text-sm text-destructive">{amountError}</p>}
      <ButtonWithApprove
        token={MetroToken}
        amount={stakeAmount || "0.000001"}
        spender={xMetroToken.address}
        chainId={xMetroToken.chainId}
        onAction={stake}
        actionLoading={staking}
        actionDisabled={isStakeDisabled}
        actionText="Stake"
        approveText="Approve METRO"
        isMax={true}
      />
    </div>
  );
}
