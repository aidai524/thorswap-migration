"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ButtonWithAuth } from "@/components/button-with-auth";
import { xMetroToken } from "@/config/tokens";
import useUnstake from "@/hooks/use-unstake";
import { formatNumber } from "@/lib/format-number";
import dayjs from "@/lib/dayjs";
import { Loader2 } from "lucide-react";

/**
 * Unstake panel component
 * Handles unstake operations with amount input
 */
export function UnstakePanel({ refetchData }: { refetchData: () => void }) {
  const {
    unstakeAmount,
    setUnstakeAmount,
    unstaking,
    tokenBalance,
    isTokenBalanceLoading,
    unstake,
    amountError,
    handleMaxUnstake,
    estimatedMetroAmount,
    estimatedUnlockTime,
    isEstimatingUnstake
  } = useUnstake({ onSuccess: refetchData });

  // Check if unstake button should be disabled
  const isUnstakeDisabled =
    !unstakeAmount ||
    Number(unstakeAmount) <= 0 ||
    !!amountError ||
    isTokenBalanceLoading ||
    isEstimatingUnstake;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="unstake-amount">Amount</Label>
        <div className="relative">
          <Input
            id="unstake-amount"
            type="number"
            placeholder="0.00"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            className="h-12 pr-20 text-lg"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMaxUnstake}
              className="cursor-pointer"
              disabled={isTokenBalanceLoading || !tokenBalance}
            >
              MAX
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available to Unstake</span>
          <span className="font-medium">
            {formatNumber(tokenBalance || 0, 2, true)} xMETRO
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">You'll receive</span>
          <div className="font-medium flex items-center gap-1">
            {isEstimatingUnstake ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : estimatedMetroAmount ? (
              formatNumber(estimatedMetroAmount || 0, 2, true)
            ) : (
              "-"
            )}
            <span>METRO</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Unlock Time</span>
          <span className="font-medium">
            {isEstimatingUnstake ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : estimatedUnlockTime ? (
              dayjs(estimatedUnlockTime * 1000).format("MM/DD/YYYY HH:mm")
            ) : (
              "-"
            )}
          </span>
        </div>
      </div>
      {amountError && <p className="text-sm text-destructive">{amountError}</p>}
      <ButtonWithAuth
        chainId={xMetroToken.chainId}
        onClick={unstake}
        loading={unstaking}
        disabled={isUnstakeDisabled}
      >
        Unstake
      </ButtonWithAuth>
    </div>
  );
}
