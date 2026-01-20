"use client";

import { useState, useEffect, useCallback } from "react";
import { parseEther } from "viem";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/wallet";
import { GAS_UNIT, GAS_ACCOUNT } from "@/config/autocompound";
import dollaService from "@/services/api";

interface UseDepositGasReturn {
  /** Loading state for depositing gas */
  depositing: boolean;
  /** Balance gas fee from API */
  balanceGasFee: string | null;
  /** Loading state for fetching gas balance */
  isLoadingBalance: boolean;
  /** Execute deposit gas transaction */
  depositGas: () => Promise<void>;
  /** Refresh gas balance */
  refreshBalance: () => Promise<void>;
}

export default function useDepositGas(): UseDepositGasReturn {
  const { account, publicClient, walletClient } = useWallet();
  const [depositing, setDepositing] = useState(false);
  const [balanceGasFee, setBalanceGasFee] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  /**
   * Fetch gas balance from API
   */
  const fetchGasBalance = useCallback(async () => {
    if (!account?.address) {
      setBalanceGasFee(null);
      return;
    }

    setIsLoadingBalance(true);
    try {
      const response = await dollaService.getAutocompoundGasFee(
        account.address
      );
      setBalanceGasFee(response?.balance_gas_fee || "0");
    } catch (err: any) {
      console.error("Failed to fetch gas balance:", err);
      setBalanceGasFee(null);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [account?.address]);

  // Auto fetch gas balance when account changes
  useEffect(() => {
    fetchGasBalance();
  }, [fetchGasBalance]);

  const depositGas = async () => {
    if (!account?.address) {
      toast({
        title: "Deposit Failed!",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    if (!walletClient || !publicClient) {
      toast({
        title: "Deposit Failed!",
        description: "Wallet not connected",
        variant: "destructive"
      });
      return;
    }

    setDepositing(true);

    try {
      // Convert ETH amount to wei
      const value = parseEther(GAS_UNIT.toString());

      // Show pending toast
      toast({
        title: "Deposit Pending!",
        description: "Confirm the transaction in your wallet...",
        variant: "default"
      });

      // Send ETH transaction
      const hash = await walletClient.sendTransaction({
        to: GAS_ACCOUNT as `0x${string}`,
        value: value
      });

      console.log("Deposit gas transaction hash:", hash);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      setDepositing(false);

      if (receipt.status === "success") {
        toast({
          title: "Deposit Successful!",
          description: `Successfully deposited ${GAS_UNIT} ETH for gas`,
          variant: "default"
        });
        // Refresh gas balance after successful deposit
        await fetchGasBalance();
      } else {
        toast({
          title: "Deposit Failed!",
          description: "Transaction was not successful",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Deposit gas error:", err);
      setDepositing(false);
      toast({
        title: "Deposit Failed!",
        description: err?.message || "Failed to deposit gas",
        variant: "destructive"
      });
    }
  };

  return {
    depositing,
    balanceGasFee,
    isLoadingBalance,
    depositGas,
    refreshBalance: fetchGasBalance
  };
}
