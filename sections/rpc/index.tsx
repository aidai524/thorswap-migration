"use client";

import React from "react";
import useRPCSpeed, { RPC_SPEED_CONFIG } from "@/hooks/use-rpc-speed";

/**
 * RPC Speed Indicator Component
 * Fixed at the bottom right corner of the page to display the current RPC response speed
 */
export default function RPCSpeedIndicator() {
  const { latency, speedConfig, isChecking } = useRPCSpeed();
  
  // Use FAST style when checking
  const displayConfig = isChecking ? RPC_SPEED_CONFIG.FAST : speedConfig;

  // Don't display if there's no chain info and not checking
  if (latency === null && !isChecking) {
    return null;
  }

  const displayText = isChecking
    ? "Checking..."
    : latency === -1
      ? "Timeout"
      : latency !== null
        ? `${latency}ms`
        : "";

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lg backdrop-blur-sm"
      style={{
        backgroundColor: `${displayConfig.color}20`,
        border: `1px solid ${displayConfig.color}40`
      }}
    >
      <div
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: displayConfig.color,
          boxShadow: `0 0 8px ${displayConfig.color}`
        }}
      />
      <span
        className="text-sm font-medium"
        style={{
          color: displayConfig.color
        }}
      >
        RPC: {displayText}
      </span>
    </div>
  );
}
