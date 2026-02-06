"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet";
import { YThorToken, xMetroToken } from "@/config/tokens";
import xMetroAbi from "@/config/abi/xmetro";
import Big from "big.js";
import { toast } from "@/hooks/use-toast";
import type { OperationItem } from "@/sections/history-record/types";

/**
 * Hook return value interface
 */
interface UseYThorVestingReturn {
  /** yTHOR vesting schedules */
  yThorVesting: OperationItem[];
  /** yTHOR unstake requests */
  yThorUnstakeRequests: OperationItem[];
  /** Loading state for yTHOR vesting */
  isLoadingVesting: boolean;
  /** Loading state for yTHOR unstake requests */
  isLoadingUnstakeRequests: boolean;
  /** Loading state for requestWithdrawUnlockedYThor */
  isRequestingWithdraw: boolean;
  /** Loading state for claimAndStakeUnlockedYThor */
  isClaimingAndStaking: boolean;
  /** Loading state for withdrawYThor */
  isWithdrawing: boolean;
  /** Error message for yTHOR vesting */
  errorVesting: string | null;
  /** Error message for yTHOR unstake requests */
  errorUnstakeRequests: string | null;
  /** Withdrawable amount */
  withdrawableAmount: string;
  /** Refresh function */
  refresh: () => Promise<void>;
  /** Refresh yTHOR unstake requests function */
  refreshUnstakeRequests: () => Promise<void>;
  /** Request withdraw unlocked yTHOR tokens */
  requestWithdrawUnlockedYThor: (maxSchedules?: number) => Promise<void>;
  /** Claim and stake unlocked yTHOR tokens */
  claimAndStakeUnlockedYThor: (maxSchedules?: number) => Promise<void>;
  /** Withdraw yTHOR tokens */
  withdrawYThor: (maxRequests?: number) => Promise<void>;
}

/**
 * Hook for querying yTHOR vesting records from xMETRO contract
 * Uses multicall to batch contract queries for efficiency
 *
 * @returns yTHOR vesting data and related functions
 */
