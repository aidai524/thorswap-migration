"use client";

import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider } from "ethers";
import { useWallet } from "@/contexts/wallet";
import chains from "@/config/chains";

// RPC timeout duration (milliseconds)
const RPC_TIMEOUT = 5000;

// RPC speed type definitions
export type RPCSpeedType = "FAST" | "SLOW" | "STOP";

export interface RPCSpeedConfig {
  color: string;
  lt?: number;
  gte?: number;
}

export const RPC_SPEED_CONFIG: Record<RPCSpeedType, RPCSpeedConfig> = {
  FAST: {
    color: "#57DB64",
    lt: 500,
    gte: 0
  },
  SLOW: {
    color: "#FFAA27",
    gte: 500,
    lt: 2000
  },
  STOP: {
    color: "#FF547D",
    gte: 2000,
    lt: RPC_TIMEOUT
  }
};

/**
 * Check RPC speed
 * @param url RPC URL
 * @param init Whether this is an initial check
 * @returns Promise<number> Returns response time in milliseconds, -1 indicates timeout or failure
 */
export async function checkRPCSpeed(
  url: string,
  init: boolean = false
): Promise<number> {
  const start = new Date().getTime();
  const provider = new JsonRpcProvider(url);

  const timeoutPromise = new Promise<number>((resolve, reject) => {
    setTimeout(() => {
      reject(-1);
    }, RPC_TIMEOUT);
  });

  return new Promise((resolve) => {
    Promise.race(
      init ? [provider.getNetwork()] : [provider.getNetwork(), timeoutPromise]
    )
      .then(() => {
        const end = new Date().getTime();
        resolve(end - start);
      })
      .catch(() => {
        resolve(-1);
      });
  });
}

/**
 * Get speed type based on response time
 * @param latency Response time in milliseconds, -1 indicates timeout, null indicates not checked
 * @returns RPCSpeedType
 */
export function getRPCSpeedType(latency: number | null): RPCSpeedType {
  if (latency === null || latency === -1 || latency >= RPC_TIMEOUT) {
    return "STOP";
  }
  if (latency >= 0 && latency < 500) {
    return "FAST";
  }
  if (latency >= 500 && latency < 2000) {
    return "SLOW";
  }
  return "STOP";
}

/**
 * Hook for RPC speed detection
 * @returns RPC speed information and check function
 */
export default function useRPCSpeed() {
  const { account } = useWallet();
  const [latency, setLatency] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Get the current chain's RPC URL
  const getCurrentRPCUrl = useCallback((): string | null => {
    if (!account?.chainId) {
      return null;
    }

    const chain = chains.find((c) => c.id === account.chainId);
    if (!chain) {
      return null;
    }

    return chain.rpcUrls.default.http[0] || null;
  }, [account?.chainId]);

  // Check RPC speed
  const checkSpeed = useCallback(async () => {
    const rpcUrl = getCurrentRPCUrl();
    if (!rpcUrl) {
      setLatency(null);
      return;
    }

    setIsChecking(true);
    try {
      const speed = await checkRPCSpeed(rpcUrl, false);
      setLatency(speed);
    } catch (error) {
      console.error("Failed to check RPC speed:", error);
      setLatency(-1);
    } finally {
      setIsChecking(false);
    }
  }, [getCurrentRPCUrl]);

  // Automatically check when chain switches
  useEffect(() => {
    if (account?.chainId) {
      checkSpeed();
      // Automatically check every 10 seconds
      const interval = setInterval(checkSpeed, 10000);
      return () => clearInterval(interval);
    } else {
      setLatency(null);
    }
  }, [account?.chainId, checkSpeed]);

  const speedType = getRPCSpeedType(latency);
  const speedConfig = RPC_SPEED_CONFIG[speedType];

  return {
    latency,
    speedType,
    speedConfig,
    isChecking,
    checkSpeed
  };
}
