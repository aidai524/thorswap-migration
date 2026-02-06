"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import HistoryRecord from "@/sections/history-record";
import UnstakeHints from "@/sections/history-record/hints";
import { ButtonWithAuth } from "@/components/button-with-auth";
import useThorLocks from "./use-thor-locks";
import useRequest from "./use-request";
import useWithdraw from "./use-withdraw";
import { formatNumber } from "@/utils/format-number";
import { xMetroToken } from "@/config/tokens";
import Big from "big.js";

/**
 * Unstake panel component
 * Displays THOR locks and unstake requests in two separate sections
 */
export function UnstakePanel() {
  const {
    thorLocks,
    unstakeRequests,
    isLoadingLocks,
    isLoadingRequests,
    errorLocks,
    errorRequests,
    refresh,
    requestableAmount,
    withdrawableAmount
  } = useThorLocks();

  const {
    isRequesting,
    isClaimingAndStaking,
    handleRequestWithdraw,
    handleClaimAndStake
  } = useRequest();

  const { handleWithdraw, loading: isWithdrawing } = useWithdraw(() => {
    refresh();
  });

  const isLoading = isLoadingLocks || isLoadingRequests;
  const isDisabled =
    isLoadingRequests || !withdrawableAmount || Big(withdrawableAmount).lte(0);

  return (
    <div className="space-y-4 mx-auto w-2xl">
      {/* Upper Card: THOR Locks */}
      <Card className="py-4">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">
              THOR Locks({thorLocks.length})
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          {isLoadingLocks ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : errorLocks ? (
            <div className="py-8 text-center text-destructive">
              Error: {errorLocks}
            </div>
          ) : thorLocks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No THOR locks found
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-2 mt-4">
              {thorLocks.map((item, index) => {
                return (
                  <HistoryRecord key={`${item.type}-${index}`} data={item} />
                );
              })}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-4">
            Claimable amount: {formatNumber(requestableAmount, 2, true)} METRO
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-[200px]">
              <ButtonWithAuth
                chainId={xMetroToken.chainId}
                onClick={() => handleRequestWithdraw(0, () => refresh())}
                loading={isRequesting}
                disabled={
                  isRequesting ||
                  isLoading ||
                  !requestableAmount ||
                  Big(requestableAmount || "0").lte(0)
                }
              >
                Claim
              </ButtonWithAuth>
            </div>
            <div className="w-[200px]">
              <ButtonWithAuth
                chainId={xMetroToken.chainId}
                onClick={() => handleClaimAndStake(0, () => refresh())}
                loading={isClaimingAndStaking}
                disabled={
                  isClaimingAndStaking ||
                  isLoading ||
                  !requestableAmount ||
                  Big(requestableAmount || "0").lte(0)
                }
              >
                Claim & Stake
              </ButtonWithAuth>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lower Card: Unstake Requests */}
      <Card>
        <CardContent>
          <UnstakeHints />
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm mt-[10px] font-bold">
              Claiming in Progress({unstakeRequests.length})
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                Withdrawable: {formatNumber(withdrawableAmount, 2, true)} METRO
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  refresh();
                }}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <div className="w-[90px]">
                <ButtonWithAuth
                  chainId={xMetroToken.chainId}
                  onClick={() => handleWithdraw(0)}
                  loading={isLoading || isLoadingRequests || isWithdrawing}
                  disabled={isDisabled}
                >
                  Withdraw
                </ButtonWithAuth>
              </div>
            </div>
          </div>
          {isLoadingRequests ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : errorRequests ? (
            <div className="py-8 text-center text-destructive">
              Error: {errorRequests}
            </div>
          ) : unstakeRequests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No unstake history found
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-2 mt-4">
              {unstakeRequests.map((item, index) => {
                return (
                  <HistoryRecord key={`${item.type}-${index}`} data={item} />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
