"use client";

import { useState } from "react";
import { ButtonWithAuth } from "@/components/button-with-auth";
import { TokenAmountPanel } from "@/components/common/token-amount-panel";
import { xMetroToken } from "@/config/tokens";
import useUnstake from "@/hooks/use-unstake";
import { formatNumber } from "@/utils/format-number";
import { Loader2 } from "lucide-react";
import Big from "big.js";
import { UnstakeConfirmDialog } from "./unstake-confirm-dialog";

/**
 * Unstake panel component
 * Handles unstake operations with amount input
 */
export function UnstakePanel({ refetchData }: { refetchData: () => void }) {
  const [unstakeConfirmOpen, setUnstakeConfirmOpen] = useState(false);

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
  } = useUnstake({
    onSuccess: () => {
      setUnstakeConfirmOpen(false);
      refetchData();
    }
  });

  // Check if unstake button should be disabled
  const isUnstakeDisabled =
    !unstakeAmount ||
    Number(unstakeAmount) <= 0 ||
    !!amountError ||
    isTokenBalanceLoading ||
    isEstimatingUnstake;
  const handleUnstakePercentage = (percentage: number) => {
    if (!tokenBalance) {
      return;
    }

    const amount = Big(tokenBalance)
      .mul(percentage)
      .div(100)
      .toFixed(18)
      .replace(/\.?0+$/, "");
    setUnstakeAmount(amount);
  };

  return (
    <div className="space-y-4">
      <TokenAmountPanel
        id="unstake-amount"
        balanceLabel="Balance"
        balanceValue={formatNumber(tokenBalance || 0, 2, true)}
        amountValue={unstakeAmount}
        onAmountChange={(e) => setUnstakeAmount(e.target.value)}
        onMaxClick={handleMaxUnstake}
        onPercentageClick={handleUnstakePercentage}
        maxDisabled={isTokenBalanceLoading || !tokenBalance}
        token={xMetroToken}
        helper={
          <>
            You&apos;ll receive:{" "}
            {isEstimatingUnstake ? (
              <Loader2 className="inline h-4 w-4 animate-spin" />
            ) : estimatedMetroAmount ? (
              formatNumber(estimatedMetroAmount || 0, 2, true)
            ) : (
              "-"
            )}{" "}
            METRO
            {/* {estimatedUnlockTime && (
              <>
                {" "}
                | Unlock Time:{" "}
                {dayjs(estimatedUnlockTime * 1000).format("MM/DD/YYYY HH:mm")}
              </>
            )} */}
          </>
        }
      />
      {amountError && <p className="text-sm text-destructive">{amountError}</p>}
      <div className="flex items-start gap-3 rounded border border-[rgba(118,121,122,0.2)] bg-[#fff9e7] p-[14px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <g clipPath="url(#clip0_62_326)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.7976 0.460655C10.6564 0.178335 10.3679 0 10.0522 0C9.73658 0 9.44808 0.178335 9.30691 0.460655L0.140224 18.794C0.0110625 19.0523 0.0248658 19.3591 0.176704 19.6047C0.328544 19.8504 0.596765 20 0.885579 20H19.2189C19.5077 20 19.7759 19.8504 19.9278 19.6047C20.0797 19.3591 20.0934 19.0523 19.9642 18.794L10.7976 0.460655ZM10.8856 7.5H9.21891V13.3333H10.8856V7.5ZM9.21891 15H10.8856V16.6667H9.21891V15Z"
              fill="#FFBD00"
            />
          </g>
          <defs>
            <clipPath id="clip0_62_326">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <div className="space-y-1 text-[14px] leading-[1.4] text-black">
          <p className="font-semibold">Unstaking takes 7 days</p>
          <p className="font-normal">
            You will not receive rewards during this time.
          </p>
        </div>
      </div>
      <ButtonWithAuth
        chainId={xMetroToken.chainId}
        onClick={() => setUnstakeConfirmOpen(true)}
        loading={unstaking}
        disabled={isUnstakeDisabled}
      >
        Unstake
      </ButtonWithAuth>
      <UnstakeConfirmDialog
        open={unstakeConfirmOpen}
        onOpenChange={setUnstakeConfirmOpen}
        xMetroAmountLabel={formatNumber(unstakeAmount || 0, 2, true)}
        metroAmountLabel={
          estimatedMetroAmount
            ? formatNumber(estimatedMetroAmount, 2, true)
            : null
        }
        isEstimatingMetro={isEstimatingUnstake}
        onConfirm={unstake}
        confirming={unstaking}
      />
    </div>
  );
}
