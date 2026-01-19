"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet";
import { ThorMigrationEscrow } from "@/config/contracts";
import migrateAbi from "@/config/abi/migrate";
import Big from "big.js";
import useContractConfigStore, {
  type StaticContractConfig
} from "@/stores/use-contract-config";
import { ThorToken, YThorToken } from "@/config/tokens";
import { useDebounceFn } from "ahooks";

/**
 * Minted amounts (dynamic data, fetched every time)
 */
export interface MintedData {
  minted10M: string;
  minted3M: string;
  mintedYThor: string;
}

/**
 * Contract configuration data interface
 */
export interface ContractConfig {
  available10M: string;
  available3M: string;
  availableYThor: string;
  is10MExpired: boolean;
  is3MExpired: boolean;
  isYThorExpired: boolean;
  ratio10M: string;
  ratio3M: string;
  ratioYThor: string;
  isStarted: boolean;
}

/**
 * Hook return value interface
 */
interface UseContractConfigReturn {
  /** Contract configuration data */
  config: ContractConfig | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Manually refresh configuration */
  refetch: () => Promise<void>;
  /** Manually refresh static config (force fetch from contract) */
  refetchStaticConfig: () => Promise<void>;
}

/**
 * Hook for batch querying ThorMigrationEscrow contract configuration
 *
 * @returns Contract configuration data, loading state, and refresh method
 *
 */
