"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet";
import { xMetroToken } from "@/config/tokens";
import xMetroAbi from "@/config/abi/xmetro";
import Big from "big.js";
import { toast } from "@/hooks/use-toast";
import type { OperationItem } from "@/sections/history-record/types";

/**
 * Hook return value interface
 */
interface UseContributorVestingReturn {
  /** Contributor vesting schedules */
  contributorVesting: OperationItem[];
  /** Contributor unstake requests */
  contributorUnstakeRequests: OperationItem[];
  /** Loading state for contributor vesting */
  isLoadingVesting: boolean;
  /** Loading state for contributor unstake requests */
  isLoadingUnstakeRequests: boolean;
  /** Loading state for requestWithdrawUnlockedContributor */
  isRequestingWithdraw: boolean;
  /** Loading state for claimAndStakeUnlockedContributor */
  isClaimingAndStaking: boolean;
  /** Loading state for withdrawContributor */
  isWithdrawing: boolean;
  /** Error message for contributor vesting */
  errorVesting: string | null;
  /** Error message for contributor unstake requests */
  errorUnstakeRequests: string | null;
  /** Withdrawable amount */
  withdrawableAmount: string;
  /** Refresh function */
  refresh: () => Promise<void>;
  /** Refresh contributor unstake requests function */
  refreshUnstakeRequests: () => Promise<void>;
  /** Request withdraw unlocked contributor tokens */
  requestWithdrawUnlockedContributor: (maxSchedules?: number) => Promise<void>;
  /** Claim and stake unlocked contributor tokens */
  claimAndStakeUnlockedContributor: (maxSchedules?: number) => Promise<void>;
  /** Withdraw contributor tokens */
  withdrawContributor: (maxRequests?: number) => Promise<void>;
}

/**
 * Hook for querying contributor vesting records from xMETRO contract
 * Uses multicall to batch contract queries for efficiency
 *
 * @returns Contributor vesting data and related functions
 */
