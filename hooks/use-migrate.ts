"use client";

import { useState, useEffect, useCallback } from "react";
import { parseUnits } from "viem";
import { useDebounceFn } from "ahooks";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/wallet";
import { ThorMigrationEscrow } from "@/config/contracts";
import migrateAbi from "@/config/abi/migrate";
import useMigrationStore from "@/stores/use-migration";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { ThorToken, YThorToken } from "@/config/tokens";
import Big from "big.js";
import type { Token } from "@/lib/types";

/**
 * Hook return value interface
 */
interface UseMigrateReturn {
  /** Loading state */
  isLoading: boolean;
  /** Execute migration */
  migrate: () => Promise<void>;
  /** Amount validation error message */
  amountError: string | null;
  /** Migration eligibility error message */
  migrationError: string | null;
  tokenBalance: string;
  selectedToken: Token;
}

/**
 * Hook for executing migration transactions
 *
 * @returns Migration function and loading state
 *
 * @example
 * ```tsx
 * const { migrate, isLoading } = useMigrate();
 *
 * <button onClick={migrate} disabled={isLoading}>
 *   {isLoading ? "Migrating..." : "Migrate"}
 * </button>
 * ```
 */
export default function useMigrate(
  contractConfig: any,
  onSuccess: () => void
): UseMigrateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const { account, publicClient, walletClient } = useWallet();
  const { token, thorPhase, amount } = useMigrationStore();

  // Get selected token for balance check
  const selectedToken = token === "THOR" ? ThorToken : YThorToken;
  const { balance: tokenBalance, refetch: refetchTokenBalance } =
    useTokenBalance({ token: selectedToken });

  /**
   * Validate amount based on requirements:
   * 1. amount must be greater than 0
   * 2. amount must be less than token balance
   * 3. amount must be less than available amount from contract config
   */
  const validateAmount = useCallback((): string | null => {
    // Check if amount is greater than 0
    if (!amount || Big(amount).lte(0)) {
      return "Amount must be greater than 0";
    }

    // Check if amount is less than token balance
    if (tokenBalance) {
      if (Big(amount).gt(tokenBalance)) {
        return `Insufficient balance.`;
      }
    }

    // Check if amount is less than available amount based on token and phase
    let availableAmount: string;
    if (token === "THOR") {
      if (thorPhase === "10M") {
        availableAmount = contractConfig.available10M;
      } else if (thorPhase === "3M") {
        availableAmount = contractConfig.available3M;
      } else {
        return "Invalid THOR phase. Please select 10M or 3M";
      }
    } else if (token === "yTHOR") {
      availableAmount = contractConfig.availableYThor;
    } else {
      return "Invalid token. Please select THOR or yTHOR";
    }

    if (Big(amount).gt(availableAmount)) {
      return `Amount exceeds available migration limit.`;
    }

    return null;
  }, [amount, tokenBalance, contractConfig, token, thorPhase]);

  /**
   * Check if migration is allowed based on requirements:
   * 1. amount must be valid
   * 2. migration must be started (isStarted must be true)
   * 3. corresponding expiration flag must be false
   */
  const checkMigrationEligibility = useCallback((): string | null => {
    // First validate amount
    const amountErr = validateAmount();
    if (amountErr) {
      return amountErr;
    }

    // Check if contract config is available
    if (!contractConfig) {
      return "Contract configuration not available";
    }

    // Check if migration has started
    if (!contractConfig.isStarted) {
      return "Migration has not started yet";
    }

    // Check expiration status based on token and phase
    if (token === "THOR") {
      if (thorPhase === "10M") {
        if (contractConfig.is10MExpired) {
          return "10M migration period has expired";
        }
      } else if (thorPhase === "3M") {
        if (contractConfig.is3MExpired) {
          return "3M migration period has expired";
        }
      } else {
        return "Invalid THOR phase. Please select 10M or 3M";
      }
    } else if (token === "yTHOR") {
      if (contractConfig.isYThorExpired) {
        return "yTHOR migration period has expired";
      }
    } else {
      return "Invalid token. Please select THOR or yTHOR";
    }

    return null;
  }, [validateAmount, contractConfig, token, thorPhase]);

  // Debounced validation functions
  const { run: debouncedValidateAmount } = useDebounceFn(
    () => {
      const error = validateAmount();
      setAmountError(error);
    },
    { wait: 300 }
  );

  const { run: debouncedCheckMigration } = useDebounceFn(
    () => {
      const error = checkMigrationEligibility();
      setMigrationError(error);
    },
    { wait: 300 }
  );

  // Auto validate when dependencies change
  useEffect(() => {
    debouncedValidateAmount();
  }, [
    amount,
    tokenBalance,
    contractConfig,
    token,
    thorPhase,
    debouncedValidateAmount
  ]);

  useEffect(() => {
    debouncedCheckMigration();
  }, [
    amount,
    tokenBalance,
    contractConfig,
    token,
    thorPhase,
    debouncedCheckMigration
  ]);

  const migrate = async () => {
    // Validate wallet connection
    if (!account?.address) {
      toast({
        title: "Migration Failed!",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    // Validate wallet client and public client
    if (!walletClient || !publicClient) {
      toast({
        title: "Migration Failed!",
        description: "Wallet not available",
        variant: "destructive"
      });
      return;
    }

    // Validate contract address
    if (!ThorMigrationEscrow) {
      toast({
        title: "Migration Failed!",
        description: "Contract address not configured",
        variant: "destructive"
      });
      return;
    }

    // Validate migration eligibility
    if (migrationError) {
      toast({
        title: "Migration Failed!",
        description: migrationError,
        variant: "destructive"
      });
      return;
    }

    // Determine which function to call based on token and phase
    let functionName: "migrateThor10m" | "migrateThor3m" | "migrateYThor";

    if (token === "THOR") {
      if (thorPhase === "10M") {
        functionName = "migrateThor10m";
      } else if (thorPhase === "3M") {
        functionName = "migrateThor3m";
      } else {
        toast({
          title: "Migration Failed!",
          description: "Invalid THOR phase. Please select 10M or 3M",
          variant: "destructive"
        });
        return;
      }
    } else if (token === "yTHOR") {
      functionName = "migrateYThor";
    } else {
      toast({
        title: "Migration Failed!",
        description: "Invalid token. Please select THOR or yTHOR",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert amount to bigint (assuming 18 decimals for THOR and yTHOR)
      const amountInWei = parseUnits(Big(amount).toFixed(18), 18);

      // Estimate gas
      let gasEstimate: bigint | undefined;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          account: account.address as `0x${string}`,
          address: ThorMigrationEscrow as `0x${string}`,
          abi: migrateAbi,
          functionName,
          args: [amountInWei]
        });
      } catch (err) {
        console.log("Gas estimation failed:", err);
      }

      toast({
        title: "Migration Pending!",
        description: "Confirm the transaction in your wallet...",
        variant: "default"
      });

      // Send transaction
      const hash = await walletClient.writeContract({
        address: ThorMigrationEscrow as `0x${string}`,
        abi: migrateAbi,
        functionName,
        args: [amountInWei],
        gas: gasEstimate ? (gasEstimate * BigInt(120)) / BigInt(100) : undefined
      });

      console.log("Migration transaction hash:", hash);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash
      });

      setIsLoading(false);

      if (receipt.status === "success") {
        toast({
          title: "Migration Successful!",
          description: `Successfully migrated ${amount} ${selectedToken.symbol} to METRO`,
          variant: "default"
        });
        onSuccess();
        refetchTokenBalance();
      } else {
        toast({
          title: "Migration Failed!",
          description: "Transaction was not successful",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Migration error:", err);
      setIsLoading(false);

      const errorMessage =
        err?.message?.includes("user rejected") ||
        err?.message?.includes("User rejected") ||
        err?.cause?.message?.includes("user rejected")
          ? "User rejected transaction"
          : err?.message || "Migration transaction failed";

      toast({
        title: "Migration Failed!",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return {
    isLoading,
    migrate,
    tokenBalance,
    amountError,
    migrationError,
    selectedToken
  };
}
