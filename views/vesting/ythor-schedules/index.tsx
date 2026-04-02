"use client";

import { Spinner } from "@/components/ui/spinner";
import { RefreshCw, ChevronRight } from "lucide-react";
import HistoryRecord from "@/sections/history-record";
import UnstakeHints from "@/sections/history-record/hints";
import { ButtonWithAuth } from "@/components/button-with-auth";
import useYThorVesting from "../use-ythor-vesting";
import { formatNumber } from "@/utils/format-number";
import { xMetroToken } from "@/config/tokens";
import Big from "big.js";
import Link from "next/link";
import usePreviewWithdrawable from "@/hooks/use-preview-withdrawable";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Claim panel component for yTHOR vesting
 * Displays yTHOR vesting schedules and unstake requests
 */
export default function YThorClaimPanel() {
  const {
    yThorVesting,
    yThorUnstakeRequests,
    isLoadingVesting,
    isLoadingUnstakeRequests,
    isRequestingWithdraw,
    isClaimingAndStaking,
    isWithdrawing,
    errorVesting,
    errorUnstakeRequests,
    withdrawableAmount,
    refresh,
    refreshUnstakeRequests,
    requestWithdrawUnlockedYThor,
    claimAndStakeUnlockedYThor,
    withdrawYThor
  } = useYThorVesting();

  const { withdrawableAmounts, isLoadingAmounts, refreshAmounts } =
    usePreviewWithdrawable();

  const isLoading = isLoadingVesting || isLoadingUnstakeRequests;

  const isDisabled =
    isLoadingUnstakeRequests ||
    !withdrawableAmount ||
    Big(withdrawableAmount).lte(0);

  const handleRefresh = async () => {
    await Promise.all([refresh(), refreshUnstakeRequests()]);
  };

  return (
    <div className="mx-auto w-[792px] bg-white shadow-[0px_4px_0px_0px_#111414_inset]">
      <div className="p-[30px]">
        <div className="flex items-center justify-between">
          <div className="text-[30px] font-[600]">Vesting Schedules</div>
          <div className="flex items-center gap-2">
            <Link
              href="/rewards"
              className={cn(
                buttonVariants({ variant: "migrationSecondary" }),
                "h-auto bg-white shrink-0 gap-1 px-[14px] py-[11px] text-base font-semibold leading-[18px] tracking-[0.48px] no-underline"
              )}
            >
              Claim Rewards
              <ChevronRight
                className="size-4 shrink-0 text-[#111414]/55"
                aria-hidden
              />
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-[#D2C5B9]/25 rounded-[4px] border-none"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
        {isLoadingVesting ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : errorVesting ? (
          <div className="py-8 text-center text-destructive">
            Error: {errorVesting}
          </div>
        ) : yThorVesting.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No yTHOR vesting schedules found
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-2 mt-4">
            {yThorVesting.map((item, index) => {
              return <HistoryRecord key={`vesting-${index}`} data={item} />;
            })}
          </div>
        )}
        <div className="text-xs text-muted-foreground my-2">
          Claimable amount: {formatNumber(withdrawableAmounts.ythor, 2, true)}{" "}
          METRO
        </div>
        <UnstakeHints />
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-[328px]">
            <ButtonWithAuth
              chainId={xMetroToken.chainId}
              onClick={() =>
                requestWithdrawUnlockedYThor(0).then(() => {
                  handleRefresh();
                  refreshAmounts();
                })
              }
              loading={isRequestingWithdraw}
              disabled={
                isRequestingWithdraw ||
                isLoadingAmounts ||
                !withdrawableAmounts.ythor ||
                Big(withdrawableAmounts.ythor || "0").lte(0)
              }
            >
              Claim
            </ButtonWithAuth>
          </div>
          <div className="w-[328px]">
            <ButtonWithAuth
              variant="migrationSecondary"
              chainId={xMetroToken.chainId}
              onClick={() =>
                claimAndStakeUnlockedYThor(0).then(() => {
                  setTimeout(() => {
                    refreshAmounts();
                  }, 1000);
                })
              }
              loading={isClaimingAndStaking}
              disabled={
                isClaimingAndStaking ||
                isLoadingAmounts ||
                !withdrawableAmounts.ythor ||
                Big(withdrawableAmounts.ythor || "0").lte(0)
              }
            >
              Claim & Stake
            </ButtonWithAuth>
          </div>
        </div>
      </div>
      <div className="px-[30px] py-[20px] border-t border-[#242424]/20">
        <div className="flex items-center justify-between">
          <div className="text-sm mt-[10px] font-bold">
            Unstaking in Progress({yThorUnstakeRequests.length})
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Withdrawable: {formatNumber(withdrawableAmount, 2, true)} METRO
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-[#D2C5B9]/25 rounded-[4px] border-none"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <div className="w-[90px]">
              <ButtonWithAuth
                variant="migrationSecondary"
                chainId={xMetroToken.chainId}
                onClick={() => withdrawYThor(0).then(() => handleRefresh())}
                loading={isLoadingUnstakeRequests || isWithdrawing}
                disabled={isDisabled}
                className="h-[36px] text-[#111414] shadow-none disabled:border-[#8D8D8D] disabled:bg-transparent disabled:text-[#8D8D8D]"
              >
                Withdraw
              </ButtonWithAuth>
            </div>
          </div>
        </div>
        {isLoadingUnstakeRequests ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : errorUnstakeRequests ? (
          <div className="py-8 text-center text-destructive">
            Error: {errorUnstakeRequests}
          </div>
        ) : yThorUnstakeRequests.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No unstake history found
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-2 mt-4">
            {yThorUnstakeRequests.map((item, index) => {
              return <HistoryRecord key={`unstake-${index}`} data={item} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
