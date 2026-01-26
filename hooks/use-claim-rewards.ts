"use client";

import { useState, useEffect, useCallback } from "react";
import { formatUnits } from "viem";
import Big from "big.js";
import { toast } from "@/hooks/use-toast";
import { xMetroToken, RewardToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";

/**
 * Hook return value interface
 */
interface UseClaimRewardsReturn {
  /** Loading state for claiming rewards */
  claiming: boolean;
  /** Claimable reward amount */
  claimableAmount: string;
  /** Loading state for fetching claimable amount */
  isLoadingClaimable: boolean;
  /** Execute claim rewards transaction */
  claimRewards: () => Promise<void>;
  /** Refresh claimable amount */
  refreshClaimable: () => Promise<void>;
}

export default function useClaimRewards(): UseClaimRewardsReturn {
  const { account, publicClient, walletClient } = useWallet();
  const [claiming, setClaiming] = useState(false);
  const [claimableAmount, setClaimableAmount] = useState("0");
  const [isLoadingClaimable, setIsLoadingClaimable] = useState(false);

  /**
   * Fetch claimable reward amount from contract
   */
  const fetchClaimableAmount = useCallback(async () => {
    setIsLoadingClaimable(true);
    try {
      // Call claimable to get the claimable reward amount
      const result = await publicClient.readContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: "claimable",
        args: [account.address as `0x${string}`]
      });

      // Reward token (USDC) has 6 decimals
      const amount = Big(result || 0).gt(1)
        ? formatUnits(result as bigint, RewardToken.decimals)
        : "0";

      setClaimableAmount(amount);

      console.log("Claimable amount:", amount);
    } catch (err) {
      console.error("Failed to fetch claimable amount:", err);
      setClaimableAmount("0");
    } finally {
      setIsLoadingClaimable(false);
    }
  }, [account?.address, publicClient]);

  // Fetch claimable amount when account or publicClient changes
  useEffect(() => {
    if (
      !account?.address ||
      !publicClient ||
      account?.chainId !== xMetroToken.chainId
    ) {
      setClaimableAmount("0");
      return;
    }
    fetchClaimableAmount();
  }, [account?.address, publicClient]);

  /**
   * Execute claim rewards transaction
   * Calls the claimRewards method on xMetroToken contract
   */
  const claimRewards = async () => {
    // Validate wallet connection
    if (!account?.address) {
      toast({
        title: "Claim Failed!",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    // Validate wallet client and public client
    if (!walletClient || !publicClient) {
      toast({
        title: "Claim Failed!",
        description: "Wallet not available",
        variant: "destructive"
      });
      return;
    }

    // Validate claimable amount
    if (!claimableAmount || Big(claimableAmount || "0").lte(0)) {
      toast({
        title: "Claim Failed!",
        description: "No rewards available to claim",
        variant: "destructive"
      });
      return;
    }

    setClaiming(true);

    try {
      // Estimate gas
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "claimRewards",
          args: []
        });
      } catch (err) {
        console.log("Gas estimation failed:", err);
      }

      // Show pending toast
      toast({
        title: "Claim Pending!",
        description: "Confirm the transaction in your wallet...",
        variant: "default"
      });

      // Send transaction
      const hash = await walletClient.writeContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: "claimRewards",
        args: [],
        gas: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined
      });

      console.log("Claim rewards transaction hash:", hash);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      setClaiming(false);

      if (receipt.status === "success") {
        toast({
          title: "Claim Successful!",
          description: `Successfully claimed ${claimableAmount} USDC`,
          variant: "default"
        });

        // Refresh claimable amount after successful claim
        fetchClaimableAmount();
      } else {
        toast({
          title: "Claim Failed!",
          description: "Transaction was not successful",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Claim rewards error:", err);
      setClaiming(false);

      const errorMessage =
        err?.message?.includes("user rejected") ||
        err?.message?.includes("User rejected") ||
        err?.cause?.message?.includes("user rejected")
          ? "User rejected transaction"
          : err?.message || "Claim rewards transaction failed";

      toast({
        title: "Claim Failed!",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    claiming,
    claimableAmount,
    isLoadingClaimable,
    claimRewards,
    refreshClaimable: fetchClaimableAmount
  };
}
