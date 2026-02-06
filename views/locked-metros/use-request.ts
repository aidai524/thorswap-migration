"use client";

import { useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { xMetroToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";

/**
 * Hook return value interface
 */
interface UseRequestReturn {
  /** Loading state for requestWithdrawUnlockedThor */
  isRequesting: boolean;
  /** Loading state for claimAndStakeUnlockedThor */
  isClaimingAndStaking: boolean;
  /** Execute requestWithdrawUnlockedThor transaction */
  handleRequestWithdraw: (
    maxLocks: number,
    onSuccess?: () => void
  ) => Promise<void>;
  /** Execute claimAndStakeUnlockedThor transaction */
  handleClaimAndStake: (
    maxLocks: number,
    onSuccess?: () => void
  ) => Promise<void>;
}

/**
 * Hook for calling requestWithdrawUnlockedThor and claimAndStakeUnlockedThor contract methods
 */
export default function useRequest(): UseRequestReturn {
  const { account, publicClient, walletClient } = useWallet();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isClaimingAndStaking, setIsClaimingAndStaking] = useState(false);

  /**
   * Handle requestWithdrawUnlockedThor transaction
   */
  const handleRequestWithdraw = useCallback(
    async (maxLocks: number, onSuccess?: () => void) => {
      if (!account?.address) {
        toast({
          title: "Request Failed!",
          description: "Please connect your wallet",
          variant: "destructive"
        });
        return;
      }
      if (!walletClient || !publicClient) {
        toast({
          title: "Request Failed!",
          description: "Wallet not available",
          variant: "destructive"
        });
        return;
      }
      setIsRequesting(true);
      try {
        // Estimate gas
        let gasEstimate: bigint | undefined;
        try {
          gasEstimate = await publicClient.estimateContractGas({
            account: account.address as `0x${string}`,
            address: xMetroToken.address as `0x${string}`,
            abi: xMetroAbi,
            functionName: "requestWithdrawUnlockedThor",
            args: [BigInt(maxLocks)]
          });
        } catch (err) {
          console.log("Gas estimation failed:", err);
        }
        // Show pending toast
        toast({
          title: "Request Pending!",
          description: "Confirm the transaction in your wallet...",
          variant: "default"
        });
        // Send transaction
        const hash = await walletClient.writeContract({
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "requestWithdrawUnlockedThor",
          args: [BigInt(maxLocks)],
          gas: gasEstimate
            ? (gasEstimate * BigInt(120)) / BigInt(100)
            : undefined
        });
        console.log("Request withdraw transaction hash:", hash);
        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash
        });
        setIsRequesting(false);
        if (receipt.status === "success") {
          toast({
            title: "Request Successful!",
            description: `Successfully requested withdraw for unlocked THOR`,
            variant: "default"
          });
          onSuccess?.();
        } else {
          toast({
            title: "Request Failed!",
            description: "Transaction was not successful",
            variant: "destructive"
          });
        }
      } catch (err: any) {
        console.error("Request withdraw error:", err);
        setIsRequesting(false);
        const errorMessage =
          err?.message?.includes("user rejected") ||
          err?.message?.includes("User rejected") ||
          err?.cause?.message?.includes("user rejected")
            ? "User rejected transaction"
            : err?.message || "Request transaction failed";
        toast({
          title: "Request Failed!",
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
    [account?.address, publicClient, walletClient]
  );

  /**
   * Handle claimAndStakeUnlockedThor transaction
   */
  const handleClaimAndStake = useCallback(
    async (maxLocks: number, onSuccess?: () => void) => {
      if (!account?.address) {
        toast({
          title: "Claim & Stake Failed!",
          description: "Please connect your wallet",
          variant: "destructive"
        });
        return;
      }
      if (!walletClient || !publicClient) {
        toast({
          title: "Claim & Stake Failed!",
          description: "Wallet not available",
          variant: "destructive"
        });
        return;
      }
      setIsClaimingAndStaking(true);
      try {
        // Estimate gas
        let gasEstimate: bigint | undefined;
        try {
          gasEstimate = await publicClient.estimateContractGas({
            account: account.address as `0x${string}`,
            address: xMetroToken.address as `0x${string}`,
            abi: xMetroAbi,
            functionName: "claimAndStakeUnlockedThor",
            args: [BigInt(maxLocks)]
          });
        } catch (err) {
          console.log("Gas estimation failed:", err);
        }
        // Show pending toast
        toast({
          title: "Claim & Stake Pending!",
          description: "Confirm the transaction in your wallet...",
          variant: "default"
        });
        // Send transaction
        const hash = await walletClient.writeContract({
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "claimAndStakeUnlockedThor",
          args: [BigInt(maxLocks)],
          gas: gasEstimate
            ? (gasEstimate * BigInt(120)) / BigInt(100)
            : undefined
        });
        console.log("Claim and stake transaction hash:", hash);
        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash
        });
        setIsClaimingAndStaking(false);
        if (receipt.status === "success") {
          toast({
            title: "Claim & Stake Successful!",
            description: `Successfully claimed and staked unlocked THOR`,
            variant: "default"
          });
          onSuccess?.();
        } else {
          toast({
            title: "Claim & Stake Failed!",
            description: "Transaction was not successful",
            variant: "destructive"
          });
        }
      } catch (err: any) {
        console.error("Claim and stake error:", err);
        setIsClaimingAndStaking(false);
        const errorMessage =
          err?.message?.includes("user rejected") ||
          err?.message?.includes("User rejected") ||
          err?.cause?.message?.includes("user rejected")
            ? "User rejected transaction"
            : err?.message || "Claim & stake transaction failed";
        toast({
          title: "Claim & Stake Failed!",
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
    [account?.address, publicClient, walletClient]
  );

  return {
    isRequesting,
    isClaimingAndStaking,
    handleRequestWithdraw,
    handleClaimAndStake
  };
}
