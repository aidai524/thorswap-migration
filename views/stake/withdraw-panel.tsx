"use client";

import { ButtonWithAuth } from "@/components/button-with-auth";
import { xMetroToken } from "@/config/tokens";
import useWithdraw from "@/hooks/use-withdraw";
import useUserStore from "@/stores/use-user";
import Big from "big.js";
import { useMemo } from "react";

/**
 * Withdraw panel component
 * Displays four different types of withdraw options with withdrawable amounts
 */
export function WithdrawPanel({ refetchData }: { refetchData: () => void }) {
  const {
    withdrawableAmounts,
    loading,
    isLoadingAmounts,
    withdrawTypes,
    handleWithdraw,
    formatAmount
  } = useWithdraw();


  return (
    <div className="space-y-4">
      {withdrawTypes.map(({ type, label, functionName }) => {
        const amountKey =
          type === "yTHOR"
            ? "ythor"
            : (type.toLowerCase() as keyof typeof withdrawableAmounts);
        const amount = withdrawableAmounts[amountKey];
        const isLoading = loading[amountKey];
        const isDisabled = !amount || Big(amount).lte(0) || isLoadingAmounts;

        return (
          <div
            key={type}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex flex-col">
              <span className="font-medium">{label}</span>
              <span className="text-sm text-muted-foreground">
                {isLoadingAmounts
                  ? "Loading..."
                  : `${formatAmount(amount)} METRO`}
              </span>
            </div>
            <div className="w-[200px]">
              <ButtonWithAuth
                chainId={xMetroToken.chainId}
                onClick={() => handleWithdraw(type, functionName)}
                loading={isLoading}
                disabled={isDisabled}
              >
                Withdraw
              </ButtonWithAuth>
            </div>
          </div>
        );
      })}
    </div>
  );
}
