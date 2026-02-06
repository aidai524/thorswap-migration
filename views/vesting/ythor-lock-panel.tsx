"use client";

import { useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Clock, Lock, Info } from "lucide-react";
import { ButtonWithApprove } from "@/components/button-with-approve";
import { AmountInput } from "@/views/migrate/amount-input";
import { useWallet } from "@/contexts/wallet";
import useMigrationStore from "@/stores/use-migration";
import useMigrate from "@/hooks/use-migrate";
import useContractConfig from "@/hooks/use-migrate-contract-config";
import { ThorMigrationEscrow } from "@/config/contracts";
import { YThorPhaseConfig } from "@/config/migration";
import { formatNumber } from "@/utils/format-number";
import { YThorToken, MetroToken } from "@/config/tokens";
import Big from "big.js";

/**
 * Lock panel component for yTHOR vesting
 * Allows users to migrate yTHOR tokens to METRO
 */
export default function YThorLockPanel() {
  const { amount, yThorPhase, set } = useMigrationStore();
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

  // Fix token to yTHOR
  useEffect(() => {
    set({ token: "yTHOR" });
  }, [set]);

  const isWrongNetwork =
    account?.address && account.chainId !== YThorToken.chainId;

  const receiveAmount = useMemo(() => {
    if (!amount || !config) return "0";
    return Big(amount).mul(config.ratioYThor).toString();
  }, [amount, config]);

  const overTime = !config?.isStarted;

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
            Convert your yTHOR tokens to METRO on Base chain
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
                  Please switch to {YThorToken.chainName} to migrate
                </p>
              </div>
            </div>
          )}

          {/* Migration Lock Period Selection */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {Object.values(YThorPhaseConfig).map((phase) => {
                const isDisabled = overTime || config?.isYThorExpired;

                return (
                  <div
                    key={phase.key}
                    className={`rounded-lg border p-3 ${
                      isDisabled
                        ? "cursor-not-allowed opacity-50 border-border"
                        : phase.key === yThorPhase
                          ? "border-primary bg-primary/5 cursor-pointer"
                          : "border-border opacity-80 cursor-pointer"
                    }`}
                    onClick={() => {
                      if (isDisabled) return;
                      set({ yThorPhase: phase.key });
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
            {yThorPhase && (
              <div className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-sm">
                <Info className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-muted-foreground">
                  Your METRO will be locked for{" "}
                  <span className="text-foreground font-medium">
                    {YThorPhaseConfig[yThorPhase].lockDuration}
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
              tokenSymbol={YThorToken.symbol}
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
              . Once confirmed, you cannot convert METRO back to yTHOR.
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
            actionText="Vest"
          />
        </CardContent>
      </Card>
    </div>
  );
}
