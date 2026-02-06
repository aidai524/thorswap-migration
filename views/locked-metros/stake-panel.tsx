"use client";

import { useEffect, useMemo } from "react";
import { useWallet } from "@/contexts/wallet";
import { AmountInput } from "@/views/migrate/amount-input";
import { ButtonWithApprove } from "@/components/button-with-approve";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Clock, Lock, Info } from "lucide-react";
import { ThorToken, MetroToken } from "@/config/tokens";
import useMigrationStore from "@/stores/use-migration";
import useMigrate from "@/hooks/use-migrate";
import useContractConfig from "@/hooks/use-migrate-contract-config";
import { ThorMigrationEscrow } from "@/config/contracts";
import { ThorPhaseConfig } from "@/config/migration";
import { formatNumber } from "@/utils/format-number";
import Big from "big.js";

export function StakePanel() {
  const { amount, thorPhase, set } = useMigrationStore();
  const { account } = useWallet();
  const { config, refetch: refetchConfig } = useContractConfig();
  const {
    migrate,
    isLoading,
    tokenBalance,
    selectedToken,
    amountError,
    migrationError
  } = useMigrate(config, () => {
    refetchConfig();
  });

  // Fix token to THOR
  useEffect(() => {
    set({ token: "THOR" });
  }, [set]);

  const isWrongNetwork =
    account?.address && account.chainId !== ThorToken.chainId;

  const receiveAmount = useMemo(() => {
    if (!amount || !config) return "0";
    return Big(amount)
      .mul(thorPhase === "10M" ? config.ratio10M : config.ratio3M)
      .toString();
  }, [amount, thorPhase, config]);

  const overTime = !config?.isStarted;
  const is10MAvailable = useMemo(() => {
    if (!config || !amount) return false;
    const isNotExpired = !config.is10MExpired;
    const hasEnoughCap = Big(config.available10M || "0").gte(amount);
    return isNotExpired && hasEnoughCap;
  }, [config, amount]);

  // Auto switch to 10M if available
  useEffect(() => {
    if (is10MAvailable && thorPhase === "3M") {
      set({ thorPhase: "10M" });
    }
  }, [is10MAvailable, thorPhase, set]);

  const errorMessage = amountError || migrationError;

  return (
    <div>
      <Card className="border-border bg-card">
        {/* <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Migrate</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-primary">METRO</span>
          </CardTitle>
          <CardDescription>
            Convert your THOR tokens to METRO on Base chain
          </CardDescription>
        </CardHeader> */}
        <CardContent className="space-y-6">
          {/* Network Warning */}
          {isWrongNetwork && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Wrong Network</p>
                <p className="text-sm text-muted-foreground">
                  Please switch to {ThorToken.chainName} to migrate
                </p>
              </div>
            </div>
          )}

          {/* Migration Lock Period Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium">
                Migration Lock Period
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ThorPhaseConfig).map((phase) => {
                const isDisabled =
                  overTime ||
                  (phase.key === "10M" && config?.is10MExpired) ||
                  (phase.key === "3M" &&
                    (config?.is3MExpired || is10MAvailable));

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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  after migration. Rewards can still be claimed during this
                  period.
                </p>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <AmountInput
              value={amount}
              onChange={(value) => set({ amount: value })}
              tokenSymbol={ThorToken.symbol}
              maxAmount={tokenBalance || "0"}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {/* Migration Preview */}
          {Number(amount) > 0 && (
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">You'll receive</span>
                <span className="font-medium text-primary">
                  ~{formatNumber(receiveAmount || 0, 2, true)} METRO
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-medium">
                  {MetroToken.chainName} Network
                </span>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-muted-foreground">
              Migration is{" "}
              <span className="text-foreground font-semibold">
                irreversible
              </span>
              . Once confirmed, you cannot convert METRO back to THOR.
            </p>
          </div>
          <ButtonWithApprove
            token={selectedToken}
            chainId={selectedToken.chainId}
            amount={amount || "0.000001"}
            spender={ThorMigrationEscrow}
            onAction={migrate}
            actionLoading={isLoading}
            actionDisabled={isWrongNetwork || isLoading || !!errorMessage}
            actionText="Lock"
          />
        </CardContent>
      </Card>
      <Card className="border-border bg-card mt-4">
        <CardHeader>
          <CardTitle className="text-base">How Migration Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              1
            </div>
            <p>Approve and submit your THOR tokens on Ethereum</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              2
            </div>
            <p>
              Your tokens are burned on Ethereum and METRO is minted on Base
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              3
            </div>
            <p>
              METRO is automatically staked with the appropriate lock period
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              4
            </div>
            <p>Start earning USDC rewards immediately</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
