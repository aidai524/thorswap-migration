"use client";

import { useWallet } from "@/contexts/wallet";
import { Button } from "@/components/ui/button";
import { ButtonWithAuth } from "@/components/button-with-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { xMetroToken } from "@/config/tokens";
import useClaimRewards from "@/hooks/use-claim-rewards";
import useAutocompound from "@/hooks/use-autocompound";
import { AutocompoundDialog } from "./autocompound-dialog";
import {
  ArrowRight,
  DollarSign,
  Loader2,
  RefreshCw,
  Coins
} from "lucide-react";
import Big from "big.js";
import { formatNumber } from "@/lib/format-number";
import { useState } from "react";

export function ClaimRewards() {
  const { account } = useWallet();
  const [showAutocompoundDialog, setShowAutocompoundDialog] = useState(false);
  const { claiming, claimableAmount, isLoadingClaimable, claimRewards } =
    useClaimRewards();

  const {
    autocompoundEnabled,
    isEnabling,
    isDisabling,
    enableAutocompound,
    disableAutocompound
  } = useAutocompound();

  if (!account) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Connect your wallet to view and claim rewards
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AutocompoundDialog
        open={showAutocompoundDialog}
        onOpenChange={setShowAutocompoundDialog}
        claimableAmount={claimableAmount}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Claim All */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Claim Rewards
            </CardTitle>
            <CardDescription>
              Withdraw your earned USDC rewards to your wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-secondary/50 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Available to Claim
              </p>
              <p className="mt-2 text-4xl font-bold text-success">
                {isLoadingClaimable ? (
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                ) : (
                  `$${formatNumber(claimableAmount || 0, 2, true)}`
                )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">USDC</p>
            </div>

            <div className="flex items-center justify-between grid grid-cols-2 gap-4">
              <Button
                variant="secondary"
                className="h-[40px] cursor-pointer"
                onClick={() => setShowAutocompoundDialog(true)}
              >
                Autocompound Rewards
              </Button>
              <div>
                <ButtonWithAuth
                  chainId={xMetroToken.chainId}
                  onClick={claimRewards}
                  loading={claiming}
                  disabled={
                    claiming ||
                    isLoadingClaimable ||
                    !claimableAmount ||
                    Big(claimableAmount).lte(0)
                  }
                >
                  {claiming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "Claim Rewards"
                  )}
                </ButtonWithAuth>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Rewards are paid in USDC on Base network
            </p>
          </CardContent>
        </Card>

        {/* Autocompound */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Autocompound
                </CardTitle>
                <CardDescription>
                  Reinvest your rewards to maximize returns
                </CardDescription>
              </div>
              <Badge
                variant={autocompoundEnabled ? "default" : "secondary"}
                className="ml-4 flex items-center gap-1.5"
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    autocompoundEnabled ? "bg-success" : "bg-muted-foreground"
                  }`}
                />
                <span className="text-xs">
                  {autocompoundEnabled ? "Enabled" : "Disabled"}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Flow Visualization */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <p className="mt-2 text-sm font-medium">USDC</p>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground" />

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-2 text-sm font-medium">METRO</p>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground" />

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                  <RefreshCw className="h-6 w-6 text-warning" />
                </div>
                <p className="mt-2 text-sm font-medium">Stake</p>
                <p className="text-xs text-muted-foreground">Flexible</p>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={
                autocompoundEnabled ? disableAutocompound : enableAutocompound
              }
            >
              {isEnabling || isDisabling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEnabling ? "Enabling..." : "Disabling..."}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {autocompoundEnabled
                    ? "Disable Autocompound"
                    : "Enable Autocompound"}
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Swaps USDC for METRO and stakes as a flexible position
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
