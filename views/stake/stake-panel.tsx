"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ButtonWithApprove } from "@/components/button-with-approve";
import { TokenAmountPanel } from "@/components/common/token-amount-panel";
import useStake from "@/hooks/use-stake";
import { MetroToken, xMetroToken } from "@/config/tokens";
import { Loader2 } from "lucide-react";
import { formatNumber } from "@/utils/format-number";
import Big from "big.js";
import { StakeConfirmDialog } from "./stake-confirm-dialog";

/**
 * Stake panel component
 * Handles staking operations with amount input
 */
export function StakePanel() {
  const [stakeConfirmOpen, setStakeConfirmOpen] = useState(false);

  const {
    stakeAmount,
    setStakeAmount,
    receiver,
    setReceiver,
    staking,
    tokenBalance,
    isTokenBalanceLoading,
    stake,
    amountError,
    receiverError,
    isContributor,
    useContributorStake,
    setUseContributorStake,
    estimatedXMetroAmount,
    isEstimatingXMetro
  } = useStake({
    onSuccess: () => setStakeConfirmOpen(false)
  });

  // Handle max stake button click
  const handleMaxStake = () => {
    setStakeAmount(tokenBalance || "");
  };
  const handleStakePercentage = (percentage: number) => {
    if (!tokenBalance) {
      return;
    }

    const amount = Big(tokenBalance)
      .mul(percentage)
      .div(100)
      .toFixed(18)
      .replace(/\.?0+$/, "");
    setStakeAmount(amount);
  };

  // Check if stake button should be disabled
  const isStakeDisabled =
    !stakeAmount ||
    Number(stakeAmount) <= 0 ||
    !!amountError ||
    !!receiverError ||
    isTokenBalanceLoading;

  return (
    <div className="space-y-4">
      {isContributor && (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="contributor-stake-switch"
              className="text-sm font-medium"
            >
              Stake Type
            </Label>
            <p className="text-xs text-muted-foreground">
              {useContributorStake
                ? "Using contributor stake (6 month cliff, 2.5 year linear unlock)"
                : "Using normal stake"}
            </p>
          </div>
          <Switch
            id="contributor-stake-switch"
            className="cursor-pointer"
            checked={useContributorStake}
            onCheckedChange={setUseContributorStake}
          />
        </div>
      )}
      {isContributor && useContributorStake && (
        <div className="space-y-2">
          <Label htmlFor="receiver-address">Receiver Address</Label>
          <Input
            id="receiver-address"
            type="text"
            placeholder="0x..."
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="h-12 font-mono"
          />
          {receiverError && receiver && (
            <p className="text-sm text-destructive">{receiverError}</p>
          )}
        </div>
      )}
      <TokenAmountPanel
        id="stake-amount"
        balanceLabel="Balance"
        balanceValue={
          isTokenBalanceLoading ? (
            <Loader2 className="inline h-4 w-4 animate-spin" />
          ) : (
            formatNumber(tokenBalance || 0, 2, true)
          )
        }
        amountValue={stakeAmount}
        onAmountChange={(e) => setStakeAmount(e.target.value)}
        onMaxClick={handleMaxStake}
        onPercentageClick={handleStakePercentage}
        maxDisabled={isTokenBalanceLoading || !tokenBalance}
        token={MetroToken}
        helper={
          (!isContributor || !useContributorStake) && (
            <>
              You&apos;ll receive:{" "}
              {isEstimatingXMetro ? (
                <Loader2 className="inline h-4 w-4 animate-spin" />
              ) : (
                formatNumber(estimatedXMetroAmount || 0, 2, true)
              )}{" "}
              xMETRO
            </>
          )
        }
      />
      {amountError && <p className="text-sm text-destructive">{amountError}</p>}
      <ButtonWithApprove
        token={MetroToken}
        amount={stakeAmount || "0.000001"}
        spender={xMetroToken.address}
        chainId={xMetroToken.chainId}
        onAction={() => setStakeConfirmOpen(true)}
        actionLoading={staking}
        actionDisabled={isStakeDisabled}
        actionText="Stake"
        approveText="Approve METRO"
        isMax={true}
      />
      <StakeConfirmDialog
        open={stakeConfirmOpen}
        onOpenChange={setStakeConfirmOpen}
        metroAmountLabel={formatNumber(stakeAmount || 0, 2, true)}
        xMetroAmountLabel={
          estimatedXMetroAmount
            ? formatNumber(estimatedXMetroAmount, 2, true)
            : null
        }
        isEstimatingXMetro={isEstimatingXMetro}
        onConfirm={stake}
        confirming={staking}
      />
    </div>
  );
}
