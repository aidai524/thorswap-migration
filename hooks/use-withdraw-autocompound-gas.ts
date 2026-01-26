"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/wallet";
import dollaService from "@/services/api";

/**
 * Hook return value interface
 */
interface UseWithdrawAutocompoundGasReturn {
  /** Loading state for withdrawing gas */
  withdrawing: boolean;
  /** Execute withdraw autocompound gas fee */
  withdrawGas: () => Promise<void>;
}

export default function useWithdrawAutocompoundGas(): UseWithdrawAutocompoundGasReturn {
  const { account, walletClient } = useWallet();
  const [withdrawing, setWithdrawing] = useState(false);

  /**
   * Execute withdraw autocompound gas fee
   * Signs a message and calls the API to withdraw gas fee
   */
  const withdrawGas = async () => {
    // Validate wallet connection
    if (!account?.address) {
      toast({
        title: "Withdraw Failed!",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    // Validate wallet client
    if (!walletClient) {
      toast({
        title: "Withdraw Failed!",
        description: "Wallet not available",
        variant: "destructive"
      });
      return;
    }

    setWithdrawing(true);

    try {
      // Create message to sign
      const message = `Confirm Withdraw AutoCompound Gas Fee Receive: ${account.address.toLowerCase()}`;

      // Show pending toast
      toast({
        title: "Withdraw Pending!",
        description: "Please sign the message in your wallet...",
        variant: "default"
      });

      // Sign message using wallet
      const signature = await walletClient.signMessage({
        message
      });

      console.log("Signature generated:", signature);

      // Call API to withdraw gas fee
      await dollaService.withdrawAutocompoundGas({
        address: account.address,
        signature
      });

      setWithdrawing(false);

      toast({
        title: "Withdraw Successful!",
        description: "Successfully withdrew autocompound gas fee",
        variant: "default"
      });
    } catch (err: any) {
      console.error("Withdraw autocompound gas error:", err);
      setWithdrawing(false);

      const errorMessage =
        err?.message?.includes("user rejected") ||
        err?.message?.includes("User rejected") ||
        err?.cause?.message?.includes("user rejected")
          ? "User rejected signature"
          : err?.message || "Failed to withdraw autocompound gas fee";

      toast({
        title: "Withdraw Failed!",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    withdrawing,
    withdrawGas
  };
}
