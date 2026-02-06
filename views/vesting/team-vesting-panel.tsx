"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import HistoryRecord from "@/sections/history-record";
import UnstakeHints from "@/sections/history-record/hints";
import { ButtonWithAuth } from "@/components/button-with-auth";
import useContributorVesting from "./use-contributor-vesting";
import { formatNumber } from "@/utils/format-number";
import { xMetroToken } from "@/config/tokens";
import Big from "big.js";
import usePreviewWithdrawable from "@/hooks/use-preview-withdrawable";

/**
 * Team vesting panel component
 * Displays contributor vesting schedules and unstake requests in two separate sections
 */
export default function TeamVestingPanel() {
  const {
    contributorVesting,
    contributorUnstakeRequests,
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
    requestWithdrawUnlockedContributor,
    claimAndStakeUnlockedContributor,
    withdrawContributor
  } = useContributorVesting();

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
    <div className="space-y-4 mx-auto w-2xl">
      {/* Upper Card: Contributor Vesting Schedules */}
      <Card className="py-4">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">
              Contributor Vesting({contributorVesting.length})
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
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
          ) : contributorVesting.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No contributor vesting schedules found
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-2 mt-4">
              {contributorVesting.map((item, index) => {
                return <HistoryRecord key={`vesting-${index}`} data={item} />;
              })}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-4">
            Claimable amount:{" "}
            {formatNumber(withdrawableAmounts.contributor, 2, true)} METRO
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-[200px]">
              <ButtonWithAuth
                chainId={xMetroToken.chainId}
                onClick={() =>
                  requestWithdrawUnlockedContributor(0).then(() => {
                    handleRefresh();
                    refreshAmounts();
                  })
                }
                loading={isRequestingWithdraw}
                disabled={
                  isRequestingWithdraw ||
                  isLoadingAmounts ||
                  !withdrawableAmounts.contributor ||
                  Big(withdrawableAmounts.contributor || "0").lte(0)
                }
              >
                Claim
              </ButtonWithAuth>
            </div>
            <div className="w-[200px]">
              <ButtonWithAuth
                chainId={xMetroToken.chainId}
                onClick={() =>
                  claimAndStakeUnlockedContributor(0).then(() => {
                    handleRefresh();
                    refreshAmounts();
                  })
                }
                loading={isClaimingAndStaking}
                disabled={
                  isClaimingAndStaking ||
                  isLoadingAmounts ||
                  !withdrawableAmounts.contributor ||
                  Big(withdrawableAmounts.contributor || "0").lte(0)
                }
              >
                Claim & Stake
              </ButtonWithAuth>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lower Card: Contributor Unstake Requests */}
      <Card>
        <CardContent>
          <UnstakeHints />
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm mt-[10px] font-bold">
              Unstaking in Progress({contributorUnstakeRequests.length})
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
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <div className="w-[90px]">
                <ButtonWithAuth
                  chainId={xMetroToken.chainId}
                  onClick={() =>
                    withdrawContributor(0).then(() => handleRefresh())
                  }
                  loading={
                    isLoading || isLoadingUnstakeRequests || isWithdrawing
                  }
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
          ) : contributorUnstakeRequests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No unstake history found
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-2 mt-4">
              {contributorUnstakeRequests.map((item, index) => {
                return <HistoryRecord key={`unstake-${index}`} data={item} />;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