export default function useContributorVesting(): UseContributorVestingReturn {
  const { account, publicClient, walletClient } = useWallet();
  const [contributorVesting, setContributorVesting] = useState<OperationItem[]>(
    []
  );
  const [contributorUnstakeRequests, setContributorUnstakeRequests] = useState<
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
   * Query contributor vesting records
   * First queries count function, then queries detailed data if count > 0
   */
  const fetchContributorVesting = useCallback(async () => {
    if (!account?.address || !publicClient) {
      setContributorVesting([]);
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
        functionName: "contributorVestingCount",
        args: [userAddress]
      });

      const contributorVestingCount = Number(countResult || 0);

      // Step 2: Query detailed data if count > 0 using multicall
      const detailCalls: any[] = [];

      for (let i = 0; i < contributorVestingCount; i++) {
        detailCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "contributorVesting",
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
      const contributorVestingData: OperationItem[] = [];
      let _requestableAmount = Big(0);
      const now = Date.now();

      for (let i = 0; i < contributorVestingCount; i++) {
        const result = detailResults[i];
        if (result) {
          const totalAmount = Big(result.totalAmount)
            .div(10 ** xMetroToken.decimals)
            .toString();
          const claimed = Big(result.claimed)
            .div(10 ** xMetroToken.decimals)
            .toString();
          const startTime = Big(result.startTime).mul(1000).toNumber();
          const duration = Big(result.duration).mul(1000).toNumber();

          contributorVestingData.push({
            totalAmount,
            claimed,
            startTime,
            duration,
            type: "contributorVesting" as const
          });
        }
      }

      setContributorVesting(contributorVestingData);
    } catch (err: any) {
      console.error("Failed to fetch contributor vesting:", err);
      setErrorVesting(err?.message || "Failed to fetch contributor vesting");
      setContributorVesting([]);
    } finally {
      setIsLoadingVesting(false);
    }
  }, [account?.address, publicClient]);

  /**
   * Query contributor unstake request records
   * First queries count function, then queries detailed data if count > 0 using multicall
   */
  const fetchContributorUnstakeRequests = useCallback(async () => {
    if (!account?.address || !publicClient) {
      setContributorUnstakeRequests([]);
      setErrorUnstakeRequests(null);
      return;
    }

    setIsLoadingUnstakeRequests(true);
    setErrorUnstakeRequests(null);

    try {
      const contractAddress = xMetroToken.address as `0x${string}`;
      const userAddress = account.address as `0x${string}`;

      // Step 1: Query count function
      const [countResult, cursorResult] = await publicClient.multicall({
        contracts: [
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "unstakeRequestCountContributor",
            args: [userAddress]
          },
          {
            address: contractAddress,
            abi: xMetroAbi,
            functionName: "unstakeCursorContributor",
            args: [userAddress]
          }
        ],
        allowFailure: false
      });

      const unstakeRequestCountContributor = Number(countResult || 0);

      // Step 2: Query detailed data if count > 0 using multicall
      const detailCalls: any[] = [];

      for (let i = 0; i < unstakeRequestCountContributor; i++) {
        detailCalls.push({
          address: contractAddress,
          abi: xMetroAbi,
          functionName: "unstakeRequestContributor",
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
      const contributorUnstakeRequestsData: OperationItem[] = [];
      let _withdrawableAmount = Big(0);
      for (let i = 0; i < unstakeRequestCountContributor; i++) {
        const result = detailResults[i];
        if (result) {
          const amount = Big(result.amount)
            .div(10 ** xMetroToken.decimals)
            .toString();
          const _unlockTime = Big(result.unlockTime).mul(1000).toNumber();
          contributorUnstakeRequestsData.push({
            amount,
            unlockTime: _unlockTime,
            widthdrawed: i < Number(cursorResult || 0),
            type: "unstakeRequest" as const,
            index: i
          });
          if (i >= Number(cursorResult || 0) && _unlockTime <= Date.now()) {
            _withdrawableAmount = _withdrawableAmount.plus(amount);
          }
        }
      }

      setContributorUnstakeRequests(contributorUnstakeRequestsData);
      setWithdrawableAmount(_withdrawableAmount.toString());
    } catch (err: any) {
      console.error("Failed to fetch contributor unstake requests:", err);
      setErrorUnstakeRequests(
        err?.message || "Failed to fetch contributor unstake requests"
      );
      setContributorUnstakeRequests([]);
    } finally {
      setIsLoadingUnstakeRequests(false);
    }
  }, [account?.address, publicClient]);

  /**
   * Request withdraw unlocked contributor tokens
   */
  const requestWithdrawUnlockedContributor = useCallback(
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
            functionName: "requestWithdrawUnlockedContributor",
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
          functionName: "requestWithdrawUnlockedContributor",
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
              "Successfully requested withdraw of unlocked contributor tokens",
            variant: "default"
          });
          // Refresh data after successful transaction
          await fetchContributorVesting();
          await fetchContributorUnstakeRequests();
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
      fetchContributorVesting,
      fetchContributorUnstakeRequests
    ]
  );

  /**
   * Claim and stake unlocked contributor tokens
   */
  const claimAndStakeUnlockedContributor = useCallback(
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
            functionName: "claimAndStakeUnlockedContributor",
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
          functionName: "claimAndStakeUnlockedContributor",
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
              "Successfully claimed and staked unlocked contributor tokens",
            variant: "default"
          });
          // Refresh data after successful transaction
          await fetchContributorVesting();
          await fetchContributorUnstakeRequests();
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
      fetchContributorVesting,
      fetchContributorUnstakeRequests
    ]
  );

  /**
   * Withdraw contributor tokens
   */
  const withdrawContributor = useCallback(
    async (maxRequests: number = 0) => {
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
            functionName: "withdrawContributor",
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
          functionName: "withdrawContributor",
          args: [BigInt(maxRequests)],
          gas: gasEstimate
            ? (gasEstimate * BigInt(120)) / BigInt(100)
            : undefined
        });

        console.log("Withdraw contributor transaction hash:", hash);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash
        });

        setIsWithdrawing(false);

        if (receipt.status === "success") {
          toast({
            title: "Operation Successful!",
            description: "Successfully withdrew contributor tokens",
            variant: "default"
          });
          // Refresh data after successful transaction
          await fetchContributorVesting();
          await fetchContributorUnstakeRequests();
        } else {
          toast({
            title: "Operation Failed!",
            description: "Transaction was not successful",
            variant: "destructive"
          });
        }
      } catch (err: any) {
        console.error("Withdraw contributor error:", err);
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
      fetchContributorVesting,
      fetchContributorUnstakeRequests
    ]
  );

  // Auto-refresh when dependencies change
  useEffect(() => {
    fetchContributorVesting();
    fetchContributorUnstakeRequests();
  }, [account, publicClient]);

  return {
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
    refresh: fetchContributorVesting,
    refreshUnstakeRequests: fetchContributorUnstakeRequests,
    requestWithdrawUnlockedContributor,
    claimAndStakeUnlockedContributor,
    withdrawContributor
  };
}