export default function useContractConfig(): UseContractConfigReturn {
  const [config, setConfig] = useState<ContractConfig | null>({
    available10M: "0",
    available3M: "0",
    availableYThor: "0",
    ratio10M: "0",
    ratio3M: "0",
    ratioYThor: "0",
    isStarted: false,
    is10MExpired: false,
    is3MExpired: false,
    isYThorExpired: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicClient,account } = useWallet();
  const { setStaticConfig } = useContractConfigStore();

  /**
   * Fetch static configuration from contract (cap, deadline, ratio, migrationStartTime)
   * This data is cached in localStorage
   */
  const fetchStaticConfig =
    useCallback(async (): Promise<StaticContractConfig | null> => {
      if (!ThorMigrationEscrow || !publicClient) {
        return null;
      }

      try {
        const staticCalls = [
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "cap10M" as const
          },
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "cap3M" as const
          },
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "capYThor" as const
          },
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "deadline10M" as const
          },
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "deadline3M" as const
          },
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "deadlineYThor" as const
          },
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "ratio10M" as const
          },
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "ratio3M" as const
          },
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "ratioYThor" as const
          },
          {
            address: ThorMigrationEscrow as `0x${string}`,
            abi: migrateAbi,
            functionName: "migrationStartTime" as const
          }
        ];

        const results = await publicClient.multicall({
          contracts: staticCalls,
          allowFailure: true
        });

        const staticConfig: StaticContractConfig = {
          cap10M: Big(results[0]?.result || "0")
            .div(10 ** ThorToken.decimals)
            .toString(),
          cap3M: Big(results[1]?.result || "0")
            .div(10 ** ThorToken.decimals)
            .toString(),
          capYThor: Big(results[2]?.result || "0")
            .div(10 ** YThorToken.decimals)
            .toString(),
          deadline10M: Big(results[3]?.result || "0")
            .mul(1000)
            .toString(),
          deadline3M: Big(results[4]?.result || "0")
            .mul(1000)
            .toString(),
          deadlineYThor: Big(results[5]?.result || "0")
            .mul(1000)
            .toString(),
          ratio10M: Big(results[6]?.result || "0")
            .div(1e18)
            .toString(),
          ratio3M: Big(results[7]?.result || "0")
            .div(1e18)
            .toString(),
          ratioYThor: Big(results[8]?.result || "0")
            .div(1e18)
            .toString(),
          migrationStartTime: Big(results[9]?.result || "0")
            .mul(1000)
            .toString()
        };

        setStaticConfig(staticConfig);

        return staticConfig;
      } catch (err) {
        console.error("Error fetching static config:", err);
        return null;
      }
    }, [publicClient, setStaticConfig]);

  /**
   * Fetch minted amounts (dynamic data, fetched every time)
   */
  const fetchMintedData = useCallback(async (): Promise<MintedData | null> => {
    if (!ThorMigrationEscrow || !publicClient) {
      return null;
    }

    try {
      const mintedCalls = [
        {
          address: ThorMigrationEscrow as `0x${string}`,
          abi: migrateAbi,
          functionName: "minted10M" as const
        },
        {
          address: ThorMigrationEscrow as `0x${string}`,
          abi: migrateAbi,
          functionName: "minted3M" as const
        },
        {
          address: ThorMigrationEscrow as `0x${string}`,
          abi: migrateAbi,
          functionName: "mintedYThor" as const
        }
      ];

      const results = await publicClient.multicall({
        contracts: mintedCalls,
        allowFailure: true
      });

      return {
        minted10M: Big(results[0]?.result || "0")
          .div(10 ** ThorToken.decimals)
          .toString(),
        minted3M: Big(results[1]?.result || "0")
          .div(10 ** ThorToken.decimals)
          .toString(),
        mintedYThor: Big(results[2]?.result || "0")
          .div(10 ** YThorToken.decimals)
          .toString()
      };
    } catch (err) {
      console.error("Error fetching minted data:", err);
      return null;
    }
  }, [publicClient]);

  /**
   * Build contract configuration from static config and minted data
   */
  const buildConfig = useCallback(
    (staticCfg: StaticContractConfig, minted: MintedData): ContractConfig => {
      const available10M = Big(staticCfg.cap10M)
        .minus(minted.minted10M)
        .toString();
      const available3M = Big(staticCfg.cap3M)
        .minus(minted.minted3M)
        .toString();
      const availableYThor = Big(staticCfg.capYThor)
        .minus(minted.mintedYThor)
        .toString();

      const now = Big(Math.floor(Date.now() / 1000));
      const deadline10M = Big(staticCfg.deadline10M);
      const deadline3M = Big(staticCfg.deadline3M);
      const deadlineYThor = Big(staticCfg.deadlineYThor);
      const migrationStartTime = Big(staticCfg.migrationStartTime);

      const _config: ContractConfig = {
        available10M,
        available3M,
        availableYThor,
        is10MExpired: !deadline10M.gt(now),
        is3MExpired: !deadline3M.gt(now),
        isYThorExpired: !deadlineYThor.gt(now),
        ratio10M: staticCfg.ratio10M,
        ratio3M: staticCfg.ratio3M,
        ratioYThor: staticCfg.ratioYThor,
        isStarted: migrationStartTime.gt(now)
      };
      console.log("migrate contract config", _config);
      return _config;
    },
    []
  );

  /**
   * Fetch configuration: use cached static config if available, always fetch minted data
   */
  const fetchConfig = useCallback(async () => {
    // Reset error state
    setError(null);
    // Validate contract address
    if (!ThorMigrationEscrow) {
      setError("Contract address not configured");
      setConfig(null);
      setIsLoading(false);
      return;
    }

    if (!publicClient) {
      setError("Web3 provider not available");
      setConfig(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Get static config (from cache or fetch)
      // Read directly from store to avoid dependency on staticConfig state
      let currentStaticConfig = useContractConfigStore.getState().staticConfig;

      if (!currentStaticConfig) {
        console.log("No cached static config found, fetching from contract...");
        currentStaticConfig = await fetchStaticConfig();
        if (!currentStaticConfig) {
          throw new Error("Failed to fetch static configuration");
        }
      } else {
        console.log("Using cached static config");
      }

      // Step 2: Always fetch minted data (dynamic, changes frequently)

      const mintedData = await fetchMintedData();
      if (!mintedData) {
        throw new Error("Failed to fetch minted data");
      }

      // Step 3: Build final config from static config and minted data
      const contractConfig = buildConfig(currentStaticConfig, mintedData);

      setConfig(contractConfig);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch contract configuration";
      setError(errorMessage);
      setConfig(null);
      console.error("Error fetching contract configuration:", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, fetchStaticConfig, fetchMintedData, buildConfig]);

  /**
   * Force refresh static config (fetch from contract and update cache)
   */
  const refetchStaticConfig = useCallback(async () => {
    if (!publicClient) {
      return;
    }
    const newStaticConfig = await fetchStaticConfig();
    if (!newStaticConfig) {
      return;
    }
    // After updating static config, fetch minted data and rebuild config
    const mintedData = await fetchMintedData();
    if (!mintedData) {
      return;
    }
    const contractConfig = buildConfig(newStaticConfig, mintedData);
    setConfig(contractConfig);
  }, [publicClient]);

  const { run: debouncedFetchConfig } = useDebounceFn(fetchConfig, {
    wait: 1000
  });

  // Auto refresh on initial load and dependency changes
  useEffect(() => {
    if (account?.address) {
      debouncedFetchConfig();
    }
  }, [account]);

  return {
    config,
    isLoading,
    error,
    refetch: fetchConfig,
    refetchStaticConfig
  };
}
