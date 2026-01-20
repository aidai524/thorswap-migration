"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAutocompound from "@/hooks/use-autocompound";
import useAutocompoundGas from "@/hooks/use-autocompound-gas";
import {
  ArrowRight,
  DollarSign,
  Loader2,
  RefreshCw,
  Coins,
  Fuel,
  AlertTriangle
} from "lucide-react";
import Big from "big.js";
import { formatNumber } from "@/lib/format-number";
import { GAS_THRESHOLD } from "@/config/autocompound";

export function AutocompoundCard() {
  const {
    autocompoundEnabled,
    isEnabling,
    isDisabling,
    enableAutocompound,
    disableAutocompound
  } = useAutocompound();

  const {
    depositing,
    balanceGasFee,
    isLoadingBalance,
    depositGas
  } = useAutocompoundGas();

  // Check if gas balance is low
  const isLowGasBalance =
    balanceGasFee !== null &&
    Big(balanceGasFee).lt( GAS_THRESHOLD );

  // Format gas balance for display
  const formattedGasBalance =
    balanceGasFee !== null && Big(balanceGasFee).gt(0)
      ? formatNumber(balanceGasFee, 6, true)
      : null;

  return (
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

        {autocompoundEnabled ? (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={disableAutocompound}
              disabled={isDisabling}
            >
              {isDisabling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Disable Autocompound
                </>
              )}
            </Button>
            <Button
              variant={isLowGasBalance ? "destructive" : "secondary"}
              className="w-full"
              size="lg"
              onClick={depositGas}
              disabled={depositing || isLoadingBalance || !!formattedGasBalance}
            >
              {depositing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  {isLowGasBalance ? (
                    <AlertTriangle className="mr-2 h-4 w-4" />
                  ) : (
                    <Fuel className="mr-2 h-4 w-4" />
                  )}
                  {formattedGasBalance
                    ? `${formattedGasBalance} ETH`
                    : isLowGasBalance
                    ? "Low Gas - Deposit"
                    : "Deposit Gas"}
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={enableAutocompound}
            disabled={isEnabling}
          >
            {isEnabling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Enable Autocompound
              </>
            )}
          </Button>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Swaps USDC for METRO and stakes as a flexible position
        </p>
      </CardContent>
    </Card>
  );
}
