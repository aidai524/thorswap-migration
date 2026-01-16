"use client";

import { useState, useCallback } from "react";
import { parseUnits, formatUnits } from "viem";
import Big from "big.js";
import { toast } from "@/hooks/use-toast";
import { xMetroToken, RewardToken, MetroToken } from "@/config/tokens";
import { useWallet } from "@/contexts/wallet";
import xMetroAbi from "@/config/abi/xmetro";
import { buildSwapDataV3MultiHop } from "@/utils/swap-data";

/**
 * Hook return value interface
 */
interface UseAutocompoundOnceReturn {
  /** Loading state for autocompound */
  autocompounding: boolean;
  /** Estimated METRO amount from swap */
  estimatedMetroAmount: string | null;
  /** Loading state for estimating METRO amount */
  isEstimatingMetro: boolean;
  /** Execute autocompound transaction */
  autocompound: (amount: string) => Promise<void>;
  /** Estimate METRO amount from USDC amount */
  estimateMetroAmount: () => Promise<string | null>;
}

/**
 * Hook for executing one-time autocompound (swap USDC to METRO and stake)
 *
 * @returns Autocompound function and related state
 */
export default function useAutocompoundOnce(): UseAutocompoundOnceReturn {
  const { account, publicClient, walletClient } = useWallet();
  const [autocompounding, setAutocompounding] = useState(false);
  const [estimatedMetroAmount, setEstimatedMetroAmount] = useState<
    string | null
  >(null);
  const [isEstimatingMetro, setIsEstimatingMetro] = useState(false);

  /**
   * Build swapData for USDC -> METRO swap
   * Default: V2 direct path [USDC, METRO]
   * Can be changed to V3 if needed
   */
  const buildSwapData = useCallback((): string => {
    // Using V2 direct path as default
    // If you need V3, use buildSwapDataV3SingleHop with appropriate fee
    return buildSwapDataV3MultiHop({
      tokens: [RewardToken.address, MetroToken.address],
      fees: [100]
    });
  }, []);

  /**
   * Estimate METRO amount from USDC amount using static call to swapAdapter
   */
  const estimateMetroAmount = useCallback(async (): Promise<string | null> => {
    if (!publicClient || !account?.address) {
      return null;
    }

    setIsEstimatingMetro(true);
    try {
      const swapData = buildSwapData();

      // Simulate swapAdapter.swap to estimate output
      // Using 0 as minAmountOut for estimation
      const result = await publicClient.simulateContract({
        address: xMetroToken.address as `0x${string}`,
        abi: xMetroAbi,
        functionName: "autocompound",
        args: [
          0, // minAmountOut = 0 for estimation
          swapData as `0x${string}`
        ],
        account: account.address as `0x${string}`
      });

      const metroAmountWei = result.result as bigint;
      const metroAmount = formatUnits(metroAmountWei, MetroToken.decimals);

      setEstimatedMetroAmount(metroAmount);
      return metroAmount;
    } catch (err) {
      console.error("Failed to estimate METRO amount:", err);
      setEstimatedMetroAmount(null);
      return null;
    } finally {
      setIsEstimatingMetro(false);
    }
  }, [publicClient, account?.address, buildSwapData]);

  /**
   * Execute autocompound transaction
   * Calls xMETRO.autocompound with swapData
   */
  const autocompound = useCallback(
    async (usdcAmount: string) => {
      // Validate wallet connection
      if (!account?.address) {
        toast({
          title: "Autocompound Failed!",
          description: "Please connect your wallet",
          variant: "destructive"
        });
        return;
      }

      // Validate wallet client and public client
      if (!walletClient || !publicClient) {
        toast({
          title: "Autocompound Failed!",
          description: "Wallet not available",
          variant: "destructive"
        });
        return;
      }

      // Validate amount
      if (!usdcAmount || Big(usdcAmount).lte(0)) {
        toast({
          title: "Autocompound Failed!",
          description: "Invalid amount",
          variant: "destructive"
        });
        return;
      }

      setAutocompounding(true);

      try {
        // Estimate METRO amount first
        const estimatedMetro = await estimateMetroAmount();
        if (!estimatedMetro) {
          throw new Error("Failed to estimate METRO amount");
        }

        // Calculate minMetroOut with 1% slippage tolerance
        const minMetroOut = Big(estimatedMetro).times(0.99).toFixed();
        const minMetroOutWei = parseUnits(minMetroOut, MetroToken.decimals);

        // Build swapData
        const swapData = buildSwapData();

        // Estimate gas
        let gasEstimate: bigint | undefined;
        try {
          gasEstimate = await publicClient.estimateContractGas({
            account: account.address as `0x${string}`,
            address: xMetroToken.address as `0x${string}`,
            abi: xMetroAbi,
            functionName: "autocompound",
            args: [minMetroOutWei, swapData as `0x${string}`]
          });
        } catch (err) {
          console.log("Gas estimation failed:", err);
        }

        // Show pending toast
        toast({
          title: "Autocompound Pending!",
          description: "Confirm the transaction in your wallet...",
          variant: "default"
        });

        // Send transaction
        const hash = await walletClient.writeContract({
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "autocompound",
          args: [minMetroOutWei, swapData as `0x${string}`],
          gas: gasEstimate
            ? (gasEstimate * BigInt(120)) / BigInt(100)
            : undefined
        });

        console.log("Autocompound transaction hash:", hash);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash
        });

        setAutocompounding(false);

        if (receipt.status === "success") {
          toast({
            title: "Autocompound Successful!",
            description: `Successfully swapped ${usdcAmount} USDC to METRO and staked`,
            variant: "default"
          });
          // Reset estimated amount
          setEstimatedMetroAmount(null);
        } else {
          toast({
            title: "Autocompound Failed!",
            description: "Transaction was not successful",
            variant: "destructive"
          });
        }
      } catch (err: any) {
        console.error("Autocompound error:", err);
        setAutocompounding(false);

        const errorMessage =
          err?.message?.includes("user rejected") ||
          err?.message?.includes("User rejected") ||
          err?.cause?.message?.includes("user rejected")
            ? "User rejected transaction"
            : err?.message || "Autocompound transaction failed";

        toast({
          title: "Autocompound Failed!",
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
    [
      account?.address,
      walletClient,
      publicClient,
      estimateMetroAmount,
      buildSwapData
    ]
  );

  return {
    autocompounding,
    estimatedMetroAmount,
    isEstimatingMetro,
    autocompound,
    estimateMetroAmount
  };
}
