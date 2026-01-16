"use client";

import { useEffect, useMemo } from "react";
import { AlertTriangle, Clock, Lock, Info } from "lucide-react";
import { ThorPhaseConfig, YThorPhaseConfig } from "@/config/migration";
import useMigrationStore from "@/stores/use-migration";
import Big from "big.js";

interface VestingInfoPanelProps {
  token: string;
  config: any;
}

export function VestingInfoPanel({ token, config }: VestingInfoPanelProps) {
  // yTHOR vesting info
  return token === "THOR" ? (
    <ThorVestingInfoPanel config={config} />
  ) : (
    <YThorVestingInfoPanel config={config} />
  );
}

function ThorVestingInfoPanel({ config }: { config: any }) {
  const { thorPhase, amount, set } = useMigrationStore();
  const overTime = !config.isStarted;

  const is10MAvailable = useMemo(() => {
    if (!config || !amount) return false;
    const isNotExpired = !config.is10MExpired;
    const hasEnoughCap = Big(config.available10M || "0").gte(amount);
    return isNotExpired && hasEnoughCap;
  }, [config, amount]);

  useEffect(() => {
    if (is10MAvailable && thorPhase === "3M") {
      set({ thorPhase: "10M" });
    }
  }, [is10MAvailable, thorPhase, set]);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Migration Lock Period</h3>
      </div>

      <div className="space-y-3">
        {Object.values(ThorPhaseConfig).map((phase) => {
          // 判断该 phase 是否应该被禁用
          const isDisabled =
            overTime ||
            (phase.key === "10M" && config.is10MExpired) ||
            (phase.key === "3M" && (config.is3MExpired || is10MAvailable));

          return (
            <div
              key={phase.key}
              className={`rounded-lg border p-3 ${
                isDisabled
                  ? "cursor-not-allowed opacity-50 border-border"
                  : phase.key === thorPhase
                  ? "border-primary bg-primary/5 cursor-pointer"
                  : "border-border opacity-80 cursor-pointer"
              }`}
              onClick={() => {
                if (isDisabled) return;
                set({ thorPhase: phase.key });
              }}
            >
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>{phase.lockDuration} lock</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {phase.description}
              </p>
            </div>
          );
        })}
      </div>

      {thorPhase && (
        <div className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 text-primary" />
          <p className="text-muted-foreground">
            Your METRO will be locked for{" "}
            <span className="text-foreground font-medium">
              {ThorPhaseConfig[thorPhase].lockDuration}
            </span>{" "}
            after migration. Rewards can still be claimed during this period.
          </p>
        </div>
      )}
    </div>
  );
}

function YThorVestingInfoPanel({ config }: { config: any }) {
  const { yThorPhase, set } = useMigrationStore();
  const overTime = !config.isStarted;
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-medium">yTHOR Vesting Schedule</h3>
      </div>

      <div className="space-y-3">
        {Object.values(YThorPhaseConfig).map((phase) => (
          <div
            key={phase.key}
            className={`rounded-lg border p-3 ${
              overTime || config.isYThorExpired
                ? "cursor-not-allowed opacity-50 border-border"
                : phase.key === yThorPhase
                ? "border-primary bg-primary/5 cursor-pointer"
                : "border-border opacity-60 cursor-pointer"
            }`}
            onClick={() => {
              if (overTime || config.isYThorExpired) return;
              set({ yThorPhase: phase.key });
            }}
          >
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>{phase.lockDuration} lock</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {phase.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
        <p className="text-muted-foreground">
          yTHOR migration results in a{" "}
          <span className="text-foreground font-medium">
            {YThorPhaseConfig[yThorPhase].lockDuration} total lock period
          </span>
          . Staking rewards are still claimable.
        </p>
      </div>
    </div>
  );
}