export default function useYThorVesting(): UseYThorVestingReturn {
  const { account, publicClient, walletClient } = useWallet();
  const [yThorVesting, setYThorVesting] = useState<OperationItem[]>([]);
  const [yThorUnstakeRequests, setYThorUnstakeRequests] = useState<
    OperationItem[]
  >([]);
  const [isLoadingVesting, setIsLoadingVesting] = useState(false);
  const [isLoadingUnstakeRequests, setIsLoadingUnstakeRequests] =
    useState(false);
  const [isRequestingWithdraw, setIsRequestingWithdraw] = useState(false);
  const [isClaimingAndStaking, setIsClaimingAndStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [errorVesting, setErrorVesting] = useState<string | null>(null);
  const [errorUnstakeRequests, setErrorUnstakeRequests] = useState<
    string | null
  >(null);
  const [withdrawableAmount, setWithdrawableAmount] = useState<string>("0");

  /**
   * Query yTHOR vesting records
   * First queries count function, then queries detailed data if count > 0
   */
  const fetchYThorVesting = useCallback(async () => {
    if (!account?.address || !publicClient) {
      setYThorVesting([]);
      setErrorVesting(null);
      return;
    }

    setIsLoadingVesting(true);
    setErrorVesting(null);

    try {
      const contractAddress = xMetroToken.address as `0x${string}`;
      const userAddress = account.address as `0x${string}`;

      // Step 1: Query count function
      const countResult = await publicClient.readContract({
        address: contractAddress,
        abi: xMetroAbi,
        functionName: "yThorVestingCount",
        args: [userAddress]
      });

      const yThorVestingCount = Number(countResult || 0);

      // Step 2: Query detailed data if count > 0 using multicall
      const detailCalls: any[] = [];

      for (let i = 0; i < yThorVestingCount; i++) {
        detailCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "yThorVesting",
          args: [userAddress, BigInt(i)]
        });
      }

      // Execute multicall for detailed data
      let detailResults: any[] = [];
      if (detailCalls.length > 0) {
        detailResults = await publicClient.multicall({
          contracts: detailCalls,
          allowFailure: false
        });
      }

      // Parse results
      const yThorVestingData: OperationItem[] = [];

      for (let i = 0; i < yThorVestingCount; i++) {
        const result = detailResults[i];
        if (result) {
          const totalAmount = Big(result.totalAmount)
            .div(10 ** YThorToken.decimals)
            .toString();
          const claimed = Big(result.claimed)
            .div(10 ** YThorToken.decimals)
            .toString();
          const startTime = Big(result.startTime).mul(1000).toNumber();
          const duration = Big(result.duration).mul(1000).toNumber();

          yThorVestingData.push({
            totalAmount,
            claimed,
            startTime,
            duration,
            type: "yThorVesting" as const
          });
        }
      }

      // Sort by startTime in descending order (newest first)
      yThorVestingData.sort((a, b) => {
        if (a.type === "yThorVesting" && b.type === "yThorVesting") {
          return b.startTime - a.startTime;
        }
        return 0;
      });

      setYThorVesting(yThorVestingData);
    } catch (err: any) {
      console.error("Failed to fetch yTHOR vesting:", err);
      setErrorVesting(err?.message || "Failed to fetch yTHOR vesting");
      setYThorVesting([]);
    } finally {
      setIsLoadingVesting(false);
    }
  }, [account?.address, publicClient]);

  /**
   * Query yTHOR unstake request records
   * First queries count and cursor functions, then queries detailed data if count > 0 using multicall
   */
  const fetchYThorUnstakeRequests = useCallback(async () => {
    if (!account?.address || !publicClient) {
      setYThorUnstakeRequests([]);
      setErrorUnstakeRequests(null);
      return;
    }

    setIsLoadingUnstakeRequests(true);
    setErrorUnstakeRequests(null);

    try {
      const contractAddress = xMetroToken.address as `0x${string}`;
      const userAddress = account.address as `0x${string}`;

      // Step 1: Query count and cursor functions
      const [countResult, cursorResult] = await publicClient.multicall({
        contracts: [
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "unstakeRequestCountYThor",
            args: [userAddress]
          },
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "unstakeCursorYThor",
            args: [userAddress]
          }
        ],
        allowFailure: false
      });

      const unstakeRequestCountYThor = Number(countResult || 0);

      // Step 2: Query detailed data if count > 0 using multicall
      const detailCalls: any[] = [];

      for (let i = 0; i < unstakeRequestCountYThor; i++) {
        detailCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "unstakeRequestYThor",
          args: [userAddress, BigInt(i)]
        });
      }

      // Execute multicall for detailed data
      let detailResults: any[] = [];
      if (detailCalls.length > 0) {
        detailResults = await publicClient.multicall({
          contracts: detailCalls,
          allowFailure: false
        });
      }

      // Parse results
      const yThorUnstakeRequestsData: OperationItem[] = [];
      let _withdrawableAmount = Big(0);
      for (let i = 0; i < unstakeRequestCountYThor; i++) {
        const result = detailResults[i];
        if (result) {
          const amount = Big(result.amount)
            .div(10 ** YThorToken.decimals)
            .toString();
          const _unlockTime = Big(result.unlockTime).mul(1000).toNumber();
          yThorUnstakeRequestsData.push({
            type: "unstakeRequest" as const,
            index: i,
            amount,
            unlockTime: _unlockTime,
            widthdrawed: i < Number(cursorResult || 0)
          });
          if (i >= Number(cursorResult || 0) && _unlockTime <= Date.now()) {
            _withdrawableAmount = _withdrawableAmount.plus(amount);
          }
        }
      }

      // Sort by unlockTime in descending order (newest first)
      yThorUnstakeRequestsData.sort((a, b) => {
        if (a.type === "unstakeRequest" && b.type === "unstakeRequest") {
          return b.unlockTime - a.unlockTime;
        }
        return 0;
      });

      setYThorUnstakeRequests(yThorUnstakeRequestsData);
      setWithdrawableAmount(_withdrawableAmount.toString());
    } catch (err: any) {
      console.error("Failed to fetch yTHOR unstake requests:", err);
      setErrorUnstakeRequests(
        err?.message || "Failed to fetch yTHOR unstake requests"
      );
      setYThorUnstakeRequests([]);
    } finally {
      setIsLoadingUnstakeRequests(false);
    }
  }, [account?.address, publicClient]);

  /**
   * Request withdraw unlocked yTHOR tokens
   */
  const requestWithdrawUnlockedYThor = useCallback(
    async (maxSchedules: number = 0) => {
      if (!account?.address) {
        toast({
          title: "Operation Failed!",
          description: "Please connect your wallet",
          variant: "destructive"
        });
        return;
      }
      if (!walletClient || !publicClient) {
        toast({
          title: "Operation Failed!",
          description: "Wallet not available",
          variant: "destructive"
        });
        return;
      }

      setIsRequestingWithdraw(true);

      try {
        // Estimate gas
        let gasEstimate: bigint | undefined;
        try {
          gasEstimate = await publicClient.estimateContractGas({
            account: account.address as `0x${string}`,
            address: xMetroToken.address as `0x${string}`,
            abi: xMetroAbi,
            functionName: "requestWithdrawUnlockedYThor",
            args: [BigInt(maxSchedules)]
          });
        } catch (err) {
          console.log("Gas estimation failed:", err);
        }

        // Show pending toast
        toast({
          title: "Transaction Pending!",
          description: "Confirm the transaction in your wallet...",
          variant: "default"
        });

        // Send transaction
        const hash = await walletClient.writeContract({
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "requestWithdrawUnlockedYThor",
          args: [BigInt(maxSchedules)],
          gas: gasEstimate
            ? (gasEstimate * BigInt(120)) / BigInt(100)
            : undefined
        });

        console.log("Request withdraw transaction hash:", hash);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash
        });

        setIsRequestingWithdraw(false);

        if (receipt.status === "success") {
          toast({
            title: "Operation Successful!",
            description:
              "Successfully requested withdraw of unlocked yTHOR tokens",
            variant: "default"
          });
          // Refresh data after successful transaction
          await fetchYThorVesting();
          await fetchYThorUnstakeRequests();
        } else {
          toast({
            title: "Operation Failed!",
            description: "Transaction was not successful",
            variant: "destructive"
          });
        }
      } catch (err: any) {
        console.error("Request withdraw error:", err);
        setIsRequestingWithdraw(false);

        const errorMessage =
          err?.message?.includes("user rejected") ||
          err?.message?.includes("User rejected") ||
          err?.cause?.message?.includes("user rejected")
            ? "User rejected transaction"
            : err?.message || "Request withdraw transaction failed";

        toast({
          title: "Operation Failed!",
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
    [
      account?.address,
      walletClient,
      publicClient,
      fetchYThorVesting,
      fetchYThorUnstakeRequests
    ]
  );

  /**
   * Claim and stake unlocked yTHOR tokens
   */
  const claimAndStakeUnlockedYThor = useCallback(
    async (maxSchedules: number = 0) => {
      if (!account?.address) {
        toast({
          title: "Operation Failed!",
          description: "Please connect your wallet",
          variant: "destructive"
        });
        return;
      }
      if (!walletClient || !publicClient) {
        toast({
          title: "Operation Failed!",
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
            functionName: "claimAndStakeUnlockedYThor",
            args: [BigInt(maxSchedules)]
          });
        } catch (err) {
          console.log("Gas estimation failed:", err);
        }

        // Show pending toast
        toast({
          title: "Transaction Pending!",
          description: "Confirm the transaction in your wallet...",
          variant: "default"
        });

        // Send transaction
        const hash = await walletClient.writeContract({
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "claimAndStakeUnlockedYThor",
          args: [BigInt(maxSchedules)],
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
            title: "Operation Successful!",
            description:
              "Successfully claimed and staked unlocked yTHOR tokens",
            variant: "default"
          });
          // Refresh data after successful transaction
          await fetchYThorVesting();
          await fetchYThorUnstakeRequests();
        } else {
          toast({
            title: "Operation Failed!",
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
            : err?.message || "Claim and stake transaction failed";

        toast({
          title: "Operation Failed!",
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
    [
      account?.address,
      walletClient,
      publicClient,
      fetchYThorVesting,
      fetchYThorUnstakeRequests
    ]
  );

  /**
   * Withdraw yTHOR tokens
   */
  const withdrawYThor = useCallback(
    async (maxRequests = 0) => {
      if (!account?.address) {
        toast({
          title: "Operation Failed!",
          description: "Please connect your wallet",
          variant: "destructive"
        });
        return;
      }
      if (!walletClient || !publicClient) {
        toast({
          title: "Operation Failed!",
          description: "Wallet not available",
          variant: "destructive"
        });
        return;
      }

      setIsWithdrawing(true);

      try {
        // Estimate gas
        let gasEstimate: bigint | undefined;
        try {
          gasEstimate = await publicClient.estimateContractGas({
            account: account.address as `0x${string}`,
            address: xMetroToken.address as `0x${string}`,
            abi: xMetroAbi,
            functionName: "withdrawYThor",
            args: [BigInt(maxRequests)]
          });
        } catch (err) {
          console.log("Gas estimation failed:", err);
        }

        // Show pending toast
        toast({
          title: "Transaction Pending!",
          description: "Confirm the transaction in your wallet...",
          variant: "default"
        });

        // Send transaction
        const hash = await walletClient.writeContract({
          address: xMetroToken.address as `0x${string}`,
          abi: xMetroAbi,
          functionName: "withdrawYThor",
          args: [BigInt(maxRequests)],
          gas: gasEstimate
            ? (gasEstimate * BigInt(120)) / BigInt(100)
            : undefined
        });

        console.log("Withdraw yTHOR transaction hash:", hash);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash
        });

        setIsWithdrawing(false);

        if (receipt.status === "success") {
          toast({
            title: "Operation Successful!",
            description: "Successfully withdrew yTHOR tokens",
            variant: "default"
          });
          // Refresh data after successful transaction
          await fetchYThorVesting();
          await fetchYThorUnstakeRequests();
        } else {
          toast({
            title: "Operation Failed!",
            description: "Transaction was not successful",
            variant: "destructive"
          });
        }
      } catch (err: any) {
        console.error("Withdraw yTHOR error:", err);
        setIsWithdrawing(false);

        const errorMessage =
          err?.message?.includes("user rejected") ||
          err?.message?.includes("User rejected") ||
          err?.cause?.message?.includes("user rejected")
            ? "User rejected transaction"
            : err?.message || "Withdraw transaction failed";

        toast({
          title: "Operation Failed!",
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
    [
      account?.address,
      walletClient,
      publicClient,
      fetchYThorVesting,
      fetchYThorUnstakeRequests
    ]
  );

  // Auto-refresh when dependencies change
  useEffect(() => {
    fetchYThorVesting();
    fetchYThorUnstakeRequests();
  }, [account, publicClient, fetchYThorVesting, fetchYThorUnstakeRequests]);

  return {
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
    refresh: fetchYThorVesting,
    refreshUnstakeRequests: fetchYThorUnstakeRequests,
    requestWithdrawUnlockedYThor,
    claimAndStakeUnlockedYThor,
    withdrawYThor
  };
}
