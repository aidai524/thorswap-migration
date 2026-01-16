"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { xMetroToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";

/**
 * Hook return value interface
 */
interface UseAutoCompoundReturn {
  /** Whether auto compound is enabled for the user */
  autocompoundEnabled: boolean;
  /** Loading state for checking auto compound status */
  isLoading: boolean;
  /** Loading state for enabling auto compound */
  isEnabling: boolean;
  /** Loading state for disabling auto compound */
  isDisabling: boolean;
  /** Enable auto compound */
  enableAutocompound: () => Promise<void>;
  /** Disable auto compound */
  disableAutocompound: () => Promise<void>;
  /** Refresh auto compound status */
  refreshStatus: () => Promise<void>;
}

/**
 * Hook for managing auto compound functionality
 *
 * @returns Auto compound state and control functions
 *
 * @example
 * ```tsx
 * const { autocompoundEnabled, enableAutocompound, disableAutocompound } = useAutoCompound();
 *
 * <button onClick={autocompoundEnabled ? disableAutocompound : enableAutocompound}>
 *   {autocompoundEnabled ? "Disable" : "Enable"} Auto Compound
 * </button>
 * ```
 */
export default function useAutoCompound(): UseAutoCompoundReturn {
  const [autocompoundEnabled, setAutocompoundEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const { account, publicClient, walletClient } = useWallet();

  /**
   * Check if auto compound is enabled for the current user
   */
  const checkAutocompoundStatus = useCallback(async () => {
    if (!account?.address || !publicClient) {
      setAutocompoundEnabled(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const enabled = await publicClient.readContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: "autocompoundEnabled",
        args: [account.address as `0x${string}`]
      });

      setAutocompoundEnabled(enabled as boolean);
    } catch (err) {
      console.error("Failed to check auto compound status:", err);
      setAutocompoundEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, publicClient]);

  /**
   * Enable auto compound for the current user
   */
  const enableAutocompound = async () => {
    // Validate wallet connection
    if (!account?.address) {
      toast({
        title: "Enable Auto Compound Failed!",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    // Validate wallet client and public client
    if (!walletClient || !publicClient) {
      toast({
        title: "Enable Auto Compound Failed!",
        description: "Wallet not available",
        variant: "destructive"
      });
      return;
    }

    setIsEnabling(true);

    try {
      // Estimate gas
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "enableAutocompound",
          args: []
        });
      } catch (err) {
        console.log("Gas estimation failed:", err);
      }

      // Show pending toast
      toast({
        title: "Confirm Transaction",
        description: "Please confirm the transaction in your wallet...",
        variant: "default"
      });

      // Send transaction
      const hash = await walletClient.writeContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: "enableAutocompound",
        args: [],
        gas: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined
      });

      console.log("Enable auto compound transaction hash:", hash);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      setIsEnabling(false);

      if (receipt.status === "success") {
        toast({
          title: "Auto Compound Enabled!",
          description: "Auto compound has been successfully enabled",
          variant: "default"
        });
        // Refresh status after successful enable
        await checkAutocompoundStatus();
      } else {
        toast({
          title: "Enable Auto Compound Failed!",
          description: "Transaction was not successful",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Enable auto compound error:", err);
      setIsEnabling(false);

      const errorMessage =
        err?.message?.includes("user rejected") ||
        err?.message?.includes("User rejected") ||
        err?.cause?.message?.includes("user rejected")
          ? "User rejected transaction"
          : err?.message || "Enable auto compound transaction failed";

      toast({
        title: "Enable Auto Compound Failed!",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  /**
   * Disable auto compound for the current user
   */
  const disableAutocompound = async () => {
    // Validate wallet connection
    if (!account?.address) {
      toast({
        title: "Disable Auto Compound Failed!",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    // Validate wallet client and public client
    if (!walletClient || !publicClient) {
      toast({
        title: "Disable Auto Compound Failed!",
        description: "Wallet not available",
        variant: "destructive"
      });
      return;
    }

    setIsDisabling(true);

    try {
      // Estimate gas
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          account: account.address as `0x${string}`,
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "disableAutocompound",
          args: []
        });
      } catch (err) {
        console.log("Gas estimation failed:", err);
      }

      // Show pending toast
      toast({
        title: "Confirm Transaction",
        description: "Please confirm the transaction in your wallet...",
        variant: "default"
      });

      // Send transaction
      const hash = await walletClient.writeContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: "disableAutocompound",
        args: [],
        gas: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined
      });

      console.log("Disable auto compound transaction hash:", hash);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      setIsDisabling(false);

      if (receipt.status === "success") {
        toast({
          title: "Auto Compound Disabled!",
          description: "Auto compound has been successfully disabled",
          variant: "default"
        });
        // Refresh status after successful disable
        await checkAutocompoundStatus();
      } else {
        toast({
          title: "Disable Auto Compound Failed!",
          description: "Transaction was not successful",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Disable auto compound error:", err);
      setIsDisabling(false);

      const errorMessage =
        err?.message?.includes("user rejected") ||
        err?.message?.includes("User rejected") ||
        err?.cause?.message?.includes("user rejected")
          ? "User rejected transaction"
          : err?.message || "Disable auto compound transaction failed";

      toast({
        title: "Disable Auto Compound Failed!",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Check auto compound status when account or publicClient changes
  useEffect(() => {
    checkAutocompoundStatus();
  }, [checkAutocompoundStatus]);

  return {
    autocompoundEnabled,
    isLoading,
    isEnabling,
    isDisabling,
    enableAutocompound,
    disableAutocompound,
    refreshStatus: checkAutocompoundStatus
  };
}
