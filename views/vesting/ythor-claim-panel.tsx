"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import HistoryRecord from "@/sections/history-record";
import UnstakeHints from "@/sections/history-record/hints";
import { ButtonWithAuth } from "@/components/button-with-auth";
import useYThorVesting from "./use-ythor-vesting";
import { formatNumber } from "@/utils/format-number";
import { xMetroToken } from "@/config/tokens";
import Big from "big.js";
import usePreviewWithdrawable from "@/hooks/use-preview-withdrawable";

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

  const isDisabled =
    isLoadingUnstakeRequests ||
    !withdrawableAmount ||
    Big(withdrawableAmount).lte(0);

  const handleRefresh = async () => {
    await Promise.all([refresh(), refreshUnstakeRequests()]);
  };

  return (
    <div className="space-y-4 mx-auto w-2xl">
      {/* Upper Card: yTHOR Vesting Schedules */}
      <Card className="py-4">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">
              yTHOR Vesting({yThorVesting.length})
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoadingVesting}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingVesting ? "animate-spin" : ""}`}
              />
            </Button>
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
          <div className="text-xs text-muted-foreground mt-4">
            Claimable amount: {formatNumber(withdrawableAmounts.ythor, 2, true)}{" "}
            METRO
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-[200px]">
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
            <div className="w-[200px]">
              <ButtonWithAuth
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
        </CardContent>
      </Card>

      {/* Lower Card: yTHOR Unstake Requests */}
      <Card>
        <CardContent>
          <UnstakeHints />
          <div className="flex items-center justify-between mt-4">
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
                disabled={isLoadingUnstakeRequests}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingUnstakeRequests ? "animate-spin" : ""}`}
                />
              </Button>
              <div className="w-[90px]">
                <ButtonWithAuth
                  chainId={xMetroToken.chainId}
                  onClick={() => withdrawYThor(0).then(() => handleRefresh())}
                  loading={isLoadingUnstakeRequests || isWithdrawing}
                  disabled={isDisabled}
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
        </CardContent>
      </Card>
    </div>
  );
}
