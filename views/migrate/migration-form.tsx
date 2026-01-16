"use client";

import { useMemo } from "react";
import { useWallet } from "@/contexts/wallet";
import { TokenSelector } from "./token-selector";
import { AmountInput } from "./amount-input";
import { VestingInfoPanel } from "./vesting-info-panel";
import { ButtonWithApprove } from "@/components/button-with-approve";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { ThorToken, YThorToken, MetroToken } from "@/config/tokens";
import useMigrationStore from "@/stores/use-migration";
import useMigrate from "@/hooks/use-migrate";
import { ThorMigrationEscrow } from "@/config/contracts";
import { formatNumber } from "@/lib/format-number";
import Big from "big.js";

export function MigrationForm({
  config,
  onRefetch
}: {
  config: any;
  onRefetch: () => void;
}) {
  const { token, amount, thorPhase, set } = useMigrationStore();
  const { account } = useWallet();
  const tokens = [ThorToken, YThorToken];
  const { migrate, isLoading, tokenBalance, selectedToken } = useMigrate(
    config,
    () => {
      onRefetch();
    }
  );
  const isWrongNetwork =
    account?.address && account.chainId !== ThorToken.chainId;

  const receiveAmount = useMemo(() => {
    if (!amount || !config) return "0";
    if (token === "THOR") {
      return Big(amount)
        .mul(thorPhase === "10M" ? config.ratio10M : config.ratio3M)
        .toString();
    } else {
      return Big(amount).mul(config.ratioYThor).toString();
    }
  }, [amount, thorPhase, config]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Migrate</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-primary">METRO</span>
          </CardTitle>
          <CardDescription>
            Convert your THOR or yTHOR tokens to METRO on Base chain
          </CardDescription>
        </CardHeader>
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

          {/* Token Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Token</label>
            <TokenSelector
              selected={token}
              onSelect={(token) => set({ token, amount: "0" })}
              tokens={tokens}
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <AmountInput
              value={amount}
              onChange={(value) => set({ amount: value })}
              tokenSymbol={token}
              maxAmount={tokenBalance || "0"}
            />
          </div>

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
            actionDisabled={isWrongNetwork || isLoading}
            actionText="Migrate & Stake"
          />
        </CardContent>
      </Card>

      {/* Right: Vesting Info */}
      <div className="space-y-6">
        <VestingInfoPanel token={token} config={config} />

        {/* Additional Info */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">How Migration Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                1
              </div>
              <p>Approve and submit your THOR/yTHOR tokens on Ethereum</p>
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
    </div>
  );
}
