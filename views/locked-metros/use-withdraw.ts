"use client";

import { useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { xMetroToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";

/**
 * Hook return value interface
 */
interface UseWithdrawReturn {
  loading: boolean;
  /** Execute withdrawThor transaction */
  handleWithdraw: (
    maxRequests: number,
    onSuccess?: () => void
  ) => Promise<void>;
}

/**
 * Hook for withdrawing THOR using withdrawThor contract method
 */
export default function useWithdraw(onSuccess?: () => void): UseWithdrawReturn {
  const { account, publicClient, walletClient } = useWallet();

  const [loading, setLoading] = useState(false);

  /**
   * Handle withdrawThor transaction
   */
  const handleWithdraw = useCallback(
    async (maxRequests: number, onSuccessCallback?: () => void) => {
      if (!account?.address) {
        toast({
          title: "Withdraw Failed!",
          description: "Please connect your wallet",
          variant: "destructive"
        });
        return;
      }
      if (!walletClient || !publicClient) {
        toast({
          title: "Withdraw Failed!",
          description: "Wallet not available",
          variant: "destructive"
        });
        return;
      }
      setLoading(true);
      try {
        // Estimate gas
        let gasEstimate: bigint | undefined;
        try {
          gasEstimate = await publicClient.estimateContractGas({
            account: account.address as `0x${string}`,
            address: xMetroToken.address as `0x${string}`,
            abi: xMetroAbi,
            functionName: "withdrawThor",
            args: [BigInt(maxRequests)]
          });
        } catch (err) {
          console.log("Gas estimation failed:", err);
        }
        // Show pending toast
        toast({
          title: "Withdraw Pending!",
          description: "Confirm the transaction in your wallet...",
          variant: "default"
        });
        // Send transaction
        const hash = await walletClient.writeContract({
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "withdrawThor",
          args: [BigInt(maxRequests)],
          gas: gasEstimate
            ? (gasEstimate * BigInt(120)) / BigInt(100)
            : undefined
        });
        console.log("Withdraw THOR transaction hash:", hash);
        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash
        });
        setLoading(false);
        if (receipt.status === "success") {
          toast({
            title: "Withdraw Successful!",
            description: `Successfully withdrew THOR`,
            variant: "default"
          });
          onSuccess?.();
          onSuccessCallback?.();
        } else {
          toast({
            title: "Withdraw Failed!",
            description: "Transaction was not successful",
            variant: "destructive"
          });
        }
      } catch (err: any) {
        console.error("Withdraw THOR error:", err);
        setLoading(false);
        const errorMessage =
          err?.message?.includes("user rejected") ||
          err?.message?.includes("User rejected") ||
          err?.cause?.message?.includes("user rejected")
            ? "User rejected transaction"
            : err?.message || "Withdraw transaction failed";
        toast({
          title: "Withdraw Failed!",
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
    [account?.address, publicClient, walletClient, onSuccess]
  );

  return {
    loading,
    handleWithdraw
  };
}
