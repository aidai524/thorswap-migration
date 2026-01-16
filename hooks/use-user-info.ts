"use client";

import { useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet";
import { xMetroToken } from "@/config/tokens";
import xMetroAbi from "@/config/abi/xmetro";
import useUserStore from "@/stores/use-user";

/**
 * Hook for managing user-related information
 * Handles checking contributor status and stores data in the store
 *
 * @returns User information and related functions
 *
 * @example
 * ```tsx
 * const { isContributor, checkIsContributor } = useUserInfo();
 *
 * useEffect(() => {
 *   checkIsContributor();
 * }, [checkIsContributor]);
 * ```
 */
export default function useUserInfo() {
  const { account, publicClient } = useWallet();
  const { isContributor, setIsContributor } = useUserStore();

  /**
   * Check if user is a contributor by querying the contract
   */
  const checkIsContributor = useCallback(async () => {
    if (
      !account?.address ||
      !publicClient ||
      account.chainId !== xMetroToken.chainId
    ) {
      setIsContributor(false);
      return;
    }

    try {
      const isContributorResult = await publicClient.readContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: "contributorWhitelist",
        args: [account.address as `0x${string}`]
      });

      setIsContributor(isContributorResult as boolean);
    } catch (err) {
      console.error("Failed to check contributor status:", err);
      setIsContributor(false);
    }
  }, [account?.address, publicClient, setIsContributor]);

  // Automatically check contributor status when account or publicClient changes
  useEffect(() => {
    if (account?.address && publicClient) {
      checkIsContributor();
    } else {
      setIsContributor(false);
    }
  }, [account?.address, publicClient]);

  return {
    isContributor,
    checkIsContributor
  };
}
